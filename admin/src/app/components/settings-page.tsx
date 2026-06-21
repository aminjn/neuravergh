import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Save, KeyRound } from "lucide-react";

// ورودی متنی پایدار (سطح ماژول) تا با هر کاراکتر remount نشود و focus نپرد.
function Field({ label, value, onChange, ph, type = "text", hint }: any) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Input dir="ltr" type={type} value={value ?? ""} placeholder={ph} onChange={onChange} />
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

// صفحه‌ی تنظیمات سیستم و یکپارچه‌سازی‌ها در داشبورد /admin
export function SettingsPage() {
  const [s, setS] = useState<any>(null);

  useEffect(() => { (async () => { try { setS(await api.getSettings()); } catch { toast.error("خطا در دریافت تنظیمات"); } })(); }, []);

  const set = (k: string, v: any) => setS((p: any) => ({ ...p, [k]: v }));
  const save = async () => {
    try { const r = await api.putSettings(s); setS(r); toast.success("تنظیمات ذخیره شد"); }
    catch (e: any) { toast.error(e?.status === 403 ? "فقط سوپر‌ادمین" : "خطا در ذخیره"); }
  };

  if (!s) return <div className="flex h-48 items-center justify-center text-muted-foreground">در حال بارگذاری…</div>;

  const f = (k: string) => ({ value: s[k], onChange: (e: any) => set(k, e.target.value) });

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>تنظیمات و یکپارچه‌سازی</h1>
          <p className="text-sm text-muted-foreground">برند، ورود پیامکی (ippanel) و سرویس‌های جانبی</p>
        </div>
        <Button onClick={save}><Save className="size-4 ms-1" /> ذخیره</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>عمومی و برند</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="نام برند" {...f("brandName")} />
          <Field label="ایمیل پشتیبانی" {...f("supportEmail")} />
          <Field label="تلفن پشتیبانی" {...f("supportPhone")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="size-4" /> ورود پیامکی (OTP) — ippanel</CardTitle>
          <CardDescription>کلید را وارد، کلید الگو را تنظیم و «ورود پیامکی» را فعال کن.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">فعال‌سازی ورود پیامکی</Label>
            <Switch checked={!!s.otpEnabled} onCheckedChange={(v) => set("otpEnabled", v)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="کلید API (AccessKey)" type="password" ph={s.ippanelApiKeySet ? "•••• (ذخیره‌شده)" : "AccessKey"} hint={s.ippanelApiKeySet ? "ذخیره‌شده — برای تغییر مقدار جدید وارد کن" : ""} {...f("ippanelApiKey")} />
            <Field label="کد الگو (Pattern)" ph="xxxxxx" {...f("ippanelPatternCode")} />
            <Field label="شماره فرستنده" ph="+983000505" {...f("ippanelSender")} />
            <Field label="نام متغیر کد در الگو" ph="code" {...f("ippanelVariable")} />
            <Field label="آدرس API" ph="https://api2.ippanel.com/api/v1" {...f("ippanelBaseUrl")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>سرویس‌های دیگر</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="آدرس وب‌هوک" ph="https://example.com/webhook" {...f("webhookUrl")} />
        </CardContent>
      </Card>
    </div>
  );
}
