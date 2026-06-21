import React from 'react';
import { useApp } from './app-context';
import { QuickForm } from './quick-actions';
import { toFa, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from './data';

// Figma-exported icon components
import Layer from '../../imports/Layer4-1/index';
import VuesaxOutlineShop from '../../imports/VuesaxOutlineShop/index';
import Element from '../../imports/Element3-1/index';
import Group from '../../imports/Group159-1/index';
import LineMapsRestaurant from '../../imports/LineMapsRestaurant-1/index';
import AddSquare from '../../imports/AddSquare-1/index';
import VuesaxOutlinePercentageSquare from '../../imports/VuesaxOutlinePercentageSquare/index';
import Gift from '../../imports/Gift/index';

// Glass card base style (matches Figma exactly)
const gc: React.CSSProperties = {
  background: 'var(--aw-eu-glass-card, rgba(255,255,255,0.2))',
  border: '0.25px solid var(--aw-eu-glass-bd, rgba(255,255,255,1))',
  borderRadius: 12,
  boxShadow: '0px 4px 4px 0px rgba(123,98,252,0.2)',
};

const KAMAND = "'Kamand', 'Vazirmatn', sans-serif";

// ── Icon wrapper helpers ──────────────────────────────────────

/** 56×56 glass quick-action card */
function ActionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...gc, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
      {children}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────

function SectionHeader({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      {/* title on RIGHT (first in RTL flex) */}
      <span style={{ fontFamily: KAMAND, fontSize: 16, fontWeight: 500, color: 'var(--aw-text-primary)' }}>
        {title}
      </span>
      {/* link on LEFT (last in RTL flex) */}
      <button
        className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
        onClick={onMore}
      >
        <span style={{ fontFamily: KAMAND, fontSize: 10, color: 'var(--aw-text-primary)' }}>مشاهده بیشتر</span>
        <i className="fa-solid fa-chevron-left" style={{ fontSize: 8, color: 'var(--aw-text-primary)' }} />
      </button>
    </div>
  );
}

// ── Simple wallet content (avoids circular import with end-user-panel) ──

function SimpleWalletContent() {
  return (
    <div className="flex flex-col gap-3">
      <div className="p-4 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, #7E5FAA, #B83D9E)' }}>
        <p className="text-[11px] m-0" style={{ color: 'rgba(255,255,255,0.7)' }}>موجودی کیف پول</p>
        <h2 className="text-[24px] text-white m-0 mt-1" style={{ fontWeight: 800 }}>
          ۲,۴۵۰,۰۰۰ <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>تومان</span>
        </h2>
      </div>
      <button onClick={() => openModal('واریز به کیف پول', <QuickForm submitLabel="واریز" toast="درخواست واریز ثبت شد" fields={[{ key: 'amount', label: 'مبلغ (تومان)' }, { key: 'method', label: 'روش پرداخت', type: 'select', options: ['درگاه بانکی', 'کارت‌به‌کارت'] }]} />)} className="w-full py-3 rounded-xl border-none text-white text-[14px] cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', fontWeight: 700 }}>
        <i className="fa-solid fa-arrow-down text-[12px] ml-1.5" />
        واریز به کیف پول
      </button>
    </div>
  );
}

// ── Glass Home Screen ──────────────────────────────────────────

function EuHomeScreenGlass() {
  const { openModal, setEuScreen, orders } = useApp();

  const activeOrders = orders.filter(o => o.status === 'preparing' || o.status === 'pending');
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  // RTL order: first in JSX → physical RIGHT, last → physical LEFT
  // Visual L→R: بیشتر | سفارش‌غذا | پشتیبانی | اپلیکیشن | مارکت
  // JSX order:  [مارکت, اپلیکیشن, پشتیبانی, سفارش‌غذا, بیشتر]
  const quickActions: { label: string; icon: React.ReactNode; action: () => void }[] = [
    {
      label: 'مارکت',
      icon: (
        <div style={{ width: 32, height: 32, position: 'relative', overflow: 'hidden' }}>
          <VuesaxOutlineShop />
        </div>
      ),
      action: () => setEuScreen('euMarketScreen'),
    },
    {
      label: 'اپلیکیشن',
      icon: (
        <div style={{ width: 32, height: 32, position: 'relative' }}>
          <Element />
        </div>
      ),
      action: () => setEuScreen('euSearchScreen'),
    },
    {
      label: 'پشتیبانی',
      icon: (
        <div style={{ width: 30, height: 32, position: 'relative' }}>
          <Group />
        </div>
      ),
      action: () => setEuScreen('euSupportScreen'),
    },
    {
      label: 'سفارش غذا',
      icon: (
        <div style={{ width: 32, height: 32, position: 'relative' }}>
          <LineMapsRestaurant />
        </div>
      ),
      action: () => setEuScreen('euDineScreen'),
    },
    {
      label: 'بیشتر',
      icon: (
        <div style={{ width: 32, height: 32, position: 'relative' }}>
          <AddSquare />
        </div>
      ),
      action: () => setEuScreen('euSearchScreen'),
    },
  ];

  // Demo order data for when no real orders exist
  const demoOrders = [
    { key: 'o1', icon: 'fa-solid fa-utensils', title: 'سفارش #۱۰۲۴', subtitle: 'پیتزا مخصوص × ۱', price: '۳۲۰,۰۰۰', statusBg: 'rgba(255,141,40,0.15)', statusLabel: 'در حال آماده‌سازی' },
    { key: 'o2', icon: 'fa-regular fa-hourglass-half', title: 'سفارش #۱۰۲۴', subtitle: 'پیتزا مخصوص × ۱', price: '۳۲۰,۰۰۰', statusBg: 'rgba(92,74,189,0.15)', statusLabel: 'در انتظار تایید' },
  ];

  const displayOrders = activeOrders.length > 0
    ? activeOrders.slice(0, 2).map((o, i) => ({
        key: o.id,
        icon: i === 0 ? 'fa-solid fa-utensils' : 'fa-regular fa-hourglass-half',
        title: `سفارش #${toFa(1024 + i)}`,
        subtitle: `${(o as any).items?.[0]?.name || 'پیتزا مخصوص'} × ${toFa((o as any).items?.[0]?.qty || 1)}`,
        price: ((o as any).total || 320000).toLocaleString('fa-IR'),
        statusBg: o.status === 'preparing' ? 'rgba(255,141,40,0.15)' : 'rgba(92,74,189,0.15)',
        statusLabel: ORDER_STATUS_LABELS[o.status] || o.status,
      }))
    : demoOrders;

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">

      {/* ── Wallet Card ── */}
      <div className="mx-4 mt-2">
        <div
          className="flex items-center px-3 gap-3 relative overflow-hidden"
          style={{ ...gc, backdropFilter: 'blur(20px)', height: 84 }}
        >
          {/* RIGHT: wallet SVG (first in RTL flex) */}
          <div style={{ width: 44, height: 41, position: 'relative', flexShrink: 0 }}>
            <Layer />
          </div>

          {/* CENTER: balance */}
          <div className="flex-1 flex flex-col items-end" style={{ gap: 1 }}>
            <p style={{ fontFamily: KAMAND, fontSize: 11, color: 'var(--aw-text-primary)', fontWeight: 500, margin: 0 }}>
              موجودی کیف پول
            </p>
            <p style={{ margin: 0, color: 'var(--aw-text-primary)', lineHeight: 1.2 }}>
              <span style={{ fontFamily: KAMAND, fontSize: 20, fontWeight: 900 }}>{'۲,۴۵۰,۰۰۰ '}</span>
              <span style={{ fontFamily: KAMAND, fontSize: 11, fontWeight: 700, color: 'var(--aw-text-secondary)' }}>تومان</span>
            </p>
          </div>

          {/* LEFT: + button (last in RTL flex) */}
          <button
            style={{
              width: 40, height: 40, borderRadius: 50, flexShrink: 0,
              background: 'var(--aw-eu-glass-card, rgba(255,255,255,0.2))', border: '0.25px solid var(--aw-eu-glass-bd, rgba(255,255,255,1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
            onClick={() => openModal('کیف پول', <SimpleWalletContent />)}
          >
            <i className="fa-solid fa-plus" style={{ fontSize: 16, color: 'var(--aw-eu-ink-strong, #404040)' }} />
          </button>
        </div>
      </div>

      {/* ── Promo Cards ── */}
      {/* RTL order: first→RIGHT (percentage+badge), last→LEFT (gift) */}
      <div className="flex gap-2 px-4 mt-2">

        {/* RIGHT promo: percentage + "پیشنهاد ویژه" badge (first in RTL) */}
        <div
          className="flex items-center px-3 gap-2"
          style={{ ...gc, backdropFilter: 'blur(20px)', flex: 1, cursor: 'pointer', minHeight: 64, paddingTop: 10, paddingBottom: 10 }}
          onClick={() => setEuScreen('euDineScreen')}
        >
          {/* icon RIGHT */}
          <div style={{ width: 24, height: 24, position: 'relative', flexShrink: 0 }}>
            <VuesaxOutlinePercentageSquare />
          </div>
          {/* text + badge LEFT */}
          <div className="flex-1 flex flex-col items-end" style={{ gap: 1 }}>
            <p style={{ fontFamily: KAMAND, fontSize: 12, fontWeight: 800, color: 'var(--aw-text-primary)', margin: 0 }}>
              ۳۰٪ تخفیف اولین سفارش
            </p>
            <p style={{ fontFamily: KAMAND, fontSize: 11, color: 'var(--aw-text-primary)', margin: 0 }}>
              تا پایان هفته
            </p>
            <div style={{
              background: '#5c4abd', borderRadius: 2, fontSize: 10, color: '#f4f4f4',
              padding: '0px 6px', border: '1px solid white', fontFamily: KAMAND,
              lineHeight: '16px', display: 'inline-block',
            }}>
              پیشنهاد  ویژه
            </div>
          </div>
        </div>

        {/* LEFT promo: gift (last in RTL) */}
        <div
          className="flex items-center px-3 gap-2"
          style={{ ...gc, backdropFilter: 'blur(20px)', flex: 1, cursor: 'pointer', minHeight: 64, paddingTop: 10, paddingBottom: 10 }}
          onClick={() => setEuScreen('euMarketScreen')}
        >
          {/* icon RIGHT */}
          <div style={{ width: 24, height: 24, position: 'relative', flexShrink: 0 }}>
            <Gift />
          </div>
          {/* text LEFT */}
          <div className="flex-1 flex flex-col items-end" style={{ gap: 1 }}>
            <p style={{ fontFamily: KAMAND, fontSize: 12, fontWeight: 800, color: 'var(--aw-text-primary)', margin: 0 }}>
              ۳۰٪ تخفیف اولین سفارش
            </p>
            <p style={{ fontFamily: KAMAND, fontSize: 11, color: 'var(--aw-text-primary)', margin: 0 }}>
              تا پایان هفته
            </p>
          </div>
        </div>
      </div>

      {/* ── دسترسی سریع ── */}
      <div className="px-4 mt-3">
        <SectionHeader title="دسترسی سریع" onMore={() => setEuScreen('euSearchScreen')} />
        {/* justify-between distributes 5 × 56px cards across the row */}
        <div className="flex justify-between">
          {quickActions.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center gap-[6px] bg-transparent border-none cursor-pointer p-0"
            >
              <ActionCard>{item.icon}</ActionCard>
              <span style={{ fontFamily: KAMAND, fontSize: 10, color: 'var(--aw-text-primary)' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── سفارشات من ── */}
      <div className="px-4 mt-3">
        <SectionHeader title="سفارشات من" onMore={() => setEuScreen('euOrdersScreen')} />

        {displayOrders.map((o) => (
          <div
            key={o.key}
            className="flex items-center px-3 gap-2 mb-2 cursor-pointer"
            style={{ ...gc, height: 70, overflow: 'hidden' }}
            onClick={() => setEuScreen('euOrdersScreen')}
          >
            {/* RIGHT: icon (first in RTL flex) */}
            <i
              className={o.icon}
              style={{ fontSize: 16, color: 'var(--aw-eu-ink-strong, #404040)', flexShrink: 0, width: 20, textAlign: 'center' as const }}
            />

            {/* ORDER text */}
            <div className="flex-1 flex flex-col items-end" style={{ gap: 1 }}>
              <p style={{ fontFamily: KAMAND, fontSize: 14, fontWeight: 700, color: 'var(--aw-text-primary)', margin: 0 }}>
                {o.title}
              </p>
              <p style={{ fontFamily: KAMAND, fontSize: 12, color: 'var(--aw-text-primary)', margin: 0 }}>
                {o.subtitle}
              </p>
            </div>

            {/* LEFT: price + status (last in RTL flex) */}
            <div className="flex flex-col items-start flex-shrink-0" style={{ gap: 4 }}>
              <p style={{ fontFamily: KAMAND, fontSize: 14, fontWeight: 500, color: 'var(--aw-text-secondary)', margin: 0 }}>
                {o.price}
              </p>
              <div style={{
                background: o.statusBg, borderRadius: 2, fontSize: 9, color: 'var(--aw-text-primary)',
                padding: '1px 6px', border: '1px solid white', fontFamily: KAMAND,
                whiteSpace: 'nowrap' as const,
              }}>
                {o.statusLabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stats Row ── */}
      <div className="flex gap-2 px-4 mt-2">
        {[
          { label: 'کل سفارشات', value: toFa(totalOrders || 3) },
          { label: 'تحویل شده', value: toFa(deliveredOrders || 3) },
          { label: 'در جریان', value: toFa(activeOrders.length || 3) },
        ].map((s, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-center"
            style={{ ...gc, height: 70, gap: 4 }}
          >
            <p style={{ fontFamily: KAMAND, fontSize: 16, fontWeight: 700, color: 'var(--aw-text-primary)', margin: 0 }}>
              {s.value}
            </p>
            <p style={{ fontFamily: KAMAND, fontSize: 12, color: 'var(--aw-text-primary)', margin: 0 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

// ── Non-glass Home Screen (preserved from before) ──────────────

function EuHomeScreenDefault() {
  const { openModal, setEuScreen, agents, orders } = useApp();
  const activeOrders = orders.filter(o => o.status === 'preparing' || o.status === 'pending');
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const quickActions = [
    { icon: 'fa-solid fa-utensils', label: 'سفارش غذا', action: () => setEuScreen('euDineScreen') },
    { icon: 'fa-solid fa-store', label: 'مارکت', action: () => setEuScreen('euMarketScreen') },
    { icon: 'fa-solid fa-headset', label: 'پشتیبانی', action: () => setEuScreen('euSupportScreen') },
    { icon: 'fa-solid fa-plus', label: 'بیشتر', action: () => setEuScreen('euSearchScreen') },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-4 aw-scroll">
      {/* Wallet */}
      <div className="flex items-center gap-3 mx-4 mt-4 p-5 rounded-2xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--aw-eu-primary-dark), var(--aw-eu-primary))' }}>
        <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-white"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <i className="fa-solid fa-wallet text-[22px]" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] m-0" style={{ color: 'rgba(255,255,255,0.6)' }}>موجودی کیف پول</p>
          <h3 className="text-[20px] text-white m-0 mt-0.5" style={{ fontWeight: 800 }}>
            ۲,۴۵۰,۰۰۰ <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>تومان</span>
          </h3>
        </div>
        <button className="w-9 h-9 rounded-xl border bg-transparent text-white cursor-pointer flex items-center justify-center"
          style={{ borderColor: 'var(--aw-eu-glass-card, rgba(255,255,255,0.2))', background: 'rgba(255,255,255,0.1)' }}
          onClick={() => openModal('کیف پول', <SimpleWalletContent />)}>
          <i className="fa-solid fa-plus text-[14px]" />
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-4">
        <p className="text-[12px] mb-2 px-1" style={{ color: 'var(--aw-text-muted)', fontWeight: 700 }}>دسترسی سریع</p>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(item => (
            <button key={item.label} onClick={item.action}
              className="flex flex-col items-center gap-2 p-3 rounded-[14px] cursor-pointer border-none"
              style={{ background: 'var(--aw-eu-card)', border: '1px solid rgba(126,95,170,0.15)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'var(--aw-eu-primary)' }}>
                <i className={item.icon} style={{ fontSize: 18 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--aw-text-primary)' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {activeOrders.length > 0 && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--aw-text-muted)' }}>سفارشات من</span>
            <button className="text-[11px] bg-transparent border-none cursor-pointer"
              style={{ color: 'var(--aw-eu-primary)', fontWeight: 600 }}
              onClick={() => setEuScreen('euOrdersScreen')}>
              مشاهده همه <i className="fa-solid fa-chevron-left text-[8px]" />
            </button>
          </div>
          {activeOrders.slice(0, 2).map(o => (
            <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl mb-2 border cursor-pointer"
              style={{ background: 'var(--aw-eu-card)', borderColor: 'rgba(126,95,170,0.15)' }}
              onClick={() => setEuScreen('euOrdersScreen')}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: ORDER_STATUS_COLORS[o.status]?.bg || 'var(--aw-primary-bg)' }}>
                <i className={`fa-solid fa-utensils text-[14px]`}
                  style={{ color: ORDER_STATUS_COLORS[o.status]?.text || 'var(--aw-eu-primary)' }} />
              </div>
              <div className="flex-1 text-right">
                <div style={{ fontSize: 12, fontWeight: 700 }}>سفارش</div>
                <div style={{ fontSize: 11, color: 'var(--aw-text-muted)' }}>{ORDER_STATUS_LABELS[o.status]}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { value: toFa(orders.length), label: 'کل سفارشات' },
          { value: toFa(deliveredOrders), label: 'تحویل شده' },
          { value: toFa(3), label: 'ایجنت فعال' },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center p-3 rounded-xl border"
            style={{ background: 'var(--aw-eu-card)', borderColor: 'rgba(126,95,170,0.15)' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--aw-eu-primary)' }}>{s.value}</span>
            <span style={{ fontSize: 10, color: 'var(--aw-text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────

export function EuHomeScreen() {
  const { theme } = useApp();
  return (theme === 'glass' || theme === 'dark') ? <EuHomeScreenGlass /> : <EuHomeScreenDefault />;
}
