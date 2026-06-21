import express from 'express';
import { query } from '../db.js';
import { authRequired, roleRequired } from '../auth.js';
import { getVoipSettings, placeCall } from '../voip.js';

// ابزارِ «برقراری تماس» برای چت — وقتی کاربر بخواهد ایجنت به کسی زنگ بزند.
const MAKE_CALL_TOOL = {
  type: 'function',
  function: {
    name: 'make_call',
    description: 'یک تماس تلفنی واقعی از طریق سرور ویپ برقرار می‌کند. هر زمان کاربر خواست به کسی زنگ زده شود یا تماسی برای هماهنگی گرفته شود، این را فراخوانی کن.',
    parameters: {
      type: 'object',
      properties: {
        target_name: { type: 'string', description: 'نام شخصی که باید با او تماس گرفته شود' },
        phone: { type: 'string', description: 'شمارهٔ تلفن مقصد اگر کاربر گفته باشد (اختیاری؛ اگر ندانی از روی نام جستجو می‌شود)' },
        purpose: { type: 'string', description: 'هدف تماس یا موضوعی که باید هماهنگ شود' },
      },
      required: ['target_name', 'purpose'],
    },
  },
};

const router = express.Router();
const adminGuard = [authRequired, roleRequired('admin', 'superadmin')];

async function getProvider(id) {
  const { rows } = await query("SELECT data FROM documents WHERE collection='ai_providers' AND id=$1", [id]);
  return rows[0]?.data || null;
}

// fetch با تایم‌اوت + تلاش مجدد (برای پایداری در برابر خطاهای موقتِ پروکسی)
async function fetchT(url, opts = {}, ms = 30000, retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(t);
      if (r.status >= 502 && r.status <= 504 && attempt < retries) continue; // 502/503/504 موقت → تلاش مجدد
      return r;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (attempt < retries) { await new Promise(s => setTimeout(s, 600 * (attempt + 1))); continue; }
      throw e;
    }
  }
  throw lastErr;
}

// مدل → ارائه‌دهنده و شناسه واقعی مدل
async function resolveModel(modelId, fallbackModel) {
  let providerId = null, realModel = modelId || fallbackModel;
  if (modelId) {
    const mr = await query("SELECT data FROM documents WHERE collection='ai_models' AND id=$1", [modelId]);
    const md = mr.rows[0]?.data;
    if (md) { providerId = md.provider; realModel = md.modelId; }
  }
  // ارائه‌دهنده: از مدل، وگرنه اولین ارائه‌دهنده‌ی فعالِ دارای کلید
  let provider = providerId ? await getProvider(providerId) : null;
  if (!provider || provider.enabled === false || !provider.apiKey) {
    const all = await query("SELECT data FROM documents WHERE collection='ai_providers'");
    provider = all.rows.map((r) => r.data).find((p) => p.enabled !== false && p.apiKey) || null;
  }
  return { provider, realModel };
}

// تبدیل گفتار به متن (STT) — صوت به‌صورت base64 در JSON
router.post('/stt', async (req, res) => {
  try {
    const { agentId, model: modelOverride, audioBase64, mime } = req.body || {};
    if (!audioBase64) return res.status(400).json({ error: 'audio_required' });
    let sttModel = modelOverride;
    if (!sttModel && agentId) {
      const a = await query("SELECT data FROM documents WHERE collection='agents' AND id=$1", [agentId]);
      sttModel = a.rows[0]?.data?.sttModel;
    }
    const { provider, realModel } = await resolveModel(sttModel, 'whisper-1');
    if (!provider) return res.json({ ok: false, fallback: true, reason: 'provider_unavailable' });
    const form = new FormData();
    form.append('file', new Blob([Buffer.from(audioBase64, 'base64')], { type: mime || 'audio/webm' }), 'audio.webm');
    form.append('model', realModel);
    const r = await fetchT(`${provider.baseUrl.replace(/\/$/, "")}/audio/transcriptions`, {
      method: 'POST', headers: { Authorization: `Bearer ${provider.apiKey}` }, body: form,
    });
    const j = await r.json();
    if (!r.ok) { console.error('STT ERROR model=', realModel, 'status=', r.status, JSON.stringify(j).slice(0, 300)); return res.status(502).json({ error: 'provider_error', detail: j }); }
    console.log('STT OK model=', realModel, 'text=', (j.text || '').slice(0, 40));
    res.json({ ok: true, text: j.text || '' });
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed', detail: String(e?.message || e) });
  }
});

// تبدیل متن به گفتار (TTS) — خروجی صوت base64
router.post('/tts', async (req, res) => {
  try {
    const { agentId, model: modelOverride, voice, text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text_required' });
    let ttsModel = modelOverride, ttsVoice = voice;
    if (agentId) {
      const a = await query("SELECT data FROM documents WHERE collection='agents' AND id=$1", [agentId]);
      const ad = a.rows[0]?.data;
      ttsModel = ttsModel || ad?.ttsModel;
      ttsVoice = ttsVoice || ad?.ttsVoice;
    }
    const { provider, realModel } = await resolveModel(ttsModel, 'tts-1');
    if (!provider) return res.json({ ok: false, fallback: true, reason: 'provider_unavailable' });
    const r = await fetchT(`${provider.baseUrl.replace(/\/$/, "")}/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({ model: realModel, input: text, voice: ttsVoice || 'alloy' }),
    });
    if (!r.ok) { const j = await r.json().catch(() => ({})); console.error('TTS ERROR model=', realModel, 'status=', r.status, JSON.stringify(j).slice(0, 300)); return res.status(502).json({ error: 'provider_error', detail: j }); }
    const buf = Buffer.from(await r.arrayBuffer());
    console.log('TTS OK model=', realModel, 'bytes=', buf.length);
    res.json({ ok: true, audioBase64: buf.toString('base64'), mime: 'audio/mpeg' });
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed', detail: String(e?.message || e) });
  }
});

// ---------------------------------------------------------------------------
// چت واقعی ایجنت — عمومی (اپ اصلی لاگین جدا ندارد). در صورت نبودِ کلید/مدل،
// fallback:true برمی‌گرداند تا فرانت به پاسخ نمونه برگردد.
// ---------------------------------------------------------------------------
router.post('/chat', async (req, res) => {
  try {
    const { agentId, model: modelOverride, messages } = req.body || {};
    console.log('AI /chat hit — agent=', agentId, 'override=', modelOverride || '-');

    // ایجنت و مدل انتساب‌یافته
    let agentDoc = null;
    if (agentId) {
      const r = await query("SELECT data FROM documents WHERE collection='agents' AND id=$1", [agentId]);
      agentDoc = r.rows[0]?.data || null;
    }
    const modelId = modelOverride || agentDoc?.modelId;
    let useModelId = modelId;
    // اگر ایجنت مدلِ چت ندارد: اولین مدلِ چتِ کاتالوگ، وگرنه مدلِ هر ایجنتِ دیگری که مدل دارد.
    if (!useModelId) {
      const dm = await query(
        "SELECT id FROM documents WHERE collection='ai_models' AND coalesce(data->>'kind','chat')='chat' AND coalesce(data->>'enabled','true') <> 'false' ORDER BY updated_at LIMIT 1",
      );
      useModelId = dm.rows[0]?.id;
    }
    if (!useModelId) {
      const am = await query(
        "SELECT data->>'modelId' AS m FROM documents WHERE collection='agents' AND coalesce(data->>'modelId','') <> '' LIMIT 1",
      );
      useModelId = am.rows[0]?.m || null;
    }

    // مدل → ارائه‌دهنده (در نبودِ کاتالوگ، نام مدلِ پیش‌فرض روی provider فعال)
    let providerId = 'noyan';
    let realModel = useModelId || process.env.DEFAULT_CHAT_MODEL || 'gpt-4o-mini';
    if (useModelId) {
      const mr = await query("SELECT data FROM documents WHERE collection='ai_models' AND id=$1", [useModelId]);
      const modelDoc = mr.rows[0]?.data;
      if (modelDoc) { providerId = modelDoc.provider || providerId; realModel = modelDoc.modelId || useModelId; }
    }

    // provider: ابتدا با شناسه؛ وگرنه اولین provider فعالِ دارای کلید
    let provider = await getProvider(providerId);
    if (!provider || provider.enabled === false || !provider.apiKey) {
      const all = await query("SELECT data FROM documents WHERE collection='ai_providers'");
      provider = all.rows.map((row) => row.data).find((pr) => pr.enabled !== false && pr.apiKey) || null;
    }
    if (!provider) return res.json({ ok: false, fallback: true, reason: 'provider_unavailable' });

    let personaStr = '';
    const p = agentDoc?.persona;
    if (p) {
      const parts = [];
      if (p.tone) parts.push(`لحن: ${p.tone}`);
      if (p.gender) parts.push(`جنسیت: ${p.gender}`);
      if (p.age) parts.push(`رده سنی: ${p.age}`);
      if (parts.length) personaStr = ' ' + parts.join('، ') + '.';
    }
    const sys = agentDoc
      ? `تو «${agentDoc.name}» هستی، ${agentDoc.role}. ${agentDoc.instructions || ''}${personaStr} پاسخ‌ها را کوتاه، مودبانه و به زبان فارسی بده.`
      : 'پاسخ کوتاه و فارسی بده.';
    const history = Array.isArray(messages) ? messages.slice(-12) : [];

    // ابزار تماس فقط وقتی فعال است که ویپ روشن باشد
    const voip = await getVoipSettings();
    const tools = voip.voipEnabled ? [MAKE_CALL_TOOL] : null;

    const callChat = (m, msgs, withTools) => fetchT(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({ model: m, messages: msgs, ...(withTools && tools ? { tools, tool_choice: 'auto' } : {}) }),
    });

    const baseMsgs = [{ role: 'system', content: sys }, ...history];
    let r = await callChat(realModel, baseMsgs, true);
    let j = await r.json().catch(() => ({}));
    // خودترمیمی: اگر مدلِ انتخابی روی گپ اجرا نشد، یک‌بار با مدلِ سالمِ پیش‌فرض تلاش کن
    const SAFE_MODEL = process.env.DEFAULT_CHAT_MODEL || 'gpt-4o-mini';
    if (!r.ok && realModel !== SAFE_MODEL) {
      console.error('AI chat model failed — retrying with safe model. model=', realModel, 'status=', r.status, JSON.stringify(j).slice(0, 200));
      r = await callChat(SAFE_MODEL, baseMsgs, true);
      j = await r.json().catch(() => ({}));
      if (r.ok) realModel = SAFE_MODEL;
    }
    if (!r.ok) { console.error('AI chat ERROR model=', realModel, 'status=', r.status, JSON.stringify(j).slice(0, 300)); return res.json({ ok: false, fallback: true, reason: 'provider_error', detail: j }); }

    // اگر مدل خواست تماس بگیرد → اجرای ابزار + یک دور دیگر برای پاسخ نهایی
    const assistantMsg = j?.choices?.[0]?.message;
    const toolCalls = assistantMsg?.tool_calls || [];
    let callResult = null;
    if (toolCalls.length && tools) {
      const toolMsgs = [];
      for (const tc of toolCalls) {
        if (tc.function?.name !== 'make_call') { toolMsgs.push({ role: 'tool', tool_call_id: tc.id, content: 'ابزار ناشناخته.' }); continue; }
        let args = {};
        try { args = JSON.parse(tc.function.arguments || '{}'); } catch {}
        const pr = await placeCall({
          agentId, agentName: agentDoc?.name, targetName: args.target_name,
          targetNumber: args.phone, purpose: args.purpose, requestedBy: 'chat',
          company: agentDoc?.company,
        });
        callResult = pr;
        let content;
        if (pr.ok) content = `تماس با ${pr.task.targetName || args.target_name} به شمارهٔ ${pr.task.targetNumber} برقرار شد (در حال زنگ‌خوردن). شناسهٔ تماس: ${pr.task.id}. نتیجهٔ نهایی پس از پایان تماس در گزارش‌ها ثبت می‌شود.`;
        else if (pr.reason === 'no_number') content = `شمارهٔ «${args.target_name}» در سیستم پیدا نشد. از کاربر بخواه شمارهٔ تماس را بدهد.`;
        else content = `برقراری تماس ناموفق بود (${pr.task?.error || pr.originate?.error || 'خطا'}). به کاربر اطلاع بده و پیشنهاد تلاش مجدد بده.`;
        console.log('AI make_call →', pr.ok ? 'ok' : 'fail', 'target=', args.target_name, 'num=', pr.task?.targetNumber);
        toolMsgs.push({ role: 'tool', tool_call_id: tc.id, content });
      }
      const r2 = await callChat(realModel, [...baseMsgs, assistantMsg, ...toolMsgs], false);
      const j2 = await r2.json().catch(() => ({}));
      const finalText = r2.ok ? (j2?.choices?.[0]?.message?.content ?? '') : (toolMsgs.map((m) => m.content).join(' '));
      console.log('AI chat OK (with make_call) model=', realModel, 'agent=', agentId);
      return res.json({ ok: true, text: finalText, model: realModel, call: callResult?.task || null });
    }

    console.log('AI chat OK model=', realModel, 'agent=', agentId);
    res.json({ ok: true, text: assistantMsg?.content ?? '', model: realModel });
  } catch (e) {
    // هر خطایی (از جمله DB) → fallback تا اپ اصلی به پاسخ نمونه برگردد
    res.json({ ok: false, fallback: true, reason: 'error', detail: String(e?.message || e) });
  }
});

// به‌روزرسانی پیکربندی یک ایجنت توسط کاربر (شخصی‌سازی) — عمومی برای اپ اصلی
// فقط فیلدهای مجاز؛ برای محصول واقعی باید به مالکِ ایجنت محدود شود.
router.put('/agent/:id', async (req, res) => {
  try {
    const ALLOWED_FIELDS = ['name', 'role', 'instructions', 'modelId', 'sttModel', 'ttsModel', 'imageModel', 'ttsVoice', 'voip', 'locked', 'persona', 'quickActions'];
    const patch = {};
    for (const k of ALLOWED_FIELDS) if (k in (req.body || {})) patch[k] = req.body[k];
    if (!Object.keys(patch).length) return res.json({ ok: true });
    const { rows } = await query(
      `UPDATE documents SET data = data || $2::jsonb, updated_at = now()
        WHERE collection = 'agents' AND id = $1 RETURNING data`,
      [req.params.id, JSON.stringify(patch)],
    );
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true, agent: rows[0].data });
  } catch (e) {
    res.status(500).json({ error: 'server_error', detail: String(e?.message || e) });
  }
});

// تولید تصویر با مدلِ تصویرِ خود ایجنت — عمومی (برای ویجت پشتیبان و پنل کاربر)
router.post('/agent-image', async (req, res) => {
  try {
    const { agentId, prompt, size } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt_required' });
    let imgModel;
    if (agentId) {
      const a = await query("SELECT data FROM documents WHERE collection='agents' AND id=$1", [agentId]);
      imgModel = a.rows[0]?.data?.imageModel;
    }
    const { provider, realModel } = await resolveModel(imgModel, 'gpt-image-1');
    if (!provider) return res.json({ ok: false, fallback: true, reason: 'provider_unavailable' });
    const r = await fetchT(`${provider.baseUrl.replace(/\/$/, "")}/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({ model: realModel, prompt, size: size || '1024x1024' }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'provider_error', detail: j });
    const item = j?.data?.[0] || {};
    res.json({ ok: true, url: item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null) });
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed', detail: String(e?.message || e) });
  }
});

// همه‌ی مسیرهای بعدی فقط برای ادمین/سوپر‌ادمین
router.use(...adminGuard);

// دریافت کل لیست مدل‌ها از ارائه‌دهنده (endpoint استاندارد OpenAI: /models)
// و درج/به‌روزرسانی در کاتالوگ ai_models (نام نمایشی موجود حفظ می‌شود).
router.post('/providers/:id/sync', async (req, res) => {
  const provider = await getProvider(req.params.id);
  if (!provider) return res.status(404).json({ error: 'provider_not_found' });
  if (!provider.apiKey) return res.status(400).json({ error: 'missing_api_key' });

  let list;
  try {
    const r = await fetchT(`${provider.baseUrl.replace(/\/$/, "")}/models`, {
      headers: { Authorization: `Bearer ${provider.apiKey}` },
    });
    if (!r.ok) return res.status(502).json({ error: 'provider_error', status: r.status });
    const j = await r.json();
    list = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
  } catch (e) {
    return res.status(502).json({ error: 'fetch_failed', detail: String(e?.message || e) });
  }

  let added = 0, updated = 0;
  for (const m of list) {
    const modelId = m.id || m.model || m.name;
    if (!modelId) continue;
    const id = String(modelId);
    const existing = await query("SELECT data FROM documents WHERE collection='ai_models' AND id=$1", [id]);
    const prev = existing.rows[0]?.data;
    const kind = /image|dall|flux|sd|midjourney|imagen|seedream|kandinsky/i.test(id) ? 'image'
      : /tts|speech|audio|whisper|stt|transcrib|voice|sahab|gpt-4o-mini-tts|gpt-4o-transcribe/i.test(id) ? 'audio' : 'chat';
    const data = {
      id,
      modelId: id,
      displayName: prev?.displayName || id, // نام نمایشی = همان شناسه‌ی مدل در API
      provider: req.params.id,
      kind: prev?.kind || kind,
      enabled: prev ? prev.enabled : true, // مدل‌های import‌شده پیش‌فرض فعال‌اند
      raw: m,
    };
    await query(
      `INSERT INTO documents (collection, id, data) VALUES ('ai_models', $1, $2::jsonb)
       ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [id, JSON.stringify(data)]
    );
    prev ? updated++ : added++;
  }
  res.json({ ok: true, total: list.length, added, updated });
});

// تست چت با یک مدل
router.post('/test', async (req, res) => {
  const { providerId, model, prompt } = req.body || {};
  const provider = await getProvider(providerId);
  if (!provider) return res.status(404).json({ error: 'provider_not_found' });
  if (!provider.apiKey) return res.status(400).json({ error: 'missing_api_key' });
  try {
    const r = await fetchT(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt || 'سلام! یک جمله کوتاه فارسی بگو.' }],
      }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'provider_error', status: r.status, detail: j });
    res.json({ ok: true, text: j?.choices?.[0]?.message?.content ?? '', usage: j?.usage });
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed', detail: String(e?.message || e) });
  }
});

// تولید تصویر (مسیر استاندارد images/generations)
router.post('/image', async (req, res) => {
  const { providerId, model, prompt, size } = req.body || {};
  const provider = await getProvider(providerId);
  if (!provider) return res.status(404).json({ error: 'provider_not_found' });
  if (!provider.apiKey) return res.status(400).json({ error: 'missing_api_key' });
  if (!prompt) return res.status(400).json({ error: 'prompt_required' });
  try {
    const r = await fetchT(`${provider.baseUrl.replace(/\/$/, "")}/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({ model: model || 'gpt-image-1', prompt, size: size || '1024x1024' }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'provider_error', status: r.status, detail: j });
    const item = j?.data?.[0] || {};
    const url = item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
    res.json({ ok: true, url, raw: j?.data });
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed', detail: String(e?.message || e) });
  }
});

export default router;
