import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './app-context';

const LOGO = 'src/assets/neura-logo-blue.png';

// ============================================================
// SPLASH — 2s logo screen (auto-advances via context timer)
// ============================================================
export function SplashScreen() {
  return (
    <div className="h-full w-full relative overflow-hidden" style={{ background: '#3a2566' }}>
      <motion.img
        src="src/assets/splash.png"
        alt="Neura"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ============================================================
// HOME — first-visit landing (after splash, before auth)
// ============================================================
const PURPLE = '#7b62fc';
const PURPLE_GLOW = '0 8px 22px rgba(123,98,252,0.40)';

// Theme-aware palette for the pre-welcome screens (home / auth)
function prePalette(dark: boolean) {
  return dark
    ? {
        PAGE_BG: '#0f0d16',
        GLASS: {
          background: 'rgba(255,255,255,0.045)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          border: '0.5px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 26px rgba(0,0,0,0.4)',
        } as React.CSSProperties,
        TXT: '#ece9f6',
        MUTE: '#a39fb6',
        CIRCLE_BG: 'rgba(255,255,255,0.06)',
        CIRCLE_SHADOW: '0 6px 16px rgba(0,0,0,0.35)',
      }
    : {
        PAGE_BG: '#eeeeee',
        GLASS: {
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '0.25px solid rgba(255,255,255,0.77)',
          boxShadow: '0 4px 14px rgba(123,98,252,0.13)',
        } as React.CSSProperties,
        TXT: '#565656',
        MUTE: '#8f8f8f',
        CIRCLE_BG: '#ffffff',
        CIRCLE_SHADOW: '0 6px 16px rgba(108,78,190,0.16)',
      };
}

// Sun / moon light–dark toggle, fixed to the top of the pre-welcome screens
function ThemeToggle({ dark, onToggle, tint }: { dark: boolean; onToggle: () => void; tint: string }) {
  return (
    <button onClick={onToggle} aria-label="تغییر تم"
      className="w-9 h-9 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors"
      style={{
        color: tint,
        background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(123,98,252,0.10)',
        border: dark ? '0.5px solid rgba(255,255,255,0.18)' : '0.5px solid rgba(123,98,252,0.20)',
      }}>
      <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'} text-[15px]`} />
    </button>
  );
}

const QUICK = [
  { label: 'صفحه من', icon: 'fa-house' },
  { label: 'اپلیکیشن', icon: 'fa-table-cells-large' },
  { label: 'پشتیبانی', icon: 'fa-headset' },
  { label: 'امکانات', icon: 'fa-plus' },
  { label: 'بیشتر', icon: 'fa-ellipsis' },
];

const SERVICES = [
  { img: 'src/assets/home/svc-tasks.png', title: 'مدیریت وظایف', desc: 'تقسیم و پیگیری کارها به صورت خودکار' },
  { img: 'src/assets/home/svc-office.png', title: 'اتوماسیون اداری', desc: 'انجام سریع کارهای اداری، مالی و برنامه‌ریزی' },
  { img: 'src/assets/home/svc-global.png', title: 'ارتباط جهانی', desc: 'تعامل فوری و چندزبانه با شرکت‌ها از هر نقطه دنیا' },
];

function SectionHead({ title, onMore, txt }: { title: string; onMore: () => void; txt: string }) {
  return (
    <div className="flex items-center justify-between px-5 mb-3.5">
      <button onClick={onMore} className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-[10px]" style={{ color: txt, fontWeight: 500 }}>
        <i className="fa-solid fa-chevron-left text-[9px]" />
        مشاهده بیشتر
      </button>
      <h2 className="text-[16px]" style={{ fontWeight: 600, color: txt }}>{title}</h2>
    </div>
  );
}

export function HomeScreen() {
  const { setAppStage, setAuthMode, preTheme, setPreTheme } = useApp();
  const dark = preTheme === 'dark';
  const { PAGE_BG, GLASS, TXT, CIRCLE_BG, CIRCLE_SHADOW } = prePalette(dark);
  const go = (mode: 'login' | 'register') => { setAuthMode(mode); setAppStage('auth'); };
  const toggle = () => setPreTheme(dark ? 'light' : 'dark');

  return (
    <div className="h-full w-full overflow-y-auto aw-scroll" dir="rtl" style={{ background: PAGE_BG }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[46px] pb-3">
        <div className="flex items-center gap-3">
          <ThemeToggle dark={dark} onToggle={toggle} tint={dark ? '#cdb9ff' : '#5c4abd'} />
          <button onClick={() => go('login')} className="bg-transparent border-none cursor-pointer p-0" style={{ color: TXT }}>
            <i className="fa-solid fa-gear text-[19px]" />
          </button>
          <button onClick={() => go('login')} className="bg-transparent border-none cursor-pointer p-0" style={{ color: dark ? '#cdb9ff' : '#5c4abd' }}>
            <i className="fa-solid fa-magnifying-glass text-[19px]" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "'Neogrey','Space Grotesk',sans-serif", fontWeight: 500, fontSize: 22, color: TXT }}>Neura</span>
          <img src={LOGO} alt="" className="w-[30px] h-[30px] object-contain" />
        </div>
      </div>

      {/* Hero card */}
      <motion.div className="mx-4 mt-1 relative overflow-hidden" style={{ ...GLASS, borderRadius: 26 }}
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-stretch">
          {/* Text + CTA (right in RTL) */}
          <div className="flex-1 py-6 pr-5 pl-2 flex flex-col items-start justify-center">
            <h1 className="text-[16px] leading-[1.6] mb-2" style={{ fontWeight: 600, color: TXT }}>
              نــورا: دستیار هوشمند شما،
            </h1>
            <p className="text-[11px] leading-[2] mb-4" style={{ color: TXT, maxWidth: 210 }}>
              ارتباط مستقیـم با شرکـت‌ها، بدون واسطه
            </p>
            <button onClick={() => go('register')}
              className="border-none cursor-pointer text-white text-[12px] px-6 py-2.5 rounded-full"
              style={{ background: PURPLE, fontWeight: 500, boxShadow: PURPLE_GLOW }}>
              همین حالا شروع کن
            </button>
          </div>
          {/* Phone (left in RTL) */}
          <div className="w-[132px] flex-shrink-0 relative">
            <img src="src/assets/home/hero-phone.png" alt="" className="absolute bottom-0 left-0 w-[150px] max-w-none"
              style={{ objectFit: 'contain' }} />
          </div>
        </div>
      </motion.div>

      {/* Quick access */}
      <div className="mt-8">
        <SectionHead title="پر کاربرد ها" onMore={() => go('login')} txt={TXT} />
        <div className="flex gap-2.5 px-5 overflow-x-auto aw-noscroll pb-1">
          {QUICK.map(q => (
            <button key={q.label} onClick={() => go('login')}
              className="flex-shrink-0 relative flex flex-col items-center bg-transparent border-none cursor-pointer" style={{ width: 66 }}>
              <div className="w-[66px] h-[96px] rounded-[22px] mt-5" style={GLASS} />
              <div className="absolute top-0 w-[52px] h-[52px] rounded-full flex items-center justify-center"
                style={{ background: CIRCLE_BG, boxShadow: CIRCLE_SHADOW }}>
                <i className={`fa-solid ${q.icon} text-[18px]`} style={{ color: TXT }} />
              </div>
              <span className="absolute bottom-[14px] text-[10px]" style={{ color: TXT, fontWeight: 400 }}>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Special offer */}
      <div className="mx-4 mt-6 relative overflow-hidden flex items-stretch" style={{ ...GLASS, borderRadius: 22 }}>
        <div className="w-[140px] flex-shrink-0 relative">
          <img src="src/assets/home/offer-phone.png" alt="" className="w-full h-full object-cover" style={{ position: 'absolute', inset: 0 }} />
        </div>
        <div className="flex-1 py-5 pr-5 pl-3 flex flex-col items-start justify-center">
          <span className="text-[10px] text-white px-3 py-1 rounded-full mb-2.5" style={{ background: PURPLE, fontWeight: 400 }}>پیشنهاد ویژه</span>
          <div className="text-[16px] mb-1" style={{ fontWeight: 600, color: TXT }}>تخفیف ویژه ۵۰٪</div>
          <div className="text-[11px]" style={{ color: TXT }}>تخفیف ویژه برای پکیج طلایی</div>
        </div>
      </div>

      {/* Services */}
      <div className="mt-8">
        <SectionHead title="خدمات متنوع نـورا" onMore={() => go('register')} txt={TXT} />
        <div className="grid grid-cols-3 gap-2.5 px-4">
          {SERVICES.map(s => (
            <div key={s.title} className="overflow-hidden flex flex-col" style={{ ...GLASS, borderRadius: 18 }}>
              <img src={s.img} alt="" className="w-full object-cover" style={{ aspectRatio: '1 / 0.92' }} />
              <div className="px-2.5 pt-2.5 pb-3">
                <div className="text-[11px] mb-1" style={{ fontWeight: 600, color: TXT }}>{s.title}</div>
                <div className="text-[9px] leading-[1.7]" style={{ color: TXT }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enter panel */}
      <div className="px-4 pt-7 pb-7">
        <button onClick={() => go('login')}
          className="w-full border-none cursor-pointer text-white text-[16px] rounded-[14px]"
          style={{ background: PURPLE, padding: '15px', fontWeight: 600, boxShadow: PURPLE_GLOW }}>
          ورود به پنل
        </button>
      </div>
    </div>
  );
}

// ============================================================
// AUTH — login / register form
// ============================================================
function GlassField({ type = 'text', value, onChange, placeholder, dark }: {
  type?: string; value: string; onChange: (v: string) => void; placeholder: string; dark: boolean;
}) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full outline-none border-none text-[15px] text-right"
      style={{
        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)',
        borderRadius: 16,
        padding: '16px 18px',
        color: dark ? '#f0eef9' : '#2a2150',
        border: dark ? '0.5px solid rgba(255,255,255,0.14)' : 'none',
        boxShadow: dark ? 'inset 0 1px 2px rgba(255,255,255,0.06)' : '0 2px 8px rgba(124,92,220,0.10), inset 0 1px 2px rgba(255,255,255,0.9)',
        fontFamily: "'Kamand', 'Vazirmatn', sans-serif",
      }}
    />
  );
}

export function AuthScreen() {
  const { authMode, setAuthMode, setAppStage, hasAccount, completeAuth, showToast, preTheme, setPreTheme } = useApp();
  const dark = preTheme === 'dark';
  const isLogin = authMode === 'login';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');

  const submit = () => {
    if (!isLogin && !name.trim()) { showToast('نام خود را وارد کنید'); return; }
    if (!phone.trim()) { showToast('شماره موبایل را وارد کنید'); return; }
    if (!pass.trim()) { showToast('رمز عبور را وارد کنید'); return; }
    showToast(isLogin ? 'خوش آمدید!' : 'حساب شما ساخته شد');
    completeAuth();
  };

  const cardStyle: React.CSSProperties = dark
    ? {
        background: 'rgba(18,14,30,0.46)',
        backdropFilter: 'blur(28px) saturate(1.3)', WebkitBackdropFilter: 'blur(28px) saturate(1.3)',
        borderRadius: 28, border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.5)', padding: '40px 28px 32px',
      }
    : {
        background: 'rgba(255,255,255,0.34)',
        backdropFilter: 'blur(28px) saturate(1.4)', WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
        borderRadius: 28, border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 24px 70px rgba(86,56,176,0.28)', padding: '40px 28px 32px',
      };
  const logoTint = dark ? '#f3f0ff' : '#2a2150';
  const accentTint = dark ? '#cdb9ff' : '#5b4ba8';

  return (
    <div className="h-full w-full relative overflow-y-auto aw-scroll" style={{
      backgroundImage: `url('${dark ? 'src/assets/login-bg-dark.png' : 'src/assets/login-bg.png'}')`,
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      {/* Top-left theme toggle */}
      <div className="absolute top-[42px] left-5 z-20">
        <ThemeToggle dark={dark} onToggle={() => setPreTheme(dark ? 'light' : 'dark')} tint={dark ? '#e9e2ff' : '#5b4ba8'} />
      </div>

      <div className="min-h-full flex items-center justify-center px-5 py-10">
        {/* Frosted glass card */}
        <motion.div
          className="w-full max-w-[400px] relative"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={cardStyle}
        >
          {/* Back → home */}
          <button onClick={() => setAppStage('home')}
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer z-10"
            style={{ color: accentTint }}>
            <i className="fa-solid fa-arrow-right text-[16px]" />
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center mb-9">
            <img src={LOGO} alt="Neura" className="w-[88px] h-[88px] object-contain mb-1" />
            <span style={{ fontFamily: "'Neogrey', 'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 32, letterSpacing: 1, color: logoTint }}>neura</span>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-3.5">
            {!isLogin && <GlassField value={name} onChange={setName} placeholder="نام و نام خانوادگی" dark={dark} />}
            <GlassField type="tel" value={phone} onChange={setPhone} placeholder={isLogin ? 'شماره موبایل یا نام کاربری' : 'شماره موبایل'} dark={dark} />
            <GlassField type="password" value={pass} onChange={setPass} placeholder="رمز عبور" dark={dark} />
          </div>

          {/* Primary */}
          <button onClick={submit}
            className="w-full mt-4 border-none cursor-pointer text-white text-[16px]"
            style={{
              background: 'linear-gradient(135deg, #8f74ee, #6d4ee0)',
              borderRadius: 16, padding: '16px',
              fontWeight: 700, fontFamily: "'Kamand', 'Vazirmatn', sans-serif",
              boxShadow: '0 10px 26px rgba(109,78,224,0.4), inset 0 1px 2px rgba(255,255,255,0.5)',
            }}>
            {isLogin ? 'ورود' : 'ثبت‌نام و ورود'}
          </button>

          {/* Forgot */}
          {isLogin && (
            <button className="w-full text-center mt-5 mb-1 text-[14px] bg-transparent border-none cursor-pointer"
              style={{ color: '#8f74ee', fontWeight: 600 }}
              onClick={() => showToast('کد بازیابی ارسال شد')}>
              فراموشی رمز عبور
            </button>
          )}

          {/* OTP login (login only) */}
          {isLogin && (
            <button onClick={() => showToast('رمز یکبار مصرف ارسال شد')}
              className="w-full mt-5 cursor-pointer text-[15px]"
              style={{
                background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)',
                border: dark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.7)',
                borderRadius: 16, padding: '15px',
                color: logoTint, fontWeight: 600,
                boxShadow: dark ? 'none' : '0 4px 14px rgba(124,92,220,0.12)',
                fontFamily: "'Kamand', 'Vazirmatn', sans-serif",
              }}>
              ورود با رمز یکبار مصرف
            </button>
          )}

          {/* Toggle mode */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-[14px]">
            <span style={{ color: accentTint }}>{isLogin ? 'هنوز ثبت‌نام نکرده‌اید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}</span>
            <button className="bg-transparent border-none cursor-pointer text-[14px]" style={{ color: '#8f74ee', fontWeight: 800 }}
              onClick={() => setAuthMode(isLogin ? 'register' : 'login')}>
              {isLogin ? 'ثبت‌نام' : 'ورود'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
