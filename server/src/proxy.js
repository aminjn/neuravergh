// مسیردهی fetch خروجی (هم‌زمان، نه یکی‌یا‌اون‌یکی):
// - ippanel (پیامک، ایرانی) در NO_PROXY است ⇒ مستقیم می‌رود (پروکسی خارجی را بلاک می‌کند).
// - گپ/Noyan (هوش مصنوعی، بین‌الملل) در NO_PROXY نیست ⇒ از پروکسی می‌رود (مستقیم از ایران بلاک است).
// EnvHttpProxyAgent خودش HTTP(S)_PROXY و NO_PROXY را می‌خواند و per-domain تصمیم می‌گیرد.
import * as undici from 'undici';

const proxy =
  process.env.HTTPS_PROXY || process.env.https_proxy ||
  process.env.HTTP_PROXY || process.env.http_proxy ||
  process.env.ALL_PROXY || process.env.all_proxy;

if (proxy) {
  try {
    if (typeof undici.EnvHttpProxyAgent === 'function') {
      undici.setGlobalDispatcher(new undici.EnvHttpProxyAgent());
      console.log('Outbound fetch: EnvHttpProxyAgent (proxy + NO_PROXY)', 'NO_PROXY=', process.env.NO_PROXY || process.env.no_proxy || '');
    } else {
      undici.setGlobalDispatcher(new undici.ProxyAgent(proxy));
      console.log('Outbound fetch via proxy:', proxy);
    }
  } catch (e) {
    console.error('Failed to set proxy dispatcher:', e?.message || e);
  }
}
