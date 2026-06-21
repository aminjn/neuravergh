import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, EuScreen } from './app-context';
import { RoleSwitcher, AgentSelector, SubscribeContent, ProfileContent, FormGroup, FormInput, SettingsGroup, SettingsItem, CustomizeAgentContent, AgentSettingsContent, MoreScreenModal, NOTIF_ICON_SRC } from './admin-panel';
import { COMPANIES, NOTIFICATIONS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, toFa, Agent, Order } from './data';
import { EuDineScreen, EuAssistantScreen, EuSupportScreen, EuMarketScreen, EuPlannerScreen, EuSearchScreen, EuReportScreen } from './eu-agent-screens';
import { EuHomeScreen } from './eu-home-screen';
import { EuAvatar } from './eu-spectrum-avatar';
import { LetterAvatar } from './letter-avatar';
import neuraLogo from "figma:asset/0ee60e1dbaa3bcb0e2daccbfdd0200ba026fb510.png";
import copilotAvatar from "figma:asset/80728c20cabe3ba700e3cee6136877e472056e8e.png";

const euPageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ========================
// EU HEADER
// ========================
const AGENT_SCREEN_META: Partial<Record<EuScreen, { title: string; icon: string; color: string }>> = {
  euDineScreen:      { title: 'سفارش غذا',   icon: 'fa-solid fa-utensils', color: '#14b8a6' },
  euAssistantScreen: { title: 'دستیار شخصی', icon: 'fa-solid fa-robot',    color: '#6366f1' },
  euSupportScreen:   { title: 'پشتیبانی',    icon: 'fa-solid fa-headset',  color: '#f43f5e' },
  euMarketScreen:    { title: 'مارکت',        icon: 'fa-solid fa-store',    color: '#F59E0B' },
};

function EuHeader() {
  const { openModal, euScreen, setEuScreen, goBack, theme, setAppStage } = useApp();
  const isGlass = theme === 'glass' || theme === 'dark';
  const agentMeta = AGENT_SCREEN_META[euScreen];

  if (isGlass) {
    return (
      <header className="flex-shrink-0" style={{ background: 'var(--aw-bg-header)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 110 }}>
        {/* Top icon row — logo on left, icons on right (fixed across all screens) */}
        <div className="flex items-center relative md:hidden px-[16px] pt-[40px] pb-[8px]" style={{ zIndex: 30 }}>
          {/* LEFT side: Neura logo (click → home) */}
          <button onClick={() => setAppStage('home')} className="flex items-center gap-[3px] bg-transparent border-none cursor-pointer p-0">
            <img src={neuraLogo} alt="" className="h-[24px] w-[24px] object-contain" />
            <span style={{ fontFamily: "'Neogrey', 'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 16, color: 'var(--aw-text-primary)' }}>Neura</span>
          </button>

          {/* RIGHT side: back (on agent screens) + 3 icons (from right: search, bell, settings) */}
          <div className="flex-1 flex items-center justify-end gap-[16px]">
            {agentMeta && (
              <button
                className="w-[20px] h-[20px] bg-transparent border-none cursor-pointer flex items-center justify-center p-0"
                style={{ color: 'var(--aw-text-primary)', fontSize: 18 }}
                onClick={goBack}
                title="بازگشت"
              >
                <i className="fa-solid fa-arrow-right" />
              </button>
            )}
            <button
              className="w-[20px] h-[20px] bg-transparent border-none cursor-pointer flex items-center justify-center p-0"
              style={{ color: 'var(--aw-eu-primary)', fontSize: 16 }}
              onClick={() => openModal('جستجو', <EuSearchPanel />)}
            >
              <img src="src/icons/png/search.png" alt="" className="nav-icon-img" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            </button>
            <button
              className="w-[20px] h-[20px] bg-transparent border-none cursor-pointer flex items-center justify-center p-0 relative"
              style={{ color: 'var(--aw-text-secondary)', fontSize: 16 }}
              onClick={() => openModal('اعلان‌ها', <EuNotifications />)}
            >
              <img src="src/icons/png/bell.png" alt="" className="nav-icon-img" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              <span className="absolute top-[1px] right-[1px] w-[7px] h-[7px] rounded-full" style={{ background: '#FF4D4D', border: '1.5px solid rgba(255,255,255,0.9)' }} />
            </button>
            <button
              className="w-[20px] h-[20px] bg-transparent border-none cursor-pointer flex items-center justify-center p-0"
              style={{ color: 'var(--aw-text-primary)', fontSize: 16 }}
              onClick={() => openModal('تنظیمات', <MoreScreenModal />)}
            >
              <img src="src/icons/png/setting.png" alt="" className="nav-icon-img" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            </button>
          </div>
        </div>

        {/* Desktop header row */}
        <div className="hidden md:flex items-center px-6 pt-3 pb-2 gap-2">
          <div className="flex items-center gap-2 flex-1">
            <img src={neuraLogo} alt="Neura" className="h-6 w-auto object-contain" />
            <span className="text-[15px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>
              {agentMeta?.title || EU_NAV_ITEMS.find(i => i.id === euScreen)?.label || 'خانه'}
            </span>
          </div>
          <button className="w-[34px] h-[34px] rounded-[10px] bg-transparent border-none cursor-pointer text-[var(--aw-text-primary)] text-[16px] flex items-center justify-center"
            onClick={() => openModal('تنظیمات', <MoreScreenModal />)}>
            <i className="fa-solid fa-gear" />
          </button>
        </div>

        {/* Avatar row — draggable: up = shrink/deactivate, down = activate. Agent selector sits bottom-right. */}
        <div className="md:hidden" data-chat-top-anchor>
          <EuAvatar cornerSlot={<AgentSelector />} fixed={euScreen === 'euHomeScreen'} />
        </div>
      </header>
    );
  }

  return (
    <header className="flex-shrink-0 border-b border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-header)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center px-3 md:px-6 pt-2 mb-1.5 relative">
        <div className="flex gap-0.5 z-10">
          {agentMeta ? (
            <button
              className="w-[38px] h-[38px] rounded-[10px] bg-transparent border-none text-[var(--aw-text-secondary)] text-base cursor-pointer flex items-center justify-center hover:text-[var(--aw-eu-primary)]"
              onClick={goBack}
            >
              <i className="fa-solid fa-arrow-right" />
            </button>
          ) : (
            <button className="w-[38px] h-[38px] rounded-[10px] bg-transparent border-none text-[var(--aw-text-secondary)] text-base cursor-pointer relative flex items-center justify-center hover:text-[var(--aw-eu-primary)]"
              onClick={() => openModal('اعلان‌ها', <EuNotifications />)}>
              <i className="fa-solid fa-bell" />
              <span className="absolute top-1 right-1 w-[16px] h-[16px] rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>۲</span>
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5 md:justify-start md:mr-4">
          {agentMeta ? (
            <>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center md:hidden" style={{ background: `${agentMeta.color}18` }}>
                <i className={`${agentMeta.icon} text-[13px]`} style={{ color: agentMeta.color }} />
              </div>
              <span className="text-[15px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{agentMeta.title}</span>
            </>
          ) : (
            <>
              <img src={neuraLogo} alt="Neura" className="h-7 w-auto object-contain md:hidden" style={{ filter: 'var(--aw-logo-filter)' }} />
              <span className="text-[15px] text-[var(--aw-text-primary)] font-[Neogrey] md:hidden" style={{ fontWeight: 700 }}>Neura</span>
              <span className="hidden md:block text-[15px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>
                {EU_NAV_ITEMS.find(i => i.id === euScreen)?.label || 'خانه'}
              </span>
            </>
          )}
        </div>
        <div className="flex gap-0.5 z-10 md:hidden">
          {!agentMeta && (
            <button className="w-[38px] h-[38px] rounded-[10px] bg-transparent border-none text-[var(--aw-text-secondary)] text-base cursor-pointer flex items-center justify-center hover:text-[var(--aw-eu-primary)]"
              onClick={() => openModal('تنظیمات', <MoreScreenModal />)}>
              <i className="fa-solid fa-sliders" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function EuSearchPanel() {
  const { setEuScreen, closeModal } = useApp();
  return (
    <div>
      <div className="flex flex-col gap-2">
        {[
          { icon: 'fa-solid fa-utensils', label: 'سفارش غذا', screen: 'euDineScreen' as EuScreen },
          { icon: 'fa-solid fa-store', label: 'مارکت', screen: 'euMarketScreen' as EuScreen },
          { icon: 'fa-solid fa-magnifying-glass', label: 'جستجوی پیشرفته', screen: 'euSearchScreen' as EuScreen },
        ].map(item => (
          <button key={item.screen} onClick={() => { closeModal(); setEuScreen(item.screen); }}
            className="flex items-center gap-3 p-3 rounded-xl border-none cursor-pointer text-right transition-all"
            style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)', color: 'var(--aw-text-primary)' }}>
            <i className={`${item.icon} w-5 text-center`} style={{ color: 'var(--aw-eu-primary)' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ========================
// EU AI SETTINGS HUB
// ========================
function EuSettingsContent() {
  const { openModal, closeModal, showToast } = useApp();
  const handleNav = (open: () => void) => { closeModal(); setTimeout(open, 180); };

  return (
    <div>
      {/* AI Hero banner */}
      <div className="p-4 rounded-2xl mb-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #B83D9E, #7E5FAA 60%, #3B82F6)' }}>
        <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="flex items-center gap-3 relative">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}>
            <i className="fa-solid fa-wand-magic-sparkles text-[20px] text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] text-white" style={{ fontWeight: 800 }}>دستیار هوشمند من</div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.85)' }}>تنظیمات شخصی، پلن، کیف پول و پشتیبانی</div>
          </div>
          <div className="px-2 py-1 rounded-full text-[9px] text-white flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.22)', fontWeight: 700 }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00E676' }} />فعال
          </div>
        </div>
      </div>

      <SettingsGroup title="حساب کاربری">
        <SettingsItem icon="fa-solid fa-user-circle" label="تنظیمات پروفایل کاربر" onClick={() => handleNav(() => openModal('پروفایل من', <EuProfileSettings />))} />
        <SettingsItem icon="fa-solid fa-sliders" label="تنظیمات برنامه" onClick={() => handleNav(() => openModal('تنظیمات برنامه', <EuAppSettings />))} />
      </SettingsGroup>

      <SettingsGroup title="هوش مصنوعی شخصی">
        <SettingsItem icon="fa-solid fa-wand-magic-sparkles" label="تنظیمات دستیار هوشمند" onClick={() => handleNav(() => openModal('شخصی‌سازی دستیار', <CustomizeAgentContent />))} />
        <SettingsItem icon="fa-solid fa-robot" label="تنظیمات عامل" onClick={() => handleNav(() => openModal('تنظیمات عامل', <AgentSettingsContent />))} />
      </SettingsGroup>

      <SettingsGroup title="پرداخت و اشتراک">
        <SettingsItem icon="fa-solid fa-wallet" label="کیف پول و پرداخت" onClick={() => handleNav(() => openModal('کیف پول و پرداخت', <EuWalletSettings />))} />
        <SettingsItem icon="fa-solid fa-crown" label="اشتراک و پلن‌ها" onClick={() => handleNav(() => openModal('اشتراک و پلن‌ها', <EuSubscriptionSettings />))} />
      </SettingsGroup>

      <SettingsGroup title="پشتیبانی">
        <SettingsItem icon="fa-solid fa-life-ring" label="تنظیمات پشتیبانی" onClick={() => handleNav(() => openModal('پشتیبانی', <EuSupportSettings />))} />
      </SettingsGroup>

      <div className="text-[10px] text-center text-[var(--aw-text-muted)] mt-2">
        <i className="fa-solid fa-shield-halved ml-1" style={{ color: 'var(--aw-eu-primary)' }} />
        داده‌های شما به‌صورت رمزنگاری‌شده روی هوش مصنوعی شخصی شما ذخیره می‌شود
      </div>
    </div>
  );
}

function EuProfileSettings() {
  const { showToast, closeModal } = useApp();
  const [form, setForm] = useState({
    name: 'علی محمدی',
    phone: '۰۹۱۲ ۳۴۵ ۶۷۸۹',
    email: 'ali.mohammadi@example.com',
    address: 'تهران، خیابان ولیعصر، پلاک ۱۲۰',
  });
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div>
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-[28px]" style={{ background: 'linear-gradient(135deg, #B83D9E, #7E5FAA)', fontWeight: 700 }}>ع</div>
          <button onClick={() => showToast('بارگذاری عکس', 'info')} className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center" style={{ background: 'var(--aw-eu-primary)', border: '3px solid var(--aw-bg-card)' }}>
            <i className="fa-solid fa-camera text-[11px] text-white" />
          </button>
        </div>
        <div className="text-[13px] mt-2" style={{ fontWeight: 700 }}>{form.name}</div>
        <div className="text-[10px] text-[var(--aw-text-muted)]">کاربر Neura</div>
      </div>
      <FormGroup label="نام و نام خانوادگی"><FormInput value={form.name} onChange={(e: any) => u('name', e.target.value)} /></FormGroup>
      <FormGroup label="شماره موبایل"><FormInput value={form.phone} onChange={(e: any) => u('phone', e.target.value)} /></FormGroup>
      <FormGroup label="ایمیل"><FormInput value={form.email} onChange={(e: any) => u('email', e.target.value)} /></FormGroup>
      <FormGroup label="آدرس">
        <textarea value={form.address} onChange={e => u('address', e.target.value)} rows={3} className="w-full p-2.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none resize-y" style={{ background: 'var(--aw-bg-input)' }} />
      </FormGroup>
      <button className="w-full py-2.5 rounded-[10px] border-none text-white cursor-pointer text-[13px]" style={{ background: 'linear-gradient(135deg, #B83D9E, #7E5FAA)', fontWeight: 700 }} onClick={() => { showToast('پروفایل ذخیره شد', 'success'); closeModal(); }}>ذخیره تغییرات</button>
    </div>
  );
}

function EuWalletSettings() {
  const { showToast } = useApp();
  const [tab, setTab] = useState<'cards' | 'tx' | 'subs' | 'cb'>('cards');
  const CARDS = [
    { id: 'c1', bank: 'سامان', last4: '۱۲۳۴', color: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', primary: true },
    { id: 'c2', bank: 'ملت', last4: '۸۸۹۲', color: 'linear-gradient(135deg, #B91C1C, #EF4444)', primary: false },
    { id: 'c3', bank: 'پاسارگاد', last4: '۴۴۵۶', color: 'linear-gradient(135deg, #047857, #10B981)', primary: false },
  ];
  const TX = [
    { id: 't1', title: 'سفارش غذا — پیتزا ویژه', amount: -185000, date: '۳ اسفند', type: 'spend' },
    { id: 't2', title: 'شارژ کیف پول', amount: 500000, date: '۲ اسفند', type: 'topup' },
    { id: 't3', title: 'اشتراک Neura Pro', amount: -149000, date: '۱ اسفند', type: 'sub' },
    { id: 't4', title: 'کش‌بک خرید', amount: 18500, date: '۳۰ بهمن', type: 'cb' },
    { id: 't5', title: 'سفارش از مارکت', amount: -72000, date: '۲۹ بهمن', type: 'spend' },
  ];
  const SUBS = [
    { id: 's1', name: 'Neura Pro', price: '۱۴۹,۰۰۰ تومان', cycle: 'ماهانه', renew: '۱ فروردین', active: true },
    { id: 's2', name: 'فضای ابری ۱۰۰GB', price: '۴۹,۰۰۰ تومان', cycle: 'ماهانه', renew: '۵ فروردین', active: true },
    { id: 's3', name: 'صدای پریمیوم', price: '۲۹,۰۰۰ تومان', cycle: 'ماهانه', renew: '—', active: false },
  ];
  const CASHBACK_LEVELS = [
    { name: 'برنزی', rate: '۲٪', from: 0, to: 1000000, color: '#B45309' },
    { name: 'نقره‌ای', rate: '۳.۵٪', from: 1000000, to: 5000000, color: '#9CA3AF' },
    { name: 'طلایی', rate: '۵٪', from: 5000000, to: 20000000, color: '#F59E0B' },
  ];
  const cashbackEarned = 245000;
  const TABS = [
    { id: 'cards' as const, label: 'کارت‌ها', icon: 'fa-solid fa-credit-card' },
    { id: 'tx' as const, label: 'تراکنش‌ها', icon: 'fa-solid fa-right-left' },
    { id: 'subs' as const, label: 'اشتراک‌ها', icon: 'fa-solid fa-repeat' },
    { id: 'cb' as const, label: 'کش‌بک', icon: 'fa-solid fa-gift' },
  ];
  const fmt = (n: number) => (n < 0 ? '-' : '+') + Math.abs(n).toLocaleString('fa-IR');

  return (
    <div>
      <div className="p-4 rounded-2xl mb-3 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7E5FAA, #B83D9E)' }}>
        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>موجودی کیف پول</div>
        <div className="text-[24px] text-white mt-1" style={{ fontWeight: 800, direction: 'ltr' }}>۲,۴۵۰,۰۰۰ <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>تومان</span></div>
      </div>

      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl mb-3" style={{ background: 'var(--aw-bg-hover)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="py-2 rounded-lg border-none cursor-pointer flex flex-col items-center gap-1 transition-all" style={tab === t.id ? { background: 'var(--aw-eu-primary)', color: '#fff', fontWeight: 700 } : { background: 'transparent', color: 'var(--aw-text-muted)' }}>
            <i className={`${t.icon} text-[12px]`} />
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'cards' && (
        <div className="flex flex-col gap-2">
          {CARDS.map(c => (
            <div key={c.id} className="p-3.5 rounded-2xl text-white relative overflow-hidden" style={{ background: c.color }}>
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="flex items-center justify-between relative">
                <div className="text-[11px]" style={{ fontWeight: 700, opacity: 0.85 }}>بانک {c.bank}</div>
                {c.primary && <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>پیش‌فرض</span>}
              </div>
              <div className="text-[16px] mt-3 tracking-widest" style={{ direction: 'ltr', fontWeight: 700 }}>•••• •••• •••• {c.last4}</div>
              <div className="text-[10px] mt-1" style={{ opacity: 0.7 }}>به نام علی محمدی</div>
            </div>
          ))}
          <button onClick={() => showToast('افزودن کارت جدید', 'info')} className="py-3 rounded-xl border-2 border-dashed cursor-pointer text-[12px]" style={{ borderColor: 'var(--aw-eu-primary)', background: 'transparent', color: 'var(--aw-eu-primary)', fontWeight: 700 }}>
            <i className="fa-solid fa-plus ml-1" />افزودن کارت جدید
          </button>
        </div>
      )}

      {tab === 'tx' && (
        <div className="flex flex-col gap-1.5">
          {TX.map(t => {
            const cfg: Record<string, { bg: string; color: string; icon: string }> = {
              spend: { bg: '#EF444415', color: '#EF4444', icon: 'fa-solid fa-arrow-up' },
              topup: { bg: '#10B98115', color: '#10B981', icon: 'fa-solid fa-arrow-down' },
              sub: { bg: '#3B82F615', color: '#3B82F6', icon: 'fa-solid fa-repeat' },
              cb: { bg: '#B83D9E15', color: '#B83D9E', icon: 'fa-solid fa-gift' },
            };
            const c = cfg[t.type];
            return (
              <div key={t.id} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
                  <i className={`${c.icon} text-[12px]`} style={{ color: c.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-[12px]" style={{ fontWeight: 600 }}>{t.title}</div>
                  <div className="text-[10px] text-[var(--aw-text-muted)]">{t.date}</div>
                </div>
                <div className="text-[12px]" style={{ fontWeight: 700, color: t.amount < 0 ? '#EF4444' : '#10B981', direction: 'ltr' }}>{fmt(t.amount)}</div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'subs' && (
        <div className="flex flex-col gap-2">
          {SUBS.map(s => (
            <div key={s.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)', opacity: s.active ? 1 : 0.55 }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.active ? 'linear-gradient(135deg, #B83D9E, #7E5FAA)' : 'var(--aw-bg-input)' }}>
                <i className="fa-solid fa-cube text-[14px] text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[12px]" style={{ fontWeight: 700 }}>{s.name}</div>
                <div className="text-[10px] text-[var(--aw-text-muted)]">{s.cycle} • تمدید: {s.renew}</div>
              </div>
              <div className="text-left">
                <div className="text-[11px]" style={{ fontWeight: 700, color: 'var(--aw-eu-primary)' }}>{s.price}</div>
                <div className="text-[9px] mt-0.5" style={{ color: s.active ? '#10B981' : '#6B7280', fontWeight: 700 }}>{s.active ? 'فعال' : 'لغو شده'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'cb' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)' }}>
            <i className="fa-solid fa-gift text-[20px] text-white mb-1" />
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.85)' }}>کل کش‌بک کسب‌شده</div>
            <div className="text-[20px] text-white mt-0.5" style={{ fontWeight: 800 }}>{cashbackEarned.toLocaleString('fa-IR')} <span className="text-[11px]">تومان</span></div>
          </div>
          <div className="text-[11px] text-[var(--aw-text-muted)] px-1" style={{ fontWeight: 600 }}>سطوح کش‌بک</div>
          {CASHBACK_LEVELS.map((l, i) => (
            <div key={i} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${l.color}22` }}>
                <i className="fa-solid fa-medal text-[14px]" style={{ color: l.color }} />
              </div>
              <div className="flex-1">
                <div className="text-[12px]" style={{ fontWeight: 700 }}>{l.name}</div>
                <div className="text-[10px] text-[var(--aw-text-muted)]">از {l.from.toLocaleString('fa-IR')} تا {l.to.toLocaleString('fa-IR')} تومان</div>
              </div>
              <div className="text-[13px]" style={{ fontWeight: 800, color: l.color }}>{l.rate}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EuSubscriptionSettings() {
  const { showToast } = useApp();
  const aiUsage = { used: 6840, total: 10000, tokens: '۶,۸۴۰', limit: '۱۰,۰۰۰' };
  const percent = (aiUsage.used / aiUsage.total) * 100;
  const PLANS = [
    { id: 'free', name: 'پایه', price: 'رایگان', tokens: '۲,۰۰۰ توکن', features: ['دستیار پایه', 'پشتیبانی ایمیلی'], current: false, color: '#6B7280' },
    { id: 'pro', name: 'Neura Pro', price: '۱۴۹,۰۰۰ / ماه', tokens: '۱۰,۰۰۰ توکن', features: ['دستیار پیشرفته', 'صدای پریمیوم', 'پشتیبانی ۲۴/۷'], current: true, color: '#B83D9E' },
    { id: 'max', name: 'Neura Max', price: '۳۹۹,۰۰۰ / ماه', tokens: 'نامحدود', features: ['همه ایجنت‌ها', 'API دسترسی', 'آموزش اختصاصی'], current: false, color: '#F59E0B' },
  ];
  return (
    <div>
      <div className="p-4 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, #B83D9E, #7E5FAA)' }}>
        <div className="flex items-center gap-2 mb-2">
          <i className="fa-solid fa-crown text-white text-[14px]" />
          <span className="text-[12px] text-white" style={{ fontWeight: 700 }}>پلن فعلی شما</span>
          <span className="mr-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700 }}>فعال</span>
        </div>
        <div className="text-[18px] text-white" style={{ fontWeight: 800 }}>Neura Pro</div>
        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.75)' }}>تمدید خودکار در ۱ فروردین ۱۴۰۵</div>
      </div>

      <div className="p-3.5 rounded-xl mb-3" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bolt text-[12px]" style={{ color: '#F59E0B' }} />
            <span className="text-[12px]" style={{ fontWeight: 700 }}>مصرف هوش مصنوعی</span>
          </div>
          <span className="text-[11px]" style={{ fontWeight: 700, color: 'var(--aw-eu-primary)' }}>{aiUsage.tokens} / {aiUsage.limit}</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--aw-bg-input)' }}>
          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #B83D9E, #F59E0B)' }} />
        </div>
        <div className="text-[10px] text-[var(--aw-text-muted)] mt-1.5">۶۸٪ از ظرفیت ماهانه شما مصرف شده است</div>
      </div>

      <div className="text-[11px] text-[var(--aw-text-muted)] mb-2 px-1" style={{ fontWeight: 600 }}>ارتقا پلن</div>
      <div className="flex flex-col gap-2">
        {PLANS.map(p => (
          <div key={p.id} className="p-3 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: `1px solid ${p.current ? p.color : 'var(--aw-border)'}` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${p.color}22` }}>
                <i className="fa-solid fa-cube text-[12px]" style={{ color: p.color }} />
              </div>
              <span className="text-[13px] flex-1" style={{ fontWeight: 700 }}>{p.name}</span>
              <span className="text-[12px]" style={{ fontWeight: 700, color: p.color }}>{p.price}</span>
            </div>
            <div className="text-[10px] text-[var(--aw-text-muted)] mb-1.5">{p.tokens}</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {p.features.map((f, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--aw-bg-input)', color: 'var(--aw-text-secondary)' }}>✓ {f}</span>
              ))}
            </div>
            <button disabled={p.current} onClick={() => showToast(`ارتقا به ${p.name}`, 'success')} className="w-full py-2 rounded-lg border-none cursor-pointer text-[11px] text-white" style={{ background: p.current ? '#6B7280' : p.color, fontWeight: 700, opacity: p.current ? 0.6 : 1 }}>
              {p.current ? 'پلن فعلی' : 'ارتقا به این پلن'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EuSupportSettings() {
  const { openModal, closeModal, showToast } = useApp();
  const FAQS = [
    { q: 'چگونه می‌توانم دستیار هوشمندم را شخصی‌سازی کنم؟', a: 'از تنظیمات > دستیار هوشمند می‌توانید عکس، جنسیت، صدا، لحن و سن آن را تغییر دهید.' },
    { q: 'مصرف توکن چگونه محاسبه می‌شود؟', a: 'هر پیام یا درخواست شما بر اساس طول و پیچیدگی توکن مصرف می‌کند.' },
    { q: 'چطور پلن خود را ارتقا دهم؟', a: 'از مسیر تنظیمات > اشتراک و پلن‌ها پلن دلخواه را انتخاب کنید.' },
    { q: 'آیا کش‌بک قابل برداشت است؟', a: 'بله، پس از رسیدن به سقف ۱۰۰هزار تومان قابل برداشت یا استفاده در خرید است.' },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <div className="p-3.5 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, #3B82F6, #1E40AF)' }}>
        <div className="flex items-center gap-2.5">
          <i className="fa-solid fa-life-ring text-[18px] text-white" />
          <div className="flex-1">
            <div className="text-[12px] text-white" style={{ fontWeight: 800 }}>پشتیبانی ۲۴/۷</div>
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.8)' }}>میانگین زمان پاسخ: کمتر از ۳ دقیقه</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => { closeModal(); setTimeout(() => openModal('گزارش مشکل', <EuReportProblem />), 180); }} className="p-3 rounded-xl border cursor-pointer flex flex-col items-center gap-1.5" style={{ background: 'var(--aw-bg-card)', borderColor: 'var(--aw-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EF444422' }}>
            <i className="fa-solid fa-triangle-exclamation text-[14px]" style={{ color: '#EF4444' }} />
          </div>
          <span className="text-[11px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>گزارش مشکل</span>
        </button>
        <button onClick={() => showToast('در حال اتصال به پشتیبانی...', 'info')} className="p-3 rounded-xl border cursor-pointer flex flex-col items-center gap-1.5" style={{ background: 'var(--aw-bg-card)', borderColor: 'var(--aw-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#10B98122' }}>
            <i className="fa-solid fa-headset text-[14px]" style={{ color: '#10B981' }} />
          </div>
          <span className="text-[11px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>تماس با پشتیبانی</span>
        </button>
      </div>

      <div className="text-[11px] text-[var(--aw-text-muted)] mb-2 px-1" style={{ fontWeight: 600 }}>سوالات متداول (FAQ)</div>
      <div className="flex flex-col gap-1.5">
        {FAQS.map((f, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full p-3 flex items-center gap-2 cursor-pointer border-none bg-transparent text-right">
              <i className="fa-solid fa-circle-question text-[12px]" style={{ color: 'var(--aw-eu-primary)' }} />
              <span className="flex-1 text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{f.q}</span>
              <i className={`fa-solid fa-chevron-${open === i ? 'up' : 'down'} text-[10px] text-[var(--aw-text-muted)]`} />
            </button>
            {open === i && (
              <div className="px-3 pb-3 text-[11px] text-[var(--aw-text-secondary)]" style={{ lineHeight: 1.7 }}>{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EuReportProblem() {
  const { showToast, closeModal } = useApp();
  const [cat, setCat] = useState('عملکرد دستیار');
  const [desc, setDesc] = useState('');
  const CATS = ['عملکرد دستیار', 'پرداخت', 'اپلیکیشن', 'حساب کاربری', 'دیگر'];
  return (
    <div>
      <div className="p-3 rounded-xl mb-3 flex items-center gap-2" style={{ background: '#EF444415', border: '1px solid #EF444433' }}>
        <i className="fa-solid fa-info-circle text-[12px]" style={{ color: '#EF4444' }} />
        <span className="text-[10px] text-[var(--aw-text-secondary)]">مشکل خود را با جزئیات شرح دهید تا سریع‌تر بررسی شود</span>
      </div>
      <FormGroup label="دسته‌بندی مشکل">
        <div className="flex gap-1.5 flex-wrap">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} className="text-[11px] px-3 py-1.5 rounded-full border-none cursor-pointer" style={cat === c ? { background: 'var(--aw-eu-primary)', color: '#fff', fontWeight: 600 } : { background: 'var(--aw-bg-card)', color: 'var(--aw-text-secondary)', border: '1px solid var(--aw-border)' }}>{c}</button>
          ))}
        </div>
      </FormGroup>
      <FormGroup label="شرح مشکل">
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="توضیح دهید چه اتفاقی افتاد..." className="w-full p-2.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none resize-y" style={{ background: 'var(--aw-bg-input)' }} />
      </FormGroup>
      <button onClick={() => { showToast('گزارش شما ارسال شد', 'success'); closeModal(); }} className="w-full py-2.5 rounded-[10px] border-none text-white cursor-pointer text-[13px]" style={{ background: 'linear-gradient(135deg, #B83D9E, #7E5FAA)', fontWeight: 700 }}>ارسال گزارش</button>
    </div>
  );
}

function WalletModal() {
  const { showToast, closeModal } = useApp();
  const [walletTab, setWalletTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  const QUICK_AMOUNTS = ['۵۰,۰۰۰', '۱۰۰,۰۰۰', '۲۰۰,۰۰۰', '۵۰۰,۰۰۰'];
  const TRANSACTIONS = [
    { id: 1, title: 'شارژ کیف پول', amount: '+۵۰۰,۰۰۰', date: '۴ اسفند ۱۴۰۴', type: 'deposit' as const },
    { id: 2, title: 'سفارش غذا - پیتزا ویژه', amount: '-۱۸۵,۰۰۰', date: '۳ اسفند ۱۴۰۴', type: 'withdraw' as const },
    { id: 3, title: 'خرید از مارکت', amount: '-۷۲,۰۰۰', date: '۲ اسفند ۱۴۰۴', type: 'withdraw' as const },
    { id: 4, title: 'شارژ کیف پول', amount: '+۱,۰۰۰,۰۰۰', date: '۱ اسفند ۱۴۰۴', type: 'deposit' as const },
    { id: 5, title: 'سفارش غذا - برگر مخصوص', amount: '-۱۴۰,۰۰۰', date: '۲۹ بهمن ۱۴۰۴', type: 'withdraw' as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Balance */}
      <div className="p-4 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, var(--aw-eu-primary-dark), var(--aw-eu-primary))' }}>
        <p className="text-[11px] m-0" style={{ color: 'rgba(255,255,255,0.6)' }}>موجودی فعلی</p>
        <h2 className="text-[24px] text-white m-0 mt-1" style={{ fontWeight: 800, direction: 'ltr' }}>۲,۴۵۰,۰۰۰ <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>تومان</span></h2>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--aw-bg-hover)' }}>
        <button
          className="flex-1 py-2.5 rounded-lg border-none cursor-pointer text-[13px] flex items-center justify-center gap-1.5 transition-all"
          style={walletTab === 'deposit' ? { background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontWeight: 700 } : { background: 'transparent', color: 'var(--aw-text-muted)', fontWeight: 500 }}
          onClick={() => setWalletTab('deposit')}
        >
          <i className="fa-solid fa-arrow-down text-[11px]" />
          واریز
        </button>
        <button
          className="flex-1 py-2.5 rounded-lg border-none cursor-pointer text-[13px] flex items-center justify-center gap-1.5 transition-all"
          style={walletTab === 'withdraw' ? { background: 'linear-gradient(135deg, #F97316, #EA580C)', color: '#fff', fontWeight: 700 } : { background: 'transparent', color: 'var(--aw-text-muted)', fontWeight: 500 }}
          onClick={() => setWalletTab('withdraw')}
        >
          <i className="fa-solid fa-arrow-up text-[11px]" />
          برداشت
        </button>
      </div>

      {/* Amount input */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] text-[var(--aw-text-muted)]" style={{ fontWeight: 600 }}>
          {walletTab === 'deposit' ? 'مبلغ واریز (تومان)' : 'مبلغ برداشت (تومان)'}
        </label>
        <input
          type="text"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="مبلغ را وارد کنید"
          className="w-full p-3 rounded-xl border text-[14px] text-[var(--aw-text-primary)] outline-none"
          style={{ background: 'var(--aw-bg-card)', borderColor: 'var(--aw-border)', direction: 'rtl', fontWeight: 600 }}
        />
        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap">
          {QUICK_AMOUNTS.map(qa => (
            <button
              key={qa}
              className="px-3 py-1.5 rounded-lg border cursor-pointer text-[11px] transition-all hover:border-[var(--aw-eu-primary)]"
              style={{ background: amount === qa ? 'rgba(126,95,170,0.15)' : 'var(--aw-bg-card)', borderColor: amount === qa ? 'var(--aw-eu-primary)' : 'var(--aw-border)', color: amount === qa ? 'var(--aw-eu-primary)' : 'var(--aw-text-muted)', fontWeight: 600 }}
              onClick={() => setAmount(qa)}
            >
              {qa}
            </button>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={() => { if (!amount) { showToast('مبلغ را وارد کنید'); return; } closeModal(); showToast(walletTab === 'deposit' ? 'درخواست واریز ثبت شد' : 'درخواست برداشت ثبت شد'); }}
        className="w-full py-3 rounded-xl border-none cursor-pointer text-white text-[14px] transition-all"
        style={{
          background: walletTab === 'deposit' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #F97316, #EA580C)',
          fontWeight: 700,
          opacity: amount ? 1 : 0.5,
        }}
      >
        <i className={`fa-solid ${walletTab === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'} text-[12px] ml-1.5`} />
        {walletTab === 'deposit' ? 'واریز به کیف پول' : 'برداشت از کیف پول'}
      </button>

      {/* Recent transactions */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-[12px] text-[var(--aw-eu-primary)]" />
          <span className="text-[12px] text-[var(--aw-text-muted)]" style={{ fontWeight: 600 }}>تراکنش‌های اخیر</span>
        </div>
        {TRANSACTIONS.map(tx => (
          <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tx.type === 'deposit' ? 'rgba(16,185,129,0.12)' : 'rgba(249,115,22,0.12)' }}>
              <i className={`fa-solid ${tx.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'} text-[12px]`} style={{ color: tx.type === 'deposit' ? '#10B981' : '#F97316' }} />
            </div>
            <div className="flex-1">
              <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{tx.title}</span>
              <p className="text-[10px] text-[var(--aw-text-muted)] m-0 mt-0.5">{tx.date}</p>
            </div>
            <span className="text-[13px]" style={{ fontWeight: 700, color: tx.type === 'deposit' ? '#10B981' : '#F97316', direction: 'ltr' }}>{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EuNotifications() {
  const { closeModal, openChat, setEuScreen, agents } = useApp();

  const euNotifs = [
    { id: 'en1', title: 'سفارش شما آماده است', desc: 'سفارش #۱۰۲۴ آماده تحویل می‌باشد.', time: '۱۰ دقیقه پیش', icon: 'fa-solid fa-utensils', iconBg: 'aw-bg-teal', type: 'order', target: 'restaurant' },
    { id: 'en2', title: 'پیام جدید از دستیار', desc: 'دستیار شخصی پیام جدیدی دارد.', time: '۳۰ دقیقه پیش', icon: 'fa-solid fa-robot', iconBg: 'aw-bg-indigo', type: 'chat', target: 'assistant' },
    ...NOTIFICATIONS.slice(0, 2).map(n => ({ ...n, type: 'info' as string, target: '' })),
  ];

  return (
    <div>
      {euNotifs.map(n => (
        <div key={n.id} className="flex items-start gap-2.5 p-3 rounded-xl mb-1.5 cursor-pointer border border-[var(--aw-border)] transition-all hover:border-[var(--aw-eu-primary)]" style={{ background: 'var(--aw-bg-card)' }}
          onClick={() => {
            closeModal();
            if (n.type === 'chat') {
              const a = agents.find(x => x.id === n.target);
              if (a && !a.locked) setTimeout(() => openChat(n.target, 'eu'), 200);
            } else if (n.type === 'order') {
              setEuScreen('euOrdersScreen');
            }
          }}>
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--aw-eu-nav-bg)', border: '1px solid var(--aw-eu-nav-border)', backdropFilter: 'blur(8px)' }}>
            {NOTIF_ICON_SRC[n.icon]
              ? <img src={NOTIF_ICON_SRC[n.icon]} alt="" className="nav-icon-img" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              : <i className={`${n.icon} text-sm`} style={{ color: 'var(--aw-eu-primary)' }} />}
          </div>
          <div className="flex-1">
            <div className="text-[13px] mb-0.5" style={{ fontWeight: 600 }}>{n.title}</div>
            <div className="text-[11px] text-[var(--aw-text-secondary)]">{n.desc}</div>
            <div className="text-[10px] text-[var(--aw-text-muted)] mt-1">{n.time}</div>
            {(n.type === 'chat' || n.type === 'order') && (
              <span className="text-[11px] text-[var(--aw-eu-primary)] mt-1 inline-block" style={{ fontWeight: 600 }}>
                {n.type === 'chat' ? 'مشاهده چت' : 'مشاهده سفارش'} ←
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================
// EU NAV
// ========================
const EU_NAV_ITEMS: { id: EuScreen; icon: string; label: string }[] = [
  { id: 'euHomeScreen', icon: 'fa-solid fa-home', label: 'خانه' },
  { id: 'euChatListScreen', icon: 'fa-solid fa-comments', label: 'گفتگوها' },
  { id: 'euPlannerScreen', icon: 'fa-solid fa-calendar-check', label: 'برنامه‌ها' },
  { id: 'euSearchScreen', icon: 'fa-solid fa-magnifying-glass', label: 'جستجو' },
  { id: 'euReportScreen', icon: 'fa-solid fa-chart-pie', label: 'گزارش' },
  { id: 'euProfileScreen', icon: 'fa-solid fa-user', label: 'پروفایل' },
];

const EU_NAV_ICON_SRC: Record<string, string> = {
  euHomeScreen: 'src/icons/png/home.png',
  euChatListScreen: 'src/icons/png/chat.png',
  euPlannerScreen: 'src/icons/png/calendar.png',
  euSearchScreen: 'src/icons/png/search.png',
  euReportScreen: 'src/icons/png/reports-charts.png',
  euProfileScreen: 'src/icons/png/profile.png',
};
function EuNavIcon({ id, fa, size, active }: { id: string; fa: string; size: number; active?: boolean }) {
  const src = EU_NAV_ICON_SRC[id];
  if (src) return <img src={src} alt="" className="nav-icon-img" style={{ width: size + 4, height: size + 4, objectFit: 'contain', filter: active ? 'brightness(0) invert(1)' : undefined }} />;
  return <i className={fa} style={{ fontSize: size, color: active ? '#fff' : undefined }} />;
}
function EuNav() {
  const { euScreen, setEuScreen, orders, theme } = useApp();
  const isGlass = theme === 'glass' || theme === 'dark';
  const activeOrderCount = orders.filter(o => o.status === 'preparing' || o.status === 'pending').length;
  const badgeMap: Partial<Record<EuScreen, number>> = {
    euChatListScreen: 3,
    euDineScreen: activeOrderCount > 0 ? activeOrderCount : undefined,
  };

  if (isGlass) {
    return (
      <div
        className="flex-shrink-0 md:hidden px-3"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))', paddingTop: 4 }}
      >
        <nav
          className="flex items-center rounded-[1000px] border"
          style={{
            background: 'var(--aw-eu-nav-bg)',
            backdropFilter: 'blur(20px)',
            borderColor: 'var(--aw-eu-nav-border)',
            boxShadow: '0 4px 4px rgba(123,98,252,0.2)',
            padding: 3,
          }}
        >
          {EU_NAV_ITEMS.map((item) => {
            const badge = badgeMap[item.id];
            const isActive = euScreen === item.id;
            return (
              <button
                key={item.id}
                className="flex-1 flex flex-col items-center gap-[2px] border-none cursor-pointer transition-all relative rounded-[100px]"
                style={{
                  padding: '6px 2px',
                  background: isActive ? '#7b62fc' : 'transparent',
                  color: isActive ? '#fff' : 'var(--aw-text-secondary)',
                  fontWeight: isActive ? 800 : 500,
                  boxShadow: isActive ? 'inset 2px 2px 1px rgba(255,255,255,0.45), 2px 4px 4px rgba(0,0,0,0.25)' : 'none',
                }}
                onClick={() => setEuScreen(item.id)}
              >
                <EuNavIcon id={item.id} fa={item.icon} size={14} />
                <span style={{ fontSize: 8, whiteSpace: 'nowrap' }}>{item.label}</span>
                {badge != null && badge > 0 && (
                  <span className="absolute top-0.5 right-1 rounded-full flex items-center justify-center text-white" style={{ background: '#ef4444', fontWeight: 700, fontSize: 8, minWidth: 14, height: 14, padding: '0 2px' }}>
                    {toFa(badge)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <nav
      className="flex-shrink-0 flex border-t border-[var(--aw-border)] px-2 py-1 md:hidden"
      style={{ background: 'var(--aw-bg-header)', backdropFilter: 'blur(20px)', paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
    >
      {EU_NAV_ITEMS.map((item) => {
        const badge = badgeMap[item.id];
        const isActive = euScreen === item.id;
        return (
          <button
            key={item.id}
            className={`flex-1 flex flex-col items-center gap-1 py-1 px-1 border-none bg-transparent cursor-pointer transition-all text-[10px] relative ${
              isActive ? 'text-[var(--aw-eu-primary)]' : 'text-[var(--aw-text-muted)]'
            }`}
            style={{ fontWeight: isActive ? 700 : 500 }}
            onClick={() => setEuScreen(item.id)}
          >
            <span className="flex items-center justify-center rounded-full transition-all" style={{
              width: 46, height: 30,
              background: isActive ? 'linear-gradient(135deg, var(--aw-eu-primary), var(--aw-eu-primary-dark))' : 'transparent',
              boxShadow: isActive ? '0 4px 12px color-mix(in srgb, var(--aw-eu-primary) 45%, transparent)' : 'none',
            }}>
              <EuNavIcon id={item.id} fa={item.icon} size={18} active={isActive} />
            </span>
            <span>{item.label}</span>
            {badge != null && badge > 0 && (
              <span className="absolute top-0 right-1/4 w-[16px] h-[16px] rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>
                {toFa(badge)}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ========================
// DESKTOP SIDEBAR (EU — collapsible like admin)
// ========================
function EuSidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const { euScreen, setEuScreen, openModal, openUnifiedCall, orders } = useApp();
  const badgeMap: Partial<Record<EuScreen, number>> = {
    euChatListScreen: 3,
    euOrdersScreen: orders.filter(o => o.status === 'preparing' || o.status === 'pending').length,
  };
  const w = expanded ? 240 : 68;

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 border-l border-[var(--aw-border)] h-full overflow-hidden"
      style={{
        width: w, minWidth: w,
        background: 'var(--aw-bg-card)',
        transition: 'width 0.28s cubic-bezier(.4,0,.2,1), min-width 0.28s cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* Logo row + toggle button */}
      <div className="flex items-center px-2 py-3 border-b border-[var(--aw-border)]" style={{ minHeight: 56 }}>
        {expanded ? (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
              <img src={neuraLogo} alt="Neura" className="h-7 w-auto object-contain flex-shrink-0" style={{ filter: 'var(--aw-logo-filter)' }} />
              <span className="text-[16px] text-[var(--aw-text-primary)] font-[Neogrey] whitespace-nowrap" style={{ fontWeight: 700 }}>Neura</span>
            </div>
            <button
              className="w-[32px] h-[32px] rounded-[10px] bg-transparent border-none text-[var(--aw-text-muted)] text-[13px] cursor-pointer flex items-center justify-center flex-shrink-0 transition-all hover:text-[var(--aw-eu-primary)] hover:bg-[var(--aw-bg-card-hover)]"
              onClick={onToggle}
              title="کوچک کردن منو"
            >
              <i className="fa-solid fa-angles-right" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <img src={neuraLogo} alt="Neura" className="h-6 w-auto object-contain" style={{ filter: 'var(--aw-logo-filter)' }} />
            <button
              className="w-[30px] h-[30px] rounded-[8px] bg-transparent border-none text-[var(--aw-text-muted)] text-[12px] cursor-pointer flex items-center justify-center transition-all hover:text-[var(--aw-eu-primary)] hover:bg-[var(--aw-bg-card-hover)]"
              onClick={onToggle}
              title="باز کردن منو"
            >
              <i className="fa-solid fa-angles-left" />
            </button>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 aw-scroll">
        {EU_NAV_ITEMS.map((item) => {
          const badge = badgeMap[item.id];
          const isActive = euScreen === item.id;
          return (
            <button
              key={item.id}
              title={!expanded ? item.label : undefined}
              className={`w-full flex items-center gap-3 mb-1 border-none rounded-xl cursor-pointer transition-all text-[13px] relative ${
                expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
              } ${isActive ? 'text-white' : 'bg-transparent text-[var(--aw-text-secondary)] hover:bg-[var(--aw-bg-card-hover)]'}`}
              style={isActive ? { background: 'var(--aw-eu-primary)', fontWeight: 600, boxShadow: '0 2px 10px rgba(126,95,170,0.3)' } : { fontWeight: 500 }}
              onClick={() => setEuScreen(item.id)}
            >
              <i className={`${item.icon} ${expanded ? 'w-5' : 'w-full'} text-center text-[15px]`} />
              {expanded && <span className="whitespace-nowrap">{item.label}</span>}
              {expanded && badge != null && badge > 0 && (
                <span className="mr-auto min-w-[20px] h-5 rounded-[10px] flex items-center justify-center text-white text-[11px] px-1.5" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>
                  {toFa(badge)}
                </span>
              )}
              {!expanded && badge != null && badge > 0 && (
                <span className="absolute top-0.5 left-1 w-[16px] h-[16px] rounded-full flex items-center justify-center text-white text-[9px]" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>
                  {toFa(badge)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className={`py-3 border-t border-[var(--aw-border)] space-y-1.5 ${expanded ? 'px-3' : 'px-2'}`}>
        <button title={!expanded ? 'تماس' : undefined} className={`w-full flex items-center gap-3 py-2.5 border-none rounded-xl cursor-pointer transition-all text-[13px] bg-transparent text-[var(--aw-text-secondary)] hover:bg-[var(--aw-bg-card-hover)] ${expanded ? 'px-3' : 'px-0 justify-center'}`} style={{ fontWeight: 500 }} onClick={openUnifiedCall}>
          <i className={`fa-solid fa-phone ${expanded ? 'w-5' : 'w-full'} text-center text-[var(--aw-secondary)]`} />
          {expanded && <span>تماس</span>}
        </button>
        <button title={!expanded ? 'اعلان‌ها' : undefined} className={`w-full flex items-center gap-3 py-2.5 border-none rounded-xl cursor-pointer transition-all text-[13px] bg-transparent text-[var(--aw-text-secondary)] hover:bg-[var(--aw-bg-card-hover)] ${expanded ? 'px-3' : 'px-0 justify-center'}`} style={{ fontWeight: 500 }} onClick={() => openModal('اعلان‌ها', <EuNotifications />)}>
          <i className={`fa-solid fa-bell ${expanded ? 'w-5' : 'w-full'} text-center`} />
          {expanded && <span>اعلان‌ها</span>}
        </button>
      </div>

      {/* Agent selector (expanded only) */}
      {expanded && (
        <div className="px-3 pb-3"><AgentSelector /></div>
      )}
    </aside>
  );
}

// EuHomeScreen is imported from ./eu-home-screen

// ========================
// SWIPE TO CALL
// ========================
export function SwipeToCall({ onCall, children }: { onCall: () => void; children: React.ReactNode }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = React.useRef<number | null>(null);
  const startY = React.useRef<number | null>(null);
  const dxRef = React.useRef(0);
  const triggered = React.useRef(false);
  const moved = React.useRef(false);
  const vScroll = React.useRef(false);
  const downTarget = React.useRef<HTMLElement | null>(null);
  const THRESHOLD = 70;
  const MAX = 160;

  const setD = (v: number) => { dxRef.current = v; setDx(v); };

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    triggered.current = false;
    moved.current = false;
    vScroll.current = false;
    downTarget.current = e.target as HTMLElement;
    setDragging(true);
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch (_) {}
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current == null || startY.current == null) return;
    const d = e.clientX - startX.current; // signed: + right, - left
    const dy = e.clientY - startY.current;
    // Vertical intent ⇒ this is a scroll, not a swipe: abandon the horizontal slide
    // and mark it moved so no synthetic click is dispatched on release.
    if (vScroll.current || (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(d))) {
      vScroll.current = true;
      moved.current = true;
      if (dxRef.current !== 0) setD(0);
      return;
    }
    if (Math.abs(d) > 6) moved.current = true;
    const clamped = Math.max(-MAX, Math.min(d, MAX));
    setD(clamped);
  };
  const finish = (allowClick: boolean) => {
    if (startX.current == null) return;
    if (Math.abs(dxRef.current) >= THRESHOLD && !triggered.current) { triggered.current = true; onCall(); }
    else if (allowClick && !moved.current && !vScroll.current && downTarget.current) {
      // pointer capture swallows the native click — re-dispatch it so child onClick fires
      downTarget.current.click();
    }
    startX.current = null;
    startY.current = null;
    downTarget.current = null;
    setDragging(false);
    setD(0);
  };

  const ready = Math.abs(dx) >= THRESHOLD;

  return (
    <div className="relative overflow-hidden rounded-[14px] mb-1">
      {/* call reveal on the side being swiped toward */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end pl-3 pr-4 pointer-events-none transition-colors"
        style={{
          background: ready ? 'var(--aw-secondary)' : 'rgba(0,230,118,0.18)',
          color: ready ? '#fff' : 'var(--aw-secondary)',
          opacity: dx < 0 ? 1 : 0,
          width: Math.max(-dx, 0),
        }}>
        <i className="fa-solid fa-phone text-[14px]" />
      </div>
      <div className="absolute inset-y-0 left-0 flex items-center justify-start pr-3 pl-4 pointer-events-none transition-colors"
        style={{
          background: ready ? 'var(--aw-secondary)' : 'rgba(0,230,118,0.18)',
          color: ready ? '#fff' : 'var(--aw-secondary)',
          opacity: dx > 0 ? 1 : 0,
          width: Math.max(dx, 0),
        }}>
        <i className="fa-solid fa-phone text-[14px]" />
      </div>
      <div
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? 'none' : 'transform 0.2s ease', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => finish(true)}
        onPointerCancel={() => finish(false)}
        onClickCapture={(e) => { if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; } }}
      >
        {children}
      </div>
    </div>
  );
}

// ========================
// EU CHAT LIST
// ========================
function EuChatListScreen() {
  const { agents, openChat, openModal, setEuScreen, startCall } = useApp();
  const euAgentIds = ['restaurant', 'market', 'assistant', 'support'];
  const euAgents = euAgentIds.map(id => agents.find(a => a.id === id)).filter((a): a is Agent => a != null);
  const unreadMap: Record<string, number> = { restaurant: 2, market: 1 };
  const [chatListTab, setChatListTab] = useState<'interactions' | 'agents'>('interactions');
  const [searchQuery, setSearchQuery] = useState('');

  const USER_CONVERSATIONS = [
    { id: 'u1', name: 'علی رضایی', init: 'ع', lastMsg: 'فایل گزارش رو فرستادم، چک کن', time: '۱۰ دقیقه پیش', unread: 3, online: true, bg: 'bg-blue-600' },
    { id: 'u2', name: 'مریم احمدی', init: 'م', lastMsg: 'ممنون، هماهنگی انجام شد', time: '۳۰ دقیقه پیش', unread: 0, online: true, bg: 'bg-pink-500' },
    { id: 'u3', name: 'حسین کریمی', init: 'ح', lastMsg: 'جلسه فردا ساعت ۱۰ تنظیم شد', time: '۱ ساعت پیش', unread: 1, online: false, bg: 'bg-emerald-600' },
    { id: 'u4', name: 'سارا محمدی', init: 'س', lastMsg: 'لینک پروژه رو بفرست لطفاً', time: '۲ ساعت پیش', unread: 0, online: false, bg: 'bg-amber-600' },
    { id: 'u5', name: 'گروه تیم فنی', init: 'ت', lastMsg: 'دیپلوی انجام شد ✅', time: '۳ ساعت پیش', unread: 5, online: true, bg: 'bg-violet-600', isGroup: true },
    { id: 'u6', name: 'رضا نوری', init: 'ر', lastMsg: 'قرارداد رو امضا کردم', time: 'دیروز', unread: 0, online: false, bg: 'bg-cyan-600' },
    { id: 'u7', name: 'گروه مدیران', init: 'م', lastMsg: 'گزارش ��اهانه آم���ده‌ست', time: 'دیروز', unread: 0, online: true, bg: 'bg-rose-600', isGroup: true },
  ];

  const AGENT_CARDS = [
    { id: 'assistant', icon: 'fa-solid fa-brain', color: '#7E5FAA', label: 'دستیار شخصی', desc: 'مدیریت امور روزانه و یادآوری‌ها' },
    { id: 'support', icon: 'fa-solid fa-headset', color: '#3B82F6', label: 'پشتیبانی', desc: 'رفع مشکلات و پاسخ به سوالات' },
    { id: 'restaurant', icon: 'fa-solid fa-utensils', color: '#F59E0B', label: 'سفارش غذا', desc: 'سفارش آنلاین از رستوران‌ها' },
    { id: 'market', icon: 'fa-solid fa-store', color: '#00E676', label: 'مارکت', desc: 'خرید محصولات و کالاها' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      {/* Tab bar */}
      <div className="flex mx-3 mt-3 mb-1" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(80px)', borderRadius: 12, padding: 4, border: '0.5px solid rgba(255,255,255,0.77)', boxShadow: '-2px -4px 8px 0px rgba(21,21,21,0.1), 2px 4px 8px 0px rgba(23,23,23,0.1)' }}>
        <button
          className="flex-1 border-none cursor-pointer flex items-center justify-center transition-all"
          style={{
            borderRadius: 10,
            padding: '8px 12px',
            background: chatListTab === 'interactions' ? 'rgba(255,255,255,0.16)' : 'transparent',
            boxShadow: chatListTab === 'interactions' ? '2px 4px 4px 0px rgba(31,31,31,0.15)' : 'none',
            color: chatListTab === 'interactions' ? 'rgb(92,74,189)' : 'rgb(143,143,143)',
            fontWeight: 600,
            fontSize: 12,
            fontFamily: "'Kamand', 'Vazirmatn', sans-serif",
          }}
          onClick={() => setChatListTab('interactions')}
        >
          تعاملات من
        </button>
        <button
          className="flex-1 border-none cursor-pointer flex items-center justify-center transition-all"
          style={{
            borderRadius: 10,
            padding: '8px 12px',
            background: chatListTab === 'agents' ? 'rgba(255,255,255,0.16)' : 'transparent',
            boxShadow: chatListTab === 'agents' ? '2px 4px 4px 0px rgba(31,31,31,0.15)' : 'none',
            color: chatListTab === 'agents' ? 'rgb(92,74,189)' : 'rgb(143,143,143)',
            fontWeight: 600,
            fontSize: 12,
            fontFamily: "'Kamand', 'Vazirmatn', sans-serif",
          }}
          onClick={() => setChatListTab('agents')}
        >
          عامل هوشمند
        </button>
      </div>

      {chatListTab === 'interactions' ? (
        <>
          {/* Search bar */}
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
              <i className="fa-solid fa-search text-[12px] text-[var(--aw-text-muted)]" />
              <input
                className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
                placeholder="جستجو در گفتگوها..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="border-none bg-transparent text-[var(--aw-text-muted)] text-[12px] cursor-pointer hover:text-[var(--aw-primary)]" onClick={() => setSearchQuery('')}>
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>
          <div className="px-3 pt-1">
            {(() => {
              // Build unified conversation list interleaved by recency
              const items: Array<{ key: string; type: 'agent' | 'user'; order: number }> = [
                { key: 'assistant', type: 'agent', order: 0 },
                { key: 'u1', type: 'user', order: 1 },
                { key: 'restaurant', type: 'agent', order: 2 },
                { key: 'u2', type: 'user', order: 3 },
                { key: 'u3', type: 'user', order: 4 },
                { key: 'support', type: 'agent', order: 5 },
                { key: 'u4', type: 'user', order: 6 },
                { key: 'u5', type: 'user', order: 7 },
                { key: 'market', type: 'agent', order: 8 },
                { key: 'u6', type: 'user', order: 9 },
                { key: 'u7', type: 'user', order: 10 },
              ];

              const sq = searchQuery.trim().toLowerCase();
              return items.map(item => {
                if (item.type === 'agent') {
                  const a = euAgents.find(ag => ag.id === item.key);
                  if (!a) return null;
                  if (sq && !a.name.toLowerCase().includes(sq) && !a.role.toLowerCase().includes(sq) && !(a.lastMsg || '').toLowerCase().includes(sq)) return null;
                  const unread = unreadMap[a.id] || 0;
                  if (a.locked) {
                    return (
                      <SwipeToCall key={a.id} onCall={() => startCall(a.name, a.role, a.bg, a.init, a.voip)}>
                      <div className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer opacity-60"
                        onClick={() => openModal('فعال‌سازی ' + a.name, <SubscribeContent agentId={a.id} />)}>
                        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 relative ${a.bg}`} style={{ fontWeight: 700, fontSize: 18 }}>
                          {a.init}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ fontWeight: 600 }}>{a.name}</span>
                            <span className="text-[10px] text-black px-2 py-0.5 rounded-md" style={{ background: 'var(--aw-accent)', fontWeight: 700 }}>
                              <i className="fa-solid fa-lock" /> خرید اشتراک
                            </span>
                          </div>
                          <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1"><i className="fa-solid fa-robot" /> {a.role}</div>
                          <div className="text-[12px] text-[var(--aw-text-secondary)] truncate">{a.lastMsg}</div>
                        </div>
                      </div>
                      </SwipeToCall>
                    );
                  }
                  return (
                    <SwipeToCall key={a.id} onCall={() => startCall(a.name, a.role, a.bg, a.init, a.voip)}>
                    <div className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer border border-transparent hover:bg-[var(--aw-bg-card-hover)] active:scale-[0.98]"
                      onClick={() => {
                        if (a.id === 'assistant') { setEuScreen('euAssistantScreen'); return; }
                        if (a.id === 'restaurant') { setEuScreen('euDineScreen'); return; }
                        if (a.id === 'support') { setEuScreen('euSupportScreen'); return; }
                        if (a.id === 'market') { setEuScreen('euMarketScreen'); return; }
                        openChat(a.id, 'eu');
                      }}>
                      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 relative ${a.bg}`} style={{ fontWeight: 700, fontSize: 18 }}>
                        {a.init}
                        <span className="absolute bottom-0.5 left-0.5 w-[13px] h-[13px] rounded-full border-2 border-[var(--aw-bg-app)]" style={{ background: 'var(--aw-online)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm" style={{ fontWeight: 600 }}>{a.name}</span>
                          <span className="text-[11px] text-[var(--aw-text-muted)]">{a.lastTime || 'الان'}</span>
                        </div>
                        <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1"><i className="fa-solid fa-robot" /> {a.role}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-[12px] text-[var(--aw-text-secondary)] truncate flex-1">{a.lastMsg}</div>
                          {unread > 0 && (
                            <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0 mr-1" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>
                              {toFa(unread)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    </SwipeToCall>
                  );
                }

                // User conversation
                const u = USER_CONVERSATIONS.find(uc => uc.id === item.key);
                if (!u) return null;
                if (sq && !u.name.toLowerCase().includes(sq) && !u.lastMsg.toLowerCase().includes(sq)) return null;
                return (
                  <SwipeToCall key={u.id} onCall={() => startCall(u.name, (u as any).isGroup ? 'گروه' : 'کاربر', u.bg, u.init, '')}>
                  <div className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer border border-transparent hover:bg-[var(--aw-bg-card-hover)] active:scale-[0.98]"
                    onClick={() => openChat(u.id, 'eu')}>
                    <div className="relative flex-shrink-0">
                      <LetterAvatar name={u.name} init={u.init} size={48} radius={14} />
                      {u.online && (
                        <span className="absolute bottom-0.5 left-0.5 w-[13px] h-[13px] rounded-full border-2 border-[var(--aw-bg-app)]" style={{ background: 'var(--aw-online)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm" style={{ fontWeight: 600 }}>{u.name}</span>
                        <span className="text-[11px] text-[var(--aw-text-muted)]">{u.time}</span>
                      </div>
                      <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1">
                        <i className={`fa-solid ${(u as any).isGroup ? 'fa-users' : 'fa-user'}`} /> {(u as any).isGroup ? 'گروه' : 'کاربر'}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] text-[var(--aw-text-secondary)] truncate flex-1">{u.lastMsg}</div>
                        {u.unread > 0 && (
                          <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0 mr-1" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>
                            {toFa(u.unread)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  </SwipeToCall>
                );
              });
            })()}
          </div>
        </>
      ) : (
        <div className="p-4">
          {/* Search bar */}
          <div className="mb-3">
            <div className="flex items-center gap-2 rounded-xl px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
              <i className="fa-solid fa-search text-[12px] text-[var(--aw-text-muted)]" />
              <input
                className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
                placeholder="جستجو در عامل‌ها..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="border-none bg-transparent text-[var(--aw-text-muted)] text-[12px] cursor-pointer hover:text-[var(--aw-primary)]" onClick={() => setSearchQuery('')}>
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations done by AI assistant on behalf of user */}
          <div className="mt-0">
            <h4 className="text-[13px] mb-2.5 flex items-center gap-1.5" style={{ fontWeight: 700, color: 'var(--aw-text-primary)' }}>
              <i className="fa-solid fa-headset text-[12px] text-[var(--aw-eu-primary)]" /> گفتگوهای دستیار از طرف شما
            </h4>
            {(() => {
              const ASSISTANT_CHATS = [
                { id: 'ac1', name: 'پشتیبانی ایرانسل', init: 'پ', bg: 'bg-orange-500', lastMsg: 'درخواست تغییر طرح اشتراک ارسال شد', time: '۱۰ دقیقه پیش', status: 'done' as const },
                { id: 'ac2', name: 'دکتر احمدی', init: 'د', bg: 'bg-teal-500', lastMsg: 'نوبت ویزیت برای شنبه ساعت ۱۰ رزرو شد', time: '۳۰ دقیقه پیش', status: 'done' as const },
                { id: 'ac3', name: 'آژانس مسافرتی سفر', init: 'آ', bg: 'bg-blue-500', lastMsg: 'در حال بررسی قیمت بلیط تهران-مشهد...', time: '۱ ساعت پیش', status: 'pending' as const },
                { id: 'ac4', name: 'تعمیرگاه مرکزی', init: 'ت', bg: 'bg-red-500', lastMsg: 'هماهنگی سرویس خودرو انجام شد - چهارشنبه ۹ صبح', time: '۲ ساعت پیش', status: 'done' as const },
                { id: 'ac5', name: 'فروشگاه دیجی‌کالا', init: 'ف', bg: 'bg-pink-500', lastMsg: 'پیگیری مرجوعی سفارش #۸۸۴۵ در جریان است', time: '۳ ساعت پیش', status: 'pending' as const },
                { id: 'ac6', name: 'بانک ملت', init: 'ب', bg: 'bg-indigo-500', lastMsg: 'استعلام وضعیت وام ارسال شد', time: 'دیروز', status: 'done' as const },
                { id: 'ac7', name: 'بیمه پاسارگاد', init: 'ب', bg: 'bg-emerald-500', lastMsg: 'درخواست تمدید بیمه شخص ثالث ثبت شد', time: 'دیروز', status: 'done' as const },
              ];
              const sq = searchQuery.trim().toLowerCase();
              const filtered = ASSISTANT_CHATS.filter(c => {
                if (!sq) return true;
                return c.name.toLowerCase().includes(sq) || c.lastMsg.toLowerCase().includes(sq);
              });
              if (filtered.length === 0) return (
                <div className="text-center text-[12px] text-[var(--aw-text-muted)] py-6">گفتگویی یافت نشد</div>
              );
              return filtered.map(c => (
                <SwipeToCall key={c.id} onCall={() => startCall(c.name, 'گفتگوی دستیار', c.bg, c.init, '')}>
                <div className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer border border-transparent hover:bg-[var(--aw-bg-card-hover)] active:scale-[0.98]"
                  onClick={() => openChat(c.id, 'eu')}>
                  <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 relative ${c.bg}`} style={{ fontWeight: 700, fontSize: 18 }}>
                    {c.init}
                    <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[var(--aw-bg-app)]" style={{ background: 'var(--aw-eu-primary)', fontSize: 8 }}>
                      <i className="fa-solid fa-robot text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm" style={{ fontWeight: 600 }}>{c.name}</span>
                      <span className="text-[11px] text-[var(--aw-text-muted)]">{c.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] text-[var(--aw-text-secondary)] truncate flex-1">{c.lastMsg}</div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md flex-shrink-0 mr-1 ${c.status === 'done' ? 'text-green-400' : 'text-yellow-400'}`}
                        style={{ background: c.status === 'done' ? 'rgba(0,230,118,0.12)' : 'rgba(255,193,7,0.12)', fontWeight: 600 }}>
                        {c.status === 'done' ? 'انجام‌شده' : 'در جریان'}
                      </span>
                    </div>
                  </div>
                </div>
                </SwipeToCall>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================
// EU AGENT DISCOVERY
// ========================
function EuAgentDiscoveryScreen() {
  const { agents, openChat, startCall, openModal, setEuScreen, goBack, openUnifiedCall } = useApp();
  const [search, setSearch] = useState('');

  const allAgents = agents.filter(a => !a.locked && (!search || a.name.includes(search) || a.role.includes(search)));
  const grouped: Record<string, Agent[]> = {};
  allAgents.forEach(a => {
    const comp = a.company || 'alpha';
    if (!grouped[comp]) grouped[comp] = [];
    grouped[comp].push(a);
  });

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      <div className="p-4">
        <h3 className="text-base mb-3 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
          <button
            className="w-8 h-8 rounded-lg bg-transparent border border-[var(--aw-border)] text-[var(--aw-text-secondary)] cursor-pointer flex items-center justify-center hover:text-[var(--aw-eu-primary)] hover:border-[var(--aw-eu-primary)] transition-all"
            onClick={goBack}
          >
            <i className="fa-solid fa-arrow-right text-sm" />
          </button>
          <i className="fa-solid fa-search text-[var(--aw-eu-primary)]" /> جستجوی عامل‌ها
        </h3>
      </div>
      <div className="px-4 pb-2.5 flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-[10px] px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
          <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]" placeholder="جستجوی عامل در همه شرکت‌ها..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer text-sm" onClick={() => setSearch('')}>
              <i className="fa-solid fa-times" />
            </button>
          )}
        </div>
        <button
          className="w-[42px] h-[42px] rounded-[10px] border border-[var(--aw-border)] text-[var(--aw-secondary)] cursor-pointer flex items-center justify-center text-base hover:border-[var(--aw-secondary)] hover:bg-[var(--aw-secondary)] hover:text-white transition-all"
          style={{ background: 'var(--aw-bg-input)' }}
          onClick={openUnifiedCall}
          title="تماس با فیلتر"
        >
          <i className="fa-solid fa-phone" />
        </button>
      </div>
      <div className="px-4">
        {Object.entries(grouped).map(([compKey, compAgents]) => (
          <div key={compKey}>
            <div className="text-[12px] text-[var(--aw-text-muted)] py-2.5 px-1 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
              <i className="fa-solid fa-building" /> {COMPANIES[compKey]?.name || compKey}
            </div>
            {compAgents.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3.5 rounded-[14px] mb-2 cursor-pointer border transition-all hover:border-[var(--aw-eu-primary)]" style={{ background: 'var(--aw-eu-card)', borderColor: 'rgba(126,95,170,0.15)' }}
                onClick={() => openChat(a.id, 'eu')}>
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-white text-base relative ${a.bg}`} style={{ fontWeight: 700 }}>
                  {a.init}
                  <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--aw-bg-app)]" style={{ background: 'var(--aw-online)' }} />
                </div>
                <div className="flex-1">
                  <div className="text-[13px]" style={{ fontWeight: 600 }}>{a.name}</div>
                  <div className="text-[11px] text-[var(--aw-text-secondary)]">{a.role}</div>
                </div>
                <div className="flex gap-1.5">
                  <button className="w-[34px] h-[34px] rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[13px]" style={{ background: 'var(--aw-eu-primary)' }} onClick={(e) => { e.stopPropagation(); openChat(a.id, 'eu'); }}>
                    <i className="fa-solid fa-comment" />
                  </button>
                  <button className="w-[34px] h-[34px] rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[13px]" style={{ background: 'var(--aw-secondary)' }} onClick={(e) => { e.stopPropagation(); startCall(a.name, a.role, a.bg, a.init, a.voip); }}>
                    <i className="fa-solid fa-phone" />
                  </button>
                  <button className="w-[34px] h-[34px] rounded-lg border-none text-white cursor-pointer flex items-center justify-center text-[13px]" style={{ background: 'var(--aw-primary)' }} onClick={(e) => { e.stopPropagation(); openModal(a.name, <AgentProfileModal agent={a} />); }}>
                    <i className="fa-solid fa-info" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12 text-[var(--aw-text-muted)]">
            <i className="fa-solid fa-robot text-[56px] opacity-25 block mb-5" />
            <p className="text-[13px]">عاملی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentProfileModal({ agent: a }: { agent: Agent }) {
  const { closeModal, openChat, startCall } = useApp();
  const comp = COMPANIES[a.company || 'alpha'];
  return (
    <div>
      <div className="text-center mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-[26px] mx-auto mb-2.5 ${a.bg}`} style={{ fontWeight: 700 }}>{a.init}</div>
        <h3 className="text-base">{a.name}</h3>
        <p className="text-[12px] text-[var(--aw-text-secondary)]">{a.role}</p>
        {comp && <p className="text-[11px] text-[var(--aw-text-muted)]">{comp.name}</p>}
      </div>
      <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] text-[12px]">
        <span className="text-[var(--aw-text-secondary)]">وضعیت</span>
        <span className="text-[var(--aw-online)]" style={{ fontWeight: 700 }}>آنلاین</span>
      </div>
      <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] text-[12px]">
        <span className="text-[var(--aw-text-secondary)]">کارهای انجام شده</span>
        <span style={{ fontWeight: 700 }}>{toFa(a.done)}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] text-[12px]">
        <span className="text-[var(--aw-text-secondary)]">کارهای معلق</span>
        <span style={{ fontWeight: 700 }}>{toFa(a.pending)}</span>
      </div>
      {a.voip && (
        <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] text-[12px]">
          <span className="text-[var(--aw-text-secondary)]">داخلی VoIP</span>
          <span style={{ fontWeight: 700 }}>{a.voip}</span>
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-secondary)', fontWeight: 600 }} onClick={() => { closeModal(); setTimeout(() => openChat(a.id, 'eu'), 200); }}>
          <i className="fa-solid fa-comment" /> چت
        </button>
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { closeModal(); startCall(a.name, a.role, a.bg, a.init, a.voip); }}>
          <i className="fa-solid fa-phone" /> تماس
        </button>
      </div>
    </div>
  );
}

// ========================
// EU ORDERS
// ========================
function EuOrdersScreen() {
  const { orders, openModal } = useApp();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      <div className="p-4">
        <h3 className="text-base mb-3 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
          <i className="fa-solid fa-shopping-bag text-[var(--aw-eu-primary)]" /> سفارشات من
        </h3>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 px-4 pb-3 flex-wrap">
        {[
          { id: 'all', label: 'همه' },
          { id: 'pending', label: 'در انتظار' },
          { id: 'preparing', label: 'در حال آماده‌سازی' },
          { id: 'delivered', label: 'تحویل شده' },
        ].map(f => (
          <button key={f.id}
            className={`py-1.5 px-3 rounded-[20px] border text-[11px] cursor-pointer transition-all ${
              filter === f.id ? 'text-white border-[var(--aw-eu-primary)]' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
            }`}
            style={filter === f.id ? { background: 'var(--aw-eu-primary)', fontWeight: 600 } : { fontWeight: 600 }}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {filtered.map(o => (
          <div key={o.id} className="rounded-[14px] p-3.5 mb-2 border border-[var(--aw-border)] cursor-pointer transition-all hover:border-[var(--aw-eu-primary)]" style={{ background: 'var(--aw-bg-card)' }}
            onClick={() => openModal('جزئیات سفارش', <OrderDetail order={o} />)}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ fontWeight: 600 }}>سفارش #{o.num}</span>
              <span className="px-2.5 py-0.5 rounded-[20px] text-[10px]" style={{ background: ORDER_STATUS_COLORS[o.status]?.bg, color: ORDER_STATUS_COLORS[o.status]?.text, fontWeight: 600 }}>
                {ORDER_STATUS_LABELS[o.status]}
              </span>
            </div>
            <div className="text-[12px] text-[var(--aw-text-secondary)] space-y-1">
              <div className="flex items-center gap-1.5"><i className="fa-solid fa-utensils text-[var(--aw-text-muted)]" /> {o.desc}</div>
              <div className="flex items-center gap-1.5"><i className="fa-solid fa-calendar text-[var(--aw-text-muted)]" /> {o.date}</div>
              <div className="flex items-center gap-1.5"><i className="fa-solid fa-coins text-[var(--aw-accent)]" /> {o.price} ریال</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--aw-text-muted)]">
            <i className="fa-solid fa-shopping-bag text-[56px] opacity-25 block mb-5" />
            <p className="text-[13px]">سفارشی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ order: o }: { order: Order }) {
  const { closeModal, openChat, orders, setOrders, showToast } = useApp();

  const cancelOrder = () => {
    setOrders(prev => prev.map(or => or.id === o.id ? { ...or, status: 'cancelled' as const } : or));
    closeModal();
    showToast('سفارش #' + o.num + ' لغو شد');
  };

  return (
    <div>
      <div className="text-center mb-4">
        <i className="fa-solid fa-shopping-bag text-[40px] text-[var(--aw-eu-primary)] mb-2.5 block" />
        <h3>سفارش #{o.num}</h3>
      </div>
      <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] text-[12px]">
        <span className="text-[var(--aw-text-secondary)]">وضعیت</span>
        <span style={{ fontWeight: 700, color: ORDER_STATUS_COLORS[o.status]?.text }}>{ORDER_STATUS_LABELS[o.status]}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] text-[12px]">
        <span className="text-[var(--aw-text-secondary)]">شرح</span>
        <span style={{ fontWeight: 600 }}>{o.desc}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] text-[12px]">
        <span className="text-[var(--aw-text-secondary)]">مبلغ کل</span>
        <span style={{ fontWeight: 700 }}>{o.price} ریال</span>
      </div>
      <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] text-[12px]">
        <span className="text-[var(--aw-text-secondary)]">تاریخ</span>
        <span style={{ fontWeight: 700 }}>{o.date}</span>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }}
          onClick={() => { closeModal(); setTimeout(() => openChat(o.agentId, 'eu'), 200); }}>
          <i className="fa-solid fa-comment" /> پیگیری با عامل
        </button>
        {(o.status === 'pending' || o.status === 'preparing') && (
          <button className="py-2.5 px-5 rounded-[10px] text-[13px] cursor-pointer border border-[var(--aw-danger)] text-[var(--aw-danger)] bg-transparent" style={{ fontWeight: 600 }}
            onClick={cancelOrder}>
            <i className="fa-solid fa-times" /> لغو
          </button>
        )}
      </div>
    </div>
  );
}

// ========================
// EU PROFILE
// ========================
function EuProfileScreen() {
  const { euProfile, openModal } = useApp();

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      {/* Profile Header */}
      <div className="text-center py-6">
        <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-white text-[38px] mx-auto mb-3 overflow-hidden" style={{ background: '#7b62fc', boxShadow: '0 8px 24px rgba(123,98,252,0.4)', fontWeight: 700 }}>
          {euProfile.avatarImage
            ? <img src={euProfile.avatarImage} alt={euProfile.name} className="w-full h-full object-cover" />
            : euProfile.avatar}
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="text-[20px]" style={{ fontWeight: 700, color: 'var(--aw-text-primary)' }}>{euProfile.name}</div>
          {euProfile.verified ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px]"
              style={{ background: 'rgba(52,199,89,0.15)', color: '#34C759', fontWeight: 700 }}>
              احراز شده
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px]"
              style={{ background: 'rgba(255,56,60,0.12)', color: '#FF383C', fontWeight: 700 }}>
              احراز نشده!
            </span>
          )}
        </div>
        {euProfile.username && <div className="text-[13px] text-[#5C4ABD] mt-0.5" style={{ fontWeight: 700 }}>@{euProfile.username}</div>}
        {euProfile.email && <div className="text-[13px] text-[#8F8F8F] mt-0.5">{euProfile.email}</div>}
      </div>

      {/* Settings — unified with admin structure (SettingsGroup / SettingsItem) */}
      <div className="px-4">
        <SettingsGroup title="حساب کاربری">
          <SettingsItem icon="fa-solid fa-user-circle" label="ویرایش پروفایل" onClick={() => openModal('پروفایل من', <ProfileContent />)} />
          <SettingsItem icon="fa-solid fa-wallet" label="مالی" onClick={() => openModal('بخش مالی', <EuFinanceContent />)} />
          <SettingsItem icon="fa-solid fa-shield-halved" label="تنظیمات امنیتی" onClick={() => openModal('تنظیمات امنیتی', <EuSecurityContent />)} />
          <SettingsItem icon="fa-solid fa-bell" label="اعلان‌ها" onClick={() => openModal('اعلان‌ها', <EuNotifications />)} />
          <SettingsItem icon="fa-solid fa-cog" label="تنظیمات برنامه" onClick={() => openModal('تنظیمات برنامه', <EuAppSettings />)} />
        </SettingsGroup>

        <SettingsGroup title="پشتیبانی و راهنما">
          <SettingsItem icon="fa-solid fa-headset" label="پشتیبانی" onClick={() => openModal('پشتیبانی', <EuSupportContent />)} />
          <SettingsItem icon="fa-solid fa-circle-question" label="سوالات متداول" onClick={() => openModal('سوالات متداول', <EuFaqContent />)} />
          <SettingsItem icon="fa-solid fa-file-contract" label="قوانین و حریم خصوصی" onClick={() => openModal('قوانین و حریم خصوصی', <EuLegalContent />)} />
          <SettingsItem icon="fa-solid fa-question-circle" label="راهنما" onClick={() => openModal('راهنما', <HelpContent />)} />
          <SettingsItem icon="fa-solid fa-sign-out-alt" label="خروج" danger onClick={() => openModal('خروج', <EuLogoutContent />)} />
        </SettingsGroup>
      </div>
    </div>
  );
}

// ====== FINANCE ======
type FinanceTab = 'wallet' | 'history' | 'methods' | 'invoices' | 'transactions';

function EuFinanceContent() {
  const { showToast, orders } = useApp();
  const [tab, setTab] = useState<FinanceTab>('wallet');
  const [balance, setBalance] = useState(345000);
  const [opAmount, setOpAmount] = useState('');
  const [opMode, setOpMode] = useState<'deposit' | 'withdraw' | null>(null);

  const [transactions, setTransactions] = useState<{ id: number; type: 'deposit' | 'withdraw' | 'purchase'; amount: number; date: string; desc: string }[]>([
    { id: 1, type: 'purchase', amount: -185000, date: 'امروز ۱۱:۲۰', desc: 'پرداخت سفارش #۱۰۲۵' },
    { id: 2, type: 'deposit',  amount: 500000,  date: 'دیروز ۰۹:۴۵', desc: 'شارژ کیف پول از بانک ملی' },
    { id: 3, type: 'purchase', amount: -270000, date: '۲ روز پیش',   desc: 'خرید اشتراک ماهانه Neura' },
    { id: 4, type: 'withdraw', amount: -100000, date: '۴ روز پیش',   desc: 'برداشت به کارت **۴۲۷۸' },
    { id: 5, type: 'deposit',  amount: 1000000, date: 'هفته پیش',     desc: 'شارژ کیف پول' },
    { id: 6, type: 'purchase', amount: -120000, date: '۱۰ روز پیش',  desc: 'پرداخت سفارش #۱۰۱۸' },
  ]);

  const invoices = [
    { id: 'INV-1042', date: '۴ اسفند ۱۴۰۴', amount: '۵۷۰,۰۰۰', status: 'paid'    as const, desc: 'فاکتور سفارش #۱۰۲۶' },
    { id: 'INV-1041', date: '۲ اسفند ۱۴۰۴', amount: '۲۱۵,۰۰۰', status: 'paid'    as const, desc: 'فاکتور سفارش #۱۰۲۵' },
    { id: 'INV-1040', date: '۱ اسفند ۱۴۰۴', amount: '۲۷۰,۰۰۰', status: 'paid'    as const, desc: 'اشتراک ماهانه Neura' },
    { id: 'INV-1039', date: '۲۸ بهمن ۱۴۰۴', amount: '۴۳۵,۰۰۰', status: 'pending' as const, desc: 'فاکتور سفارش #۱۰۲۴' },
    { id: 'INV-1038', date: '۲۵ بهمن ۱۴۰۴', amount: '۱۳۵,۰۰۰', status: 'refund'  as const, desc: 'فاکتور لغو شده #۱۰۲۲' },
  ];

  const paymentMethods = [
    { id: 'pm1', type: 'card',   label: 'بانک ملی',     last4: '۴۲۷۸', icon: 'fa-solid fa-credit-card', color: '#3B82F6', isDefault: true },
    { id: 'pm2', type: 'card',   label: 'بانک سامان',   last4: '۹۱۰۲', icon: 'fa-solid fa-credit-card', color: '#10B981', isDefault: false },
    { id: 'pm3', type: 'wallet', label: 'کیف پول Neura', last4: '',     icon: 'fa-solid fa-wallet',      color: '#8B5CF6', isDefault: false },
  ];

  const formatNum = (n: number) => Math.abs(n).toLocaleString('fa-IR');

  const submitOp = () => {
    const parsed = parseInt(opAmount.replace(/[^\d]/g, ''), 10);
    if (!parsed || parsed <= 0) { showToast('مبلغ معتبر وارد کنید'); return; }
    if (opMode === 'withdraw' && parsed > balance) { showToast('موجودی کافی نیست'); return; }
    const delta = opMode === 'deposit' ? parsed : -parsed;
    setBalance(b => b + delta);
    setTransactions(prev => [{
      id: Math.max(...prev.map(t => t.id), 0) + 1,
      type: opMode!, amount: delta, date: 'هم‌اکنون',
      desc: opMode === 'deposit' ? 'شارژ کیف پول' : 'برداشت از کیف پول',
    }, ...prev]);
    showToast(opMode === 'deposit' ? 'واریز با موفقیت انجام شد' : 'برداشت با موفقیت انجام شد');
    setOpMode(null); setOpAmount('');
  };

  const TABS: { id: FinanceTab; label: string; icon: string }[] = [
    { id: 'wallet',       label: 'کیف پول',       icon: 'fa-solid fa-wallet' },
    { id: 'history',      label: 'تاریخچه خرید',  icon: 'fa-solid fa-clock-rotate-left' },
    { id: 'methods',      label: 'روش‌های پرداخت', icon: 'fa-solid fa-credit-card' },
    { id: 'invoices',     label: 'فاکتورها',       icon: 'fa-solid fa-file-invoice' },
    { id: 'transactions', label: 'تراکنش‌ها',      icon: 'fa-solid fa-right-left' },
  ];

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto aw-scroll pb-1">
        {TABS.map(t => (
          <button key={t.id}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer whitespace-nowrap transition-all"
            style={tab === t.id
              ? { background: 'var(--aw-eu-primary)', color: '#fff', borderColor: 'transparent', fontWeight: 700 }
              : { background: 'transparent', color: 'var(--aw-text-secondary)', borderColor: 'var(--aw-border)', fontWeight: 500 }}
            onClick={() => setTab(t.id)}>
            <i className={`${t.icon} text-[10px]`} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'wallet' && (
        <div>
          <div className="rounded-2xl p-4 mb-3 text-white"
            style={{ background: 'linear-gradient(135deg, var(--aw-eu-primary), var(--aw-eu-primary-dark))' }}>
            <div className="text-[10px] opacity-80 mb-1">موجودی کیف پول</div>
            <div className="text-[24px]" style={{ fontWeight: 800 }}>{formatNum(balance)} <span className="text-[12px] opacity-80">تومان</span></div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2 rounded-lg border-none text-[11.5px] cursor-pointer flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.20)', color: '#fff', fontWeight: 700 }}
                onClick={() => { setOpMode('deposit'); setOpAmount(''); }}>
                <i className="fa-solid fa-arrow-down text-[10px]" /> واریز
              </button>
              <button className="flex-1 py-2 rounded-lg border-none text-[11.5px] cursor-pointer flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.20)', color: '#fff', fontWeight: 700 }}
                onClick={() => { setOpMode('withdraw'); setOpAmount(''); }}>
                <i className="fa-solid fa-arrow-up text-[10px]" /> برداشت
              </button>
            </div>
          </div>

          {opMode && (
            <div className="rounded-xl border border-[var(--aw-border)] p-3 mb-3" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="text-[12px] mb-2" style={{ fontWeight: 700 }}>
                {opMode === 'deposit' ? 'واریز به کیف پول' : 'برداشت از کیف پول'}
              </div>
              <input type="text" inputMode="numeric"
                className="w-full text-center py-2.5 rounded-[10px] border border-[var(--aw-border)] text-[16px] outline-none mb-2 text-[var(--aw-text-primary)]"
                style={{ background: 'var(--aw-bg-input)', fontWeight: 700 }}
                placeholder="مبلغ به تومان"
                value={opAmount}
                onChange={e => setOpAmount(e.target.value.replace(/[^\d]/g, ''))} />
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {[100000, 500000, 1000000, 2000000].map(v => (
                  <button key={v}
                    className="py-1 px-2.5 rounded-md border border-[var(--aw-border)] bg-transparent text-[10.5px] cursor-pointer text-[var(--aw-text-secondary)]"
                    onClick={() => setOpAmount(String(v))}>
                    {v.toLocaleString('fa-IR')}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-[10px] border-none text-white text-[12px] cursor-pointer"
                  style={{ background: opMode === 'deposit' ? '#10B981' : '#F59E0B', fontWeight: 700 }}
                  onClick={submitOp}>
                  تأیید {opMode === 'deposit' ? 'واریز' : 'برداشت'}
                </button>
                <button className="px-4 rounded-[10px] border border-[var(--aw-border)] bg-transparent text-[12px] cursor-pointer text-[var(--aw-text-secondary)]"
                  onClick={() => setOpMode(null)}>انصراف</button>
              </div>
            </div>
          )}

          <div className="text-[11px] text-[var(--aw-text-muted)] mb-1.5 px-1" style={{ fontWeight: 700 }}>آخرین تراکنش‌ها</div>
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-2.5 p-2.5 mb-1.5 rounded-xl border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: t.amount > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                <i className={`fa-solid ${t.amount > 0 ? 'fa-arrow-down' : 'fa-arrow-up'} text-[10px]`}
                  style={{ color: t.amount > 0 ? '#10B981' : '#EF4444' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] truncate" style={{ fontWeight: 600 }}>{t.desc}</div>
                <div className="text-[9.5px] text-[var(--aw-text-muted)]">{t.date}</div>
              </div>
              <div className="text-[12px] flex-shrink-0" style={{ color: t.amount > 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                {t.amount > 0 ? '+' : '−'}{formatNum(t.amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-[var(--aw-text-muted)] text-[11.5px]">
              <i className="fa-solid fa-shopping-bag text-[28px] opacity-25 block mb-2" />
              تاریخچه‌ای موجود نیست
            </div>
          ) : orders.map(o => (
            <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl mb-1.5 border border-[var(--aw-border)]"
              style={{ background: 'var(--aw-bg-card)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: ORDER_STATUS_COLORS[o.status]?.bg || 'var(--aw-primary-bg)' }}>
                <i className="fa-solid fa-receipt text-[12px]" style={{ color: ORDER_STATUS_COLORS[o.status]?.text || 'var(--aw-eu-primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px]" style={{ fontWeight: 600 }}>سفارش #{o.num}</div>
                <div className="text-[10px] text-[var(--aw-text-muted)]">{o.date}</div>
              </div>
              <div className="text-left">
                <div className="text-[11px]" style={{ fontWeight: 700 }}>{o.price}</div>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded-md" style={{ background: ORDER_STATUS_COLORS[o.status]?.bg, color: ORDER_STATUS_COLORS[o.status]?.text, fontWeight: 700 }}>
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'methods' && (
        <div>
          {paymentMethods.map(pm => (
            <div key={pm.id} className="flex items-center gap-3 p-3 rounded-xl mb-1.5 border border-[var(--aw-border)]"
              style={{ background: 'var(--aw-bg-card)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: pm.color }}>
                <i className={`${pm.icon} text-[14px]`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px]" style={{ fontWeight: 600 }}>{pm.label}</span>
                  {pm.isDefault && <span className="text-[8px] px-1.5 py-0.5 rounded-md text-white" style={{ background: 'var(--aw-eu-primary)', fontWeight: 700 }}>پیش‌فرض</span>}
                </div>
                <div className="text-[10.5px] text-[var(--aw-text-muted)]">
                  {pm.type === 'card' ? `**** **** **** ${pm.last4}` : 'موجودی داخلی'}
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg border border-[var(--aw-border)] bg-transparent cursor-pointer text-[var(--aw-text-muted)]"
                onClick={() => showToast('ویرایش روش پرداخت')}>
                <i className="fa-solid fa-pen text-[10px]" />
              </button>
            </div>
          ))}
          <button className="w-full py-2.5 rounded-xl border border-dashed text-[12px] cursor-pointer flex items-center justify-center gap-1.5"
            style={{ borderColor: 'var(--aw-eu-primary)', color: 'var(--aw-eu-primary)', background: 'transparent', fontWeight: 600 }}
            onClick={() => showToast('افزودن روش پرداخت جدید')}>
            <i className="fa-solid fa-plus text-[10px]" /> افزودن روش پرداخت
          </button>
        </div>
      )}

      {tab === 'invoices' && (
        <div>
          {invoices.map(inv => {
            const meta = inv.status === 'paid'
              ? { label: 'پرداخت شده', color: '#10B981' }
              : inv.status === 'pending'
                ? { label: 'در انتظار', color: '#F59E0B' }
                : { label: 'مرجوع', color: '#EF4444' };
            return (
              <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl mb-1.5 border border-[var(--aw-border)]"
                style={{ background: 'var(--aw-bg-card)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}18` }}>
                  <i className="fa-solid fa-file-invoice text-[12px]" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px]" style={{ fontWeight: 600 }}>{inv.id}</div>
                  <div className="text-[10px] text-[var(--aw-text-muted)] truncate">{inv.desc} · {inv.date}</div>
                </div>
                <div className="text-left">
                  <div className="text-[11px]" style={{ fontWeight: 700 }}>{inv.amount}</div>
                  <span className="text-[8.5px] px-1.5 py-0.5 rounded-md" style={{ background: `${meta.color}18`, color: meta.color, fontWeight: 700 }}>{meta.label}</span>
                </div>
                <button className="w-8 h-8 rounded-lg border border-[var(--aw-border)] bg-transparent cursor-pointer text-[var(--aw-text-muted)]"
                  onClick={() => showToast('دانلود فاکتور ' + inv.id)}>
                  <i className="fa-solid fa-download text-[10px]" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'transactions' && (
        <div>
          {transactions.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 p-2.5 mb-1.5 rounded-xl border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: t.amount > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                <i className={`fa-solid ${t.type === 'deposit' ? 'fa-arrow-down' : t.type === 'withdraw' ? 'fa-arrow-up' : 'fa-bag-shopping'} text-[11px]`}
                  style={{ color: t.amount > 0 ? '#10B981' : '#EF4444' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] truncate" style={{ fontWeight: 600 }}>{t.desc}</div>
                <div className="text-[9.5px] text-[var(--aw-text-muted)]">{t.date} · {t.type === 'deposit' ? 'واریز' : t.type === 'withdraw' ? 'برداشت' : 'خرید'}</div>
              </div>
              <div className="text-[12px] flex-shrink-0" style={{ color: t.amount > 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                {t.amount > 0 ? '+' : '−'}{formatNum(t.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====== SECURITY ======
type SecurityTab = 'password' | 'twofa' | 'thirdparty' | 'logs';

function EuSecurityContent() {
  const { showToast } = useApp();
  const [tab, setTab] = useState<SecurityTab>('password');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAMethod, setTwoFAMethod] = useState<'sms' | 'app' | 'email'>('sms');

  const [providers, setProviders] = useState([
    { id: 'google',   name: 'Google',   icon: 'fa-brands fa-google',   color: '#EA4335', connected: true,  email: 'user@gmail.com' },
    { id: 'apple',    name: 'Apple',    icon: 'fa-brands fa-apple',    color: '#000000', connected: false, email: '' },
    { id: 'github',   name: 'GitHub',   icon: 'fa-brands fa-github',   color: '#181717', connected: false, email: '' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin', color: '#0A66C2', connected: false, email: '' },
  ]);

  const securityLog = [
    { id: 1, type: 'login',    date: 'امروز ۱۴:۲۲',   ip: '۱۸۵.۲۳۱.۸۸.۴۲',  device: 'Chrome / Windows', location: 'تهران', success: true  },
    { id: 2, type: 'login',    date: 'امروز ۰۹:۱۰',   ip: '۱۸۵.۲۳۱.۸۸.۴۲',  device: 'Safari / iOS',     location: 'تهران', success: true  },
    { id: 3, type: 'pwd',      date: 'دیروز ۲۰:۱۵',   ip: '۱۸۵.۲۳۱.۸۸.۴۲',  device: 'Chrome / Windows', location: 'تهران', success: true  },
    { id: 4, type: 'login',    date: 'دیروز ۱۸:۰۰',   ip: '۸۹.۴۴.۲۰۱.۹',    device: 'Firefox / Linux',  location: 'مشهد',  success: false },
    { id: 5, type: '2fa',      date: '۲ روز پیش',    ip: '۱۸۵.۲۳۱.۸۸.۴۲',  device: 'Chrome / Windows', location: 'تهران', success: true  },
    { id: 6, type: 'thirdparty', date: '۳ روز پیش',  ip: '۱۸۵.۲۳۱.۸۸.۴۲',  device: 'Chrome / Windows', location: 'تهران', success: true  },
    { id: 7, type: 'login',    date: 'هفته پیش',     ip: '۱۸۵.۲۳۱.۸۸.۴۲',  device: 'Chrome / Mac',     location: 'تهران', success: true  },
  ];

  const submitPwd = () => {
    if (newPwd.length < 6) { showToast('پسورد جدید حداقل ۶ کاراکتر'); return; }
    if (newPwd !== confirmPwd) { showToast('تکرار پسورد مطابقت ندارد'); return; }
    showToast('پسورد با موفقیت تغییر کرد');
    setOldPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  const toggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, connected: !p.connected, email: !p.connected ? `user@${id}.com` : '' } : p));
    const target = providers.find(p => p.id === id)!;
    showToast(target.connected ? 'اکانت قطع شد' : 'اکانت متصل شد');
  };

  const TABS: { id: SecurityTab; label: string; icon: string }[] = [
    { id: 'password',   label: 'پسورد',          icon: 'fa-solid fa-key' },
    { id: 'twofa',      label: 'دو مرحله‌ای',    icon: 'fa-solid fa-mobile-screen-button' },
    { id: 'thirdparty', label: 'اکانت‌های ثالث', icon: 'fa-solid fa-link' },
    { id: 'logs',       label: 'لاگ امنیتی',     icon: 'fa-solid fa-clock-rotate-left' },
  ];

  const logMeta = (type: string) => {
    if (type === 'login')      return { icon: 'fa-solid fa-right-to-bracket', color: '#3B82F6', label: 'ورود' };
    if (type === 'pwd')        return { icon: 'fa-solid fa-key',              color: '#F59E0B', label: 'تغییر پسورد' };
    if (type === '2fa')        return { icon: 'fa-solid fa-shield-halved',    color: '#10B981', label: 'تغییر 2FA' };
    return                            { icon: 'fa-solid fa-link',             color: '#8B5CF6', label: 'اتصال اکانت' };
  };

  return (
    <div>
      <div className="flex gap-1.5 mb-3 overflow-x-auto aw-scroll pb-1">
        {TABS.map(t => (
          <button key={t.id}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-[11px] cursor-pointer whitespace-nowrap transition-all"
            style={tab === t.id
              ? { background: 'var(--aw-eu-primary)', color: '#fff', borderColor: 'transparent', fontWeight: 700 }
              : { background: 'transparent', color: 'var(--aw-text-secondary)', borderColor: 'var(--aw-border)', fontWeight: 500 }}
            onClick={() => setTab(t.id)}>
            <i className={`${t.icon} text-[10px]`} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'password' && (
        <div>
          <FormGroup label="پسورد فعلی">
            <div className="relative">
              <FormInput type={showPwd ? 'text' : 'password'} value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="پسورد فعلی" />
            </div>
          </FormGroup>
          <FormGroup label="پسورد جدید">
            <FormInput type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="حداقل ۶ کاراکتر" />
          </FormGroup>
          <FormGroup label="تکرار پسورد جدید">
            <FormInput type={showPwd ? 'text' : 'password'} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="تکرار پسورد" />
          </FormGroup>
          <label className="flex items-center gap-2 mb-3 cursor-pointer text-[11.5px] text-[var(--aw-text-secondary)]">
            <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)} />
            نمایش پسوردها
          </label>
          <button className="w-full py-2.5 rounded-[10px] border-none text-white text-[12.5px] cursor-pointer"
            style={{ background: 'var(--aw-eu-primary)', fontWeight: 700 }} onClick={submitPwd}>
            <i className="fa-solid fa-check text-[10px] ml-1" /> ذخیره پسورد
          </button>
        </div>
      )}

      {tab === 'twofa' && (
        <div>
          <div className="rounded-xl p-3 mb-3 border" style={{
            background: twoFAEnabled ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
            borderColor: twoFAEnabled ? 'rgba(16,185,129,0.30)' : 'rgba(245,158,11,0.30)',
          }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-[14px]" style={{ color: twoFAEnabled ? '#10B981' : '#F59E0B' }} />
                <span className="text-[12.5px]" style={{ fontWeight: 700 }}>ورود دو مرحله‌ای</span>
              </div>
              <button
                className="w-11 h-6 rounded-full border-none cursor-pointer relative transition-all"
                style={{ background: twoFAEnabled ? '#10B981' : 'var(--aw-border)' }}
                onClick={() => { setTwoFAEnabled(!twoFAEnabled); showToast(twoFAEnabled ? 'دو مرحله‌ای غیرفعال شد' : 'دو مرحله‌ای فعال شد'); }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ right: twoFAEnabled ? 2 : 22 }} />
              </button>
            </div>
            <div className="text-[10.5px] text-[var(--aw-text-secondary)] leading-5">
              با فعال‌سازی، علاوه بر پسورد، یک کد یکبار مصرف نیز برای ورود نیاز خواهد بود.
            </div>
          </div>

          {twoFAEnabled && (
            <div>
              <div className="text-[11px] text-[var(--aw-text-muted)] mb-1.5 px-1" style={{ fontWeight: 700 }}>روش تأیید</div>
              {([
                { id: 'sms'   as const, icon: 'fa-solid fa-mobile-screen', label: 'پیامک',          desc: 'کد به موبایل ارسال می‌شود' },
                { id: 'app'   as const, icon: 'fa-solid fa-shield',        label: 'اپ Authenticator', desc: 'Google Authenticator یا مشابه' },
                { id: 'email' as const, icon: 'fa-solid fa-envelope',      label: 'ایمیل',           desc: 'کد به ایمیل ارسال می‌شود' },
              ]).map(m => (
                <button key={m.id}
                  className="w-full flex items-center gap-2.5 p-3 mb-1.5 rounded-xl border cursor-pointer text-right"
                  style={{
                    background: twoFAMethod === m.id ? 'var(--aw-eu-primary-bg)' : 'var(--aw-bg-card)',
                    borderColor: twoFAMethod === m.id ? 'var(--aw-eu-primary)' : 'var(--aw-border)',
                  }}
                  onClick={() => { setTwoFAMethod(m.id); showToast('روش انتخاب شد'); }}>
                  <i className={`${m.icon} text-[14px]`} style={{ color: twoFAMethod === m.id ? 'var(--aw-eu-primary)' : 'var(--aw-text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px]" style={{ fontWeight: 600 }}>{m.label}</div>
                    <div className="text-[10px] text-[var(--aw-text-muted)]">{m.desc}</div>
                  </div>
                  {twoFAMethod === m.id && <i className="fa-solid fa-circle-check text-[12px]" style={{ color: 'var(--aw-eu-primary)' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'thirdparty' && (
        <div>
          <div className="text-[11px] text-[var(--aw-text-muted)] mb-2 leading-5 px-1">
            با اتصال اکانت‌های زیر، می‌توانید بدون پسورد وارد شوید.
          </div>
          {providers.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 mb-1.5 rounded-xl border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: p.color }}>
                <i className={`${p.icon} text-[16px]`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px]" style={{ fontWeight: 600 }}>{p.name}</div>
                <div className="text-[10px] text-[var(--aw-text-muted)] truncate">
                  {p.connected ? p.email : 'متصل نشده'}
                </div>
              </div>
              <button className="py-1.5 px-3 rounded-lg border-none text-[10.5px] cursor-pointer text-white"
                style={{ background: p.connected ? '#EF4444' : '#10B981', fontWeight: 700 }}
                onClick={() => toggleProvider(p.id)}>
                {p.connected ? 'قطع اتصال' : 'اتصال'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <div>
          {securityLog.map(l => {
            const m = logMeta(l.type);
            return (
              <div key={l.id} className="flex items-center gap-2.5 p-2.5 mb-1.5 rounded-xl border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${m.color}18` }}>
                  <i className={`${m.icon} text-[11px]`} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px]" style={{ fontWeight: 700 }}>{m.label}</span>
                    {!l.success && <span className="text-[8.5px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.18)', color: '#EF4444', fontWeight: 700 }}>ناموفق</span>}
                  </div>
                  <div className="text-[9.5px] text-[var(--aw-text-muted)] truncate">{l.device} · {l.location} · {l.ip}</div>
                </div>
                <div className="text-[9.5px] text-[var(--aw-text-muted)] flex-shrink-0">{l.date}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EuSettingsItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 mb-2 cursor-pointer transition-all hover:brightness-[0.98]"
      style={{
        height: 40,
        borderRadius: 12,
        background: 'var(--aw-eu-glass-card, rgba(255,255,255,0.2))',
        boxShadow: 'inset 0 0 0 0.5px var(--aw-eu-glass-bd, rgb(255,255,255)), 0px 4px 4px rgba(123,98,252,0.2)',
      }}
      onClick={onClick}>
      <i className={`${icon} text-[16px] w-5 text-center`} style={{ color: danger ? '#FF383C' : 'var(--aw-text-primary)' }} />
      <span className="flex-1 text-[14px]" style={{ fontWeight: 500, color: danger ? '#FF383C' : 'var(--aw-text-primary)', fontFamily: "'Kamand', 'Vazirmatn', sans-serif" }}>{label}</span>
      <i className="fa-solid fa-chevron-left text-[13px]" style={{ color: '#8F8F8F' }} />
    </div>
  );
}

function EuAppSettings() {
  const { showToast, theme, setTheme, closeModal } = useApp();

  const themeOptions: { id: 'dark' | 'light' | 'bw' | 'glass'; icon: string; label: string }[] = [
    { id: 'glass', icon: 'fa-solid fa-sun', label: 'روشن' },
    { id: 'dark', icon: 'fa-solid fa-moon', label: 'تیره' },
    { id: 'bw', icon: 'fa-solid fa-circle-half-stroke', label: 'سیاه‌سفید' },
  ];

  return (
    <div>
      {/* Theme Selector */}
      <div className="mb-4">
        <div className="text-[12px] text-[var(--aw-text-muted)] mb-2 px-1" style={{ fontWeight: 600 }}>تم برنامه</div>
        <div className="grid grid-cols-2 gap-2">
          {themeOptions.map(t => (
            <button
              key={t.id}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all ${
                theme === t.id
                  ? 'border-[var(--aw-eu-primary)] text-[var(--aw-eu-primary)]'
                  : 'border-[var(--aw-border)] text-[var(--aw-text-secondary)]'
              }`}
              style={{
                background: theme === t.id ? 'var(--aw-primary-bg)' : 'var(--aw-bg-card)',
                fontWeight: theme === t.id ? 700 : 500,
              }}
              onClick={() => {
                setTheme(t.id);
                showToast('تم «' + t.label + '» فعال شد');
              }}
            >
              <i className={`${t.icon} text-lg`} />
              <span className="text-[11px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <EuSettingsItem icon="fa-solid fa-language" label="زبان: فارسی" onClick={() => showToast('زبان فارسی انتخاب شده')} />
      <EuSettingsItem icon="fa-solid fa-bell" label="اعلان‌ها: فعال" onClick={() => showToast('اعلان‌ها فعال است')} />
      <EuSettingsItem icon="fa-solid fa-database" label="پاک‌سازی کش" onClick={() => { showToast('کش پاک‌سازی شد'); closeModal(); }} />
    </div>
  );
}

function HelpContent() {
  return (
    <div>
      {[
        { q: 'چگونه سفارش غذا ثبت کنم؟', a: 'از صفحه خانه روی "سفارش غذا" کلیک کنید و با عامل رستوران گفتگو کنید.' },
        { q: 'چگونه با پشتیبانی تماس بگیرم؟', a: 'از منوی خانه روی "پشتیبانی" کلیک کنید یا از دکمه تماس استفاده کنید.' },
        { q: 'چگونه سفارش را لغو کنم؟', a: 'به بخش سفارشات رفته، سفارش مورد نظر را انتخاب و دکمه لغو را بزنید.' },
        { q: 'چگونه پروفایل خود را ویرایش کنم؟', a: 'از بخش پروفایل، گزینه "ویرایش پروفایل" را انتخاب کنید.' },
      ].map((item, i) => (
        <div key={i} className="rounded-xl p-3.5 mb-2 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
          <div className="text-[13px] mb-1 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
            <i className="fa-solid fa-question-circle text-[var(--aw-eu-primary)]" /> {item.q}
          </div>
          <div className="text-[12px] text-[var(--aw-text-secondary)]">{item.a}</div>
        </div>
      ))}
    </div>
  );
}

// ====== SUPPORT (TICKETING) ======
type TicketStatus = 'open' | 'pending' | 'answered' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high';
type TicketMessage = { id: number; from: 'user' | 'agent'; body: string; date: string };
type Ticket = {
  id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  updated: string;
  messages: TicketMessage[];
};

const TICKET_STATUS_META: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  open:     { label: 'باز',           color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  pending:  { label: 'در انتظار پاسخ', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  answered: { label: 'پاسخ داده شده',  color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  closed:   { label: 'بسته شده',       color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
};

const TICKET_PRIORITY_META: Record<TicketPriority, { label: string; color: string }> = {
  low:    { label: 'کم',     color: '#10B981' },
  medium: { label: 'متوسط',  color: '#F59E0B' },
  high:   { label: 'بالا',   color: '#EF4444' },
};

const TICKET_CATEGORIES = ['فنی', 'مالی', 'سفارشات', 'حساب کاربری', 'سایر'];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TK-1042', subject: 'مشکل در پرداخت سفارش', category: 'مالی', priority: 'high', status: 'answered', updated: '۲ ساعت پیش',
    messages: [
      { id: 1, from: 'user',  body: 'سلام، هنگام پرداخت سفارش #۱۰۲۵ مبلغ کسر شد ولی سفارش ثبت نشد.', date: 'دیروز ۱۴:۲۰' },
      { id: 2, from: 'agent', body: 'سلام، با عرض پوزش. تراکنش بررسی شد و مبلغ تا ۲۴ ساعت آینده به کیف پول شما برمی‌گردد.', date: 'امروز ۰۹:۳۰' },
    ],
  },
  {
    id: 'TK-1041', subject: 'تغییر شماره تماس حساب', category: 'حساب کاربری', priority: 'medium', status: 'pending', updated: 'دیروز',
    messages: [
      { id: 1, from: 'user', body: 'چطور می‌تونم شماره موبایلم رو تغییر بدم؟', date: 'دیروز ۱۰:۱۵' },
    ],
  },
  {
    id: 'TK-1038', subject: 'باگ در نمایش گزارش‌ها', category: 'فنی', priority: 'low', status: 'closed', updated: '۵ روز پیش',
    messages: [
      { id: 1, from: 'user',  body: 'در گزارش هفتگی نمودار خط نمایش داده نمی‌شود.', date: '۶ روز پیش' },
      { id: 2, from: 'agent', body: 'با به‌روزرسانی نسخه ۲.۳ این مشکل برطرف شد. ممنون از گزارش شما.', date: '۵ روز پیش' },
    ],
  },
];

function EuSupportContent() {
  const { showToast } = useApp();
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [view, setView] = useState<'list' | 'detail' | 'new'>('list');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [reply, setReply] = useState('');

  const [draft, setDraft] = useState({ subject: '', category: TICKET_CATEGORIES[0], priority: 'medium' as TicketPriority, body: '' });

  const filtered = useMemo(
    () => tickets.filter(t => filter === 'all' || t.status === filter),
    [tickets, filter],
  );

  const active = tickets.find(t => t.id === activeId) || null;

  const submitNew = () => {
    if (!draft.subject.trim() || !draft.body.trim()) { showToast('عنوان و متن تیکت را وارد کنید'); return; }
    const id = 'TK-' + Math.floor(1100 + Math.random() * 900);
    const ticket: Ticket = {
      id, subject: draft.subject.trim(), category: draft.category, priority: draft.priority,
      status: 'open', updated: 'هم‌اکنون',
      messages: [{ id: 1, from: 'user', body: draft.body.trim(), date: 'هم‌اکنون' }],
    };
    setTickets(prev => [ticket, ...prev]);
    setDraft({ subject: '', category: TICKET_CATEGORIES[0], priority: 'medium', body: '' });
    setActiveId(id);
    setView('detail');
    showToast('تیکت با موفقیت ثبت شد');
  };

  const sendReply = () => {
    if (!active || !reply.trim()) return;
    setTickets(prev => prev.map(t => t.id === active.id ? {
      ...t,
      status: 'pending',
      updated: 'هم‌اکنون',
      messages: [...t.messages, { id: t.messages.length + 1, from: 'user', body: reply.trim(), date: 'هم‌اکنون' }],
    } : t));
    setReply('');
    showToast('پیام ارسال شد');
  };

  const closeTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'closed', updated: 'هم‌اکنون' } : t));
    showToast('تیکت بسته شد');
  };

  if (view === 'new') {
    return (
      <div>
        <button className="text-[11.5px] mb-3 cursor-pointer bg-transparent border-none text-[var(--aw-eu-primary)] flex items-center gap-1" style={{ fontWeight: 600 }} onClick={() => setView('list')}>
          <i className="fa-solid fa-chevron-right text-[9px]" /> بازگشت
        </button>
        <div className="rounded-xl p-3 border border-[var(--aw-border)] mb-2" style={{ background: 'var(--aw-bg-card)' }}>
          <label className="text-[11px] text-[var(--aw-text-muted)] block mb-1" style={{ fontWeight: 600 }}>عنوان تیکت</label>
          <input type="text" value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))}
            placeholder="مثلاً: مشکل در پرداخت" className="w-full px-3 py-2 rounded-lg border border-[var(--aw-border)] text-[12px] outline-none" style={{ background: 'var(--aw-bg)' }} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="rounded-xl p-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
            <label className="text-[11px] text-[var(--aw-text-muted)] block mb-1" style={{ fontWeight: 600 }}>دسته‌بندی</label>
            <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
              className="w-full px-2 py-2 rounded-lg border border-[var(--aw-border)] text-[12px] outline-none" style={{ background: 'var(--aw-bg)' }}>
              {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="rounded-xl p-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
            <label className="text-[11px] text-[var(--aw-text-muted)] block mb-1" style={{ fontWeight: 600 }}>اولویت</label>
            <div className="flex gap-1">
              {(['low','medium','high'] as TicketPriority[]).map(p => {
                const m = TICKET_PRIORITY_META[p];
                const active = draft.priority === p;
                return (
                  <button key={p} onClick={() => setDraft(d => ({ ...d, priority: p }))}
                    className="flex-1 py-1.5 rounded-md text-[10.5px] cursor-pointer border transition-all"
                    style={{ background: active ? `${m.color}22` : 'transparent', color: active ? m.color : 'var(--aw-text-muted)', borderColor: active ? m.color : 'var(--aw-border)', fontWeight: 700 }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="rounded-xl p-3 border border-[var(--aw-border)] mb-3" style={{ background: 'var(--aw-bg-card)' }}>
          <label className="text-[11px] text-[var(--aw-text-muted)] block mb-1" style={{ fontWeight: 600 }}>متن پیام</label>
          <textarea value={draft.body} onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
            placeholder="مشکل یا سوال خود را به‌صورت کامل بنویسید..." rows={5}
            className="w-full px-3 py-2 rounded-lg border border-[var(--aw-border)] text-[12px] outline-none resize-none" style={{ background: 'var(--aw-bg)' }} />
        </div>
        <button onClick={submitNew} className="w-full py-2.5 rounded-xl border-none text-white text-[12.5px] cursor-pointer flex items-center justify-center gap-1.5" style={{ background: 'var(--aw-eu-primary)', fontWeight: 700 }}>
          <i className="fa-solid fa-paper-plane text-[10px]" /> ثبت تیکت
        </button>
      </div>
    );
  }

  if (view === 'detail' && active) {
    const sMeta = TICKET_STATUS_META[active.status];
    const pMeta = TICKET_PRIORITY_META[active.priority];
    return (
      <div>
        <button className="text-[11.5px] mb-3 cursor-pointer bg-transparent border-none text-[var(--aw-eu-primary)] flex items-center gap-1" style={{ fontWeight: 600 }} onClick={() => { setView('list'); setActiveId(null); }}>
          <i className="fa-solid fa-chevron-right text-[9px]" /> بازگشت
        </button>
        <div className="rounded-xl p-3 border border-[var(--aw-border)] mb-3" style={{ background: 'var(--aw-bg-card)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[12.5px]" style={{ fontWeight: 700 }}>{active.subject}</div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: sMeta.bg, color: sMeta.color, fontWeight: 700 }}>{sMeta.label}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[var(--aw-text-muted)]">
            <span>#{active.id}</span>
            <span>·</span>
            <span>{active.category}</span>
            <span>·</span>
            <span style={{ color: pMeta.color, fontWeight: 700 }}>اولویت {pMeta.label}</span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {active.messages.map(m => (
            <div key={m.id} className="rounded-xl p-3 border" style={{ background: m.from === 'user' ? 'rgba(126,95,170,0.08)' : 'var(--aw-bg-card)', borderColor: m.from === 'user' ? 'rgba(126,95,170,0.25)' : 'var(--aw-border)' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10.5px] flex items-center gap-1" style={{ color: m.from === 'user' ? 'var(--aw-eu-primary)' : 'var(--aw-text-secondary)', fontWeight: 700 }}>
                  <i className={`fa-solid ${m.from === 'user' ? 'fa-user' : 'fa-headset'} text-[9px]`} />
                  {m.from === 'user' ? 'شما' : 'کارشناس پشتیبانی'}
                </div>
                <div className="text-[9.5px] text-[var(--aw-text-muted)]">{m.date}</div>
              </div>
              <div className="text-[11.5px] text-[var(--aw-text-secondary)] leading-6">{m.body}</div>
            </div>
          ))}
        </div>

        {active.status !== 'closed' ? (
          <>
            <div className="rounded-xl p-2 border border-[var(--aw-border)] mb-2 flex items-end gap-2" style={{ background: 'var(--aw-bg-card)' }}>
              <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="پاسخ خود را بنویسید..." rows={2}
                className="flex-1 px-2 py-1.5 rounded-lg text-[12px] outline-none resize-none border-none" style={{ background: 'transparent' }} />
              <button onClick={sendReply} disabled={!reply.trim()} className="w-9 h-9 rounded-lg border-none text-white cursor-pointer flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--aw-eu-primary)', opacity: reply.trim() ? 1 : 0.4 }}>
                <i className="fa-solid fa-paper-plane text-[11px]" />
              </button>
            </div>
            <button onClick={() => closeTicket(active.id)} className="w-full py-2 rounded-xl border border-[var(--aw-border)] text-[11.5px] cursor-pointer text-[var(--aw-danger)]" style={{ background: 'transparent', fontWeight: 600 }}>
              <i className="fa-solid fa-xmark-circle text-[10px] ml-1" /> بستن تیکت
            </button>
          </>
        ) : (
          <div className="text-center py-3 text-[11px] text-[var(--aw-text-muted)] border border-dashed border-[var(--aw-border)] rounded-xl">
            این تیکت بسته شده است.
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setView('new')} className="w-full py-2.5 rounded-xl border-none text-white text-[12.5px] cursor-pointer flex items-center justify-center gap-1.5 mb-3" style={{ background: 'var(--aw-eu-primary)', fontWeight: 700 }}>
        <i className="fa-solid fa-plus text-[10px]" /> ثبت تیکت جدید
      </button>

      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 aw-scroll">
        {([['all','همه'], ['open','باز'], ['pending','در انتظار'], ['answered','پاسخ داده شده'], ['closed','بسته']] as const).map(([id, label]) => {
          const active = filter === id;
          return (
            <button key={id} onClick={() => setFilter(id as any)} className="px-3 py-1.5 rounded-lg text-[11px] cursor-pointer border whitespace-nowrap" style={{ background: active ? 'var(--aw-eu-primary)' : 'transparent', color: active ? '#fff' : 'var(--aw-text-secondary)', borderColor: active ? 'var(--aw-eu-primary)' : 'var(--aw-border)', fontWeight: 700 }}>
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-[var(--aw-text-muted)]">
          <i className="fa-solid fa-inbox text-[32px] opacity-25 block mb-2" />
          <p className="text-[11.5px]">تیکتی یافت نشد</p>
        </div>
      ) : filtered.map(t => {
        const sMeta = TICKET_STATUS_META[t.status];
        const pMeta = TICKET_PRIORITY_META[t.priority];
        return (
          <div key={t.id} onClick={() => { setActiveId(t.id); setView('detail'); }}
            className="rounded-xl p-3 mb-2 border border-[var(--aw-border)] cursor-pointer transition-all hover:border-[var(--aw-eu-primary)]"
            style={{ background: 'var(--aw-bg-card)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[12.5px] truncate flex-1 ml-2" style={{ fontWeight: 700 }}>{t.subject}</div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: sMeta.bg, color: sMeta.color, fontWeight: 700 }}>{sMeta.label}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[var(--aw-text-muted)]">
              <div className="flex items-center gap-1.5">
                <span>#{t.id}</span>
                <span>·</span>
                <span>{t.category}</span>
                <span>·</span>
                <span style={{ color: pMeta.color, fontWeight: 700 }}>{pMeta.label}</span>
              </div>
              <span>{t.updated}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ====== FAQ ======
const FAQ_CATEGORIES = [
  {
    title: 'حساب کاربری',
    icon: 'fa-solid fa-user',
    color: '#3B82F6',
    items: [
      { q: 'چگونه نام کاربری خود را تغییر دهم؟', a: 'از مسیر تنظیمات → ویرایش پروفایل می‌توانید نام کاربری را ویرایش کنید. توجه داشته باشید نام کاربری باید بدون فاصله و یکتا باشد.' },
      { q: 'چگونه احراز هویت را انجام دهم؟', a: 'در صفحه ویرایش پروفایل روی نشان «تایید نشده» کلیک کنید و مراحل ارسال و تایید کد را دنبال کنید.' },
      { q: 'چگونه ورود دو مرحله‌ای را فعال کنم؟', a: 'به تنظیمات امنیتی → ورود دو مرحله‌ای رفته و کلید فعال‌سازی را روشن کرده، روش دلخواه (پیامک/برنامه/ایمیل) را انتخاب کنید.' },
    ],
  },
  {
    title: 'مالی و پرداخت',
    icon: 'fa-solid fa-wallet',
    color: '#10B981',
    items: [
      { q: 'چگونه کیف پول خود را شارژ کنم؟', a: 'وارد بخش مالی → کیف پول شده و روی «واریز» بزنید. سپس مبلغ را وارد کرده و پرداخت را تکمیل کنید.' },
      { q: 'مدت زمان بازگشت وجه چقدر است؟', a: 'بازگشت وجه برای پرداخت‌های ناموفق حداکثر ۷۲ ساعت کاری زمان می‌برد.' },
      { q: 'آیا می‌توانم برای کیف پولم برداشت تنظیم کنم؟', a: 'بله، از بخش مالی → کیف پول گزینه «برداشت» را انتخاب و حساب مقصد را وارد کنید.' },
    ],
  },
  {
    title: 'سفارشات و خرید',
    icon: 'fa-solid fa-bag-shopping',
    color: '#F59E0B',
    items: [
      { q: 'چگونه سفارش را لغو کنم؟', a: 'از بخش سفارشات، سفارش مورد نظر را انتخاب و در صورت قابل لغو بودن، دکمه لغو را بزنید.' },
      { q: 'مدت زمان تحویل چقدر است؟', a: 'بسته به نوع سفارش و شهر، بین ۳۰ دقیقه تا ۳ روز کاری متغیر است.' },
      { q: 'فاکتورهای رسمی را از کجا دریافت کنم؟', a: 'از بخش مالی → فاکتورها می‌توانید فاکتور هر سفارش را دانلود کنید.' },
    ],
  },
  {
    title: 'فنی و عیب‌یابی',
    icon: 'fa-solid fa-bug',
    color: '#EF4444',
    items: [
      { q: 'چرا اعلان‌ها را دریافت نمی‌کنم؟', a: 'مطمئن شوید در تنظیمات اعلان‌ها فعال‌اند و دسترسی notification از سطح سیستم‌عامل به اپ داده شده باشد.' },
      { q: 'برنامه به‌درستی بارگذاری نمی‌شود.', a: 'یک‌بار از اپ خارج و دوباره وارد شوید. اگر مشکل ادامه داشت، از طریق بخش پشتیبانی تیکت ثبت کنید.' },
    ],
  },
];

function EuFaqContent() {
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const sections = useMemo(() => FAQ_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(it => !q || it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)),
  })).filter(cat => cat.items.length > 0), [q]);

  return (
    <div>
      <div className="rounded-xl p-2 border border-[var(--aw-border)] mb-3 flex items-center gap-2" style={{ background: 'var(--aw-bg-card)' }}>
        <i className="fa-solid fa-magnifying-glass text-[11px] text-[var(--aw-text-muted)] mr-1" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو در سوالات..."
          className="flex-1 bg-transparent border-none outline-none text-[12px]" />
        {query && (
          <button onClick={() => setQuery('')} className="bg-transparent border-none cursor-pointer text-[var(--aw-text-muted)]">
            <i className="fa-solid fa-xmark text-[10px]" />
          </button>
        )}
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-10 text-[var(--aw-text-muted)]">
          <i className="fa-solid fa-circle-question text-[32px] opacity-25 block mb-2" />
          <p className="text-[11.5px]">سوالی یافت نشد</p>
        </div>
      ) : sections.map(cat => (
        <div key={cat.title} className="mb-3">
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}22` }}>
              <i className={`${cat.icon} text-[11px]`} style={{ color: cat.color }} />
            </div>
            <div className="text-[12px]" style={{ fontWeight: 700 }}>{cat.title}</div>
          </div>
          {cat.items.map((it, i) => {
            const key = cat.title + i;
            const open = openKey === key;
            return (
              <div key={key} className="rounded-xl border border-[var(--aw-border)] mb-1.5 overflow-hidden" style={{ background: 'var(--aw-bg-card)' }}>
                <button onClick={() => setOpenKey(open ? null : key)} className="w-full flex items-center justify-between gap-2 p-3 text-right bg-transparent border-none cursor-pointer">
                  <span className="text-[12px] flex-1" style={{ fontWeight: 600 }}>{it.q}</span>
                  <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'} text-[10px] text-[var(--aw-text-muted)] flex-shrink-0`} />
                </button>
                {open && (
                  <div className="px-3 pb-3 pt-0 text-[11.5px] text-[var(--aw-text-secondary)] leading-6 border-t border-[var(--aw-border)]" style={{ paddingTop: '0.6rem' }}>
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ====== LEGAL (TERMS / PRIVACY) ======
const LEGAL_TERMS = [
  { title: '۱. پذیرش شرایط', body: 'با ایجاد حساب کاربری در Neura، شما با تمامی بندهای این توافق‌نامه و مقررات ذکر شده موافقت می‌کنید. در صورت عدم پذیرش، استفاده از سرویس مجاز نیست.' },
  { title: '۲. مسئولیت کاربر', body: 'کاربر متعهد می‌شود از حساب کاربری خود به‌صورت صحیح و قانونی استفاده کند و هرگونه فعالیت غیرقانونی، آسیب‌رسان یا خلاف اخلاق ممنوع است.' },
  { title: '۳. حق نشر و مالکیت معنوی', body: 'تمامی محتوا، طرح، علائم تجاری و کد منبع متعلق به Neura است و هرگونه کپی‌برداری، توزیع یا استفاده تجاری بدون اجازه کتبی ممنوع است.' },
  { title: '۴. پرداخت‌ها و بازپرداخت', body: 'پرداخت‌ها از طریق درگاه‌های معتبر انجام می‌شود. در صورت تراکنش ناموفق، مبلغ ظرف ۷۲ ساعت کاری به حساب کاربر بازگردانده می‌شود.' },
  { title: '۵. لغو و تعلیق حساب', body: 'Neura این حق را برای خود محفوظ می‌دارد در صورت تخلف کاربر از مقررات، حساب وی را بدون اطلاع قبلی تعلیق یا حذف کند.' },
  { title: '۶. تغییر شرایط', body: 'این شرایط ممکن است در هر زمان به‌روز شود. تغییرات از طریق اعلان درون‌برنامه‌ای به اطلاع کاربران خواهد رسید.' },
];

const LEGAL_PRIVACY = [
  { title: '۱. اطلاعات جمع‌آوری شده', body: 'ما اطلاعاتی همچون نام، شماره موبایل، آدرس ایمیل، آدرس IP و رفتار استفاده از اپ را جهت ارائه خدمات بهتر ذخیره می‌کنیم.' },
  { title: '۲. استفاده از اطلاعات', body: 'اطلاعات صرفاً برای ارائه سرویس، احراز هویت، پشتیبانی، بهبود تجربه کاربری و امنیت حساب کاربری استفاده می‌شود.' },
  { title: '۳. اشتراک‌گذاری با اشخاص ثالث', body: 'هیچ‌گاه اطلاعات شخصی شما به اشخاص ثالث فروخته نمی‌شود. تنها در موارد قانونی یا ضروری برای ارائه خدمت با شرکای منتخب به اشتراک گذاشته می‌شود.' },
  { title: '۴. امنیت داده', body: 'تمامی داده‌ها رمزنگاری شده و در سرورهای امن نگهداری می‌شوند. دسترسی به داده‌های حساس فقط برای کارشناسان مجاز ممکن است.' },
  { title: '۵. حقوق کاربر', body: 'شما می‌توانید در هر زمان درخواست مشاهده، اصلاح یا حذف داده‌های شخصی خود را از طریق بخش پشتیبانی ارسال کنید.' },
  { title: '۶. کوکی‌ها', body: 'برای ارتقاء تجربه کاربری از کوکی استفاده می‌شود. می‌توانید از تنظیمات مرورگر، استفاده از کوکی را غیرفعال کنید.' },
];

function EuLegalContent() {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');
  const sections = tab === 'terms' ? LEGAL_TERMS : LEGAL_PRIVACY;

  return (
    <div>
      <div className="flex gap-1 mb-3 p-1 rounded-xl border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
        {([['terms','قوانین و مقررات','fa-solid fa-file-contract'], ['privacy','حریم خصوصی','fa-solid fa-user-shield']] as const).map(([id, label, icon]) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id as any)} className="flex-1 py-2 rounded-lg text-[11.5px] cursor-pointer border-none flex items-center justify-center gap-1.5" style={{ background: active ? 'var(--aw-eu-primary)' : 'transparent', color: active ? '#fff' : 'var(--aw-text-secondary)', fontWeight: 700 }}>
              <i className={`${icon} text-[10px]`} /> {label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl p-3 border border-[var(--aw-border)] mb-3" style={{ background: 'rgba(126,95,170,0.08)', borderColor: 'rgba(126,95,170,0.25)' }}>
        <div className="flex items-start gap-2">
          <i className="fa-solid fa-circle-info text-[12px] mt-0.5" style={{ color: 'var(--aw-eu-primary)' }} />
          <div>
            <div className="text-[11.5px] mb-0.5" style={{ fontWeight: 700, color: 'var(--aw-eu-primary)' }}>
              {tab === 'terms' ? 'شرایط استفاده از سرویس Neura' : 'سیاست حفظ حریم خصوصی Neura'}
            </div>
            <div className="text-[10.5px] text-[var(--aw-text-secondary)]">آخرین به‌روزرسانی: ۲۰ فروردین ۱۴۰۵</div>
          </div>
        </div>
      </div>

      {sections.map((s, i) => (
        <div key={i} className="rounded-xl p-3 border border-[var(--aw-border)] mb-2" style={{ background: 'var(--aw-bg-card)' }}>
          <div className="text-[12px] mb-1.5" style={{ fontWeight: 700, color: 'var(--aw-eu-primary)' }}>{s.title}</div>
          <div className="text-[11.5px] text-[var(--aw-text-secondary)] leading-7">{s.body}</div>
        </div>
      ))}

      <div className="text-center text-[10px] text-[var(--aw-text-muted)] py-3">
        © ۱۴۰۵ Neura. تمامی حقوق محفوظ است.
      </div>
    </div>
  );
}

function EuLogoutContent() {
  const { closeModal, showToast, logout } = useApp();
  return (
    <div>
      <div className="text-center mb-4">
        <i className="fa-solid fa-sign-out-alt text-[40px] text-[var(--aw-danger)] mb-3 block" />
        <p className="text-[14px]">آیا مطمئن هستید؟</p>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-danger)', fontWeight: 600 }} onClick={() => { closeModal(); showToast('با موفقیت خارج شدید'); logout(); }}>بله، خروج</button>
        <button className="flex-1 py-2.5 px-5 rounded-[10px] text-[13px] cursor-pointer border border-[var(--aw-border)] text-[var(--aw-text-secondary)]" style={{ background: 'transparent', fontWeight: 600 }} onClick={closeModal}>انصراف</button>
      </div>
    </div>
  );
}

// ========================
// END USER PANEL MAIN
// ========================
export default function EndUserPanel() {
  const { euScreen } = useApp();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const isAgentScreen = euScreen === 'euDineScreen' || euScreen === 'euAssistantScreen' || euScreen === 'euSupportScreen' || euScreen === 'euMarketScreen';
  // These screens carry their OWN tab bar as the footer — hide the global nav so there aren't two.
  const ownFooter = euScreen === 'euDineScreen' || euScreen === 'euSupportScreen' || euScreen === 'euMarketScreen';

  return (
    <div className="flex h-full min-h-0" style={{ direction: 'rtl' }}>
      {/* Desktop Sidebar — only for non-agent screens */}
      {!isAgentScreen && <EuSidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(p => !p)} />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0" style={{ order: 2 }}>
        {/* Header always rendered so avatar stays fixed at top */}
        <EuHeader />

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {euScreen === 'euHomeScreen' && <motion.div key="euHome" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuHomeScreen /></motion.div>}
            {euScreen === 'euChatListScreen' && <motion.div key="euChats" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuChatListScreen /></motion.div>}
            {euScreen === 'euAgentDiscovery' && <motion.div key="euDiscover" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuAgentDiscoveryScreen /></motion.div>}
            {euScreen === 'euOrdersScreen' && <motion.div key="euOrders" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuOrdersScreen /></motion.div>}
            {euScreen === 'euPlannerScreen' && <motion.div key="euPlanner" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuPlannerScreen /></motion.div>}
            {euScreen === 'euSearchScreen' && <motion.div key="euSearch" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuSearchScreen /></motion.div>}
            {euScreen === 'euReportScreen' && <motion.div key="euReport" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuReportScreen /></motion.div>}
            {euScreen === 'euProfileScreen' && <motion.div key="euProfile" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuProfileScreen /></motion.div>}
            {euScreen === 'euDineScreen' && <motion.div key="euDine" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuDineScreen /></motion.div>}
            {euScreen === 'euAssistantScreen' && <motion.div key="euAssistant" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuAssistantScreen /></motion.div>}
            {euScreen === 'euSupportScreen' && <motion.div key="euSupport" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuSupportScreen /></motion.div>}
            {euScreen === 'euMarketScreen' && <motion.div key="euMarket" className="flex flex-col h-full" variants={euPageVariants} initial="initial" animate="animate" exit="exit"><EuMarketScreen /></motion.div>}
          </AnimatePresence>
        </div>

        {/* Bottom nav — hidden on screens that provide their own footer tab bar */}
        {!ownFooter && <EuNav />}
      </div>
    </div>
  );
}