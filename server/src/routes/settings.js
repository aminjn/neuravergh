import express from 'express';
import { query } from '../db.js';
import { authRequired, roleRequired } from '../auth.js';

const router = express.Router();

// مقادیر پیش‌فرض تنظیمات — باید با AppSettings فرانت هماهنگ بماند
const DEFAULTS = {
  brandName: 'Neura',
  supportEmail: 'support@neura.app',
  supportPhone: '۰۲۱-۱۲۳۴۵۶۷۸',
  defaultTheme: 'light',
  primaryColor: '#9B59B6',
  language: 'fa',
  aiEnabled: true,
  aiApiBase: 'https://api.openai.com/v1',
  aiApiKey: '',
  aiModel: 'gpt-4o-mini',
  smsEnabled: false,
  smsApiKey: '',
  webhookUrl: '',
  allowRegistration: true,
  sessionTimeout: 30,
  maintenanceMode: false,
  // ورود با OTP پیامکی (ippanel)
  otpEnabled: false,
  ippanelApiKey: '',
  ippanelBaseUrl: 'https://api2.ippanel.com/api/v1',
  ippanelSendPath: '/sms/pattern/normal/send',
  ippanelPatternCode: '',
  ippanelSender: '+983000505',
  ippanelVariable: 'code',
  // تماس صوتی با سرور ویپ (Asterisk ARI روی HTTP)
  voipEnabled: false,
  voipType: 'asterisk-ari',
  voipBaseUrl: '',          // مثلاً 84.241.5.9:8585 (http:// و /ari خودکار)
  voipUsername: '',
  voipPassword: '',
  voipTrunk: '',            // ترانک خروجی، مثلاً mytrunk → PJSIP/{number}@{trunk}
  voipEndpointPattern: 'PJSIP/{number}',
  voipContext: 'from-internal',
  voipExtension: '',        // داخلیِ مقصدِ اتصال در dialplan (خالی = همان شماره)
  voipPriority: 1,
  voipCallerId: 'Neura',
  voipTimeout: 30,
  voipAppName: '',          // اگر پر شود، تماس به اپ Stasis می‌رود (برای فاز ۲ صدای AI)
  voipAppArgs: '',
};

// تنظیمات حساس را از خروجی عمومی حذف کن
const SECRET_KEYS = ['aiApiKey', 'smsApiKey', 'ippanelApiKey', 'voipPassword'];

// خواندن تنظیمات — عمومی است (برند/تم برای همه لازم است)
// کلیدهای حساس حذف می‌شوند؛ به‌جای مقدار، پرچم "*Set" نشان می‌دهد که مقداری ذخیره شده است.
router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT data FROM settings WHERE id = 1');
  const merged = { ...DEFAULTS, ...(rows[0]?.data || {}) };
  const out = { ...merged };
  for (const k of SECRET_KEYS) {
    out[`${k}Set`] = !!merged[k];
    delete out[k];
  }
  res.json(out);
});

// ذخیره تنظیمات — فقط سوپر‌ادمین
router.put('/', authRequired, roleRequired('superadmin'), async (req, res) => {
  const patch = req.body || {};
  // فقط کلیدهای شناخته‌شده را قبول کن
  const clean = {};
  for (const k of Object.keys(DEFAULTS)) {
    if (!(k in patch)) continue;
    // کلید حساسِ خالی، مقدار قبلی را پاک نکند
    if (SECRET_KEYS.includes(k) && !patch[k]) continue;
    clean[k] = patch[k];
  }

  const { rows } = await query(
    `INSERT INTO settings (id, data, updated_at)
       VALUES (1, $1::jsonb, now())
     ON CONFLICT (id) DO UPDATE
       SET data = settings.data || $1::jsonb, updated_at = now()
     RETURNING data`,
    [JSON.stringify(clean)]
  );
  const merged = { ...DEFAULTS, ...rows[0].data };
  for (const k of SECRET_KEYS) { merged[`${k}Set`] = !!merged[k]; delete merged[k]; }
  res.json(merged);
});

export default router;
