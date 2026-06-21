import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken, authRequired } from '../auth.js';

const router = express.Router();

// ورود
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username_password_required' });

  const { rows } = await query(
    'SELECT * FROM app_users WHERE username = $1 OR email = $1 LIMIT 1',
    [String(username).trim()]
  );
  const user = rows[0];
  if (!user || user.status !== 'active') return res.status(401).json({ error: 'invalid_credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, company: user.company },
  });
});

// --- ورود با OTP پیامکی (ippanel) ---
function normalizePhone(p) {
  if (!p) return '';
  let s = String(p).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');
  if (s.startsWith('0')) s = '98' + s.slice(1);
  else if (s.startsWith('9') && s.length === 10) s = '98' + s;
  return s;
}
async function getFullSettings() {
  const { rows } = await query('SELECT data FROM settings WHERE id = 1');
  return rows[0]?.data || {};
}

// fetch با timeout و retry (برای پایداری ارسال پیامک)
async function fetchRetry(url, opts = {}, ms = 15000, retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(t);
      if (r.status >= 502 && r.status <= 504 && attempt < retries) {
        await new Promise((s) => setTimeout(s, 600 * (attempt + 1)));
        continue;
      }
      return r;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (attempt < retries) { await new Promise((s) => setTimeout(s, 600 * (attempt + 1))); continue; }
      throw e;
    }
  }
  throw lastErr;
}

router.post('/otp/request', async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!phone || phone.length < 11) return res.status(400).json({ error: 'bad_phone' });
  const s = await getFullSettings();
  if (!s.otpEnabled) return res.status(400).json({ error: 'otp_disabled' });
  if (!s.ippanelApiKey || !s.ippanelPatternCode) return res.status(400).json({ error: 'ippanel_not_configured' });

  const code = String(Math.floor(10000 + Math.random() * 90000));
  const hash = await bcrypt.hash(code, 8);
  await query(
    `INSERT INTO otp_codes (phone, code_hash, expires_at, attempts)
       VALUES ($1, $2, now() + interval '3 minutes', 0)
     ON CONFLICT (phone) DO UPDATE SET code_hash = $2, expires_at = now() + interval '3 minutes', attempts = 0, created_at = now()`,
    [phone, hash],
  );
  const baseUrl = (s.ippanelBaseUrl || 'https://api2.ippanel.com/api/v1').replace(/\/$/, '');
  const sendPath = s.ippanelSendPath || '/sms/pattern/normal/send';
  const sender = s.ippanelSender || '+983000505';
  const variable = s.ippanelVariable || 'code';
  try {
    const r = await fetchRetry(`${baseUrl}${sendPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: s.ippanelApiKey },
      body: JSON.stringify({ code: s.ippanelPatternCode, sender, recipient: '+' + phone, variable: { [variable]: code } }),
    });
    const j = await r.json().catch(() => ({}));
    // ippanel گاهی 200 با status غیر OK برمی‌گرداند
    if (!r.ok || (j && j.status && j.status !== 'OK')) {
      console.error('ippanel send failed:', r.status, JSON.stringify(j));
      return res.status(502).json({ error: 'sms_failed', status: r.status, detail: j });
    }
    console.log('ippanel send ok:', JSON.stringify(j));
  } catch (e) {
    console.error('ippanel fetch error:', e?.message || e);
    return res.status(502).json({ error: 'sms_failed', detail: String(e?.message || e) });
  }
  res.json({ ok: true });
});

router.post('/otp/verify', async (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  const code = String(req.body?.code || '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).trim();
  const { rows } = await query('SELECT * FROM otp_codes WHERE phone = $1', [phone]);
  const rec = rows[0];
  if (!rec || new Date(rec.expires_at) < new Date()) return res.status(400).json({ error: 'expired' });
  if (rec.attempts >= 5) return res.status(429).json({ error: 'too_many_attempts' });
  const ok = await bcrypt.compare(code, rec.code_hash);
  if (!ok) {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE phone = $1', [phone]);
    return res.status(401).json({ error: 'invalid_code' });
  }
  await query('DELETE FROM otp_codes WHERE phone = $1', [phone]);
  let user = (await query('SELECT * FROM app_users WHERE username = $1', [phone])).rows[0];
  if (!user) {
    const ph = await bcrypt.hash(Math.random().toString(36).slice(2), 8);
    user = (await query(
      `INSERT INTO app_users (username, password_hash, name, role, meta)
         VALUES ($1, $2, $1, 'user', $3::jsonb) RETURNING *`,
      [phone, ph, JSON.stringify({ phone })],
    )).rows[0];
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

// کاربر فعلی
router.get('/me', authRequired, async (req, res) => {
  const { rows } = await query(
    'SELECT id, username, name, email, role, company, status FROM app_users WHERE id = $1',
    [req.user.sub]
  );
  if (!rows[0]) return res.status(404).json({ error: 'not_found' });
  res.json({ user: rows[0] });
});

export default router;
