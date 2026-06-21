import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "./ui/select";
import { Sparkles, RefreshCw, Trash2, Plus, FlaskConical, Save, Image as ImageIcon } from "lucide-react";

interface Provider { id: string; name: string; baseUrl: string; apiKey?: string; enabled?: boolean; note?: string; }
interface Model { id: string; modelId: string; displayName: string; provider: string; kind?: string; enabled?: boolean; }
interface QuickAction { label: string; prompt: string; }
interface Agent { id: string; name: string; role?: string; modelId?: string; imageModel?: string; sttModel?: string; ttsModel?: string; ttsVoice?: string; quickActions?: QuickAction[]; company?: string; }

export function AiPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const [p, m, a] = await Promise.all([
        api.list<Provider>("ai_providers"),
        api.list<Model>("ai_models"),
        api.list<Agent>("agents"),
      ]);
      setProviders(p); setModels(m); setAgents(a);
    } catch { toast.error("خطا در دریافت اطلاعات"); }
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  if (loading) return <div className="flex h-48 items-center justify-center text-muted-foreground">در حال بارگذاری…</div>;

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <div>
          <h1>هوش مصنوعی و مدل‌ها</h1>
          <p className="text-sm text-muted-foreground">مدیریت ارائه‌دهنده‌ها، مدل‌ها و انتساب به ایجنت‌ها</p>
        </div>
      </div>

      <Tabs defaultValue="models" dir="rtl">
        <TabsList>
          <TabsTrigger value="models">مدل‌ها</TabsTrigger>
          <TabsTrigger value="providers">ارائه‌دهنده‌ها</TabsTrigger>
          <TabsTrigger value="assign">انتساب به ایجنت‌ها</TabsTrigger>
          <TabsTrigger value="quick">اقدامات سریع</TabsTrigger>
          <TabsTrigger value="test">تست</TabsTrigger>
          <TabsTrigger value="image">تولید تصویر</TabsTrigger>
        </TabsList>

        <TabsContent value="models"><ModelsTab models={models} providers={providers} onChange={reload} /></TabsContent>
        <TabsContent value="providers"><ProvidersTab providers={providers} onChange={reload} /></TabsContent>
        <TabsContent value="assign"><AssignTab agents={agents} models={models} onChange={reload} /></TabsContent>
        <TabsContent value="quick"><QuickActionsTab agents={agents} onChange={reload} /></TabsContent>
        <TabsContent value="test"><TestTab providers={providers} models={models} /></TabsContent>
        <TabsContent value="image"><ImageTab providers={providers} models={models} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Models ----------
function ModelsTab({ models, providers, onChange }: { models: Model[]; providers: Provider[]; onChange: () => void }) {
  const [draft, setDraft] = useState<Record<string, string>>({});

  const saveName = async (m: Model) => {
    const name = draft[m.id] ?? m.displayName;
    await api.update("ai_models", m.id, { displayName: name });
    toast.success("نام نمایشی ذخیره شد");
    onChange();
  };
  const toggle = async (m: Model) => { await api.update("ai_models", m.id, { enabled: !m.enabled }); onChange(); };
  const del = async (m: Model) => { await api.remove("ai_models", m.id); toast.success("مدل حذف شد"); onChange(); };
  const add = async () => {
    const modelId = prompt("شناسه واقعی مدل (مثلاً gpt-4o):");
    if (!modelId) return;
    const displayName = prompt("نام نمایشی:", modelId) || modelId;
    await api.create("ai_models", { id: modelId, modelId, displayName, provider: providers[0]?.id || "noyan", kind: "chat", enabled: true });
    toast.success("مدل اضافه شد"); onChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>کاتالوگ مدل‌ها</CardTitle>
          <CardDescription>نام نمایشی هر مدل را تنظیم کن. لیست از خود API خوانده می‌شود. {models.length} مدل</CardDescription>
        </div>
        <Button size="sm" onClick={add}><Plus className="size-4 ms-1" /> افزودن مدل</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {models.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2.5">
            <Input className="w-44" value={draft[m.id] ?? m.displayName} onChange={(e) => setDraft({ ...draft, [m.id]: e.target.value })} />
            <Badge variant="secondary" dir="ltr">{m.modelId}</Badge>
            <Select value={m.kind || "chat"} onValueChange={async (v) => { await api.update("ai_models", m.id, { kind: v }); onChange(); }}>
              <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">متن (chat)</SelectItem>
                <SelectItem value="image">تصویر (image)</SelectItem>
                <SelectItem value="audio">صوت (STT/TTS)</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{m.provider}</span>
            <div className="ms-auto flex items-center gap-2">
              <Switch checked={!!m.enabled} onCheckedChange={() => toggle(m)} />
              <Button size="sm" variant="ghost" onClick={() => saveName(m)}><Save className="size-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => del(m)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Providers ----------
function ProvidersTab({ providers, onChange }: { providers: Provider[]; onChange: () => void }) {
  const [edit, setEdit] = useState<Record<string, Partial<Provider>>>({});
  const [syncing, setSyncing] = useState<string | null>(null);

  const val = (p: Provider, k: keyof Provider) => (edit[p.id]?.[k] ?? (p as any)[k]) as any;
  const set = (id: string, k: keyof Provider, v: any) => setEdit({ ...edit, [id]: { ...edit[id], [k]: v } });

  const save = async (p: Provider) => {
    await api.update("ai_providers", p.id, { name: val(p, "name"), baseUrl: val(p, "baseUrl"), apiKey: val(p, "apiKey"), enabled: val(p, "enabled") });
    toast.success("ارائه‌دهنده ذخیره شد"); onChange();
  };
  const sync = async (p: Provider) => {
    setSyncing(p.id);
    try {
      const r = await api.syncProvider(p.id);
      toast.success(`${r.total} مدل دریافت شد (${r.added} جدید، ${r.updated} به‌روز)`);
      onChange();
    } catch (e: any) {
      const msg = e?.message;
      toast.error(
        e?.status === 400 ? "ابتدا کلید API را ذخیره کن"
        : msg === "provider_error" ? "ارائه‌دهنده خطا داد — کلید API یا Base URL را بررسی کن"
        : msg === "fetch_failed" ? "اتصال به ارائه‌دهنده ناموفق — آدرس Base URL یا دسترسی شبکه سرور را بررسی کن"
        : "خطا در دریافت مدل‌ها از ارائه‌دهنده"
      );
    }
    setSyncing(null);
  };
  const addProvider = async () => {
    const name = prompt("نام ارائه‌دهنده:"); if (!name) return;
    const baseUrl = prompt("Base URL (سازگار با OpenAI):", "https://api.openai.com/v1") || "";
    await api.create("ai_providers", { id: name.toLowerCase().replace(/\s+/g, "-"), name, baseUrl, apiKey: "", enabled: true });
    toast.success("ارائه‌دهنده اضافه شد"); onChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>ارائه‌دهنده‌های هوش مصنوعی</CardTitle>
          <CardDescription>کلید API را وارد و «دریافت مدل‌ها» را بزن تا کل لیست واقعی import شود.</CardDescription>
        </div>
        <Button size="sm" onClick={addProvider}><Plus className="size-4 ms-1" /> ارائه‌دهنده جدید</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((p) => (
          <div key={p.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Input className="w-44" value={val(p, "name")} onChange={(e) => set(p.id, "name", e.target.value)} />
              <Badge variant="outline" dir="ltr">{p.id}</Badge>
              <div className="ms-auto flex items-center gap-2">
                <Label className="text-xs">فعال</Label>
                <Switch checked={!!val(p, "enabled")} onCheckedChange={(v) => set(p.id, "enabled", v)} />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Base URL</Label>
                <Input dir="ltr" value={val(p, "baseUrl")} onChange={(e) => set(p.id, "baseUrl", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">کلید API</Label>
                <Input dir="ltr" type="password" placeholder="••••••" value={val(p, "apiKey") || ""} onChange={(e) => set(p.id, "apiKey", e.target.value)} />
              </div>
            </div>
            {p.note && <p className="text-xs text-muted-foreground">{p.note}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => save(p)}><Save className="size-4 ms-1" /> ذخیره</Button>
              <Button size="sm" variant="secondary" disabled={syncing === p.id} onClick={() => sync(p)}>
                <RefreshCw className={`size-4 ms-1 ${syncing === p.id ? "animate-spin" : ""}`} /> دریافت مدل‌ها
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Assign to agents ----------
const TTS_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

function AssignTab({ agents, models, onChange }: { agents: Agent[]; models: Model[]; onChange: () => void }) {
  const chatModels = models.filter((m) => (m.kind || "chat") === "chat");
  const imageModels = models.filter((m) => m.kind === "image");
  const audioModels = models.filter((m) => m.kind === "audio");

  const assign = async (a: Agent, patch: Record<string, string>) => {
    await api.update("agents", a.id, patch);
    toast.success(`تنظیمات ایجنت «${a.name}» ذخیره شد`);
    onChange();
  };

  const ModelSelect = ({ a, field, list, ph }: { a: Agent; field: keyof Agent; list: Model[]; ph: string }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-muted-foreground">{ph}</label>
      <Select value={(a[field] as string) || ""} onValueChange={(v) => assign(a, { [field]: v } as any)}>
        <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>
          {list.length ? list.map((m) => <SelectItem key={m.id} value={m.modelId}>{m.displayName}</SelectItem>)
            : <SelectItem value="none" disabled>موجود نیست</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>انتساب مدل به ایجنت‌ها</CardTitle>
        <CardDescription>برای هر ایجنت: مدل متن (چت)، تصویر، تبدیل گفتار به متن (STT) و متن به گفتار (TTS). {agents.length} ایجنت</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {models.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            هنوز مدلی موجود نیست. به تب «ارائه‌دهنده‌ها» برو، کلید API را وارد و «دریافت مدل‌ها» را بزن.
          </div>
        )}
        {agents.map((a) => (
          <div key={a.id} className="rounded-lg border p-3">
            <div className="mb-2">
              <div className="text-sm">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.role || a.id}</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <ModelSelect a={a} field="modelId" list={chatModels} ph="متن (چت)" />
              <ModelSelect a={a} field="imageModel" list={imageModels} ph="تصویر" />
              <ModelSelect a={a} field="sttModel" list={audioModels} ph="گفتار→متن (STT)" />
              <ModelSelect a={a} field="ttsModel" list={audioModels} ph="متن→گفتار (TTS)" />
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-muted-foreground">صدای TTS</label>
                <Select value={a.ttsVoice || ""} onValueChange={(v) => assign(a, { ttsVoice: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {TTS_VOICES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Quick actions (فقط برای ایجنت دستیار) ----------
function QuickActionsTab({ agents, onChange }: { agents: Agent[]; onChange: () => void }) {
  const editable = agents.filter((a) => a.id === 'assistant');
  const [draft, setDraft] = useState<Record<string, QuickAction[]>>(
    () => Object.fromEntries(editable.map((a) => [a.id, a.quickActions || []])),
  );
  const setActions = (id: string, arr: QuickAction[]) => setDraft((d) => ({ ...d, [id]: arr }));
  const add = (id: string) => setActions(id, [...(draft[id] || []), { label: '', prompt: '' }]);
  const upd = (id: string, i: number, k: keyof QuickAction, v: string) =>
    setActions(id, (draft[id] || []).map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const rm = (id: string, i: number) => setActions(id, (draft[id] || []).filter((_, j) => j !== i));
  const save = async (a: Agent) => {
    try {
      await api.update('agents', a.id, { quickActions: (draft[a.id] || []).filter((x) => x.label.trim()) });
      toast.success(`اقدامات «${a.name}» ذخیره شد`); onChange();
    } catch { toast.error('خطا در ذخیره'); }
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">اقدامات سریع فقط برای «دستیار هوشمند» تعریف می‌شود: یک «برچسب» (که کاربر می‌بیند) و یک «دستور» (که به AI فرستاده می‌شود).</p>
      {editable.length === 0 && <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">ایجنت «دستیار» یافت نشد.</div>}
      {editable.map((a) => (
        <Card key={a.id}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div><CardTitle className="text-sm">{a.name}</CardTitle><CardDescription>{a.role || a.id}</CardDescription></div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => add(a.id)}><Plus className="size-4 ms-1" /> اقدام</Button>
              <Button size="sm" onClick={() => save(a)}><Save className="size-4 ms-1" /> ذخیره</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(draft[a.id] || []).length === 0 && <div className="text-xs text-muted-foreground">اقدامی تعریف نشده.</div>}
            {(draft[a.id] || []).map((qa, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input className="w-52" placeholder="برچسب (مثلاً: لیدهای داغ امروز)" value={qa.label} onChange={(e) => upd(a.id, i, 'label', e.target.value)} />
                <Input className="flex-1" placeholder="دستور به AI (مثلاً: لیدهای داغ امروز را فهرست کن)" value={qa.prompt} onChange={(e) => upd(a.id, i, 'prompt', e.target.value)} />
                <Button size="sm" variant="ghost" onClick={() => rm(a.id, i)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------- Test ----------
function TestTab({ providers, models }: { providers: Provider[]; models: Model[] }) {
  const [providerId, setProviderId] = useState(providers[0]?.id || "");
  const [model, setModel] = useState(models[0]?.modelId || "");
  const [prompt, setPrompt] = useState("سلام! یک جمله کوتاه فارسی بگو.");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true); setOut("");
    try {
      const r = await api.testModel({ providerId, model, prompt });
      setOut(r.text || "(پاسخ خالی)");
    } catch (e: any) {
      setOut("خطا: " + (e?.status === 400 ? "کلید API این ارائه‌دهنده تنظیم نشده" : e?.message || "اتصال ناموفق"));
    }
    setBusy(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FlaskConical className="size-4" /> تست مدل</CardTitle>
        <CardDescription>یک پیام بفرست تا اتصال و پاسخ مدل را بررسی کنی.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">ارائه‌دهنده</Label>
            <Select value={providerId} onValueChange={setProviderId}>
              <SelectTrigger><SelectValue placeholder="ارائه‌دهنده" /></SelectTrigger>
              <SelectContent>{providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">مدل</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue placeholder="مدل" /></SelectTrigger>
              <SelectContent>{models.map((m) => <SelectItem key={m.id} value={m.modelId}>{m.displayName} ({m.modelId})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
        <Button onClick={run} disabled={busy}>{busy ? "در حال ارسال…" : "ارسال"}</Button>
        {out && <div className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-sm">{out}</div>}
      </CardContent>
    </Card>
  );
}

// ---------- Image generation ----------
function ImageTab({ providers, models }: { providers: Provider[]; models: Model[] }) {
  const imageModels = models.filter((m) => m.kind === "image");
  const [providerId, setProviderId] = useState(providers[0]?.id || "");
  const [model, setModel] = useState(imageModels[0]?.modelId || "");
  const [prompt, setPrompt] = useState("یک لوگوی مینیمال برای یک برند فناوری روی پس‌زمینه سفید");
  const [size, setSize] = useState("1024x1024");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!model) { toast.error("ابتدا یک مدل تصویر را در تب «مدل‌ها» فعال کن"); return; }
    setBusy(true); setUrl("");
    try {
      const r = await api.generateImage({ providerId, model, prompt, size });
      if (r.url) setUrl(r.url); else toast.error("تصویری برنگشت");
    } catch (e: any) {
      toast.error(e?.status === 400 ? "کلید API این ارائه‌دهنده تنظیم نشده" : "خطا در تولید تصویر");
    }
    setBusy(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ImageIcon className="size-4" /> تولید تصویر</CardTitle>
        <CardDescription>با مدل‌های تصویری (kind=image) یک تصویر بساز.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">ارائه‌دهنده</Label>
            <Select value={providerId} onValueChange={setProviderId}>
              <SelectTrigger><SelectValue placeholder="ارائه‌دهنده" /></SelectTrigger>
              <SelectContent>{providers.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">مدل تصویر</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue placeholder="مدل تصویر" /></SelectTrigger>
              <SelectContent>
                {imageModels.length
                  ? imageModels.map((m) => <SelectItem key={m.id} value={m.modelId}>{m.displayName}</SelectItem>)
                  : <SelectItem value="none" disabled>مدلی با نوع image یافت نشد</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">اندازه</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x1024">۱۰۲۴×۱۰۲۴</SelectItem>
                <SelectItem value="1024x1536">۱۰۲۴×۱۵۳۶</SelectItem>
                <SelectItem value="1536x1024">۱۵۳۶×۱۰۲۴</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
        <Button onClick={run} disabled={busy}>{busy ? "در حال تولید…" : "تولید تصویر"}</Button>
        {url && (
          <div className="rounded-lg border p-3">
            <img src={url} alt="generated" className="mx-auto max-h-96 rounded-md" />
            <a href={url} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs text-primary underline">باز کردن در تب جدید</a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
