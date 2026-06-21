import React, { useState, useRef, useContext, createContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, AdminScreen, AgentTeam, ChatGroup } from './app-context';
import {
  COMPANIES, NOTIFICATIONS, Agent, Customer, Deal, FinanceItem, Task, Personnel, PERSONNEL_PERMISSIONS,
  toFa, STATUS_LABELS, STAGE_LABELS,
  TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_COLORS,
  MONTHLY_REVENUE_DATA, WEEKLY_ACTIVITY_DATA, CRM_FUNNEL_DATA
} from './data';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import MarketingCampaignScreen from './marketing-campaign-screen';
import { SalesFunnelScreen, SalesForecastScreen, InventoryScreen, PurchaseRequestScreen } from './sales-inventory-screens';
import { SECRETARY_MEETINGS, MEETING_STATUS, MeetingViewer, NewMeetingContent, type SecretaryMeeting } from './meetings';
import neuraLogo from "figma:asset/0ee60e1dbaa3bcb0e2daccbfdd0200ba026fb510.png";
import svgPaths from "../../imports/svg-t4fpzrr60b";
import DailyBriefingScreen from './daily-briefing';
import { SecPlanningScreen, SecCrmLiteScreen, SecPerformanceScreen, SecDailyFinanceScreen } from './secretary-screens';
import { EuAvatar } from './eu-spectrum-avatar';
import { SwipeToCall } from './end-user-panel';
import { LetterAvatar } from './letter-avatar';
import { MktConversationsScreen, MktLeadsScreen, MktSegmentScreen, MktPerformanceScreen, MktApprovalsScreen, MktCalendarScreen } from './marketing-screens';
import { MarketingProvider } from './marketing-context';
import { ProcRequestsScreen, ProcOrdersScreen, ProcDeliveryScreen, ProcFinanceScreen } from './procurement-screens';
import { SalesPosScreen, SalesOrdersScreen, SalesInvoicesScreen, SalesMenuScreen, SalesCustomersScreen, SalesQuickReportScreen } from './sales-screens';
import { SalesConversationsScreen, SalesShiftScreen } from './sales-extra';

// ========================
// AGENT TEAM CONFIG
// ========================
type TeamKey = 'marketing' | 'secretary' | 'finance' | 'procurement' | 'sales';

interface TeamConfig {
  id: TeamKey;
  name: string;
  desc: string;
  icon: string;
  bg: string;
  gradient: string;
  agentId: string;
  navItems: { id: AdminScreen; icon: string; label: string }[];
}

const TEAM_CONFIGS: Record<TeamKey, TeamConfig> = {
  marketing: {
    id: 'marketing', name: 'بازاریابی', desc: 'مدیریت کمپین‌ها، تحلیل بازار و جذب مشتری',
    icon: 'fa-solid fa-bullhorn', bg: 'aw-bg-blue', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    agentId: 'marketing',
    navItems: [
      { id: 'mktConversationsScreen', icon: 'fa-solid fa-comments', label: 'گفتگو' },
      { id: 'mktLeadsScreen', icon: 'fa-solid fa-user-plus', label: 'لیدها' },
      { id: 'campaignScreen', icon: 'fa-solid fa-bullhorn', label: 'کمپین‌ها' },
      { id: 'mktSegmentScreen', icon: 'fa-solid fa-users-viewfinder', label: 'مخاطبان' },
      { id: 'mktPerformanceScreen', icon: 'fa-solid fa-chart-line', label: 'عملکرد' },
    ],
  },
  secretary: {
    id: 'secretary', name: 'منشی', desc: 'مرکز فرماندهی، مدیریت تقویم، جلسات و هماهنگی‌ها',
    icon: 'fa-solid fa-calendar-check', bg: 'aw-bg-pink', gradient: 'linear-gradient(135deg, #22A6F0, #1B4FE8)',
    agentId: 'secretary',
    navItems: [
      { id: 'chatsScreen', icon: 'fa-solid fa-comments', label: 'گفتگو' },
      { id: 'secPlanningScreen', icon: 'fa-solid fa-calendar-days', label: 'برنامه‌ریزی' },
      { id: 'secCrmLiteScreen', icon: 'fa-solid fa-address-book', label: 'ارتباط مشتری' },
      { id: 'secPerformanceScreen', icon: 'fa-solid fa-chart-simple', label: 'گزارش‌ها' },
      { id: 'secDailyFinanceScreen', icon: 'fa-solid fa-coins', label: 'مالی روزانه' },
    ],
  },
  finance: {
    id: 'finance', name: 'مالی / اداری', desc: 'حسابداری، فاکتورها و گزارش‌های مالی',
    icon: 'fa-solid fa-calculator', bg: 'aw-bg-purple', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    agentId: 'finance',
    navItems: [
      { id: 'chatsScreen', icon: 'fa-solid fa-comments', label: 'گفتگوها' },
      { id: 'dashboardScreen', icon: 'fa-solid fa-th-large', label: 'داشبورد' },
      { id: 'financeScreen', icon: 'fa-solid fa-wallet', label: 'مالی' },
      { id: 'reportsScreen', icon: 'fa-solid fa-file-invoice-dollar', label: 'فاکتورها' },
      { id: 'tasksScreen', icon: 'fa-solid fa-list-check', label: 'وظایف' },
    ],
  },
  procurement: {
    id: 'procurement', name: 'خرید / تدارکات', desc: 'زنجیره تأمین: درخواست → سفارش → تحویل → انبار → پرداخت',
    icon: 'fa-solid fa-boxes-stacked', bg: 'aw-bg-orange', gradient: 'linear-gradient(135deg, #F97316, #C2410C)',
    agentId: 'procurement',
    navItems: [
      { id: 'chatsScreen', icon: 'fa-solid fa-comments', label: 'گفتگو' },
      { id: 'procRequestsScreen', icon: 'fa-solid fa-file-circle-plus', label: 'درخواست‌ها' },
      { id: 'procOrdersScreen', icon: 'fa-solid fa-truck-field', label: 'سفارشات' },
      { id: 'procDeliveryScreen', icon: 'fa-solid fa-dolly', label: 'تحویل' },
      { id: 'inventoryScreen', icon: 'fa-solid fa-warehouse', label: 'موجودی' },
      { id: 'procFinanceScreen', icon: 'fa-solid fa-money-check-dollar', label: 'مالی تأمین' },
    ],
  },
  sales: {
    id: 'sales', name: 'فروشنده/صندوقدار', desc: 'مدیریت فروش، فاکتورها و ارتباط با مشتری',
    icon: 'fa-solid fa-cash-register', bg: 'aw-bg-green', gradient: 'linear-gradient(135deg, #10B981, #047857)',
    agentId: 'sales',
    navItems: [
      { id: 'salesConversationsScreen', icon: 'fa-solid fa-headset', label: 'گفتگو' },
      { id: 'salesOrdersScreen', icon: 'fa-solid fa-bag-shopping', label: 'سفارشات' },
      { id: 'salesInvoicesScreen', icon: 'fa-solid fa-file-invoice-dollar', label: 'فاکتورها' },
      { id: 'salesMenuScreen', icon: 'fa-solid fa-store', label: 'محصولات' },
      { id: 'salesCustomersScreen', icon: 'fa-solid fa-users', label: 'مشتریان' },
      { id: 'salesQuickReportScreen', icon: 'fa-solid fa-chart-pie', label: 'گزارش' },
    ],
  },
};

function getTeamNavItems(teamKey: AgentTeam): { id: AdminScreen; icon: string; label: string }[] {
  if (!teamKey) return ADMIN_NAV_ITEMS;
  return TEAM_CONFIGS[teamKey]?.navItems || ADMIN_NAV_ITEMS;
}

// Designed icon-pack mapping for agent teams
const TEAM_ICON_SRC: Record<string, string> = {
  secretary: 'src/icons/png/secretary.png',
  marketing: 'src/icons/png/marketing.png',
  finance: 'src/icons/png/finance.png',
  procurement: 'src/icons/png/logistics.png',
  sales: 'src/icons/png/seller-cashier.png',
};
// Renders an agent's saved photo avatar if set, else the colored initial circle
function AgentCircle({ agent, size, radius, fontSize, className = '', style = {} }: { agent: { avatar?: string; bg: string; init: string }; size: number; radius: number; fontSize?: number; className?: string; style?: React.CSSProperties }) {
  if (agent.avatar) {
    return (
      <div className={`flex-shrink-0 overflow-hidden ${className}`} style={{ width: size, height: size, borderRadius: radius, ...style }}>
        <img src={agent.avatar} alt="" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center 18%' }} draggable={false} />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center text-white flex-shrink-0 ${agent.bg} ${className}`} style={{ width: size, height: size, borderRadius: radius, fontWeight: 700, fontSize: fontSize ?? Math.round(size * 0.42), ...style }}>{agent.init}</div>
  );
}
// Designed icon-pack mapping for footer nav screens
const NAV_ICON_SRC: Record<string, string> = {
  mktConversationsScreen: 'src/icons/png/chat.png',
  chatsScreen: 'src/icons/png/chat.png',
  salesConversationsScreen: 'src/icons/png/chat.png',
  campaignScreen: 'src/icons/png/marketing.png',
  mktLeadsScreen: 'src/icons/svg2/audience.svg',
  mktSegmentScreen: 'src/icons/svg2/audience.svg',
  mktPerformanceScreen: 'src/icons/png/reports-charts.png',
  secPlanningScreen: 'src/icons/png/calendar.png',
  secCrmLiteScreen: 'src/icons/svg2/audience.svg',
  secPerformanceScreen: 'src/icons/png/reports-charts.png',
  secDailyFinanceScreen: 'src/icons/svg2/coins.svg',
  dashboardScreen: 'src/icons/svg2/dashboard.svg',
  financeScreen: 'src/icons/png/wallet.png',
  reportsScreen: 'src/icons/svg2/invoice.svg',
  tasksScreen: 'src/icons/svg2/tasks.svg',
  procRequestsScreen: 'src/icons/svg2/requests.svg',
  procOrdersScreen: 'src/icons/svg2/orders.svg',
  procDeliveryScreen: 'src/icons/svg2/delivery2.svg',
  inventoryScreen: 'src/icons/svg2/warehouse2.svg',
  procFinanceScreen: 'src/icons/svg2/coins.svg',
  salesOrdersScreen: 'src/icons/svg2/orders.svg',
  salesInvoicesScreen: 'src/icons/svg2/invoice.svg',
  salesMenuScreen: 'src/icons/png/shop-market.png',
  salesCustomersScreen: 'src/icons/svg2/audience.svg',
  salesQuickReportScreen: 'src/icons/png/reports-charts.png',
};
// Designed icon-pack mapping for notification glyphs (keeps notifications consistent with the rest of the app)
export const NOTIF_ICON_SRC: Record<string, string> = {
  'fa-solid fa-bullhorn': 'src/icons/png/marketing.png',
  'fa-solid fa-file-invoice-dollar': 'src/icons/svg2/invoice.svg',
  'fa-solid fa-user-plus': 'src/icons/svg2/audience.svg',
  'fa-solid fa-chart-bar': 'src/icons/png/reports-charts.png',
  'fa-solid fa-calendar-check': 'src/icons/png/calendar.png',
  'fa-solid fa-utensils': 'src/icons/png/shop-market.png',
  'fa-solid fa-robot': 'src/icons/svg2/assistant.svg',
};
function NavIcon({ id, fa, size }: { id: string; fa: string; size: number }) {
  const src = NAV_ICON_SRC[id];
  if (src) return <img src={src} alt="" className="nav-icon-img" style={{ width: size + 4, height: size + 4, objectFit: 'contain' }} />;
  return <i className={fa} style={{ fontSize: size }} />;
}

// ========================
// MOTION VARIANTS
// ========================
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// Custom RTL-friendly Recharts tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-modal)', direction: 'rtl', boxShadow: 'var(--aw-shadow-sm)' }}>
      <div className="text-[11px] text-[var(--aw-text-muted)] mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-[12px] flex items-center gap-1.5" style={{ color: p.color, fontWeight: 600 }}>
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: {toFa(p.value)}
        </div>
      ))}
    </div>
  );
}

// ========================
// HEADER
// ========================
function TeamSelectionScreen() {
  const { setAgentTeam, setAdminScreen } = useApp();
  const teams = Object.values(TEAM_CONFIGS);

  return (
    <div className="flex flex-col h-full items-center justify-center" style={{ background: 'var(--aw-bg-app)' }}>
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <img src="src/assets/neura-logo-blue.png" alt="Neura" className="h-10 w-auto object-contain" style={{ filter: 'var(--aw-logo-filter)' }} />
        <span className="text-[24px] text-[var(--aw-text-primary)] font-[Neogrey]" style={{ fontWeight: 700 }}>Neura</span>
      </div>

      <p className="text-[13px] text-[var(--aw-text-secondary)] mb-8">تیم عامل هوشمند خود را انتخاب کنید</p>

      {/* Thumbnail Grid */}
      <div className="flex flex-wrap justify-center gap-5 md:gap-8 px-6 max-w-[480px]">
        {teams.map((team, i) => (
          <motion.button
            key={team.id}
            className="flex flex-col items-center gap-2.5 bg-transparent border-none cursor-pointer group"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07, duration: 0.35, ease: 'easeOut' }}
            onClick={() => {
              setAgentTeam(team.id);
              setAdminScreen(team.navItems[0]?.id || 'chatsScreen');
            }}
          >
            <motion.div
              className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-[22px] flex items-center justify-center text-white text-[28px] md:text-[32px]"
              style={{ background: team.gradient, boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}
              whileHover={{ scale: 1.1, boxShadow: '0 8px 28px rgba(0,0,0,0.35)' }}
              whileTap={{ scale: 0.92 }}
            >
              <i className={team.icon} />
            </motion.div>
            <span className="text-[12px] text-[var(--aw-text-secondary)] group-hover:text-[var(--aw-text-primary)] transition-colors" style={{ fontWeight: 600 }}>
              {team.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Agent selector */}
      <div className="mt-10 flex justify-center">
        <AgentSelector />
      </div>
    </div>
  );
}

// ========================
// HEADER
// ========================
function AdminHeader() {
  const { company, setCompany, openModal, agentTeam, theme, setAdminScreen, setAppStage } = useApp();
  const [companyOpen, setCompanyOpen] = useState(false);

  return (
    <header className="flex-shrink-0 relative" style={{ background: 'transparent', backdropFilter: 'none', WebkitBackdropFilter: 'none', zIndex: 40 }}>
      {/* Mobile: personal-panel style top row — logo left, icons right */}
      <div className="flex items-center relative md:hidden px-[16px] pt-[40px] pb-[8px]">
        <button onClick={() => setAppStage('home')} className="flex items-center gap-[3px] flex-1 bg-transparent border-none cursor-pointer p-0">
          <img src="src/assets/neura-logo-blue.png" alt="" className="h-[24px] w-[24px] object-contain" style={{ filter: 'var(--aw-logo-filter)' }} />
          <span style={{ fontFamily: "'Neogrey', 'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 16, color: 'var(--aw-text-primary)' }}>Neura</span>
        </button>

        {/* Company / workspace switcher — centered */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[36px]">
          <div className="relative">
            <button onClick={() => setCompanyOpen(o => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] cursor-pointer border"
              style={{ background: 'var(--aw-eu-nav-bg)', borderColor: 'var(--aw-eu-nav-border)', color: 'var(--aw-text-primary)' }}>
              <i className="fa-solid fa-building text-[11px]" style={{ color: 'var(--aw-eu-primary)' }} />
              <span className="text-[12px] max-w-[110px] truncate" style={{ fontWeight: 600 }}>{COMPANIES[company]?.name}</span>
              <i className={`fa-solid fa-chevron-down text-[8px] text-[var(--aw-text-muted)] transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {companyOpen && (
                <>
                  <div className="fixed inset-0 z-[45]" onClick={() => setCompanyOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-[230px] rounded-[14px] overflow-hidden z-[46] p-1.5"
                    style={{ background: 'var(--aw-bg-modal)', border: '1px solid var(--aw-border)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
                    <div className="px-2.5 py-1.5 text-[10px] text-[var(--aw-text-muted)]" style={{ fontWeight: 700 }}>فضای کاری / شرکت‌ها</div>
                    {Object.entries(COMPANIES).map(([k, v]) => {
                      const active = k === company;
                      return (
                        <button key={k} onClick={() => { setCompany(k); setCompanyOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] cursor-pointer border-none text-right transition-colors"
                          style={{ background: active ? 'var(--aw-primary-bg)' : 'transparent' }}>
                          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: active ? 'var(--aw-eu-primary)' : 'var(--aw-bg-input)', color: active ? '#fff' : 'var(--aw-text-secondary)' }}>
                            <i className="fa-solid fa-building text-[12px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] truncate" style={{ fontWeight: 600, color: 'var(--aw-text-primary)' }}>{v.name}</div>
                            <div className="text-[10px] text-[var(--aw-text-muted)]">{v.type}</div>
                          </div>
                          {active && <i className="fa-solid fa-circle-check text-[13px]" style={{ color: 'var(--aw-eu-primary)' }} />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end gap-[14px]">
          <button className="w-[20px] h-[20px] bg-transparent border-none cursor-pointer flex items-center justify-center p-0"
            style={{ color: 'var(--aw-eu-primary)', fontSize: 16 }} onClick={() => openModal('جستجو', <SearchContent />)}>
            <img src="src/icons/png/search.png" alt="" className="nav-icon-img" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          </button>
          <button className="w-[20px] h-[20px] bg-transparent border-none cursor-pointer flex items-center justify-center p-0 relative"
            style={{ color: 'var(--aw-text-secondary)', fontSize: 16 }} onClick={() => openModal('اعلان‌ها', <NotificationsContent />)}>
            <img src="src/icons/png/bell.png" alt="" className="nav-icon-img" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            <span className="absolute top-[1px] right-[1px] w-[7px] h-[7px] rounded-full" style={{ background: '#FF4D4D', border: '1.5px solid rgba(255,255,255,0.9)' }} />
          </button>
          <button className="w-[20px] h-[20px] bg-transparent border-none cursor-pointer flex items-center justify-center p-0"
            style={{ color: 'var(--aw-text-primary)', fontSize: 16 }} onClick={() => openModal('تنظیمات', <MoreScreenModal />)}>
            <img src="src/icons/png/setting.png" alt="" className="nav-icon-img" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          </button>
        </div>
      </div>

      {/* Desktop: logo + team name (right) / search + bell + company (left) */}
      <div className="hidden md:flex items-center px-6 pt-3 pb-2 gap-2 border-b border-[var(--aw-border)]">
        <div className="flex items-center gap-2 flex-1">
          <img src="src/assets/neura-logo-blue.png" alt="Neura" className="h-6 w-auto object-contain" style={{ filter: 'var(--aw-logo-filter)' }} />
          <span className="text-[15px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>
            {agentTeam ? TEAM_CONFIGS[agentTeam]?.name : 'مدیریت'}
          </span>
        </div>
        <div className="relative flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
          <i className="fa-solid fa-building text-[10px] text-[var(--aw-primary)]" />
          <span className="text-[11px] text-[var(--aw-text-primary)] max-w-[80px] truncate" style={{ fontWeight: 600 }}>{COMPANIES[company]?.name.split(' ').slice(-1)[0]}</span>
          <i className="fa-solid fa-chevron-down text-[8px] text-[var(--aw-text-muted)]" />
          <select className="absolute inset-0 opacity-0 cursor-pointer text-base" value={company} onChange={(e) => setCompany(e.target.value)}>
            {Object.entries(COMPANIES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
        <HeaderBtn icon="fa-solid fa-search" onClick={() => openModal('جستجو', <SearchContent />)} />
        <HeaderBtn icon="fa-solid fa-bell" badge={3} onClick={() => openModal('اعلان‌ها', <NotificationsContent />)} />
      </div>
    </header>
  );
}

function HeaderBtn({ icon, badge, onClick }: { icon: string; badge?: number; onClick?: () => void }) {
  return (
    <button
      className="w-[38px] h-[38px] rounded-[10px] bg-transparent border-none text-[var(--aw-text-secondary)] text-base cursor-pointer relative flex items-center justify-center transition-all hover:text-[var(--aw-primary)]"
      onClick={onClick}
    >
      <i className={icon} />
      {badge != null && badge > 0 && (
        <span className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>
          {toFa(badge)}
        </span>
      )}
    </button>
  );
}

export function RoleSwitcher() {
  const { role, setRole, setBriefingSeen, theme } = useApp();
  const isGlass = theme === 'glass' || theme === 'dark';

  if (isGlass) {
    return (
      <div
        className="flex gap-[3px] p-[3px] rounded-[9999px] border"
        style={{ background: 'var(--aw-eu-nav-bg)', borderColor: 'var(--aw-eu-nav-border)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 4px rgba(46,134,255,0.2)' }}
      >
        {(['user', 'admin'] as const).map((r) => (
          <button
            key={r}
            className="flex-1 border-none rounded-[100px] cursor-pointer transition-all"
            style={role === r
              ? { background: 'var(--aw-eu-primary)', color: '#fff', fontWeight: 700, padding: '7px 12px', fontSize: 12, boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.45), 2px 4px 4px rgba(0,0,0,0.25)' }
              : { background: 'transparent', color: 'var(--aw-text-secondary)', fontWeight: 500, padding: '7px 12px', fontSize: 12 }}
            onClick={() => { setRole(r); if (r === 'admin') setBriefingSeen(true); }}
          >
            {r === 'admin' ? 'پنل مدیریت' : 'پنل شخصی'}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 p-1 mx-4 mb-1.5 rounded-xl" style={{ background: 'var(--aw-bg-card)' }}>
      {(['admin', 'user'] as const).map((r) => (
        <button
          key={r}
          className={`flex-1 py-1.5 px-2 border-none rounded-lg text-[12px] cursor-pointer transition-all ${
            role === r ? 'text-white shadow-md' : 'bg-transparent text-[var(--aw-text-muted)]'
          }`}
          style={role === r ? { background: 'var(--aw-primary)', fontWeight: 600, boxShadow: '0 2px 10px rgba(46,134,255,0.3)' } : { fontWeight: 600 }}
          onClick={() => { setRole(r); if (r === 'admin') setBriefingSeen(true); }}
        >
          {r === 'admin' ? 'پنل مدیریت' : 'پنل شخصی'}
        </button>
      ))}
    </div>
  );
}

// ========================
// AGENT SELECTOR — unified dropdown: دستیار شخصی + management teams
// (replaces the panel toggle; switches role + active team)
// ========================
export function AgentSelector() {
  const { role, setRole, agentTeam, setAgentTeam, setAdminScreen, setBriefingSeen } = useApp();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const trigRef = useRef<HTMLButtonElement>(null);
  const order: TeamKey[] = ['secretary', 'marketing', 'finance', 'procurement', 'sales'];
  const ASSISTANT_ICON = 'src/icons/svg2/assistant.svg';
  const options: { key: string; name: string; desc: string; icon: string }[] = [
    { key: 'assistant', name: 'دستیار شخصی', desc: 'دستیار هوشمند شخصی شما', icon: ASSISTANT_ICON },
    ...order.map(k => ({ key: k, name: TEAM_CONFIGS[k].name, desc: TEAM_CONFIGS[k].desc, icon: TEAM_ICON_SRC[k] || ASSISTANT_ICON })),
  ];
  const currentKey = role === 'user' ? 'assistant' : (agentTeam || 'assistant');
  const current = options.find(o => o.key === currentKey) || options[0];
  // Blue (business) side ⇒ tint the portalled icons blue to match the .neura-admin scope they escape.
  const blueTheme = role === 'admin';

  const toggle = () => {
    if (open) { setOpen(false); return; }
    const r = trigRef.current?.getBoundingClientRect();
    if (r) setMenuPos({ top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) });
    setOpen(true);
  };

  const pick = (key: string) => {
    setOpen(false);
    if (key === 'assistant') { setRole('user'); return; }
    setBriefingSeen(true);
    setAgentTeam(key as TeamKey);
    const cfg = TEAM_CONFIGS[key as TeamKey];
    if (cfg?.navItems?.[0]) setAdminScreen(cfg.navItems[0].id as AdminScreen);
    setRole('admin');
  };

  return (
    <div className="relative" style={{ zIndex: 40 }}>
      <button
        ref={trigRef}
        onClick={toggle}
        className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full border cursor-pointer transition-all"
        style={{
          background: 'var(--aw-eu-nav-bg, rgba(255,255,255,0.2))',
          borderColor: 'var(--aw-eu-nav-border, rgba(255,255,255,0.5))',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 12px var(--aw-eu-primary-shadow, rgba(0,0,0,0.16))',
        }}
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src={current.icon} alt="" className="nav-icon-img" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </span>
        <span className="text-[12px] whitespace-nowrap" style={{ fontWeight: 700, color: 'var(--aw-text-primary)' }}>{current.name}</span>
        <i className="fa-solid fa-chevron-down text-[9px]" style={{ color: 'var(--aw-text-secondary)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && menuPos && createPortal(
        <div className={blueTheme ? 'neura-admin' : undefined} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)}>
          <motion.div
            className="w-[224px] rounded-2xl overflow-hidden p-1.5"
            onClick={(e: any) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuPos.top,
              right: menuPos.right,
              background: 'color-mix(in srgb, var(--aw-bg-modal) 65%, transparent)',
              border: '1px solid var(--aw-border)',
              backdropFilter: 'blur(28px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.32)',
              zIndex: 9999,
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
          >
            {options.map(o => {
              const isActive = o.key === currentKey;
              return (
                <button
                  key={o.key}
                  onClick={() => pick(o.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-right"
                  style={{ background: isActive ? 'var(--aw-primary-bg)' : 'transparent' }}
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={o.icon} alt="" className="nav-icon-img" style={{ width: 34, height: 34, objectFit: 'contain' }} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] truncate" style={{ fontWeight: 700, color: 'var(--aw-text-primary)' }}>{o.name}</span>
                    <span className="block text-[10px] truncate" style={{ color: 'var(--aw-text-muted)' }}>{o.desc}</span>
                  </span>
                  {isActive && <i className="fa-solid fa-check text-[12px]" style={{ color: 'var(--aw-eu-primary)' }} />}
                </button>
              );
            })}
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ========================
// TEAM ICON BAR (small icons for quick team switching)
// ========================
function TeamIconBar() {
  const { agentTeam, setAgentTeam, setAdminScreen, setRole, setBriefingSeen } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const teamOrder: TeamKey[] = ['secretary', 'marketing', 'finance', 'procurement', 'sales'];
  const teams = teamOrder.map(k => TEAM_CONFIGS[k]);
  const activeTeam = agentTeam ? TEAM_CONFIGS[agentTeam] : null;

  // Collapsed: show only the active agent + an expand button (saves vertical space)
  if (collapsed && activeTeam) {
    return (
      <div className="flex items-center justify-center gap-2 mx-4 mb-2 py-1.5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[12px]" style={{ background: activeTeam.gradient }}>
            <i className={activeTeam.icon} />
          </div>
          <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{activeTeam.name}</span>
          <button className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer text-[var(--aw-text-muted)] text-[11px]" title="نمایش همه عامل‌ها" onClick={() => setCollapsed(false)}>
            <i className="fa-solid fa-chevron-down" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 mx-4 mb-2 py-2 relative">
      {activeTeam && (
        <button className="absolute left-1 top-1 w-6 h-6 rounded-full bg-transparent border-none cursor-pointer text-[var(--aw-text-muted)] text-[11px]" title="جمع کردن نوار عامل‌ها" onClick={() => setCollapsed(true)}>
          <i className="fa-solid fa-chevron-up" />
        </button>
      )}
      {teams.map((team) => {
        const active = agentTeam === team.id;
        return (
          <button
            key={team.id}
            title={team.name}
            className="relative flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer p-0 group"
            style={{ width: 56 }}
            onClick={() => {
              setAgentTeam(team.id);
              setAdminScreen(team.navItems[0]?.id || 'chatsScreen');
              setRole('admin');
              setBriefingSeen(true);
            }}
          >
            <div
              className={`w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-white text-[17px] transition-all ${
                active ? '' : 'opacity-50 hover:opacity-90'
              }`}
              style={{
                background: team.gradient,
                boxShadow: active ? '0 0 0 2px var(--aw-bg-app), 0 0 0 3.5px var(--aw-primary), 0 3px 12px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              <i className={team.icon} />
            </div>
            <span className={`text-[10px] transition-colors whitespace-nowrap ${active ? 'text-[var(--aw-text-primary)]' : 'text-[var(--aw-text-muted)]'}`} style={{ fontWeight: active ? 700 : 500 }}>
              {team.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ========================
// NAV ITEMS (shared between bottom nav & desktop sidebar)
// ========================
const ADMIN_NAV_ITEMS: { id: AdminScreen; icon: string; label: string }[] = [
  { id: 'chatsScreen', icon: 'fa-solid fa-comments', label: 'گفتگوها' },
  { id: 'dashboardScreen', icon: 'fa-solid fa-th-large', label: 'داشبورد' },
  { id: 'crmScreen', icon: 'fa-solid fa-users', label: 'CRM' },
  { id: 'financeScreen', icon: 'fa-solid fa-wallet', label: 'مالی' },
  { id: 'tasksScreen', icon: 'fa-solid fa-list-check', label: 'وظایف' },
  { id: 'reportsScreen', icon: 'fa-solid fa-chart-bar', label: 'گزارش‌ها' },
];

// ========================
// BOTTOM NAV (mobile only)
// ========================
// Map detail/sub-screens to the footer parent that should stay highlighted
const NAV_PARENT: Partial<Record<AdminScreen, AdminScreen>> = {
  mktApprovalsScreen: 'mktConversationsScreen',
  mktCalendarScreen: 'campaignScreen',
  salesShiftScreen: 'salesQuickReportScreen',
};

function AdminNav() {
  const { adminScreen, setAdminScreen, agentTeam, theme } = useApp();
  const navItems = agentTeam ? TEAM_CONFIGS[agentTeam]?.navItems || ADMIN_NAV_ITEMS : ADMIN_NAV_ITEMS;
  const activeId = NAV_PARENT[adminScreen] || adminScreen;
  const isGlass = theme === 'glass' || theme === 'dark';

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
            boxShadow: '0 4px 4px rgba(46,134,255,0.2)',
            padding: 3,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                className="flex-1 flex flex-col items-center gap-[2px] border-none cursor-pointer transition-all relative rounded-[100px]"
                style={{
                  padding: '6px 2px',
                  background: isActive ? 'var(--aw-eu-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--aw-text-secondary)',
                  fontWeight: isActive ? 800 : 500,
                  boxShadow: isActive ? 'inset 2px 2px 1px rgba(255,255,255,0.45), 2px 4px 4px rgba(0,0,0,0.25)' : 'none',
                }}
                onClick={() => setAdminScreen(item.id)}
              >
                <NavIcon id={item.id} fa={item.icon} size={14} />
                <span style={{ fontSize: 8, whiteSpace: 'nowrap' }}>{item.label}</span>
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
      {navItems.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 border-none bg-transparent cursor-pointer transition-all rounded-[10px] text-[10px] relative ${
              isActive ? 'text-[var(--aw-primary)]' : 'text-[var(--aw-text-muted)]'
            }`}
            style={{ fontWeight: isActive ? 700 : 500 }}
            onClick={() => setAdminScreen(item.id)}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full" style={{ background: 'var(--aw-primary)' }} />
            )}
            <NavIcon id={item.id} fa={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ========================
// DESKTOP SIDEBAR (collapsible — expanded / icon-only)
// ========================
function AdminSidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const { adminScreen, setAdminScreen, company, setCompany, openModal, openUnifiedCall, agentTeam } = useApp();
  const navItems = getTeamNavItems(agentTeam);
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
              <img src="src/assets/neura-logo-blue.png" alt="Neura" className="h-7 w-auto object-contain flex-shrink-0" style={{ filter: 'var(--aw-logo-filter)' }} />
              <span className="text-[16px] text-[var(--aw-text-primary)] font-[Neogrey] whitespace-nowrap" style={{ fontWeight: 700 }}>Neura</span>
            </div>
            <button
              className="w-[32px] h-[32px] rounded-[10px] bg-transparent border-none text-[var(--aw-text-muted)] text-[13px] cursor-pointer flex items-center justify-center flex-shrink-0 transition-all hover:text-[var(--aw-primary)] hover:bg-[var(--aw-bg-card-hover)]"
              onClick={onToggle}
              title="کوچک کردن منو"
            >
              <i className="fa-solid fa-angles-right" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <img src="src/assets/neura-logo-blue.png" alt="Neura" className="h-6 w-auto object-contain" style={{ filter: 'var(--aw-logo-filter)' }} />
            <button
              className="w-[30px] h-[30px] rounded-[8px] bg-transparent border-none text-[var(--aw-text-muted)] text-[12px] cursor-pointer flex items-center justify-center transition-all hover:text-[var(--aw-primary)] hover:bg-[var(--aw-bg-card-hover)]"
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
        {navItems.map((item) => {
          const isActive = (NAV_PARENT[adminScreen] || adminScreen) === item.id;
          return (
            <button
              key={item.id}
              title={!expanded ? item.label : undefined}
              className={`w-full flex items-center gap-3 mb-1 border-none rounded-xl cursor-pointer transition-all text-[13px] relative ${
                expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
              } ${isActive ? 'text-white' : 'bg-transparent text-[var(--aw-text-secondary)] hover:bg-[var(--aw-bg-card-hover)]'}`}
              style={isActive ? { background: 'var(--aw-primary)', fontWeight: 600, boxShadow: '0 2px 10px rgba(46,134,255,0.3)' } : { fontWeight: 500 }}
              onClick={() => setAdminScreen(item.id)}
            >
              <i className={`${item.icon} ${expanded ? 'w-5' : 'w-full'} text-center text-[15px]`} />
              {expanded && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className={`py-3 border-t border-[var(--aw-border)] space-y-1.5 ${expanded ? 'px-3' : 'px-2'}`}>
        <button title={!expanded ? 'تماس‌ها' : undefined} className={`w-full flex items-center gap-3 py-2.5 border-none rounded-xl cursor-pointer transition-all text-[13px] bg-transparent text-[var(--aw-text-secondary)] hover:bg-[var(--aw-bg-card-hover)] ${expanded ? 'px-3' : 'px-0 justify-center'}`} style={{ fontWeight: 500 }} onClick={openUnifiedCall}>
          <i className={`fa-solid fa-phone ${expanded ? 'w-5' : 'w-full'} text-center text-[var(--aw-secondary)]`} />
          {expanded && <span>تماس‌ها</span>}
        </button>
        <button title={!expanded ? 'تنظیمات' : undefined} className={`w-full flex items-center gap-3 py-2.5 border-none rounded-xl cursor-pointer transition-all text-[13px] bg-transparent text-[var(--aw-text-secondary)] hover:bg-[var(--aw-bg-card-hover)] ${expanded ? 'px-3' : 'px-0 justify-center'}`} style={{ fontWeight: 500 }} onClick={() => openModal('تنظیمات', <MoreScreenModal />)}>
          <i className={`fa-solid fa-cog ${expanded ? 'w-5' : 'w-full'} text-center`} />
          {expanded && <span>تنظیمات</span>}
        </button>
      </div>

      {/* Agent selector (expanded only) */}
      {expanded && (
        <div className="px-3 pb-3"><AgentSelector /></div>
      )}
    </aside>
  );
}

// ========================
// NEW GROUP CHAT CONTENT (global, not tied to category)
// ========================
function NewGroupChatContent() {
  const { agents, personnel, customers, company, addGroupChat, closeModal, showToast, agentTeam, openChat } = useApp();
  const [chatName, setChatName] = useState('');
  const [selectOpen, setSelectOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState<{ id: string; type: 'agent' | 'personnel' | 'customer'; name: string; init: string; bg: string }[]>([]);

  const companyAgents = agents.filter(a => !a.company || a.company === company).filter(a => !a.locked);
  const allItems = [
    ...companyAgents.map(a => ({ id: a.id, type: 'agent' as const, name: a.name, sub: a.role, init: a.init, bg: a.bg })),
    ...personnel.map(p => ({ id: p.id, type: 'personnel' as const, name: p.name, sub: p.role, init: p.name[0], bg: 'bg-blue-500' })),
    ...customers.map(c => ({ id: c.id, type: 'customer' as const, name: c.name, sub: c.contact, init: c.name[0], bg: 'bg-emerald-500' })),
  ];
  const filtered = allItems.filter(i => !searchQ || i.name.includes(searchQ) || i.sub.includes(searchQ));

  const isSelected = (id: string, type: string) => selected.some(s => s.id === id && s.type === type);
  const toggle = (it: { id: string; type: 'agent' | 'personnel' | 'customer'; name: string; init: string; bg: string }) => {
    setSelected(prev => isSelected(it.id, it.type)
      ? prev.filter(s => !(s.id === it.id && s.type === it.type))
      : [...prev, { id: it.id, type: it.type, name: it.name, init: it.init, bg: it.bg }]);
  };

  const BG_OPTIONS = ['bg-violet-600', 'bg-pink-500', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];

  const submit = () => {
    if (!chatName.trim()) { showToast('نام گروه را وارد کنید'); return; }
    if (selected.length < 2) { showToast('حداقل ۲ عضو انتخاب کنید'); return; }
    const id = 'gc_' + Date.now();
    addGroupChat({
      id,
      name: chatName.trim(),
      bg: BG_OPTIONS[Math.floor(Math.random() * BG_OPTIONS.length)],
      memberIds: selected.map(s => ({ id: s.id, type: s.type })),
      team: agentTeam || null,
    });
    showToast('چت گروهی ایجاد شد');
    closeModal();
    setTimeout(() => openChat(id, 'group'), 150);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-[12px] text-[var(--aw-text-secondary)] mb-1.5 block" style={{ fontWeight: 600 }}>نام گروه</label>
        <input
          className="w-full bg-[var(--aw-bg-input)] border border-[var(--aw-border)] rounded-[10px] px-3 py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
          placeholder="مثلاً: تیم پروژه..."
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-[12px] text-[var(--aw-text-secondary)] mb-1.5 block" style={{ fontWeight: 600 }}>مخاطبین</label>
        <div
          className="w-full bg-[var(--aw-bg-input)] border border-[var(--aw-border)] rounded-[10px] px-3 py-2.5 text-[13px] cursor-pointer flex items-center justify-between gap-2"
          onClick={() => setSelectOpen(o => !o)}
        >
          <div className="flex flex-wrap gap-1 flex-1 min-h-[20px]">
            {selected.length === 0 && <span className="text-[var(--aw-text-muted)]">انتخاب مخاطبین...</span>}
            {selected.map(s => (
              <span key={s.type + s.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-white" style={{ background: 'var(--aw-primary)' }}>
                {s.name}
                <button className="border-none bg-transparent text-white cursor-pointer text-[10px] p-0 leading-none"
                  onClick={(e) => { e.stopPropagation(); toggle({ id: s.id, type: s.type, name: s.name, init: s.init, bg: s.bg }); }}>
                  <i className="fa-solid fa-times" />
                </button>
              </span>
            ))}
          </div>
          <i className={`fa-solid fa-chevron-${selectOpen ? 'up' : 'down'} text-[10px] text-[var(--aw-text-muted)]`} />
        </div>
        {selectOpen && (
          <div className="mt-1.5 border border-[var(--aw-border)] rounded-[10px] overflow-hidden" style={{ background: 'var(--aw-bg-card)' }}>
            <input
              className="w-full bg-transparent border-b border-[var(--aw-border)] px-3 py-2 text-[12px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
              placeholder="جستجو..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              autoFocus
            />
            <div className="max-h-[240px] overflow-y-auto aw-scroll">
              {filtered.length === 0 && (
                <div className="text-center py-4 text-[var(--aw-text-muted)] text-[12px]">یافت نشد</div>
              )}
              {filtered.map(it => {
                const sel = isSelected(it.id, it.type);
                return (
                  <div key={it.type + it.id}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[var(--aw-bg-card-hover)]"
                    onClick={() => toggle(it)}>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] flex-shrink-0 ${it.bg}`} style={{ fontWeight: 700 }}>{it.init}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px]" style={{ fontWeight: 600 }}>{it.name}</div>
                      <div className="text-[10px] text-[var(--aw-text-muted)] truncate">{it.sub}</div>
                    </div>
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${sel ? 'text-white' : ''}`}
                      style={{ background: sel ? 'var(--aw-primary)' : 'var(--aw-bg-input)', border: sel ? 'none' : '1px solid var(--aw-border)' }}>
                      {sel && <i className="fa-solid fa-check text-[8px]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <button
        className="w-full py-3 rounded-[10px] border-none text-white cursor-pointer text-[13px]"
        style={{ background: 'var(--aw-primary)', fontWeight: 700 }}
        onClick={submit}
      >
        <i className="fa-solid fa-check ml-1.5" />
        ایجاد چت گروهی
      </button>
    </div>
  );
}

// ========================
// RENAME CATEGORY
// ========================
function RenameCategoryContent({ group }: { group: ChatGroup }) {
  const { updateChatGroup, closeModal, showToast } = useApp();
  const [name, setName] = useState(group.name);
  const submit = () => {
    if (!name.trim()) { showToast('نام معتبر وارد کنید'); return; }
    updateChatGroup(group.id, { name: name.trim() });
    showToast('نام دسته‌بندی تغییر یافت');
    closeModal();
  };
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[12px] text-[var(--aw-text-secondary)]" style={{ fontWeight: 600 }}>نام دسته‌بندی</label>
      <input
        className="w-full bg-[var(--aw-bg-input)] border border-[var(--aw-border)] rounded-[10px] px-3 py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <button
        className="w-full py-3 rounded-[10px] border-none text-white cursor-pointer text-[13px]"
        style={{ background: 'var(--aw-primary)', fontWeight: 700 }}
        onClick={submit}
      >
        ذخیره
      </button>
    </div>
  );
}

// ========================
// ADD CHAT TO CATEGORY
// ========================
function AddChatToCategoryContent({ group }: { group: ChatGroup }) {
  const { agents, personnel, customers, company, updateChatGroup, closeModal, showToast } = useApp();
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState<{ id: string; type: 'agent' | 'personnel' | 'customer' }[]>([]);

  const isMember = (id: string, type: string) => group.members.some(m => m.id === id && m.type === type);
  const isSelected = (id: string, type: string) => selected.some(s => s.id === id && s.type === type);

  const companyAgents = agents.filter(a => !a.company || a.company === company).filter(a => !a.locked);
  const allItems = [
    ...companyAgents.map(a => ({ id: a.id, type: 'agent' as const, name: a.name, sub: a.role, init: a.init, bg: a.bg })),
    ...personnel.map(p => ({ id: p.id, type: 'personnel' as const, name: p.name, sub: p.role, init: p.name[0], bg: 'bg-blue-500' })),
    ...customers.map(c => ({ id: c.id, type: 'customer' as const, name: c.name, sub: c.contact, init: c.name[0], bg: 'bg-emerald-500' })),
  ].filter(i => !isMember(i.id, i.type));

  const filtered = allItems.filter(i => !searchQ || i.name.includes(searchQ) || i.sub.includes(searchQ));

  const toggle = (id: string, type: 'agent' | 'personnel' | 'customer') => {
    setSelected(prev => prev.some(s => s.id === id && s.type === type)
      ? prev.filter(s => !(s.id === id && s.type === type))
      : [...prev, { id, type }]);
  };

  const submit = () => {
    if (selected.length === 0) { showToast('چتی انتخاب نشده'); return; }
    updateChatGroup(group.id, { members: [...group.members, ...selected] });
    showToast(toFa(selected.length) + ' چت اضافه شد');
    closeModal();
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        className="w-full bg-[var(--aw-bg-input)] border border-[var(--aw-border)] rounded-[10px] px-3 py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
        placeholder="جستجو..."
        value={searchQ}
        onChange={(e) => setSearchQ(e.target.value)}
      />
      <div className="max-h-[300px] overflow-y-auto aw-scroll flex flex-col gap-1">
        {filtered.length === 0 && (
          <div className="text-center py-6 text-[var(--aw-text-muted)] text-[12px]">چتی برای افزودن نیست</div>
        )}
        {filtered.map(it => {
          const sel = isSelected(it.id, it.type);
          return (
            <div
              key={it.type + '_' + it.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-[10px] cursor-pointer transition-all border ${sel ? 'border-[var(--aw-primary)]' : 'border-transparent'}`}
              style={{ background: sel ? 'rgba(126,95,170,0.12)' : 'var(--aw-bg-input)' }}
              onClick={() => toggle(it.id, it.type)}
            >
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-white flex-shrink-0 ${it.bg}`} style={{ fontWeight: 700 }}>
                {it.init}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px]" style={{ fontWeight: 600 }}>{it.name}</div>
                <div className="text-[11px] text-[var(--aw-text-muted)] truncate">{it.sub}</div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${sel ? 'text-white' : ''}`} style={{ background: sel ? 'var(--aw-primary)' : 'var(--aw-bg-card)', border: sel ? 'none' : '1px solid var(--aw-border)' }}>
                {sel && <i className="fa-solid fa-check text-[10px]" />}
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="w-full py-3 rounded-[10px] border-none text-white cursor-pointer text-[13px]"
        style={{ background: 'var(--aw-primary)', fontWeight: 700 }}
        onClick={submit}
      >
        افزودن {selected.length > 0 && '(' + toFa(selected.length) + ')'}
      </button>
    </div>
  );
}

// ========================
// NEW GROUP CONTENT (for + button modal)
// ========================
function NewGroupContent() {
  const { agents, personnel, customers, company, addChatGroup, setChatTab, closeModal, showToast, agentTeam } = useApp();
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState<{ id: string; type: 'agent' | 'personnel' | 'customer' }[]>([]);
  const [searchQ, setSearchQ] = useState('');

  const companyAgents = agents.filter(a => !a.company || a.company === company).filter(a => !a.locked);

  const allItems: { id: string; type: 'agent' | 'personnel' | 'customer'; name: string; sub: string; init: string; bg: string }[] = [
    ...companyAgents.map(a => ({ id: a.id, type: 'agent' as const, name: a.name, sub: a.role, init: a.init, bg: a.bg })),
    ...personnel.map(p => ({ id: p.id, type: 'personnel' as const, name: p.name, sub: p.role, init: p.name[0], bg: 'bg-blue-500' })),
    ...customers.map(c => ({ id: c.id, type: 'customer' as const, name: c.name, sub: c.contact, init: c.name[0], bg: 'bg-emerald-500' })),
  ];

  const filtered = allItems.filter(i => !searchQ || i.name.includes(searchQ) || i.sub.includes(searchQ));

  const toggleSelect = (id: string, type: 'agent' | 'personnel' | 'customer') => {
    setSelected(prev => {
      const exists = prev.find(s => s.id === id && s.type === type);
      if (exists) return prev.filter(s => !(s.id === id && s.type === type));
      return [...prev, { id, type }];
    });
  };

  const isSelected = (id: string, type: string) => selected.some(s => s.id === id && s.type === type);

  const handleCreate = () => {
    if (!groupName.trim()) { showToast('لطفاً نام دسته‌بندی را وارد کنید'); return; }
    if (selected.length === 0) { showToast('لطفاً حداقل یک چت انتخاب کنید'); return; }
    const group: ChatGroup = {
      id: 'grp_' + Date.now(),
      name: groupName.trim(),
      members: selected,
      team: agentTeam || null,
    };
    addChatGroup(group);
    setChatTab(group.id);
    closeModal();
    showToast('دسته‌بندی «' + groupName.trim() + '» ایجاد شد');
  };

  return (
    <div className="flex flex-col gap-4 max-h-[70vh]">
      {/* Group Name */}
      <div>
        <label className="block text-[12px] text-[var(--aw-text-muted)] mb-1.5">نام دسته‌بندی جدید</label>
        <input
          className="w-full bg-transparent border border-[var(--aw-border)] rounded-[10px] px-3 py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
          style={{ background: 'var(--aw-bg-input)' }}
          placeholder="مثلاً: مشتریان VIP"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          autoFocus
        />
      </div>

      {/* Select Chats */}
      <div>
        <label className="block text-[12px] text-[var(--aw-text-muted)] mb-1.5">
          افزودن چت‌ها به این گروه
          {selected.length > 0 && <span className="mr-1 text-[var(--aw-primary)]">({toFa(selected.length)} انتخاب شده)</span>}
        </label>
        <div className="flex items-center gap-2 rounded-[10px] px-3 border border-[var(--aw-border)] mb-2" style={{ background: 'var(--aw-bg-input)' }}>
          <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
          <input
            className="flex-1 bg-transparent border-none py-2 text-[12px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
            placeholder="جستجو در مخاطبین..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>
        <div className="overflow-y-auto max-h-[40vh] aw-scroll rounded-[10px] border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          {filtered.length === 0 && (
            <div className="text-center py-6 text-[var(--aw-text-muted)] text-[12px]">موردی یافت نشد</div>
          )}
          {filtered.map(item => (
            <button
              key={item.type + '_' + item.id}
              className="w-full flex items-center gap-3 p-2.5 border-none cursor-pointer transition-all bg-transparent text-right"
              style={{
                borderBottom: '1px solid var(--aw-border)',
                background: isSelected(item.id, item.type) ? 'rgba(126,95,170,0.15)' : 'transparent'
              }}
              onClick={() => toggleSelect(item.id, item.type)}
            >
              <div className="relative">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-white flex-shrink-0 ${item.bg}`} style={{ fontWeight: 700, fontSize: 13 }}>
                  {item.init}
                </div>
                {isSelected(item.id, item.type) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white" style={{ background: 'var(--aw-primary)' }}>
                    <i className="fa-solid fa-check" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-[var(--aw-text-primary)] truncate">{item.name}</div>
                <div className="text-[11px] text-[var(--aw-text-muted)] truncate">{item.sub}</div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                background: item.type === 'agent' ? 'rgba(126,95,170,0.2)' : item.type === 'personnel' ? 'rgba(59,130,246,0.2)' : 'rgba(0,230,118,0.2)',
                color: item.type === 'agent' ? '#9F8DC6' : item.type === 'personnel' ? '#3B82F6' : '#00E676',
              }}>
                {item.type === 'agent' ? 'عامل' : item.type === 'personnel' ? 'پرسنل' : 'مشتری'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Create Button */}
      <button
        className="w-full py-3 rounded-[10px] border-none text-white cursor-pointer text-[13px] transition-all"
        style={{ background: 'var(--aw-primary)', fontWeight: 600, opacity: groupName.trim() && selected.length > 0 ? 1 : 0.5 }}
        onClick={handleCreate}
      >
        <i className="fa-solid fa-folder-plus ml-2" />
        ایجاد گروه ({toFa(selected.length)} عضو)
      </button>
    </div>
  );
}

// ========================
// CHATS SCREEN
// ========================
const TEAM_SAMPLE_CHATS: Record<TeamKey, { id: string; name: string; init: string; bg: string; lastMsg: string; time: string; unread: number; tag: string }[]> = {
  secretary: [
    { id: 'sec1', name: 'دکتر اکرمی',           init: 'د', bg: 'bg-pink-500',    lastMsg: 'لطفاً جلسه فردا ساعت ۱۰ را تأیید کنید', time: '۵ دقیقه پیش', unread: 2, tag: 'جلسه' },
    { id: 'sec2', name: 'مهندس کرمی',           init: 'م', bg: 'bg-rose-500',    lastMsg: 'یادآوری قرار با مشتری در ساعت ۱۴',     time: '۲۰ دقیقه پیش', unread: 0, tag: 'یادآوری' },
    { id: 'sec3', name: 'منشی شعبه ۲',          init: 'ش', bg: 'bg-fuchsia-500', lastMsg: 'هماهنگی برای رزرو سالن کنفرانس انجام شد', time: '۱ ساعت پیش', unread: 1, tag: 'هماهنگی' },
    { id: 'sec4', name: 'دفتر مدیرعامل',         init: 'د', bg: 'bg-purple-500',  lastMsg: 'گزارش روزانه را تا ساعت ۱۶ ارسال کنید',  time: 'دیروز',     unread: 0, tag: 'گزارش' },
    { id: 'sec5', name: 'سرکار خانم رحیمی',      init: 'ر', bg: 'bg-pink-600',    lastMsg: 'تماس مشتری VIP در صف انتظار است',         time: 'دیروز',     unread: 3, tag: 'تماس' },
  ],
  marketing: [
    { id: 'mkt1', name: 'تیم محتوا',             init: 'م', bg: 'bg-blue-500',    lastMsg: 'کمپین اینستاگرام آماده انتشار است',         time: '۱۰ دقیقه پیش', unread: 4, tag: 'کمپین' },
    { id: 'mkt2', name: 'آژانس دیجیتال آلفا',    init: 'آ', bg: 'bg-indigo-500',  lastMsg: 'گزارش CTR هفته گذشته را ارسال کردیم',        time: '۳۰ دقیقه پیش', unread: 0, tag: 'تبلیغات' },
    { id: 'mkt3', name: 'سارا - مدیر برند',      init: 'س', bg: 'bg-cyan-500',    lastMsg: 'بودجه گوگل ادز نیاز به تمدید دارد',          time: '۲ ساعت پیش',   unread: 2, tag: 'بودجه' },
    { id: 'mkt4', name: 'لید جدید (وب‌سایت)',     init: 'ل', bg: 'bg-sky-500',     lastMsg: 'کاربر فرم تماس را پر کرد - پیگیری کنید',     time: '۳ ساعت پیش',   unread: 1, tag: 'لید' },
    { id: 'mkt5', name: 'تیم سوشال',             init: 'ش', bg: 'bg-blue-600',    lastMsg: 'تعامل پست امروز ۲۱۰٪ افزایش یافت 🚀',        time: 'دیروز',       unread: 0, tag: 'سوشال' },
  ],
  finance: [
    { id: 'fin1', name: 'حسابدار - آقای محمدی',  init: 'م', bg: 'bg-purple-500',  lastMsg: 'صورت حساب فروردین تنظیم شد',                  time: '۱۵ دقیقه پیش', unread: 1, tag: 'حسابداری' },
    { id: 'fin2', name: 'بانک ملی - شعبه مرکزی', init: 'ب', bg: 'bg-violet-500',  lastMsg: 'تراکنش ۲۵۰ میلیونی تأیید شد',                 time: '۱ ساعت پیش',   unread: 0, tag: 'بانک' },
    { id: 'fin3', name: 'دارایی و مالیات',       init: 'د', bg: 'bg-fuchsia-600', lastMsg: 'اظهارنامه مالیاتی Q۱ نیاز به امضا دارد',      time: '۲ ساعت پیش',   unread: 2, tag: 'مالیات' },
    { id: 'fin4', name: 'بیمه آسیا',             init: 'ب', bg: 'bg-purple-600',  lastMsg: 'تمدید بیمه مسئولیت تا پایان هفته',            time: 'دیروز',       unread: 0, tag: 'بیمه' },
    { id: 'fin5', name: 'حسابرس داخلی',          init: 'ح', bg: 'bg-indigo-600',  lastMsg: 'گزارش ممیزی سه‌ماهه آماده بازبینی است',         time: '۲ روز پیش',   unread: 1, tag: 'ممیزی' },
  ],
  procurement: [
    { id: 'prc1', name: 'تأمین‌کننده پارس',        init: 'پ', bg: 'bg-orange-500',  lastMsg: 'محموله ۱۵۰ کارتن تا فردا تحویل می‌شود',       time: '۲۰ دقیقه پیش', unread: 2, tag: 'تحویل' },
    { id: 'prc2', name: 'انبار مرکزی',           init: 'ا', bg: 'bg-amber-500',   lastMsg: 'موجودی کالای A۲ به حد بحرانی رسید',           time: '۴۵ دقیقه پیش', unread: 3, tag: 'انبار' },
    { id: 'prc3', name: 'حمل‌ونقل البرز',         init: 'ا', bg: 'bg-orange-600',  lastMsg: 'بارنامه ۸۸۲۱ صادر شد',                       time: '۳ ساعت پیش',   unread: 0, tag: 'لجستیک' },
    { id: 'prc4', name: 'تأمین‌کننده ایران‌خودرو', init: 'ا', bg: 'bg-yellow-600',  lastMsg: 'پیش‌فاکتور قطعات یدکی ارسال شد',               time: 'دیروز',       unread: 1, tag: 'سفارش' },
    { id: 'prc5', name: 'گمرک - ترخیص',          init: 'گ', bg: 'bg-amber-600',   lastMsg: 'مدارک ترخیص کانتینر تکمیل است',               time: 'دیروز',       unread: 0, tag: 'گمرک' },
  ],
  sales: [
    { id: 'sls1', name: 'علی رضایی - مشتری VIP', init: 'ع', bg: 'bg-emerald-500', lastMsg: 'سفارش جدید ثبت شد - ۸ قلم',                    time: '۵ دقیقه پیش',  unread: 3, tag: 'فروش' },
    { id: 'sls2', name: 'صندوق ۲',               init: 'ص', bg: 'bg-green-500',   lastMsg: 'گزارش روزانه: ۴۲ تراکنش، ۱۸ میلیون',          time: '۱۵ دقیقه پیش', unread: 0, tag: 'صندوق' },
    { id: 'sls3', name: 'مشتری حضوری - میز ۵',   init: 'م', bg: 'bg-teal-500',    lastMsg: 'درخواست فاکتور رسمی برای شرکت',                time: '۳۰ دقیقه پیش', unread: 1, tag: 'فاکتور' },
    { id: 'sls4', name: 'فروشگاه اینترنتی',      init: 'ف', bg: 'bg-emerald-600', lastMsg: '۱۴ سفارش آنلاین در انتظار آماده‌سازی',           time: '۱ ساعت پیش',   unread: 5, tag: 'آنلاین' },
    { id: 'sls5', name: 'باشگاه مشتریان',        init: 'ب', bg: 'bg-green-600',   lastMsg: '۷ مشتری از کد تخفیف استفاده کردند',            time: 'دیروز',       unread: 0, tag: 'وفاداری' },
  ],
};

const SearchHighlightContext = createContext<string>('');

function Hi({ text }: { text: string }) {
  const q = useContext(SearchHighlightContext).trim();
  if (!q || !text) return <>{text}</>;
  const idx = text.indexOf(q);
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(255,210,0,0.45)', color: 'inherit', borderRadius: 3, padding: '0 1px' }}>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

interface PeerChatMsg { from: string; text: string; time: string; }
interface PersonnelPeerChat {
  id: string;
  members: string[];
  isGroup: boolean;
  title?: string;
  lastMsg: string;
  time: string;
  unread: number;
  bg: string;
  transcript: PeerChatMsg[];
}

const PERSONNEL_PEER_CHATS_BY_TEAM: Record<TeamKey, PersonnelPeerChat[]> = {
  secretary: [
    {
      id: 'sec1', members: ['p1', 'p2'], isGroup: false,
      lastMsg: 'صورتجلسه هیئت‌مدیره را برای آقای مدیرعامل ارسال کردم',
      time: '۱۰:۴۰', unread: 0, bg: 'bg-pink-500',
      transcript: [
        { from: 'p1', text: 'سلام، جلسه ساعت ۱۰ هیئت‌مدیره برگزار شد؟', time: '۱۰:۲۰' },
        { from: 'p2', text: 'بله، تمام شد. در حال تنظیم صورتجلسه هستم', time: '۱۰:۲۵' },
        { from: 'p2', text: 'صورتجلسه هیئت‌مدیره را برای آقای مدیرعامل ارسال کردم', time: '۱۰:۴۰' },
      ],
    },
    {
      id: 'sec2', members: ['p2', 'p3'], isGroup: false,
      lastMsg: 'وقت جلسه با شرکت آلفا را به فردا ساعت ۱۴ موکول کردم',
      time: '۰۹:۱۵', unread: 1, bg: 'bg-blue-500',
      transcript: [
        { from: 'p3', text: 'لطفاً وقت جلسه پنج‌شنبه را تغییر بده، سفر دارم', time: '۰۹:۰۵' },
        { from: 'p2', text: 'چشم، با مشتری هماهنگ می‌کنم', time: '۰۹:۱۰' },
        { from: 'p2', text: 'وقت جلسه با شرکت آلفا را به فردا ساعت ۱۴ موکول کردم', time: '۰۹:۱۵' },
      ],
    },
    {
      id: 'sec3', members: ['p1', 'p2', 'p4'], isGroup: true, title: 'هماهنگی برنامه هفتگی مدیران',
      lastMsg: 'تقویم به‌روز شد، لینک گوگل میت در دعوت‌ها قرار گرفت',
      time: 'دیروز', unread: 0, bg: 'bg-purple-500',
      transcript: [
        { from: 'p1', text: 'جلسات این هفته را در تقویم ثبت کنیم', time: 'دیروز ۱۵:۱۰' },
        { from: 'p4', text: 'سه‌شنبه جلسه با تیم فنی فراموش نشود', time: 'دیروز ۱۵:۱۲' },
        { from: 'p2', text: 'حله، اضافه می‌کنم', time: 'دیروز ۱۵:۱۵' },
        { from: 'p2', text: 'تقویم به‌روز شد، لینک گوگل میت در دعوت‌ها قرار گرفت', time: 'دیروز ۱۵:۳۰' },
      ],
    },
  ],
  marketing: [
    {
      id: 'mkt1', members: ['p1', 'p2'], isGroup: false,
      lastMsg: 'نرخ کلیک کمپین اینستاگرام به ۴.۸٪ رسید',
      time: '۱۱:۰۵', unread: 2, bg: 'bg-pink-500',
      transcript: [
        { from: 'p1', text: 'گزارش کمپین جشنواره بهاره آماده است؟', time: '۱۰:۵۰' },
        { from: 'p2', text: 'بله، در حال نهایی کردن اعداد هستم', time: '۱۰:۵۵' },
        { from: 'p2', text: 'نرخ کلیک کمپین اینستاگرام به ۴.۸٪ رسید', time: '۱۱:۰۵' },
      ],
    },
    {
      id: 'mkt2', members: ['p2', 'p3'], isGroup: false,
      lastMsg: 'محتوای ویدیویی هفته بعد را به تولید سپردم',
      time: '۰۹:۳۰', unread: 0, bg: 'bg-orange-500',
      transcript: [
        { from: 'p3', text: 'تقویم محتوای ماه بعد را شروع کنیم؟', time: '۰۹:۱۵' },
        { from: 'p2', text: 'بله، تم اصلی روی برندینگ تمرکز داشته باشه', time: '۰۹:۲۵' },
        { from: 'p2', text: 'محتوای ویدیویی هفته بعد را به تولید سپردم', time: '۰۹:۳۰' },
      ],
    },
    {
      id: 'mkt3', members: ['p1', 'p2', 'p3', 'p4'], isGroup: true, title: 'تیم کمپین یلدا',
      lastMsg: 'بودجه گوگل ادز را ۲۰٪ افزایش دادیم',
      time: 'دیروز', unread: 3, bg: 'bg-purple-500',
      transcript: [
        { from: 'p1', text: 'برای کمپین یلدا چه کانال‌هایی فعال باشد؟', time: 'دیروز ۱۴:۲۰' },
        { from: 'p4', text: 'اینستا، گوگل ادز و ایمیل مارکتینگ', time: 'دیروز ۱۴:۲۵' },
        { from: 'p3', text: 'پیشنهاد می‌کنم تلگرام هم اضافه کنیم', time: 'دیروز ۱۴:۳۰' },
        { from: 'p2', text: 'بودجه گوگل ادز را ۲۰٪ افزایش دادیم', time: 'دیروز ۱۵:۰۰' },
      ],
    },
  ],
  finance: [
    {
      id: 'fin1', members: ['p1', 'p2'], isGroup: false,
      lastMsg: 'فاکتور شماره ۲۳۴ به مشتری ارسال شد',
      time: '۱۰:۲۵', unread: 0, bg: 'bg-emerald-500',
      transcript: [
        { from: 'p1', text: 'فاکتور مشتری شرکت آلفا آماده شد', time: '۱۰:۱۸' },
        { from: 'p2', text: 'مبلغ نهایی چقدر شد؟', time: '۱۰:۲۰' },
        { from: 'p1', text: '۸۰ میلیون تومان با احتساب مالیات', time: '۱۰:۲۲' },
        { from: 'p1', text: 'فاکتور شماره ۲۳۴ به مشتری ارسال شد', time: '۱۰:۲۵' },
      ],
    },
    {
      id: 'fin2', members: ['p2', 'p3'], isGroup: false,
      lastMsg: 'لیست حقوق این ماه را به بانک ارسال کردم',
      time: '۰۸:۵۰', unread: 1, bg: 'bg-blue-500',
      transcript: [
        { from: 'p3', text: 'حقوق پرسنل امروز واریز می‌شود؟', time: '۰۸:۴۰' },
        { from: 'p2', text: 'بله، در حال ارسال به بانک هستم', time: '۰۸:۴۵' },
        { from: 'p2', text: 'لیست حقوق این ماه را به بانک ارسال کردم', time: '۰۸:۵۰' },
      ],
    },
    {
      id: 'fin3', members: ['p1', 'p2', 'p4'], isGroup: true, title: 'بستن حساب‌های پایان ماه',
      lastMsg: 'تراز آزمایشی متعادل است، آماده گزارش‌گیری هستیم',
      time: 'دیروز', unread: 0, bg: 'bg-purple-500',
      transcript: [
        { from: 'p4', text: 'مغایرت بانکی این ماه برطرف شد؟', time: 'دیروز ۱۶:۱۰' },
        { from: 'p1', text: 'بله، ۲ تراکنش بود که اصلاح کردم', time: 'دیروز ۱۶:۲۰' },
        { from: 'p2', text: 'تراز آزمایشی متعادل است، آماده گزارش‌گیری هستیم', time: 'دیروز ۱۶:۴۵' },
      ],
    },
  ],
  procurement: [
    {
      id: 'pro1', members: ['p1', 'p2'], isGroup: false,
      lastMsg: 'تأمین‌کننده روز چهارشنبه کاغذ A4 را تحویل می‌دهد',
      time: '۰۹:۵۰', unread: 2, bg: 'bg-emerald-500',
      transcript: [
        { from: 'p2', text: 'سفارش کاغذ A4 ثبت شد؟', time: '۰۹:۴۲' },
        { from: 'p1', text: 'بله، با تأمین‌کننده هماهنگ شد', time: '۰۹:۴۵' },
        { from: 'p1', text: 'تأمین‌کننده روز چهارشنبه کاغذ A4 را تحویل می‌دهد', time: '۰۹:۵۰' },
      ],
    },
    {
      id: 'pro2', members: ['p2', 'p3'], isGroup: false,
      lastMsg: 'سه پیشنهاد قیمت برای کارتریج HP گرفتم',
      time: '۱۱:۲۰', unread: 0, bg: 'bg-orange-500',
      transcript: [
        { from: 'p3', text: 'برای کارتریج پرینتر چندتا تأمین‌کننده داریم؟', time: '۱۱:۰۵' },
        { from: 'p2', text: 'سه پیشنهاد قیمت برای کارتریج HP گرفتم', time: '۱۱:۲۰' },
      ],
    },
    {
      id: 'pro3', members: ['p1', 'p3', 'p4'], isGroup: true, title: 'استعلام تأمین‌کنندگان فصلی',
      lastMsg: 'قرارداد سال بعد با تأمین‌کننده پارس آماده امضا است',
      time: 'دیروز', unread: 0, bg: 'bg-purple-500',
      transcript: [
        { from: 'p4', text: 'برای استعلام جدید کدام تأمین‌کننده‌ها را دعوت کنیم؟', time: 'دیروز ۱۴:۱۰' },
        { from: 'p3', text: 'پارس، ایران‌خودرو و تأمین‌کالای البرز', time: 'دیروز ۱۴:۱۵' },
        { from: 'p1', text: 'قرارداد سال بعد با تأمین‌کننده پارس آماده امضا است', time: 'دیروز ۱۶:۰۰' },
      ],
    },
  ],
  sales: [
    {
      id: 'sal1', members: ['p1', 'p2'], isGroup: false,
      lastMsg: 'مشتری شماره ۸ فاکتور را تأیید کرد',
      time: '۱۰:۱۵', unread: 0, bg: 'bg-emerald-500',
      transcript: [
        { from: 'p1', text: 'مشتری شرکت سامان آمد، چه تخفیفی پیشنهاد بدم؟', time: '۱۰:۰۰' },
        { from: 'p2', text: 'تا ۱۰٪ مجاز هستیم', time: '۱۰:۰۵' },
        { from: 'p1', text: 'مشتری شماره ۸ فاکتور را تأیید کرد', time: '۱۰:۱۵' },
      ],
    },
    {
      id: 'sal2', members: ['p2', 'p3'], isGroup: false,
      lastMsg: 'موجودی محصول A زیر حد مجاز است',
      time: '۰۹:۳۰', unread: 3, bg: 'bg-orange-500',
      transcript: [
        { from: 'p2', text: 'محصول A چقدر در انبار داریم؟', time: '۰۹:۲۰' },
        { from: 'p3', text: 'فقط ۸ عدد', time: '۰۹:۲۵' },
        { from: 'p3', text: 'موجودی محصول A زیر حد مجاز است', time: '۰۹:۳۰' },
      ],
    },
    {
      id: 'sal3', members: ['p1', 'p2', 'p4'], isGroup: true, title: 'شیفت فروش امروز',
      lastMsg: 'مجموع فروش روزانه از ۸۵ میلیون تومان عبور کرد',
      time: '۱۸:۴۰', unread: 0, bg: 'bg-purple-500',
      transcript: [
        { from: 'p4', text: 'شروع شیفت همه آماده؟', time: '۰۸:۰۰' },
        { from: 'p1', text: 'بله، صندوق باز شد', time: '۰۸:۰۵' },
        { from: 'p2', text: 'فروش ساعت ۱۲ از ۳۰ میلیون رد شد', time: '۱۲:۱۵' },
        { from: 'p4', text: 'مجموع فروش روزانه از ۸۵ میلیون تومان عبور کرد', time: '۱۸:۴۰' },
      ],
    },
  ],
};

function PersonnelPeerChatViewer({ chat, personnel }: { chat: PersonnelPeerChat; personnel: any[] }) {
  const memberNames = chat.members.map(id => personnel.find(p => p.id === id)?.name || id);
  return (
    <div className="flex flex-col" style={{ maxHeight: '70vh' }}>
      <div className="px-1 pb-3 border-b border-[var(--aw-border)] mb-3">
        <div className="text-[13px] mb-1" style={{ fontWeight: 600 }}>
          {chat.isGroup ? chat.title : memberNames.join(' و ')}
        </div>
        <div className="text-[11px] text-[var(--aw-text-muted)] flex items-center gap-1.5">
          <i className="fa-solid fa-eye" />
          فقط مشاهده — {chat.isGroup ? `${toFa(chat.members.length)} نفر` : 'گفتگوی دونفره'}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto aw-scroll space-y-2 pb-2">
        {chat.transcript.map((m, i) => {
          const sender = personnel.find(p => p.id === m.from);
          return (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0 bg-[var(--aw-primary)]" style={{ fontWeight: 700 }}>
                {sender?.name?.[0] || '؟'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[var(--aw-text-muted)] mb-0.5 flex items-center gap-1.5">
                  <span style={{ fontWeight: 600 }}>{sender?.name || m.from}</span>
                  <span>·</span>
                  <span>{m.time}</span>
                </div>
                <div className="text-[12px] rounded-[10px] p-2.5 inline-block border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--aw-border)] text-[11px] text-[var(--aw-text-muted)] text-center flex items-center justify-center gap-1.5">
        <i className="fa-solid fa-lock" />
        دسترسی ادمین فقط خواندنی است — امکان ارسال پیام وجود ندارد
      </div>
    </div>
  );
}


function ChatsScreen() {
  const { chatTab, setChatTab, agents, personnel, customers, company, openChat, openModal, chatGroups, removeChatGroup, updateChatGroup, showToast, agentTeam, startCall, groupChats, removeGroupChat } = useApp();
  const [search, setSearch] = useState('');
  const [hiddenBaseTabs, setHiddenBaseTabs] = useState<Record<string, string[]>>({});
  const teamScope = agentTeam || '_none';
  const hiddenForTeam = hiddenBaseTabs[teamScope] || [];
  const hideBaseTab = (id: string) => {
    setHiddenBaseTabs(prev => ({ ...prev, [teamScope]: [...(prev[teamScope] || []), id] }));
    if (chatTab === id) setChatTab('all');
    showToast('دسته‌بندی حذف شد');
  };

  const allBaseTabs: { id: string; label: string }[] = [
    { id: 'customers', label: 'تعاملات من' },
    { id: 'agents', label: 'عامل هوشمند' },
    { id: 'personnel', label: 'تعاملات پرسنل' },
    ...(agentTeam === 'secretary' ? [{ id: 'meetings', label: 'جلسات' }] : []),
  ];
  const baseTabs = allBaseTabs.filter(t => !hiddenForTeam.includes(t.id));

  const allTabs = [{ id: 'all', label: 'همه' }, ...baseTabs];

  const filteredAgents = agents
    .filter(a => !a.company || a.company === company)
    .filter(a => !search || a.name.includes(search) || a.role.includes(search));

  const filteredPersonnel = personnel.filter(p => !search || p.name.includes(search) || p.role.includes(search));
  const filteredCustomers = customers.filter(c => !search || c.name.includes(search) || c.contact.includes(search));

  const teamKey = (agentTeam as TeamKey | null) || null;
  const teamSamples = teamKey ? TEAM_SAMPLE_CHATS[teamKey] : null;
  const teamConfig = teamKey ? TEAM_CONFIGS[teamKey] : null;
  const filteredTeamSamples = teamSamples?.filter(s => !search || s.name.includes(search) || s.lastMsg.includes(search) || s.tag.includes(search)) || [];

  // Find current group if active tab is a custom group
  const activeGroup = chatGroups.find(g => g.id === chatTab);

  // Get members for a group
  const getGroupMembers = (group: ChatGroup) => {
    return group.members.map(m => {
      if (m.type === 'agent') {
        const a = agents.find(x => x.id === m.id);
        return a ? { ...m, name: a.name, sub: a.role, init: a.init, bg: a.bg } : null;
      }
      if (m.type === 'personnel') {
        const p = personnel.find(x => x.id === m.id);
        return p ? { ...m, name: p.name, sub: p.role, init: p.name[0], bg: 'bg-blue-500' } : null;
      }
      if (m.type === 'customer') {
        const c = customers.find(x => x.id === m.id);
        return c ? { ...m, name: c.name, sub: c.contact, init: c.name[0], bg: 'bg-emerald-500' } : null;
      }
      return null;
    }).filter(Boolean);
  };

  const handleDeleteGroup = (groupId: string) => {
    removeChatGroup(groupId);
    setChatTab('customers');
    showToast('گروه حذف شد');
  };

  return (
    <SearchHighlightContext.Provider value={search}>
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="px-4 pb-2.5 flex-shrink-0">
        <div className="flex gap-1 p-[3px] rounded-full overflow-x-auto aw-noscroll border" style={{ background: 'var(--aw-eu-nav-bg)', borderColor: 'var(--aw-eu-nav-border)', backdropFilter: 'blur(20px)' }}>
          {allTabs.map(t => {
            const isActive = chatTab === t.id;
            const isAll = t.id === 'all';
            const isBase = ['customers', 'agents', 'personnel', 'meetings'].includes(t.id);
            const isGroup = !isAll && !isBase;
            return (
              <div
                key={t.id}
                className={`flex-shrink-0 flex items-center rounded-full transition-all ${isActive ? '' : 'bg-transparent text-[var(--aw-text-secondary)]'}`}
                style={isActive ? { background: 'var(--aw-bg-card)', color: 'var(--aw-text-primary)', boxShadow: 'inset 0 0 0 1px var(--aw-border), 0 2px 6px rgba(0,0,0,0.10)' } : undefined}
              >
                <button
                  className="px-3.5 py-1.5 text-center border-none bg-transparent text-inherit text-[11px] cursor-pointer whitespace-nowrap"
                  style={{ fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}
                  onClick={() => setChatTab(t.id)}
                >
                  {isAll && <i className="fa-solid fa-layer-group ml-1 text-[10px]" />}
                  {t.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group header with delete option */}
      {activeGroup && (
        <div className="px-4 pb-2 flex-shrink-0 flex items-center justify-between">
          <span className="text-[12px] text-[var(--aw-text-muted)]">
            <i className="fa-solid fa-folder-open ml-1 text-[var(--aw-primary)]" />
            {toFa(activeGroup.members.length)} عضو
          </span>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <button
              className="bg-transparent border-none text-[11px] text-[var(--aw-primary)] cursor-pointer flex items-center gap-1 hover:opacity-80 transition-all"
              onClick={() => openModal('افزودن چت', <AddChatToCategoryContent group={activeGroup} />)}
            >
              <i className="fa-solid fa-user-plus text-[10px]" />
              افزودن چت
            </button>
            <button
              className="bg-transparent border-none text-[11px] text-[var(--aw-primary)] cursor-pointer flex items-center gap-1 hover:opacity-80 transition-all"
              onClick={() => openModal('تغییر نام دسته‌بندی', <RenameCategoryContent group={activeGroup} />)}
            >
              <i className="fa-solid fa-pen text-[10px]" />
              تغییر نام
            </button>
            <button
              className="bg-transparent border-none text-[11px] text-red-400 cursor-pointer flex items-center gap-1 hover:text-red-300 transition-all"
              onClick={() => handleDeleteGroup(activeGroup.id)}
            >
              <i className="fa-solid fa-trash text-[10px]" />
              حذف گروه
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 pb-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-[10px] px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
          <input
            className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
            placeholder="جستجوی گفتگو..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer text-sm" onClick={() => setSearch('')}>
              <i className="fa-solid fa-times" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 aw-scroll">
        {/* New Chat / Group / Meeting Button */}
        {chatTab === 'meetings' && agentTeam === 'secretary' ? (
          <button
            className="w-full flex items-center gap-3 p-3 mb-2 rounded-[14px] border border-dashed border-[var(--aw-border)] cursor-pointer transition-all bg-transparent hover:border-[var(--aw-primary)] group"
            onClick={() => openModal('برگزاری جلسه', <NewMeetingContent />)}
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-all" style={{ background: 'rgba(126,95,170,0.15)' }}>
              <i className="fa-solid fa-calendar-plus text-[var(--aw-primary)] text-sm" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[13px] text-[var(--aw-text-primary)] group-hover:text-[var(--aw-primary)] transition-all">برگزاری جلسه</div>
              <div className="text-[11px] text-[var(--aw-text-muted)]">برنامه‌ریزی جلسه حضوری یا آنلاین</div>
            </div>
            <i className="fa-solid fa-chevron-left text-[10px] text-[var(--aw-text-muted)] group-hover:text-[var(--aw-primary)] transition-all" />
          </button>
        ) : (
          <button
            className="w-full flex items-center gap-3 p-3 mb-2 rounded-[14px] border border-dashed border-[var(--aw-border)] cursor-pointer transition-all bg-transparent hover:border-[var(--aw-primary)] group"
            onClick={() => openModal('گفتگوی جدید', <NewChatContent />)}
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-all" style={{ background: 'rgba(126,95,170,0.15)' }}>
              <i className="fa-solid fa-plus text-[var(--aw-primary)] text-sm" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[13px] text-[var(--aw-text-primary)] group-hover:text-[var(--aw-primary)] transition-all">ایجاد گفتگوی جدید</div>
              <div className="text-[11px] text-[var(--aw-text-muted)]">چت یا گروه جدید بسازید</div>
            </div>
            <i className="fa-solid fa-chevron-left text-[10px] text-[var(--aw-text-muted)] group-hover:text-[var(--aw-primary)] transition-all" />
          </button>
        )}

        {/* Team-specific sample chats */}
        {teamSamples && teamConfig && (chatTab === 'customers' || chatTab === 'all') && filteredTeamSamples.length > 0 && (
          <div className="mb-3">
            <div className="text-[12px] text-[var(--aw-text-muted)] mb-2 px-1 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
              <i className={teamConfig.icon} style={{ color: 'var(--aw-primary)' }} />
              نمونه‌های تیم {teamConfig.name}
              <span className="text-[10px] text-[var(--aw-text-muted)]">({toFa(filteredTeamSamples.length)})</span>
            </div>
            <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-1">
              {filteredTeamSamples.map(s => (
                <SwipeToCall key={s.id} onCall={() => startCall(s.name, s.tag, s.bg, s.init, '')}>
                <div
                  className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer border border-transparent hover:bg-[var(--aw-bg-card-hover)] transition-all"
                  onClick={() => openChat(s.id, 'contact', { name: s.name, init: s.init, bg: s.bg, sub: s.tag })}>
                  <LetterAvatar name={s.name} init={s.init} size={48} radius={14} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[13px]" style={{ fontWeight: 600 }}><Hi text={s.name} /></span>
                      <span className="text-[11px] text-[var(--aw-text-muted)]">{s.time}</span>
                    </div>
                    <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(126,95,170,0.15)', color: 'var(--aw-primary)', fontWeight: 700 }}>
                        <Hi text={s.tag} />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] text-[var(--aw-text-secondary)] truncate flex-1"><Hi text={s.lastMsg} /></div>
                      {s.unread > 0 && (
                        <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0 mr-1" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>
                          {toFa(s.unread)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                </SwipeToCall>
              ))}
            </div>
            {filteredCustomers.length > 0 && (
              <div className="text-[11px] text-[var(--aw-text-muted)] mt-2 mb-1 px-1" style={{ fontWeight: 700 }}>
                <i className="fa-solid fa-users ml-1" /> سایر تعاملات
              </div>
            )}
          </div>
        )}

        <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-1">
        {(chatTab === 'agents' || chatTab === 'all') && filteredAgents.map(a => (
          <AgentChatItem key={'a_' + a.id} agent={a} />
        ))}
        {(chatTab === 'personnel' || chatTab === 'all') && (() => {
          const visible = (PERSONNEL_PEER_CHATS_BY_TEAM[(agentTeam as TeamKey) || 'secretary'] || []).filter(c => {
            if (!search) return true;
            const names = c.members.map(id => personnel.find(p => p.id === id)?.name || '').join(' ');
            return c.lastMsg.includes(search) || names.includes(search) || (c.title || '').includes(search);
          });
          return visible.map(c => {
            const memberNames = c.members.map(id => personnel.find(p => p.id === id)?.name || id);
            const title = c.isGroup ? c.title : memberNames.join(' و ');
            return (
              <div key={'pp_' + c.id}
                className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer mb-1 border border-transparent hover:bg-[var(--aw-bg-card-hover)] transition-all"
                onClick={() => {
                  let msgId = 9000 + c.id.charCodeAt(0);
                  const initMsgs = c.transcript.map((m, i) => ({
                    id: msgId++,
                    text: (personnel.find(p => p.id === m.from)?.name || m.from) + ': ' + m.text,
                    sent: i % 2 === 0,
                    time: m.time,
                  }));
                  openChat('peer_' + c.id, 'contact', {
                    name: title || '',
                    init: c.isGroup ? 'گ' : (memberNames[0]?.[0] || 'پ'),
                    bg: c.bg,
                    sub: c.isGroup ? `گروه · ${toFa(c.members.length)} نفر` : 'گفتگوی پرسنل',
                  }, initMsgs);
                }}>
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 ${c.bg}`} style={{ fontWeight: 700, fontSize: 16 }}>
                  <i className={c.isGroup ? 'fa-solid fa-users' : 'fa-solid fa-comments'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[13px] truncate" style={{ fontWeight: 600 }}><Hi text={title || ''} /></span>
                    <span className="text-[11px] text-[var(--aw-text-muted)] flex-shrink-0">{c.time}</span>
                  </div>
                  <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1 mb-0.5">
                    <span className="px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ background: 'rgba(126,95,170,0.15)', color: 'var(--aw-primary)', fontWeight: 700 }}>
                      <i className="fa-solid fa-eye text-[8px]" /> فقط مشاهده
                    </span>
                    <span>·</span>
                    <span>{c.isGroup ? `${toFa(c.members.length)} نفر` : 'دونفره'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] text-[var(--aw-text-secondary)] truncate flex-1"><Hi text={c.lastMsg} /></div>
                    {c.unread > 0 && (
                      <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[9px] flex-shrink-0 mr-1" style={{ background: 'var(--aw-danger)', fontWeight: 700 }}>
                        {toFa(c.unread)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          });
        })()}
        {(chatTab === 'customers' || chatTab === 'all') && filteredCustomers.map(c => (
          <CustomerChatItem key={'c_' + c.id} customer={c} />
        ))}
        {/* Global group chats (team-scoped) */}
        {(() => {
          const visibleGroupChats = groupChats.filter(g => (g.team || null) === (agentTeam || null) && (!search || g.name.includes(search)));
          if (chatTab !== 'all') return null;
          if (visibleGroupChats.length === 0) return null;
          return (
            <div className="mb-3">
              <div className="text-[12px] text-[var(--aw-text-muted)] mb-2 px-1 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
                <i className="fa-solid fa-comments" style={{ color: 'var(--aw-primary)' }} />
                چت‌های گروهی
                <span className="text-[10px] text-[var(--aw-text-muted)]">({toFa(visibleGroupChats.length)})</span>
              </div>
              {visibleGroupChats.map(gc => (
                <div key={gc.id}
                  className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer mb-1 border border-transparent hover:bg-[var(--aw-bg-card-hover)] transition-all"
                  onClick={() => openChat(gc.id, 'group')}>
                  <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 overflow-hidden ${gc.bg}`} style={{ fontWeight: 700, fontSize: 16 }}>
                    {gc.image ? <img src={gc.image} alt={gc.name} className="w-full h-full object-cover" /> : <i className="fa-solid fa-users" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px]" style={{ fontWeight: 600 }}><Hi text={gc.name} /></div>
                    <div className="text-[11px] text-[var(--aw-text-muted)]">{toFa(gc.memberIds.length)} عضو</div>
                  </div>
                  <button
                    className="w-8 h-8 rounded-[10px] border-none bg-transparent text-red-400 cursor-pointer flex items-center justify-center text-[11px] flex-shrink-0 hover:text-red-300"
                    onClick={(e) => { e.stopPropagation(); removeGroupChat(gc.id); showToast('چت گروهی حذف شد'); }}
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
        {/* Custom group content */}
        {activeGroup && (() => {
          const members = getGroupMembers(activeGroup);
          const filteredMembers = members.filter((m: any) => !search || m.name.includes(search) || m.sub.includes(search));
          const removeMember = (memberId: string, type: string) => {
            updateChatGroup(activeGroup.id, { members: activeGroup.members.filter(mm => !(mm.id === memberId && mm.type === type)) });
            showToast('چت از دسته‌بندی حذف شد');
          };
          return filteredMembers.length > 0 ? filteredMembers.map((m: any) => {
            let inner: React.ReactNode = null;
            if (m.type === 'agent') {
              const a = agents.find(x => x.id === m.id);
              if (a) inner = <AgentChatItem agent={a} />;
            } else if (m.type === 'personnel') {
              const p = personnel.find(x => x.id === m.id);
              if (p) inner = <PersonnelChatItem person={p} />;
            } else if (m.type === 'customer') {
              const c = customers.find(x => x.id === m.id);
              if (c) inner = <CustomerChatItem customer={c} />;
            }
            if (!inner) return null;
            return (
              <div key={'grp_' + m.type + '_' + m.id} className="relative group">
                {inner}
                <button
                  title="حذف از دسته‌بندی"
                  className="absolute top-2 left-2 w-7 h-7 rounded-full border-none bg-[var(--aw-bg-card)] text-red-400 cursor-pointer flex items-center justify-center text-[11px] opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300"
                  onClick={(e) => { e.stopPropagation(); removeMember(m.id, m.type); }}
                >
                  <i className="fa-solid fa-times" />
                </button>
              </div>
            );
          }) : (
            <EmptyState icon="fa-solid fa-folder-open" text="عضوی یافت نشد" />
          );
        })()}
        </div>
        {chatTab === 'meetings' && agentTeam === 'secretary' && (() => {
          const filtered = SECRETARY_MEETINGS.filter(m =>
            !search || m.title.includes(search) || m.location.includes(search) || (m.minutes || []).some(x => x.includes(search))
          );
          const inperson = filtered.filter(m => m.kind === 'inperson');
          const online = filtered.filter(m => m.kind === 'online');
          if (filtered.length === 0) {
            return <EmptyState icon="fa-solid fa-handshake" text="جلسه‌ای یافت نشد" />;
          }
          const renderSection = (title: string, icon: string, items: SecretaryMeeting[]) => items.length === 0 ? null : (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-1 mb-2 text-[11px] text-[var(--aw-text-muted)]" style={{ fontWeight: 700 }}>
                <i className={icon} /> <span>{title}</span>
                <span className="ml-auto px-1.5 py-0.5 rounded-md bg-[var(--aw-bg-card)]">{toFa(items.length)}</span>
              </div>
              {items.map(m => {
                const st = MEETING_STATUS[m.status];
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all mb-1 border border-transparent hover:bg-[var(--aw-bg-card-hover)] active:scale-[0.98]"
                    style={{ background: 'var(--aw-bg-card)' }}
                    onClick={() => openModal('جلسه', <MeetingViewer meeting={m} personnel={personnel} />)}
                  >
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 ${m.kind === 'inperson' ? 'bg-indigo-500' : 'bg-cyan-500'}`} style={{ fontWeight: 700 }}>
                      <i className={m.kind === 'inperson' ? 'fa-solid fa-building-user' : 'fa-solid fa-video'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm truncate" style={{ fontWeight: 600 }}><Hi text={m.title} /></span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap" style={{ background: st.bg, color: st.text, fontWeight: 700 }}>
                          <i className={`${st.icon} ml-1`} />{st.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-2 mb-0.5">
                        <span><i className="fa-solid fa-calendar ml-1" />{m.date}</span>
                        <span><i className="fa-solid fa-clock ml-1" />{m.time}</span>
                        <span><i className="fa-solid fa-hourglass-half ml-1" />{m.duration}</span>
                      </div>
                      <div className="text-[12px] text-[var(--aw-text-secondary)] truncate flex items-center gap-1">
                        <i className={`${m.kind === 'inperson' ? 'fa-solid fa-location-dot' : 'fa-solid fa-link'} text-[10px] opacity-70`} />
                        <Hi text={m.location} />
                        <span className="mx-1 opacity-50">•</span>
                        <i className="fa-solid fa-users text-[10px] opacity-70" />
                        <span>{toFa(m.attendees.length)} نفر</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
          return (
            <div>
              {renderSection('جلسات حضوری', 'fa-solid fa-building-user', inperson)}
              {renderSection('جلسات آنلاین', 'fa-solid fa-video', online)}
              <div className="mt-2 p-3 rounded-[12px] text-[11px] text-[var(--aw-text-secondary)] flex items-start gap-2" style={{ background: 'var(--aw-bg-card)', border: '1px dashed var(--aw-border)' }}>
                <i className="fa-solid fa-microphone-lines mt-0.5" style={{ color: 'var(--aw-primary)' }} />
                <span>منشی هوشمند در تمامی جلسات حضور دارد، گفتگوها را ثبت کرده و صورتجلسه را به صورت خودکار تهیه می‌کند.</span>
              </div>
            </div>
          );
        })()}
        {chatTab === 'agents' && filteredAgents.length === 0 && (
          <EmptyState icon="fa-solid fa-robot" text="عاملی یافت نشد" />
        )}
        {chatTab === 'customers' && filteredCustomers.length === 0 && filteredTeamSamples.length === 0 && (
          <EmptyState icon="fa-solid fa-users" text="مشتری‌ای یافت نشد" />
        )}
        {chatTab === 'personnel' && (PERSONNEL_PEER_CHATS_BY_TEAM[(agentTeam as TeamKey) || 'secretary'] || []).filter(c => {
          if (!search) return true;
          const names = c.members.map(id => personnel.find(p => p.id === id)?.name || '').join(' ');
          return c.lastMsg.includes(search) || names.includes(search) || (c.title || '').includes(search);
        }).length === 0 && (
          <EmptyState icon="fa-solid fa-comments" text="گفتگوی پرسنلی یافت نشد" />
        )}
        {chatTab === 'all' && filteredAgents.length === 0 && filteredPersonnel.length === 0 && filteredCustomers.length === 0 && filteredTeamSamples.length === 0 && (
          <EmptyState icon="fa-solid fa-layer-group" text="چتی یافت نشد" />
        )}
      </div>
    </div>
    </SearchHighlightContext.Provider>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-12 text-[var(--aw-text-muted)]">
      <i className={`${icon} text-[56px] opacity-25 block mb-5`} />
      <p className="text-[13px]">{text}</p>
    </div>
  );
}

function AgentChatItem({ agent: a }: { agent: Agent }) {
  const { openChat, openModal, startCall } = useApp();

  if (a.locked) {
    return (
      <SwipeToCall onCall={() => startCall(a.name, a.role, a.bg, a.init, a.voip || '')}>
      <div
        className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all opacity-60"
        onClick={() => openModal('فعال‌سازی ' + a.name, <SubscribeContent agentId={a.id} />)}
      >
        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 relative ${a.bg}`} style={{ fontWeight: 700, fontSize: 18 }}>
          {a.init}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-sm" style={{ fontWeight: 600 }}><Hi text={a.name} /></span>
            <span className="text-[10px] text-black px-2 py-0.5 rounded-md" style={{ background: 'var(--aw-accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              <i className="fa-solid fa-lock" /> خرید اشتراک
            </span>
          </div>
          <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1">
            <i className="fa-solid fa-robot" /> <Hi text={a.role} />
          </div>
          <div className="text-[12px] text-[var(--aw-text-secondary)] truncate max-w-[200px]">{a.lastMsg}</div>
        </div>
      </div>
      </SwipeToCall>
    );
  }

  return (
    <SwipeToCall onCall={() => startCall(a.name, a.role, a.bg, a.init, a.voip || '')}>
    <div
      className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all border border-transparent hover:bg-[var(--aw-bg-card-hover)] active:scale-[0.98]"
      onClick={() => openChat(a.id, 'agent')}
    >
      <div className="relative flex-shrink-0">
        <AgentCircle agent={a} size={48} radius={14} fontSize={18} />
        <span className="absolute bottom-0.5 left-0.5 w-[13px] h-[13px] rounded-full border-2 border-[var(--aw-bg-app)]" style={{ background: 'var(--aw-online)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-sm" style={{ fontWeight: 600 }}><Hi text={a.name} /></span>
          <span className="text-[11px] text-[var(--aw-text-muted)]">{a.lastTime}</span>
        </div>
        <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1">
          <i className="fa-solid fa-robot" /> <Hi text={a.role} /> | داخلی: {a.voip}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-[var(--aw-text-secondary)] truncate max-w-[200px]">{a.lastMsg}</span>
          {a.unread > 0 && (
            <span className="min-w-[20px] h-5 rounded-[10px] flex items-center justify-center text-white text-[11px] px-1.5" style={{ background: 'var(--aw-primary)', fontWeight: 700 }}>
              {toFa(a.unread)}
            </span>
          )}
        </div>
      </div>
    </div>
    </SwipeToCall>
  );
}

function PersonnelChatItem({ person: p }: { person: any }) {
  const { openChat, startCall } = useApp();
  return (
    <SwipeToCall onCall={() => startCall(p.name, p.role, p.bg, p.init, p.voip || '')}>
    <div
      className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all border border-transparent hover:bg-[var(--aw-bg-card-hover)] active:scale-[0.98]"
      onClick={() => openChat(p.id, 'personnel')}
    >
      <div className="relative flex-shrink-0">
        <LetterAvatar name={p.name} init={p.init} size={48} radius={14} />
        <span className="absolute bottom-0.5 left-0.5 w-[13px] h-[13px] rounded-full border-2 border-[var(--aw-bg-app)]" style={{ background: p.status === 'online' ? 'var(--aw-online)' : 'var(--aw-offline)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-sm" style={{ fontWeight: 600 }}><Hi text={p.name} /></span>
          <span className="text-[11px] text-[var(--aw-text-muted)]">{p.lastTime}</span>
        </div>
        <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1">
          <i className="fa-solid fa-user-tie" /> <Hi text={p.role} /> | داخلی: {p.voip} | {p.status === 'online' ? 'آنلاین' : 'آفلاین'}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-[var(--aw-text-secondary)] truncate max-w-[200px]">{p.lastMsg}</span>
          {p.unread > 0 && (
            <span className="min-w-[20px] h-5 rounded-[10px] flex items-center justify-center text-white text-[11px] px-1.5" style={{ background: 'var(--aw-primary)', fontWeight: 700 }}>
              {toFa(p.unread)}
            </span>
          )}
        </div>
      </div>
    </div>
    </SwipeToCall>
  );
}

function CustomerChatItem({ customer: c }: { customer: Customer }) {
  const { openChat, startCall } = useApp();
  const statusColor = c.status === 'active' ? 'var(--aw-online)' : c.status === 'lead' ? '#f59e0b' : 'var(--aw-offline)';
  return (
    <SwipeToCall onCall={() => startCall(c.name, 'مشتری', c.bg, c.init, '')}>
    <div
      className="flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all border border-transparent hover:bg-[var(--aw-bg-card-hover)] active:scale-[0.98]"
      onClick={() => openChat(c.id, 'customer')}
    >
      <div className="relative flex-shrink-0">
        <LetterAvatar name={c.name} init={c.init} size={48} radius={14} />
        <span className="absolute bottom-0.5 left-0.5 w-[13px] h-[13px] rounded-full border-2 border-[var(--aw-bg-app)]" style={{ background: statusColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-sm" style={{ fontWeight: 600 }}><Hi text={c.name} /></span>
          <span className="text-[11px] text-[var(--aw-text-muted)]">{c.lastTime}</span>
        </div>
        <div className="text-[10px] text-[var(--aw-text-muted)] flex items-center gap-1">
          <i className="fa-solid fa-building" /> <Hi text={c.contact} /> | {STATUS_LABELS[c.status]}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-[var(--aw-text-secondary)] truncate max-w-[200px]">{c.lastMsg}</span>
          {c.unread > 0 && (
            <span className="min-w-[20px] h-5 rounded-[10px] flex items-center justify-center text-white text-[11px] px-1.5" style={{ background: 'var(--aw-primary)', fontWeight: 700 }}>
              {toFa(c.unread)}
            </span>
          )}
        </div>
      </div>
    </div>
    </SwipeToCall>
  );
}

// ========================
// DASHBOARD
// ========================
function DashboardScreen() {
  const { agents, customers, company, personnel, setAdminScreen, setChatTab, openChat, openModal, setFinTab, setCrmTab } = useApp();
  const companyAgents = agents.filter(a => !a.locked && (!a.company || a.company === company));
  const totalDone = companyAgents.reduce((s, a) => s + a.done, 0);
  const totalPending = companyAgents.reduce((s, a) => s + a.pending, 0);
  const onlinePersonnel = personnel.filter(p => p.status === 'online').length;

  // Agent performance chart data
  const agentChartData = companyAgents.map(a => ({
    name: a.name.split(' ')[0],
    done: a.done,
    pending: a.pending,
  }));

  return (
    <motion.div className="flex-1 overflow-y-auto p-4 pb-4 aw-scroll" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4" variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={fadeInUp}><StatCard icon="fa-solid fa-robot" color="var(--aw-primary)" bg="rgba(46,134,255,0.15)" value={toFa(companyAgents.length)} label="عامل فعال" onClick={() => { setAdminScreen('chatsScreen'); setChatTab('agents'); }} /></motion.div>
        <motion.div variants={fadeInUp}><StatCard icon="fa-solid fa-check-circle" color="var(--aw-secondary)" bg="rgba(16,185,129,0.15)" value={toFa(totalDone)} label="کار انجام شده" onClick={() => setAdminScreen('tasksScreen')} /></motion.div>
        <motion.div variants={fadeInUp}><StatCard icon="fa-solid fa-clock" color="var(--aw-accent)" bg="rgba(245,158,11,0.15)" value={toFa(totalPending)} label="در انتظار" onClick={() => setAdminScreen('tasksScreen')} /></motion.div>
        <motion.div variants={fadeInUp}><StatCard icon="fa-solid fa-users" color="var(--aw-danger)" bg="rgba(239,68,68,0.15)" value={toFa(customers.length)} label="مشتریان" onClick={() => { setAdminScreen('crmScreen'); setCrmTab('customers'); }} /></motion.div>
      </motion.div>

      {/* Quick stats */}
      <motion.div className="rounded-[14px] p-4 mb-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }} variants={fadeInUp} initial="initial" animate="animate">
        <div className="flex justify-around text-center">
          <div className="cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded-lg" onClick={() => { setAdminScreen('chatsScreen'); setChatTab('personnel'); }}>
            <div className="text-lg text-[var(--aw-secondary)]" style={{ fontWeight: 800 }}>{toFa(onlinePersonnel)}</div>
            <div className="text-[10px] text-[var(--aw-text-muted)]">پرسنل آنلاین</div>
          </div>
          <div className="w-px" style={{ background: 'var(--aw-border)' }} />
          <div className="cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded-lg" onClick={() => { setAdminScreen('chatsScreen'); setChatTab('personnel'); }}>
            <div className="text-lg text-[var(--aw-primary)]" style={{ fontWeight: 800 }}>{toFa(personnel.length)}</div>
            <div className="text-[10px] text-[var(--aw-text-muted)]">کل پرسنل</div>
          </div>
          <div className="w-px" style={{ background: 'var(--aw-border)' }} />
          <div className="cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded-lg" onClick={() => openModal('شرکت‌ها', <CompanyListContent />)}>
            <div className="text-lg text-[var(--aw-accent)]" style={{ fontWeight: 800 }}>{toFa(Object.keys(COMPANIES).length)}</div>
            <div className="text-[10px] text-[var(--aw-text-muted)]">شرکت‌ها</div>
          </div>
        </div>
      </motion.div>

      {/* Agent Performance Chart */}
      <DashSection title="عملکرد عامل‌ها" icon="fa-solid fa-chart-line" iconColor="var(--aw-primary)" onTitleClick={() => setAdminScreen('reportsScreen')} actionLabel="گزارش کامل">
        <div className="w-full h-[200px] mb-3" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentChartData} barGap={4} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--aw-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Bar key="bar-done-dash" dataKey="done" name="انجام شده" fill="#00E676" radius={[6, 6, 0, 0]} barSize={18} />
              <Bar key="bar-pending-dash" dataKey="pending" name="معلق" fill="#22A6F0" radius={[6, 6, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {companyAgents.map(a => (
          <div
            key={a.id}
            className="flex items-center gap-2.5 py-2 border-b border-[var(--aw-border-light)] last:border-none cursor-pointer hover:bg-[var(--aw-bg-card-hover)] rounded-lg transition-all px-1 -mx-1"
            onClick={() => openChat(a.id, 'agent')}
          >
            <AgentCircle agent={a} size={32} radius={8} fontSize={13} />
            <div className="flex-1">
              <div className="text-[12px]" style={{ fontWeight: 600 }}>{a.name}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">{a.role}</div>
            </div>
            <div className="text-left flex items-center gap-3">
              <span className="text-[11px]"><span className="text-[var(--aw-secondary)]" style={{ fontWeight: 700 }}>{toFa(a.done)}</span> <span className="text-[var(--aw-text-muted)]">انجام</span></span>
              <span className="text-[11px]"><span className="text-[var(--aw-accent)]" style={{ fontWeight: 700 }}>{toFa(a.pending)}</span> <span className="text-[var(--aw-text-muted)]">معلق</span></span>
            </div>
            <i className="fa-solid fa-chevron-left text-[10px] text-[var(--aw-text-muted)]" />
          </div>
        ))}
      </DashSection>

      {/* Revenue Trend Chart */}
      <DashSection title="روند درآمد ماهانه" icon="fa-solid fa-chart-area" iconColor="var(--aw-secondary)" onTitleClick={() => { setAdminScreen('financeScreen'); setFinTab('overview'); }} actionLabel="ماژول مالی">
        <div className="w-full h-[180px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_REVENUE_DATA.slice(-6)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="درآمد (م)" stroke="#00E676" fill="url(#incomeGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashSection>

      <DashSection title="اعلان‌های اخیر" icon="fa-solid fa-bell" iconColor="var(--aw-accent)" onTitleClick={() => openModal('اعلان‌ها', <NotificationsContent />)} actionLabel="همه اعلان‌ها">
        {NOTIFICATIONS.slice(0, 3).map(n => (
          <NotifItem key={n.id} notif={n} />
        ))}
      </DashSection>
    </motion.div>
  );
}

function CompanyListContent() {
  const { setCompany, closeModal, showToast } = useApp();
  return (
    <div>
      {Object.entries(COMPANIES).map(([key, comp]) => (
        <div
          key={key}
          className="flex items-center gap-3 p-3.5 rounded-xl mb-1.5 cursor-pointer border border-[var(--aw-border)] hover:border-[var(--aw-primary)] transition-all"
          style={{ background: 'var(--aw-bg-card)' }}
          onClick={() => { setCompany(key); closeModal(); showToast('شرکت ' + comp.name + ' انتخاب شد'); }}
        >
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[var(--aw-primary)]" style={{ background: 'var(--aw-primary-bg)' }}>
            <i className="fa-solid fa-building text-base" />
          </div>
          <div className="flex-1">
            <div className="text-[13px]" style={{ fontWeight: 600 }}>{comp.name}</div>
            <div className="text-[11px] text-[var(--aw-text-muted)]">{comp.type || 'شرکت'}</div>
          </div>
          <i className="fa-solid fa-chevron-left text-[11px] text-[var(--aw-text-muted)]" />
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, color, bg, value, label, onClick }: { icon: string; color: string; bg: string; value: string; label: string; onClick?: () => void }) {
  return (
    <div
      className={`rounded-[14px] p-4 border border-[var(--aw-border)] transition-all ${onClick ? 'cursor-pointer hover:border-[var(--aw-primary)] hover:scale-[1.02] active:scale-[0.98]' : ''}`}
      style={{ background: 'var(--aw-bg-card)' }}
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-base mb-2.5" style={{ background: bg, color }}><i className={icon} /></div>
      <div className="text-[24px] mb-0.5" style={{ fontWeight: 800 }}>{value}</div>
      <div className="text-[11px] text-[var(--aw-text-muted)]">{label}</div>
      {onClick && (
        <div className="mt-2 text-[10px] text-[var(--aw-primary)] flex items-center gap-1" style={{ fontWeight: 600 }}>
          <span>مشاهده</span>
          <i className="fa-solid fa-arrow-left text-[8px]" />
        </div>
      )}
    </div>
  );
}

function DashSection({ title, icon, iconColor, children, onTitleClick, actionLabel }: { title: string; icon: string; iconColor: string; children: React.ReactNode; onTitleClick?: () => void; actionLabel?: string }) {
  return (
    <div className="rounded-[14px] p-4 mb-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
      <div className="text-sm mb-3 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
        <i className={icon} style={{ color: iconColor }} /> {title}
        {onTitleClick && (
          <button
            className="mr-auto text-[11px] text-[var(--aw-primary)] bg-transparent border-none cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ fontWeight: 600 }}
            onClick={onTitleClick}
          >
            {actionLabel || 'مشاهده همه'}
            <i className="fa-solid fa-arrow-left text-[9px]" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ========================
// CRM SCREEN
// ========================
function CrmScreen() {
  const { crmTab, setCrmTab, customers, deals, openModal } = useApp();
  const [search, setSearch] = useState('');

  const tabs = [
    { id: 'customers' as const, label: 'مشتریان' },
    { id: 'leads' as const, label: 'سرنخ‌ها' },
    { id: 'deals' as const, label: 'معاملات' },
  ];

  const filtered = customers.filter(c => !search || c.name.includes(search) || c.contact.includes(search));
  const filteredDeals = deals.filter(d => !search || d.title.includes(search) || d.customer.includes(search));

  const addLabel = { customers: 'مشتری', leads: 'سرنخ', deals: 'معامله' }[crmTab] || '';

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2.5 flex-shrink-0">
        <div className="flex gap-1 p-1 rounded-[10px]" style={{ background: 'var(--aw-bg-card)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`flex-1 py-2 text-center border-none rounded-lg text-[12px] cursor-pointer transition-all ${
                crmTab === t.id ? 'text-white' : 'bg-transparent text-[var(--aw-text-muted)]'
              }`}
              style={crmTab === t.id ? { background: 'var(--aw-primary)', fontWeight: 600 } : { fontWeight: 600 }}
              onClick={() => setCrmTab(t.id)}
            >
              {t.label}
              {t.id === 'leads' && <span className="mr-1 text-[10px]">({toFa(customers.filter(c => c.status === 'lead').length)})</span>}
              {t.id === 'deals' && <span className="mr-1 text-[10px]">({toFa(deals.length)})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-[10px] px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
          <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]" placeholder="جستجو در CRM..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer text-sm" onClick={() => setSearch('')}>
              <i className="fa-solid fa-times" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 aw-scroll relative">
        <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-2.5">
        {crmTab === 'customers' && filtered.filter(c => c.status === 'active' || c.status === 'inactive').map(c => (
          <CrmCard key={c.id} customer={c} />
        ))}
        {crmTab === 'leads' && filtered.filter(c => c.status === 'lead').map(c => (
          <CrmCard key={c.id} customer={c} />
        ))}
        {crmTab === 'deals' && filteredDeals.map(d => (
          <DealCard key={d.id} deal={d} />
        ))}
        </div>
        {crmTab === 'customers' && filtered.filter(c => c.status === 'active' || c.status === 'inactive').length === 0 && (
          <EmptyState icon="fa-solid fa-users" text="مشتری‌ای یافت نشد" />
        )}
        {crmTab === 'leads' && filtered.filter(c => c.status === 'lead').length === 0 && (
          <EmptyState icon="fa-solid fa-user-plus" text="سرنخی یافت نشد" />
        )}
        {crmTab === 'deals' && filteredDeals.length === 0 && (
          <EmptyState icon="fa-solid fa-handshake" text="معامله‌ای یافت نشد" />
        )}
      </div>

      <button
        className="absolute bottom-20 left-5 w-[52px] h-[52px] rounded-full border-none text-white text-xl cursor-pointer z-40 flex items-center justify-center"
        style={{ background: 'var(--aw-primary)', boxShadow: 'var(--aw-shadow)' }}
        onClick={() => openModal('افزودن ' + addLabel, <CrmAddContent />)}
      >
        <i className="fa-solid fa-plus" />
      </button>
    </div>
  );
}

function CrmCard({ customer: c }: { customer: Customer }) {
  const { openModal } = useApp();
  const statusStyle = c.status === 'active'
    ? { background: 'rgba(16,185,129,0.2)', color: '#10b981' }
    : c.status === 'lead'
    ? { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }
    : { background: 'rgba(100,116,139,0.2)', color: '#64748b' };

  return (
    <div
      className="rounded-[14px] p-3.5 mb-2 border border-[var(--aw-border)] cursor-pointer transition-all hover:border-[var(--aw-primary)]"
      style={{ background: 'var(--aw-bg-card)' }}
      onClick={() => openModal(c.name, <CustomerDetailContent customerId={c.id} />)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm" style={{ fontWeight: 600 }}>{c.name}</span>
        <span className="px-2.5 py-0.5 rounded-[20px] text-[10px]" style={{ ...statusStyle, fontWeight: 600 }}>{STATUS_LABELS[c.status]}</span>
      </div>
      <div className="text-[12px] text-[var(--aw-text-secondary)] space-y-1">
        <div className="flex items-center gap-1.5"><i className="fa-solid fa-user text-[var(--aw-text-muted)]" /> {c.contact}</div>
        <div className="flex items-center gap-1.5"><i className="fa-solid fa-phone text-[var(--aw-text-muted)]" /> {c.phone}</div>
        {c.value !== '۰' && <div className="flex items-center gap-1.5"><i className="fa-solid fa-coins text-[var(--aw-accent)]" /> ارزش: {c.value} ریال</div>}
      </div>
    </div>
  );
}

function DealCard({ deal: d }: { deal: Deal }) {
  const { openModal } = useApp();
  const stageStyle: Record<string, any> = {
    negotiation: { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
    proposal: { background: 'rgba(46,134,255,0.2)', color: '#2E86FF' },
    closed: { background: 'rgba(16,185,129,0.2)', color: '#10b981' },
  };

  return (
    <div
      className="rounded-[14px] p-3.5 mb-2 border border-[var(--aw-border)] cursor-pointer transition-all hover:border-[var(--aw-primary)]"
      style={{ background: 'var(--aw-bg-card)' }}
      onClick={() => openModal(d.title, <DealDetailContent dealId={d.id} />)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm" style={{ fontWeight: 600 }}>{d.title}</span>
        <span className="px-2.5 py-0.5 rounded-[20px] text-[10px]" style={{ ...stageStyle[d.stage], fontWeight: 600 }}>{STAGE_LABELS[d.stage]}</span>
      </div>
      <div className="text-[12px] text-[var(--aw-text-secondary)] space-y-1">
        <div className="flex items-center gap-1.5"><i className="fa-solid fa-building text-[var(--aw-text-muted)]" /> {d.customer}</div>
        <div className="flex items-center gap-1.5"><i className="fa-solid fa-coins text-[var(--aw-accent)]" /> {d.value} ریال</div>
        <div className="flex items-center gap-1.5"><i className="fa-solid fa-percentage text-[var(--aw-text-muted)]" /> احتمال: {d.probability}</div>
      </div>
    </div>
  );
}

// ========================
// FINANCE SCREEN
// ========================
function FinanceScreen() {
  const { finTab, setFinTab, financeData, openModal } = useApp();

  const tabs = [
    { id: 'overview' as const, label: 'نمای کلی' },
    { id: 'income' as const, label: 'درآمدها' },
    { id: 'expense' as const, label: 'هزینه‌ها' },
    { id: 'invoices' as const, label: 'فاکتورها' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1.5 px-4 py-2.5 flex-wrap flex-shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`py-2 px-3.5 rounded-[20px] border text-[11px] cursor-pointer transition-all ${
              finTab === t.id ? 'text-white border-[var(--aw-primary)]' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
            }`}
            style={finTab === t.id ? { background: 'var(--aw-primary)', fontWeight: 600 } : { fontWeight: 600 }}
            onClick={() => setFinTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 aw-scroll">
        {finTab === 'overview' && <FinOverview />}
        {finTab === 'income' && <FinTable items={financeData.income} colorClass="var(--aw-secondary)" type="income" />}
        {finTab === 'expense' && <FinTable items={financeData.expense} colorClass="var(--aw-danger)" type="expense" />}
        {finTab === 'invoices' && <InvoicesTab />}
      </div>
    </div>
  );
}

function FinOverview() {
  const { financeData, openModal } = useApp();
  const allItems = [...financeData.income, ...financeData.expense];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4" variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={fadeInUp}><FinSumCard value="۱,۰۰۰,۰۰۰,۰۰۰" label="کل درآمد (ریال)" color="var(--aw-secondary)" /></motion.div>
        <motion.div variants={fadeInUp}><FinSumCard value="۳۵۰,۰۰۰,۰۰۰" label="کل هزینه (ریال)" color="var(--aw-danger)" /></motion.div>
        <motion.div variants={fadeInUp}><FinSumCard value="۶۵۰,۰۰۰,۰۰۰" label="سود خالص (ریال)" color="var(--aw-primary)" /></motion.div>
        <motion.div variants={fadeInUp}><FinSumCard value={toFa(financeData.income.filter(f => f.status === 'pending').length + financeData.expense.filter(f => f.status === 'pending').length)} label="فاکتور معوق" color="var(--aw-accent)" /></motion.div>
      </motion.div>

      {/* Income vs Expense Chart */}
      <DashSection title="مقایسه درآمد و هزینه" icon="fa-solid fa-chart-line" iconColor="var(--aw-secondary)">
        <div className="w-full h-[220px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="finIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E676" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="finExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--aw-border-light)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="درآمد (م)" stroke="#00E676" fill="url(#finIncomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="هزینه (م)" stroke="#ef4444" fill="url(#finExpenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashSection>

      <DashSection title="آخرین تراکنش‌ها" icon="fa-solid fa-exchange-alt" iconColor="var(--aw-primary)">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-right p-2 text-[11px] text-[var(--aw-text-muted)] border-b border-[var(--aw-border)]" style={{ fontWeight: 600 }}>شرح</th>
                <th className="text-right p-2 text-[11px] text-[var(--aw-text-muted)] border-b border-[var(--aw-border)]" style={{ fontWeight: 600 }}>مبلغ</th>
                <th className="text-right p-2 text-[11px] text-[var(--aw-text-muted)] border-b border-[var(--aw-border)]" style={{ fontWeight: 600 }}>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {allItems.slice(0, 5).map(f => (
                <tr key={f.id} className="hover:bg-[var(--aw-bg-card-hover)] cursor-pointer" onClick={() => openModal('جزئیات تراکنش', <FinDetailContent itemId={f.id} />)}>
                  <td className="p-2 text-[12px] border-b border-[var(--aw-border-light)]">{f.desc}</td>
                  <td className="p-2 text-[12px] border-b border-[var(--aw-border-light)]" style={{ fontWeight: 600 }}>{f.amount}</td>
                  <td className="p-2 text-[12px] border-b border-[var(--aw-border-light)]">
                    <span className="px-2 py-0.5 rounded-[20px] text-[10px]" style={{ background: f.status === 'paid' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: f.status === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {f.status === 'paid' ? 'پرداخت شده' : 'معوق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashSection>
    </motion.div>
  );
}

function FinSumCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-[14px] p-3.5 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
      <div className="text-xl mb-0.5" style={{ fontWeight: 800, color }}>{value}</div>
      <div className="text-[11px] text-[var(--aw-text-muted)]">{label}</div>
    </div>
  );
}

function FinTable({ items, colorClass, type }: { items: FinanceItem[]; colorClass: string; type: 'income' | 'expense' }) {
  const { openModal } = useApp();
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr>
              <th className="text-right p-2 text-[11px] text-[var(--aw-text-muted)] border-b border-[var(--aw-border)]" style={{ fontWeight: 600 }}>شرح</th>
              <th className="text-right p-2 text-[11px] text-[var(--aw-text-muted)] border-b border-[var(--aw-border)]" style={{ fontWeight: 600 }}>مبلغ</th>
              <th className="text-right p-2 text-[11px] text-[var(--aw-text-muted)] border-b border-[var(--aw-border)]" style={{ fontWeight: 600 }}>تاریخ</th>
              <th className="text-right p-2 text-[11px] text-[var(--aw-text-muted)] border-b border-[var(--aw-border)]" style={{ fontWeight: 600 }}>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {items.map(f => (
              <tr key={f.id} className="hover:bg-[var(--aw-bg-card-hover)] cursor-pointer" onClick={() => openModal('جزئیات تراکنش', <FinDetailContent itemId={f.id} />)}>
                <td className="p-2 text-[12px] border-b border-[var(--aw-border-light)]">{f.desc}</td>
                <td className="p-2 text-[12px] border-b border-[var(--aw-border-light)]" style={{ fontWeight: 600, color: colorClass }}>{f.amount}</td>
                <td className="p-2 text-[12px] border-b border-[var(--aw-border-light)]">{f.date}</td>
                <td className="p-2 text-[12px] border-b border-[var(--aw-border-light)]">
                  <span className="px-2 py-0.5 rounded-[20px] text-[10px]" style={{ background: f.status === 'paid' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: f.status === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                    {f.status === 'paid' ? 'پرداخت شده' : 'معوق'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="w-full py-2.5 px-5 border border-dashed border-[var(--aw-border)] rounded-[10px] text-[13px] cursor-pointer bg-transparent text-[var(--aw-text-secondary)] hover:border-[var(--aw-primary)] hover:text-[var(--aw-primary)] transition-all"
        style={{ fontWeight: 600 }}
        onClick={() => openModal('افزودن ' + (type === 'income' ? 'درآمد' : 'هزینه'), <FinAddContent type={type} />)}
      >
        <i className="fa-solid fa-plus" /> افزودن {type === 'income' ? 'درآمد' : 'هزینه'} جدید
      </button>
    </>
  );
}

function InvoicesTab() {
  const { financeData, openModal, showToast } = useApp();
  const pendingInvoices = [...financeData.income, ...financeData.expense].filter(f => f.status === 'pending');
  const paidInvoices = [...financeData.income, ...financeData.expense].filter(f => f.status === 'paid');

  return (
    <div>
      {pendingInvoices.length > 0 && (
        <>
          <div className="text-[12px] text-[var(--aw-accent)] mb-2 px-1 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
            <i className="fa-solid fa-clock" /> فاکتورهای معوق ({toFa(pendingInvoices.length)})
          </div>
          {pendingInvoices.map(f => (
            <div key={f.id} className="rounded-[14px] p-3.5 mb-2 border border-[var(--aw-border)] cursor-pointer transition-all hover:border-[var(--aw-primary)]" style={{ background: 'var(--aw-bg-card)' }}
              onClick={() => openModal('جزئیات فاکتور', <FinDetailContent itemId={f.id} />)}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[13px]" style={{ fontWeight: 600 }}>{f.desc}</span>
                <span className="px-2 py-0.5 rounded-[20px] text-[10px]" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontWeight: 600 }}>معوق</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[var(--aw-text-secondary)]">{f.date} | {f.category}</span>
                <span className="text-[13px] text-[var(--aw-accent)]" style={{ fontWeight: 700 }}>{f.amount} ریال</span>
              </div>
            </div>
          ))}
        </>
      )}

      {paidInvoices.length > 0 && (
        <>
          <div className="text-[12px] text-[var(--aw-secondary)] mb-2 mt-4 px-1 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
            <i className="fa-solid fa-check-circle" /> فاکتورهای پرداخت شده ({toFa(paidInvoices.length)})
          </div>
          {paidInvoices.map(f => (
            <div key={f.id} className="rounded-[14px] p-3.5 mb-2 border border-[var(--aw-border)] cursor-pointer transition-all hover:border-[var(--aw-primary)]" style={{ background: 'var(--aw-bg-card)' }}
              onClick={() => openModal('جزئیات فاکتور', <FinDetailContent itemId={f.id} />)}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[13px]" style={{ fontWeight: 600 }}>{f.desc}</span>
                <span className="px-2 py-0.5 rounded-[20px] text-[10px]" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 600 }}>پرداخت شده</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[var(--aw-text-secondary)]">{f.date} | {f.category}</span>
                <span className="text-[13px] text-[var(--aw-secondary)]" style={{ fontWeight: 700 }}>{f.amount} ریال</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ========================
// REPORTS SCREEN
// ========================
function ReportsScreen() {
  const { agents, customers, company, deals, personnel, openModal } = useApp();
  const companyAgents = agents.filter(a => !a.locked && (!a.company || a.company === company));

  const agentChartData = companyAgents.map(a => ({
    name: a.name.split(' ')[0],
    done: a.done,
    pending: a.pending,
  }));

  return (
    <motion.div className="flex-1 overflow-y-auto p-4 pb-4 aw-scroll" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <h3 className="text-base mb-4 flex items-center gap-1.5" style={{ fontWeight: 700 }}>
        <i className="fa-solid fa-chart-bar text-[var(--aw-primary)]" /> گزارش‌ها
      </h3>

      <ReportCard
        icon="fa-solid fa-robot" bg="aw-bg-blue" title="عملکرد عامل‌ها" desc="تحلیل کارایی و بهره‌وری عامل‌های هوشمند"
        onClick={() => openModal('گزارش عملکرد عامل‌ها', <AgentReportDetail />)}
      >
        <div className="w-full h-[160px] mb-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentChartData} barGap={3} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--aw-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<ChartTooltip />} />
              <Bar key="bar-done-rpt" dataKey="done" name="انجام شده" fill="#00E676" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar key="bar-pending-rpt" dataKey="pending" name="معلق" fill="#22A6F0" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ReportCard>

      <ReportCard
        icon="fa-solid fa-wallet" bg="aw-bg-green" title="خلاصه مالی" desc="درآمد، هزینه و سود خالص"
        onClick={() => openModal('گزارش مالی', <FinanceReportDetail />)}
      >
        <div className="w-full h-[160px] mb-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_REVENUE_DATA.slice(-6)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--aw-border-light)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--aw-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="income" name="درآمد" stroke="#00E676" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="expense" name="هزینه" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ReportMetric label="سود خالص" value="۶۵۰,۰۰۰,۰۰۰ ریال" valueColor="var(--aw-primary)" />
      </ReportCard>

      <ReportCard
        icon="fa-solid fa-users" bg="aw-bg-purple" title="نمای CRM" desc="وضعیت مشتریان و معاملات"
        onClick={() => openModal('گزارش CRM', <CrmReportDetail />)}
      >
        <div className="flex items-center gap-4">
          <div className="w-[120px] h-[120px] flex-shrink-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CRM_FUNNEL_DATA} cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={3} dataKey="value">
                  {CRM_FUNNEL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1">
            {CRM_FUNNEL_DATA.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                <span className="flex-1 text-[var(--aw-text-secondary)]">{d.name}</span>
                <span style={{ fontWeight: 700, color: d.fill }}>{toFa(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </ReportCard>

      <ReportCard
        icon="fa-solid fa-chart-line" bg="aw-bg-orange" title="فعالیت کاربران" desc="بررسی تعاملات و پیام‌ها"
        onClick={() => openModal('فعالیت کاربران', <ActivityReportDetail />)}
      >
        <div className="w-full h-[140px] mb-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_ACTIVITY_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <XAxis dataKey="day" tick={{ fill: 'var(--aw-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--aw-text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<ChartTooltip />} />
              <Bar key="bar-msgs-rpt" dataKey="messages" name="پیام‌ها" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar key="bar-calls-rpt" dataKey="calls" name="تماس‌ها" fill="#2E86FF" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ReportMetric label="پرسنل آنلاین" value={toFa(personnel.filter(p => p.status === 'online').length)} valueColor="var(--aw-online)" />
      </ReportCard>
    </motion.div>
  );
}

function ReportCard({ icon, bg, title, desc, children, onClick }: { icon: string; bg: string; title: string; desc: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <div className="rounded-[14px] p-4 mb-2.5 border border-[var(--aw-border)] cursor-pointer transition-all hover:border-[var(--aw-primary)]" style={{ background: 'var(--aw-bg-card)' }} onClick={onClick}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-base text-white ${bg}`}><i className={icon} /></div>
        <div>
          <div className="text-sm" style={{ fontWeight: 600 }}>{title}</div>
          <div className="text-[12px] text-[var(--aw-text-secondary)]">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ReportMetric({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)] last:border-none text-[12px]">
      <span className="text-[var(--aw-text-secondary)]">{label}</span>
      <span style={{ fontWeight: 700, color: valueColor }}>{value}</span>
    </div>
  );
}

// ========================
// MORE SCREEN (Settings - now used as modal content)
// ========================
export function MoreScreenModal() {
  const { openModal, closeModal, openUnifiedCall, setAdminScreen, showToast } = useApp();

  const handleNav = (action: () => void) => {
    closeModal();
    setTimeout(action, 200);
  };
  const back = () => openModal('تنظیمات', <MoreScreenModal />);
  const openSub = (title: string, content: React.ReactNode) => openModal(title, content, back);

  return (
    <div>
      <SettingsGroup title="مدیریت">
        <SettingsItem icon="fa-solid fa-robot" label="تنظیمات عامل‌ها" onClick={() => openSub('تنظیمات عامل‌ها', <AgentSettingsContent />)} />
        <SettingsItem icon="fa-solid fa-user-tie" label="مدیریت پرسنل" onClick={() => openSub('مدیریت پرسنل', <PersonnelSettingsContent />)} />
        <SettingsItem icon="fa-solid fa-chart-bar" label="گزارش‌ها" onClick={() => { closeModal(); setAdminScreen('reportsScreen'); }} />
      </SettingsGroup>

      <SettingsGroup title="عامل‌های هوشمند (AI)">
        <SettingsItem icon="fa-solid fa-user-plus" label="استخدام ایجنت" onClick={() => openSub('استخدام ایجنت', <HireAgentContent />)} />
        <SettingsItem icon="fa-solid fa-shield-halved" label="پرمیشن و دسترسی" onClick={() => openSub('پرمیشن و دسترسی', <PermissionsContent />)} />
        <SettingsItem icon="fa-solid fa-diagram-project" label="تنظیمات ورک‌فلو" onClick={() => openSub('تنظیمات ورک‌فلو', <WorkflowContent />)} />
        <SettingsItem icon="fa-solid fa-toggle-on" label="فعال/غیرفعال‌سازی ایجنت" onClick={() => openSub('فعال/غیرفعال‌سازی ایجنت', <ToggleAgentContent />)} />
        <SettingsItem icon="fa-solid fa-gauge-high" label="تنظیمات KPI" onClick={() => openSub('تنظیمات KPI', <KpiSettingsContent />)} />
        <SettingsItem icon="fa-solid fa-crown" label="مدیریت پلن‌ها" onClick={() => openSub('مدیریت پلن‌ها', <PlansManagementContent />)} />
      </SettingsGroup>

      <SettingsGroup title="ارتباطات">
        <SettingsItem icon="fa-solid fa-phone-alt" label="تماس‌ها" onClick={() => { closeModal(); openUnifiedCall(); }} />
        <SettingsItem icon="fa-solid fa-bell" label="اعلان‌ها" onClick={() => openSub('اعلان‌ها', <NotificationsContent />)} />
      </SettingsGroup>

      <SettingsGroup title="حساب کاربری">
        <SettingsItem icon="fa-solid fa-user-circle" label="پروفایل من" onClick={() => openSub('پروفایل من', <ProfileContent />)} />
        <SettingsItem icon="fa-solid fa-cog" label="ت��ظیمات برنامه" onClick={() => openSub('تنظیمات برنامه', <AppSettingsContent />)} />
        <SettingsItem icon="fa-solid fa-question-circle" label="درباره Neura" onClick={() => openSub('درباره Neura', <AboutContent />)} />
        <SettingsItem icon="fa-solid fa-sign-out-alt" label="خروج" danger onClick={() => openSub('خروج', <LogoutContent />)} />
      </SettingsGroup>
    </div>
  );
}


// ========================
// TASKS SCREEN
// ========================
type TasksTab = 'tasks' | 'calendar' | 'todo' | 'planner';

interface TodoListItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

interface PlannerBlock {
  id: string;
  time: string;
  title: string;
  category: 'meeting' | 'task' | 'break' | 'personal';
  duration: string;
}

interface CalendarEvent {
  id: string;
  day: number;
  title: string;
  color: string;
  time?: string;
}

const INITIAL_TODO_ITEMS: TodoListItem[] = [
  { id: 'td1', text: 'بررسی ایمیل‌های صبح', done: true, createdAt: 'امروز' },
  { id: 'td2', text: 'ارسال گزارش هفتگی به مدیریت', done: false, createdAt: 'امروز' },
  { id: 'td3', text: 'هماهنگی جلسه با تیم فروش', done: false, createdAt: 'امروز' },
  { id: 'td4', text: 'آپدیت مستندات پروژه', done: false, createdAt: 'دیروز' },
  { id: 'td5', text: 'تماس با تأمین‌کننده جدید', done: true, createdAt: 'دیروز' },
  { id: 'td6', text: 'بازبینی قرارداد شرکت آلفا', done: false, createdAt: 'دیروز' },
  { id: 'td7', text: 'ثبت فاکتورهای خرید ماه جاری', done: false, createdAt: '۲ روز پیش' },
  { id: 'td8', text: 'پیگیری پرداخت معوقه', done: false, createdAt: '۲ روز پیش' },
];

const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'ce1', day: 3, title: 'جلسه تیم فنی', color: '#8B5CF6', time: '۰۹:۰۰' },
  { id: 'ce2', day: 5, title: 'ارائه گزارش مالی', color: '#3B82F6', time: '۱۱:۰۰' },
  { id: 'ce3', day: 5, title: 'جلسه بازاریابی', color: '#F59E0B', time: '۱۴:۰۰' },
  { id: 'ce4', day: 8, title: 'مهلت ارسال پروپوزال', color: '#EF4444', time: '۱۷:۰۰' },
  { id: 'ce5', day: 12, title: 'بازدید مشتری VIP', color: '#10B981', time: '۱۰:۰۰' },
  { id: 'ce6', day: 14, title: 'وبینار آموزشی', color: '#22A6F0', time: '۱۵:۰۰' },
  { id: 'ce7', day: 18, title: 'جلسه هیئت‌مدیره', color: '#8B5CF6', time: '۰۹:۳۰' },
  { id: 'ce8', day: 20, title: 'ددلاین پروژه سامان', color: '#EF4444', time: '۲۳:۵۹' },
  { id: 'ce9', day: 22, title: 'جشن تولد همکار', color: '#F59E0B' },
  { id: 'ce10', day: 25, title: 'جلسه بررسی KPI', color: '#3B82F6', time: '۱۱:۰۰' },
  { id: 'ce11', day: 28, title: 'پایان ماه - بستن حساب‌ها', color: '#EF4444' },
];

const PLANNER_BLOCKS_INIT: PlannerBlock[] = [
  { id: 'pb1', time: '۰۸:۰۰', title: 'بررسی ایمیل و پیام‌ها', category: 'task', duration: '۳۰ دقیقه' },
  { id: 'pb2', time: '۰۸:۳۰', title: 'استندآپ روزانه تیم', category: 'meeting', duration: '۱۵ دقیقه' },
  { id: 'pb3', time: '۰۹:۰۰', title: 'کار روی پروژه اصلی', category: 'task', duration: '۲ ساعت' },
  { id: 'pb4', time: '۱۱:۰۰', title: 'جلسه با مشتری', category: 'meeting', duration: '۱ ساعت' },
  { id: 'pb5', time: '۱۲:۰۰', title: 'استراحت و ناهار', category: 'break', duration: '۱ ساعت' },
  { id: 'pb6', time: '۱۳:۰۰', title: 'بررسی گزارش‌های مالی', category: 'task', duration: '۱ ساعت' },
  { id: 'pb7', time: '۱۴:۰۰', title: 'جلسه تیم بازاریابی', category: 'meeting', duration: '۴۵ دقیقه' },
  { id: 'pb8', time: '۱۵:۰۰', title: 'پاسخ به تیکت‌های پشتیبانی', category: 'task', duration: '۱ ساعت' },
  { id: 'pb9', time: '۱۶:۰۰', title: 'مطالعه و یادگیری', category: 'personal', duration: '۴۵ دقیقه' },
  { id: 'pb10', time: '۱۷:۰۰', title: 'جمع‌بندی و برنامه‌ریزی فردا', category: 'task', duration: '۳۰ دقیقه' },
];

const PLANNER_CATS: Record<string, { label: string; color: string; icon: string }> = {
  meeting: { label: 'جلسه', color: '#8B5CF6', icon: 'fa-solid fa-users' },
  task: { label: 'وظیفه', color: '#3B82F6', icon: 'fa-solid fa-list-check' },
  break: { label: 'استراحت', color: '#10B981', icon: 'fa-solid fa-mug-hot' },
  personal: { label: 'شخصی', color: '#F59E0B', icon: 'fa-solid fa-star' },
};

const TASKS_TABS_LIST: { id: TasksTab; label: string; icon: string }[] = [
  { id: 'tasks', label: 'تسک‌ها', icon: 'fa-solid fa-list-check' },
  { id: 'calendar', label: 'تقویم', icon: 'fa-solid fa-calendar-days' },
  { id: 'todo', label: 'To-Do', icon: 'fa-solid fa-square-check' },
  { id: 'planner', label: 'پلنر', icon: 'fa-solid fa-table-cells-large' },
];

const WEEKDAYS_CAL = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const MONTH_NAME_CAL = 'اسفند ۱۴۰۴';

function TasksScreen() {
  const { tasks, setTasks, openModal, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<TasksTab>('tasks');
  const [filter, setFilter] = useState<'all' | 'todo' | 'inProgress' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [todoItems, setTodoItems] = useState<TodoListItem[]>(INITIAL_TODO_ITEMS);
  const [newTodo, setNewTodo] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [plannerDay, setPlannerDay] = useState<'today' | 'tomorrow'>('today');
  const [plannerBlocks, setPlannerBlocks] = useState<PlannerBlock[]>(PLANNER_BLOCKS_INIT);

  const filteredTasks = tasks
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => !search || t.title.includes(search) || t.assignee.includes(search) || t.description.includes(search));

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'inProgress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const filters: { id: typeof filter; label: string; count?: number }[] = [
    { id: 'all', label: 'همه', count: tasks.length },
    { id: 'todo', label: 'در انتظار', count: todoCount },
    { id: 'inProgress', label: 'در حال انجام', count: inProgressCount },
    { id: 'done', label: 'انجام شده', count: doneCount },
  ];

  const daysInMonth = 30;
  const calendarDays: (number | null)[] = [];
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  const dayEvents = selectedDay ? CALENDAR_EVENTS.filter(e => e.day === selectedDay) : [];

  const todoRemaining = todoItems.filter(t => !t.done).length;
  const todoDoneCount = todoItems.filter(t => t.done).length;

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodoItems(prev => [{ id: 'td' + Date.now(), text: newTodo.trim(), done: false, createdAt: 'الان' }, ...prev]);
    setNewTodo('');
    showToast('آیتم جدید اضافه شد');
  };
  const toggleTodo = (id: string) => setTodoItems(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id: string) => { setTodoItems(prev => prev.filter(t => t.id !== id)); showToast('حذف شد'); };
  const deletePlannerBlock = (id: string) => { setPlannerBlocks(prev => prev.filter(b => b.id !== id)); showToast('بلاک حذف شد'); };

  const handleAddPlanner = () => {
    openModal('افزودن بلاک جدید', <PlannerAddContent onAdd={(block) => {
      setPlannerBlocks(prev => [...prev, block].sort((a, b) => a.time.localeCompare(b.time)));
    }} />);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar + Stats */}
      <div className="px-4 pt-2 pb-1 flex-shrink-0">
        {/* Main Tabs */}
        <div className="flex gap-1 mb-3 p-1 rounded-[14px] border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
          {TASKS_TABS_LIST.map(tab => (
            <button
              key={tab.id}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] border-none cursor-pointer transition-all text-[11px] ${
                activeTab === tab.id ? 'text-white' : 'bg-transparent text-[var(--aw-text-muted)]'
              }`}
              style={activeTab === tab.id ? { background: 'var(--aw-primary)', fontWeight: 700 } : { fontWeight: 600 }}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`${tab.icon} text-[12px]`} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'tasks' && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-[12px] p-3 text-center border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="text-lg" style={{ fontWeight: 800, color: '#2E86FF' }}>{toFa(todoCount)}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">در انتظار</div>
            </div>
            <div className="rounded-[12px] p-3 text-center border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="text-lg" style={{ fontWeight: 800, color: '#f59e0b' }}>{toFa(inProgressCount)}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">در حال انجام</div>
            </div>
            <div className="rounded-[12px] p-3 text-center border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="text-lg" style={{ fontWeight: 800, color: '#10b981' }}>{toFa(doneCount)}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">انجام شده</div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="flex items-center justify-between mb-2">
            <button className="bg-transparent border-none text-[var(--aw-text-secondary)] cursor-pointer p-1"><i className="fa-solid fa-chevron-right" /></button>
            <span className="text-sm text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{MONTH_NAME_CAL}</span>
            <button className="bg-transparent border-none text-[var(--aw-text-secondary)] cursor-pointer p-1"><i className="fa-solid fa-chevron-left" /></button>
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-[12px] p-3 text-center border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="text-lg" style={{ fontWeight: 800, color: '#F59E0B' }}>{toFa(todoRemaining)}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">باقی‌مانده</div>
            </div>
            <div className="rounded-[12px] p-3 text-center border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
              <div className="text-lg" style={{ fontWeight: 800, color: '#10B981' }}>{toFa(todoDoneCount)}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">انجام‌شده</div>
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="flex gap-2 mb-3">
            {(['today', 'tomorrow'] as const).map(d => (
              <button
                key={d}
                className={`flex-1 py-2.5 rounded-[12px] border text-[12px] cursor-pointer transition-all ${
                  plannerDay === d ? 'text-white border-[var(--aw-primary)]' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
                }`}
                style={plannerDay === d ? { background: 'var(--aw-primary)', fontWeight: 700 } : { fontWeight: 600 }}
                onClick={() => setPlannerDay(d)}
              >
                <i className={`fa-solid ${d === 'today' ? 'fa-sun' : 'fa-moon'} ml-1`} />
                {d === 'today' ? 'امروز' : 'فردا'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== TASKS TAB ===== */}
      {activeTab === 'tasks' && (
        <>
          <div className="flex gap-1.5 px-4 pb-2 flex-wrap flex-shrink-0">
            {filters.map(f => (
              <button
                key={f.id}
                className={`py-2 px-3 rounded-[20px] border text-[11px] cursor-pointer transition-all ${
                  filter === f.id ? 'text-white border-[var(--aw-primary)]' : 'bg-transparent text-[var(--aw-text-secondary)] border-[var(--aw-border)]'
                }`}
                style={filter === f.id ? { background: 'var(--aw-primary)', fontWeight: 600 } : { fontWeight: 600 }}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {f.count !== undefined && <span className="mr-1 text-[10px]">({toFa(f.count)})</span>}
              </button>
            ))}
          </div>
          <div className="px-4 pb-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 rounded-[10px] px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
              <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
              <input
                className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
                placeholder="جستجو در وظایف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer text-sm" onClick={() => setSearch('')}>
                  <i className="fa-solid fa-times" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 aw-scroll relative">
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            )) : (
              <EmptyState icon="fa-solid fa-list-check" text="وظیفه‌ای یافت نشد" />
            )}
          </div>
        </>
      )}

      {/* ===== CALENDAR TAB ===== */}
      {activeTab === 'calendar' && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 aw-scroll">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS_CAL.map(d => (
                <div key={d} className="text-center text-[11px] text-[var(--aw-text-muted)] py-1" style={{ fontWeight: 600 }}>{d}</div>
              ))}
            </div>
            <motion.div variants={fadeInUp} className="grid grid-cols-7 gap-1 mb-3">
              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} />;
                const evts = CALENDAR_EVENTS.filter(e => e.day === day);
                const isSel = selectedDay === day;
                const isToday = day === 22;
                return (
                  <button
                    key={day}
                    className={`relative p-1.5 rounded-[10px] border cursor-pointer transition-all min-h-[42px] flex flex-col items-center justify-start gap-0.5 ${
                      isSel ? 'border-[var(--aw-primary)] text-white' : isToday ? 'border-[var(--aw-accent)]' : 'border-transparent hover:border-[var(--aw-border)]'
                    }`}
                    style={{ background: isSel ? 'var(--aw-primary)' : isToday ? 'rgba(139,92,246,0.1)' : 'transparent' }}
                    onClick={() => setSelectedDay(isSel ? null : day)}
                  >
                    <span className={`text-[12px] ${isSel ? 'text-white' : isToday ? 'text-[var(--aw-primary)]' : 'text-[var(--aw-text-primary)]'}`} style={{ fontWeight: isToday ? 800 : 500 }}>{toFa(day)}</span>
                    {evts.length > 0 && (
                      <div className="flex gap-0.5">
                        {evts.slice(0, 3).map(e => <div key={e.id} className="w-[5px] h-[5px] rounded-full" style={{ background: isSel ? '#fff' : e.color }} />)}
                      </div>
                    )}
                  </button>
                );
              })}
            </motion.div>
            {selectedDay !== null && (
              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fa-solid fa-calendar-day text-[var(--aw-primary)]" />
                  <span className="text-[13px]" style={{ fontWeight: 700 }}>رویدادهای {toFa(selectedDay)} {MONTH_NAME_CAL}</span>
                </div>
                {dayEvents.length > 0 ? dayEvents.map(evt => (
                  <div key={evt.id} className="rounded-[12px] p-3 mb-2 border border-[var(--aw-border)] flex items-center gap-3" style={{ background: 'var(--aw-bg-card)' }}>
                    <div className="w-1 h-10 rounded-full" style={{ background: evt.color }} />
                    <div className="flex-1">
                      <div className="text-[13px]" style={{ fontWeight: 600 }}>{evt.title}</div>
                      {evt.time && <div className="text-[11px] text-[var(--aw-text-muted)] mt-0.5"><i className="fa-solid fa-clock ml-1" />{evt.time}</div>}
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ background: evt.color }} />
                  </div>
                )) : (
                  <div className="text-center py-6 text-[var(--aw-text-muted)] text-[13px]">
                    <i className="fa-solid fa-calendar-xmark text-2xl mb-2 block opacity-40" />رویدادی ثبت نشده
                  </div>
                )}
              </motion.div>
            )}
            {selectedDay === null && (
              <motion.div variants={fadeInUp}>
                <div className="flex items-center gap-2 mb-2">
                  <i className="fa-solid fa-clock text-[var(--aw-primary)]" />
                  <span className="text-[13px]" style={{ fontWeight: 700 }}>رویدادهای پیش‌رو</span>
                </div>
                {CALENDAR_EVENTS.filter(e => e.day >= 22).slice(0, 5).map(evt => (
                  <div key={evt.id} className="rounded-[12px] p-3 mb-2 border border-[var(--aw-border)] flex items-center gap-3 cursor-pointer transition-all hover:border-[var(--aw-primary)]" style={{ background: 'var(--aw-bg-card)' }} onClick={() => setSelectedDay(evt.day)}>
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white text-[14px]" style={{ background: evt.color, fontWeight: 700 }}>{toFa(evt.day)}</div>
                    <div className="flex-1">
                      <div className="text-[13px]" style={{ fontWeight: 600 }}>{evt.title}</div>
                      {evt.time && <div className="text-[11px] text-[var(--aw-text-muted)] mt-0.5"><i className="fa-solid fa-clock ml-1" />{evt.time}</div>}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* ===== TO-DO TAB ===== */}
      {activeTab === 'todo' && (
        <>
          <div className="px-4 pb-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 rounded-[12px] px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
              <i className="fa-solid fa-plus text-sm text-[var(--aw-primary)]" />
              <input
                className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]"
                placeholder="آیتم جدید اضافه کنید..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              />
              {newTodo && (
                <button className="bg-transparent border-none text-[var(--aw-primary)] cursor-pointer text-sm" style={{ fontWeight: 700 }} onClick={addTodo}>افزودن</button>
              )}
            </div>
          </div>
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--aw-bg-input)' }}>
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #10B981, #3B82F6)' }} initial={{ width: 0 }} animate={{ width: todoItems.length > 0 ? `${(todoDoneCount / todoItems.length) * 100}%` : '0%' }} transition={{ duration: 0.4 }} />
              </div>
              <span className="text-[10px] text-[var(--aw-text-muted)]" style={{ fontWeight: 600 }}>{toFa(todoDoneCount)}/{toFa(todoItems.length)}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 aw-scroll">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              {todoItems.length > 0 ? todoItems.map(item => (
                <motion.div key={item.id} variants={fadeInUp} className={`rounded-[12px] p-3 mb-2 border border-[var(--aw-border)] flex items-center gap-3 transition-all ${item.done ? 'opacity-60' : ''}`} style={{ background: 'var(--aw-bg-card)' }}>
                  <button className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all" style={{ borderColor: item.done ? '#10b981' : 'var(--aw-border)', background: item.done ? '#10b981' : 'transparent' }} onClick={() => toggleTodo(item.id)}>
                    {item.done && <i className="fa-solid fa-check text-[10px] text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[13px] ${item.done ? 'line-through text-[var(--aw-text-muted)]' : ''}`} style={{ fontWeight: 500 }}>{item.text}</span>
                    <div className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">{item.createdAt}</div>
                  </div>
                  <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer text-sm hover:text-[#ef4444] transition-colors p-1" onClick={() => deleteTodo(item.id)}>
                    <i className="fa-solid fa-trash-can text-[12px]" />
                  </button>
                </motion.div>
              )) : <EmptyState icon="fa-solid fa-square-check" text="لیست خالی است" />}
            </motion.div>
          </div>
        </>
      )}

      {/* ===== PLANNER TAB ===== */}
      {activeTab === 'planner' && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 aw-scroll">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={fadeInUp} className="flex gap-2 flex-wrap mb-3">
              {Object.entries(PLANNER_CATS).map(([key, cat]) => (
                <span key={key} className="flex items-center gap-1 text-[10px] text-[var(--aw-text-muted)] px-2 py-1 rounded-[20px] border border-[var(--aw-border)]" style={{ fontWeight: 600 }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />{cat.label}
                </span>
              ))}
            </motion.div>
            {plannerBlocks.map((block, idx) => {
              const cat = PLANNER_CATS[block.category];
              return (
                <motion.div key={block.id} variants={fadeInUp} className="flex gap-3 mb-1">
                  <div className="w-12 flex-shrink-0 text-[11px] text-[var(--aw-text-muted)] pt-3 text-left" style={{ fontWeight: 600 }}>{block.time}</div>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full border-2 mt-3.5" style={{ borderColor: cat.color, background: 'var(--aw-bg-app)' }} />
                    {idx < plannerBlocks.length - 1 && <div className="w-0.5 flex-1 min-h-[20px]" style={{ background: 'var(--aw-border)' }} />}
                  </div>
                  <div
                    className="flex-1 rounded-[12px] p-3 mb-1 border cursor-pointer transition-all hover:border-[var(--aw-primary)]"
                    style={{ background: 'var(--aw-bg-card)', borderColor: 'var(--aw-border)', borderRightWidth: 3, borderRightColor: cat.color }}
                    onClick={() => openModal(block.title, (
                      <div className="space-y-3 text-[13px]">
                        <div className="flex justify-between"><span className="text-[var(--aw-text-muted)]">زمان:</span><span>{block.time}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--aw-text-muted)]">مدت:</span><span>{block.duration}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--aw-text-muted)]">دسته‌بندی:</span><span style={{ color: cat.color }}><i className={`${cat.icon} ml-1`} />{cat.label}</span></div>
                        <button className="w-full mt-2 py-2.5 rounded-[10px] text-[13px] cursor-pointer border border-[#ef4444] text-[#ef4444] bg-transparent" style={{ fontWeight: 600 }} onClick={() => deletePlannerBlock(block.id)}>
                          <i className="fa-solid fa-trash ml-1" />حذف بلاک
                        </button>
                      </div>
                    ))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className={`${cat.icon} text-[12px]`} style={{ color: cat.color }} />
                        <span className="text-[13px]" style={{ fontWeight: 600 }}>{block.title}</span>
                      </div>
                      <span className="text-[10px] text-[var(--aw-text-muted)] px-2 py-0.5 rounded-[20px] border border-[var(--aw-border)]" style={{ fontWeight: 500 }}>{block.duration}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {plannerBlocks.length === 0 && <EmptyState icon="fa-solid fa-table-cells-large" text="بلاکی ثبت نشده" />}
          </motion.div>
        </div>
      )}

      {/* Add button */}
      <button
        className="absolute bottom-20 left-5 w-[52px] h-[52px] rounded-full border-none text-white text-xl cursor-pointer z-40 flex items-center justify-center"
        style={{ background: 'var(--aw-primary)', boxShadow: 'var(--aw-shadow)' }}
        onClick={() => {
          if (activeTab === 'tasks') openModal('افزودن وظیفه', <TaskAddContent />);
          else if (activeTab === 'calendar') openModal('افزودن رویداد', <CalendarEventAddContent />);
          else if (activeTab === 'planner') handleAddPlanner();
        }}
      >
        <i className="fa-solid fa-plus" />
      </button>
    </div>
  );
}

function CalendarEventAddContent() {
  const { closeModal, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const save = () => { if (!title || !day) return; closeModal(); showToast('رویداد جدید اضافه شد'); };
  return (
    <div>
      <FormGroup label="عنوان رویداد"><FormInput placeholder="عنوان رویداد" value={title} onChange={e => setTitle(e.target.value)} /></FormGroup>
      <FormGroup label="روز ماه"><FormInput placeholder="مثلاً ۱۵" value={day} onChange={e => setDay(e.target.value)} /></FormGroup>
      <FormGroup label="ساعت (اختیاری)"><FormInput placeholder="مثلاً ۱۰:۰۰" value={time} onChange={e => setTime(e.target.value)} /></FormGroup>
      <button className="w-full py-2.5 border-none rounded-[10px] text-[13px] text-white cursor-pointer mt-2" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={save}>
        <i className="fa-solid fa-calendar-plus ml-1" /> ثبت رویداد
      </button>
    </div>
  );
}

function PlannerAddContent({ onAdd }: { onAdd: (block: PlannerBlock) => void }) {
  const { closeModal, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState<'meeting' | 'task' | 'break' | 'personal'>('task');
  const save = () => {
    if (!title || !time) return;
    onAdd({ id: 'pb' + Date.now(), time, title, category, duration: duration || '۳۰ دقیقه' });
    closeModal();
    showToast('بلاک جدید اضافه شد');
  };
  return (
    <div>
      <FormGroup label="عنوان"><FormInput placeholder="عنوان بلاک" value={title} onChange={e => setTitle(e.target.value)} /></FormGroup>
      <FormGroup label="ساعت شروع"><FormInput placeholder="مثلاً ۱۰:۰۰" value={time} onChange={e => setTime(e.target.value)} /></FormGroup>
      <FormGroup label="مدت زمان"><FormInput placeholder="مثلاً ۱ ساعت" value={duration} onChange={e => setDuration(e.target.value)} /></FormGroup>
      <FormGroup label="دسته‌بندی">
        <FormSelect value={category} onChange={e => setCategory(e.target.value as any)} options={[
          { value: 'task', label: 'وظیفه' }, { value: 'meeting', label: 'جلسه' }, { value: 'break', label: 'استراحت' }, { value: 'personal', label: 'شخصی' },
        ]} />
      </FormGroup>
      <button className="w-full py-2.5 border-none rounded-[10px] text-[13px] text-white cursor-pointer mt-2" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={save}>
        <i className="fa-solid fa-plus ml-1" /> افزودن بلاک
      </button>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const { openModal, setTasks, showToast } = useApp();
  const statusColor = TASK_STATUS_COLORS[task.status];
  const priorityColor = TASK_PRIORITY_COLORS[task.priority];

  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus as Task['status'] } : t));
    showToast(newStatus === 'done' ? 'وظیفه تکمیل شد' : 'وظیفه به حالت انتظار بازگشت');
  };

  return (
    <div
      className={`rounded-[14px] p-3.5 mb-2 border border-[var(--aw-border)] cursor-pointer transition-all hover:border-[var(--aw-primary)] ${task.status === 'done' ? 'opacity-70' : ''}`}
      style={{ background: 'var(--aw-bg-card)' }}
      onClick={() => openModal(task.title, <TaskDetailContent taskId={task.id} />)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-all"
          style={{
            borderColor: task.status === 'done' ? '#10b981' : 'var(--aw-border)',
            background: task.status === 'done' ? '#10b981' : 'transparent',
          }}
          onClick={toggleDone}
        >
          {task.status === 'done' && <i className="fa-solid fa-check text-[10px] text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1.5">
            <span className={`text-[13px] ${task.status === 'done' ? 'line-through text-[var(--aw-text-muted)]' : ''}`} style={{ fontWeight: 600 }}>
              {task.title}
            </span>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-1.5">
            <span className="px-2 py-0.5 rounded-[20px] text-[10px]" style={{ background: statusColor.bg, color: statusColor.text, fontWeight: 600 }}>
              {TASK_STATUS_LABELS[task.status]}
            </span>
            <span className="px-2 py-0.5 rounded-[20px] text-[10px]" style={{ background: priorityColor.bg, color: priorityColor.text, fontWeight: 600 }}>
              <i className="fa-solid fa-flag text-[8px]" /> {TASK_PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[var(--aw-text-muted)]">
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-user text-[9px]" /> {task.assignee}
            </span>
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-calendar text-[9px]" /> {task.dueDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskDetailContent({ taskId }: { taskId: string }) {
  const { tasks, setTasks, closeModal, showToast } = useApp();
  const t = tasks.find(x => x.id === taskId);
  if (!t) return null;

  const update = (field: keyof Task, val: string) => {
    setTasks(prev => prev.map(tk => tk.id === taskId ? { ...tk, [field]: val } : tk));
  };

  const handleDelete = () => {
    setTasks(prev => prev.filter(tk => tk.id !== taskId));
    closeModal();
    showToast('وظیفه حذف شد');
  };

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-[20px] text-[11px]" style={{ background: TASK_STATUS_COLORS[t.status].bg, color: TASK_STATUS_COLORS[t.status].text, fontWeight: 600 }}>
          {TASK_STATUS_LABELS[t.status]}
        </span>
        <span className="px-3 py-1 rounded-[20px] text-[11px]" style={{ background: TASK_PRIORITY_COLORS[t.priority].bg, color: TASK_PRIORITY_COLORS[t.priority].text, fontWeight: 600 }}>
          <i className="fa-solid fa-flag text-[9px]" /> {TASK_PRIORITY_LABELS[t.priority]}
        </span>
      </div>
      <FormGroup label="عنوان"><FormInput value={t.title} onChange={e => update('title', e.target.value)} /></FormGroup>
      <FormGroup label="توضیحات">
        <textarea
          className="w-full p-2.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none resize-y min-h-[60px]"
          style={{ background: 'var(--aw-bg-input)' }}
          value={t.description}
          onChange={e => update('description', e.target.value)}
          rows={3}
        />
      </FormGroup>
      <FormGroup label="مسئول"><FormInput value={t.assignee} onChange={e => update('assignee', e.target.value)} /></FormGroup>
      <FormGroup label="تاریخ سررسید"><FormInput value={t.dueDate} onChange={e => update('dueDate', e.target.value)} /></FormGroup>
      <FormGroup label="وضعیت">
        <FormSelect
          value={t.status}
          onChange={e => update('status', e.target.value as any)}
          options={[
            { value: 'todo', label: 'در انتظار' },
            { value: 'inProgress', label: 'در حال انجام' },
            { value: 'done', label: 'انجام شده' },
          ]}
        />
      </FormGroup>
      <FormGroup label="اولویت">
        <FormSelect
          value={t.priority}
          onChange={e => update('priority', e.target.value as any)}
          options={[
            { value: 'high', label: 'بالا' },
            { value: 'medium', label: 'متوسط' },
            { value: 'low', label: 'پایین' },
          ]}
        />
      </FormGroup>
      <div className="text-[11px] text-[var(--aw-text-muted)] mb-3 px-1">
        <i className="fa-solid fa-clock" /> ایجاد شده: {t.createdAt}
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { closeModal(); showToast('تغییرات ذخیره شد'); }}>
          <i className="fa-solid fa-save" /> ذخیره
        </button>
        <button className="py-2.5 px-5 rounded-[10px] text-[13px] cursor-pointer border border-[var(--aw-danger)] text-[var(--aw-danger)] bg-transparent" style={{ fontWeight: 600 }} onClick={handleDelete}>
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  );
}

function TaskAddContent() {
  const { setTasks, closeModal, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const save = () => {
    if (!title) return;
    const newTask: Task = {
      id: 't' + Date.now(),
      title,
      description,
      status: 'todo',
      priority,
      assignee: assignee || 'نامشخص',
      dueDate: dueDate || 'بدون سررسید',
      createdAt: 'امروز',
    };
    setTasks(prev => [newTask, ...prev]);
    closeModal();
    showToast('وظیفه جدید اضافه شد');
  };

  return (
    <div>
      <FormGroup label="عنوان وظیفه"><FormInput placeholder="عنوان وظیفه را وارد کنید" value={title} onChange={e => setTitle(e.target.value)} /></FormGroup>
      <FormGroup label="توضیحات">
        <textarea
          className="w-full p-2.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none resize-y min-h-[60px] placeholder:text-[var(--aw-text-muted)]"
          style={{ background: 'var(--aw-bg-input)' }}
          placeholder="توضیحات وظیفه"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </FormGroup>
      <FormGroup label="مسئول"><FormInput placeholder="نام مسئول" value={assignee} onChange={e => setAssignee(e.target.value)} /></FormGroup>
      <FormGroup label="تاریخ سررسید"><FormInput placeholder="مثال: ۱۴۰۴/۱۲/۱۰" value={dueDate} onChange={e => setDueDate(e.target.value)} /></FormGroup>
      <FormGroup label="اولویت">
        <FormSelect
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          options={[
            { value: 'high', label: 'بالا' },
            { value: 'medium', label: 'متوسط' },
            { value: 'low', label: 'پایین' },
          ]}
        />
      </FormGroup>
      <button className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={save}>
        <i className="fa-solid fa-plus" /> ثبت وظیفه
      </button>
    </div>
  );
}

export function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[12px] text-[var(--aw-text-muted)] mb-2 px-1" style={{ fontWeight: 600 }}>{title}</div>
      {children}
    </div>
  );
}

export function SettingsItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 p-3.5 rounded-xl mb-1 cursor-pointer transition-all border border-[var(--aw-border)] hover:border-[var(--aw-primary)]"
      style={{ background: 'var(--aw-bg-card)' }}
      onClick={onClick}
    >
      <i className={`${icon} text-base w-5 text-center`} style={{ color: danger ? 'var(--aw-danger)' : 'var(--aw-primary)' }} />
      <span className={`flex-1 text-[13px] ${danger ? 'text-[var(--aw-danger)]' : ''}`} style={{ fontWeight: 500 }}>{label}</span>
      <i className="fa-solid fa-chevron-left text-[12px] text-[var(--aw-text-muted)]" />
    </div>
  );
}

// ========================
// MODAL CONTENTS
// ========================
function NotifItem({ notif: n, isRead, onMarkRead, onDelete }: { notif: any; isRead?: boolean; onMarkRead?: (id: string) => void; onDelete?: (id: string) => void }) {
  const { closeModal, openChat, setAdminScreen, setCrmTab, setFinTab, agents } = useApp();
  const handleClick = () => {
    closeModal();
    if (n.type === 'chat') {
      const a = agents.find((x: any) => x.id === n.target);
      if (a && !a.locked) setTimeout(() => openChat(n.target, 'agent'), 250);
    } else if (n.type === 'finance') {
      setAdminScreen('financeScreen');
      if (n.target === 'pending') setFinTab('invoices');
    } else if (n.type === 'crm') {
      setAdminScreen('crmScreen');
      if (n.target === 'leads') setCrmTab('leads');
    } else if (n.type === 'reports') {
      setAdminScreen('reportsScreen');
    }
  };

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-xl mb-1.5 cursor-pointer border transition-all hover:border-[var(--aw-primary)] ${isRead ? 'border-transparent opacity-60' : 'border-[var(--aw-border)]'}`} style={{ background: 'var(--aw-bg-card)' }} onClick={handleClick}>
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--aw-eu-nav-bg)', border: '1px solid var(--aw-eu-nav-border)', backdropFilter: 'blur(8px)' }}>
        {NOTIF_ICON_SRC[n.icon]
          ? <img src={NOTIF_ICON_SRC[n.icon]} alt="" className="nav-icon-img" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          : <i className={`${n.icon} text-sm`} style={{ color: 'var(--aw-primary)' }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {!isRead && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--aw-primary)' }} />}
          <div className="text-[13px] truncate" style={{ fontWeight: 600 }}>{n.title}</div>
        </div>
        <div className="text-[11px] text-[var(--aw-text-secondary)]">{n.desc}</div>
        <div className="text-[10px] text-[var(--aw-text-muted)] mt-1">{n.time}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-[var(--aw-primary)] inline-block" style={{ fontWeight: 600 }}>{n.cta} ←</span>
          <div className="flex-1" />
          {!isRead && onMarkRead && (
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-all hover:opacity-80"
              style={{ background: 'var(--aw-bg-hover)', color: 'var(--aw-success)', fontWeight: 600 }}
              onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
            >
              <i className="fa-solid fa-check text-[9px]" />
              خوانده شد
            </button>
          )}
          {onDelete && (
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-all hover:opacity-80"
              style={{ background: 'var(--aw-bg-hover)', color: 'var(--aw-danger)', fontWeight: 600 }}
              onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
            >
              <i className="fa-solid fa-trash text-[9px]" />
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationsContent() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const handleMarkRead = (id: string) => setReadIds(prev => new Set(prev).add(id));
  const handleDelete = (id: string) => setDeletedIds(prev => new Set(prev).add(id));
  const handleMarkAllRead = () => setReadIds(new Set(NOTIFICATIONS.map(n => n.id)));

  const visibleNotifs = NOTIFICATIONS.filter(n => !deletedIds.has(n.id));
  const unreadCount = visibleNotifs.filter(n => !readIds.has(n.id)).length;

  return (
    <div>
      {visibleNotifs.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] text-[var(--aw-text-muted)]">{toFa(unreadCount)} اعلان خوانده‌نشده</span>
          {unreadCount > 0 && (
            <button
              className="text-[11px] px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'var(--aw-bg-hover)', color: 'var(--aw-primary)', fontWeight: 600 }}
              onClick={handleMarkAllRead}
            >
              <i className="fa-solid fa-check-double ml-1 text-[10px]" />
              خواندن همه
            </button>
          )}
        </div>
      )}
      <AnimatePresence>
        {visibleNotifs.map(n => (
          <motion.div key={n.id} initial={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.25 }}>
            <NotifItem notif={n} isRead={readIds.has(n.id)} onMarkRead={handleMarkRead} onDelete={handleDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
      {visibleNotifs.length === 0 && (
        <div className="text-center py-10 text-[var(--aw-text-muted)]">
          <i className="fa-solid fa-bell-slash text-3xl mb-3 block opacity-40" />
          <div className="text-[13px]">اعلانی وجود ندارد</div>
        </div>
      )}
    </div>
  );
}

function SearchContent() {
  const [query, setQuery] = useState('');
  const { agents, personnel, customers, deals, closeModal, openChat, openModal } = useApp();

  const results: { name: string; sub: string; icon: string; bg: string; init: string; action: () => void }[] = [];

  if (query.trim()) {
    agents.filter(a => a.name.includes(query) || a.role.includes(query)).forEach(a => {
      results.push({
        name: a.name, sub: a.role, icon: 'fa-solid fa-robot', bg: a.bg, init: a.init,
        action: () => { closeModal(); if (!a.locked) setTimeout(() => openChat(a.id, 'agent'), 200); }
      });
    });
    personnel.filter(p => p.name.includes(query) || p.role.includes(query)).forEach(p => {
      results.push({
        name: p.name, sub: p.role, icon: 'fa-solid fa-user-tie', bg: p.bg, init: p.init,
        action: () => { closeModal(); setTimeout(() => openChat(p.id, 'personnel'), 200); }
      });
    });
    customers.filter(c => c.name.includes(query) || c.contact.includes(query)).forEach(c => {
      results.push({
        name: c.name, sub: c.contact, icon: 'fa-solid fa-user', bg: 'aw-bg-cyan', init: c.name[0],
        action: () => { closeModal(); setTimeout(() => openModal(c.name, <CustomerDetailContent customerId={c.id} />), 200); }
      });
    });
    deals.filter(d => d.title.includes(query) || d.customer.includes(query)).forEach(d => {
      results.push({
        name: d.title, sub: d.customer, icon: 'fa-solid fa-handshake', bg: 'aw-bg-green', init: d.title[0],
        action: () => { closeModal(); setTimeout(() => openModal(d.title, <DealDetailContent dealId={d.id} />), 200); }
      });
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-[10px] px-3 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-input)' }}>
        <i className="fa-solid fa-search text-sm text-[var(--aw-text-muted)]" />
        <input className="flex-1 bg-transparent border-none py-2.5 text-[13px] text-[var(--aw-text-primary)] outline-none placeholder:text-[var(--aw-text-muted)]" placeholder="جستجو در همه بخش‌ها..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
        {query && (
          <button className="bg-transparent border-none text-[var(--aw-text-muted)] cursor-pointer text-sm" onClick={() => setQuery('')}>
            <i className="fa-solid fa-times" />
          </button>
        )}
      </div>
      <div className="mt-3">
        {results.length > 0 ? results.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-1 cursor-pointer border border-[var(--aw-border)] hover:border-[var(--aw-primary)]" style={{ background: 'var(--aw-bg-card)' }} onClick={r.action}>
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] ${r.bg}`} style={{ fontWeight: 700 }}>{r.init}</div>
            <div className="flex-1">
              <span className="text-[13px]" style={{ fontWeight: 500 }}>{r.name}</span>
              <span className="text-[11px] text-[var(--aw-text-muted)] mr-2">— {r.sub}</span>
            </div>
          </div>
        )) : query ? <div className="text-center py-8 text-[var(--aw-text-muted)] text-[13px]">نتیجه‌ای یافت نشد</div> : (
          <div className="text-center py-8 text-[var(--aw-text-muted)] text-[13px]">عبارت مورد نظر را تایپ کنید...</div>
        )}
      </div>
    </div>
  );
}

export function SubscribeContent({ agentId }: { agentId: string }) {
  const { agents, setAgents, closeModal, showToast } = useApp();
  const a = agents.find(x => x.id === agentId);
  if (!a) return null;

  const activate = () => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, locked: false, instructions: ag.instructions || 'دستورالعمل پیش‌فرض عامل ' + ag.name } : ag));
    closeModal();
    showToast(a.name + ' فعال شد!');
  };

  return (
    <div>
      <div className="text-center mb-5">
        <div className="mx-auto mb-2.5 w-16" style={{ display: 'flex', justifyContent: 'center' }}><AgentCircle agent={a} size={64} radius={999} fontSize={26} /></div>
        <h3 className="text-base">{a.name}</h3>
        <p className="text-[12px] text-[var(--aw-text-secondary)]">{a.role}</p>
      </div>
      <div className="rounded-xl p-4 mb-4 text-center border" style={{ background: 'var(--aw-primary-bg)', borderColor: 'var(--aw-primary)' }}>
        <div className="text-[24px] text-[var(--aw-primary)]" style={{ fontWeight: 800 }}>۴۹,۰۰۰</div>
        <div className="text-[12px] text-[var(--aw-text-secondary)]">تومان / ماهانه</div>
      </div>
      <ul className="list-none p-0 mb-4">
        {['پاسخ‌دهی ۲۴ ساعته', 'یکپارچه‌سازی با سیستم‌ها', 'گزارش‌گیری پیشرفته'].map(f => (
          <li key={f} className="py-1.5 text-[12px] flex items-center gap-1.5">
            <i className="fa-solid fa-check-circle text-[var(--aw-secondary)]" /> {f}
          </li>
        ))}
      </ul>
      <button className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={activate}>
        <i className="fa-solid fa-shopping-cart" /> خرید اشتراک
      </button>
    </div>
  );
}

export function CustomerDetailContent({ customerId }: { customerId: string }) {
  const { customers, setCustomers, closeModal, showToast, startCall, openChat } = useApp();
  const c = customers.find(x => x.id === customerId);
  if (!c) return null;

  const update = (field: keyof Customer, val: string) => {
    setCustomers(prev => prev.map(cu => cu.id === customerId ? { ...cu, [field]: val } : cu));
  };

  const handleDelete = () => {
    setCustomers(prev => prev.filter(cu => cu.id !== customerId));
    closeModal();
    showToast(c.name + ' حذف شد');
  };

  return (
    <div>
      <div className="text-center mb-4">
        <div className="aw-bg-cyan w-14 h-14 rounded-full flex items-center justify-center text-white text-[22px] mx-auto mb-2.5" style={{ fontWeight: 700 }}>{c.name[0]}</div>
        <h3 className="text-base">{c.name}</h3>
        <p className="text-[12px] text-[var(--aw-text-secondary)]">{STATUS_LABELS[c.status]}</p>
      </div>
      <FormGroup label="نام مخاطب"><FormInput value={c.contact} onChange={e => update('contact', e.target.value)} /></FormGroup>
      <FormGroup label="تلفن"><FormInput value={c.phone} onChange={e => update('phone', e.target.value)} /></FormGroup>
      <FormGroup label="ایمیل"><FormInput value={c.email} onChange={e => update('email', e.target.value)} /></FormGroup>
      <FormGroup label="وضعیت">
        <FormSelect value={c.status} onChange={e => update('status', e.target.value as any)} options={[{ value: 'active', label: 'فعال' }, { value: 'lead', label: 'سرنخ' }, { value: 'inactive', label: 'غیرفعال' }]} />
      </FormGroup>
      <div className="flex gap-2 mb-2">
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-eu-primary)', fontWeight: 600 }}
          onClick={() => { closeModal(); setTimeout(() => openChat(customerId, 'customer'), 200); }}>
          <i className="fa-solid fa-comment" /> چت
        </button>
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-secondary)', fontWeight: 600 }}
          onClick={() => { closeModal(); startCall(c.name, 'مشتری', 'aw-bg-cyan', c.name[0], ''); }}>
          <i className="fa-solid fa-phone" /> تماس
        </button>
      </div>
      <div className="flex gap-2 mb-2">
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { closeModal(); showToast('تغییرات ذخیره شد'); }}>
          <i className="fa-solid fa-save" /> ذخیره
        </button>
      </div>
      <button className="w-full py-2 px-5 rounded-[10px] text-[12px] cursor-pointer border border-[var(--aw-danger)] text-[var(--aw-danger)] bg-transparent" style={{ fontWeight: 600 }} onClick={handleDelete}>
        <i className="fa-solid fa-trash" /> حذف مشتری
      </button>
    </div>
  );
}

function DealDetailContent({ dealId }: { dealId: string }) {
  const { deals, setDeals, closeModal, showToast } = useApp();
  const d = deals.find(x => x.id === dealId);
  if (!d) return null;

  const update = (field: keyof Deal, val: string) => {
    setDeals(prev => prev.map(de => de.id === dealId ? { ...de, [field]: val } : de));
  };

  const handleDelete = () => {
    setDeals(prev => prev.filter(de => de.id !== dealId));
    closeModal();
    showToast('معامله حذف شد');
  };

  return (
    <div>
      <FormGroup label="عنوان"><FormInput value={d.title} onChange={e => update('title', e.target.value)} /></FormGroup>
      <FormGroup label="مشتری"><FormInput value={d.customer} onChange={e => update('customer', e.target.value)} /></FormGroup>
      <FormGroup label="ارزش"><FormInput value={d.value} onChange={e => update('value', e.target.value)} /></FormGroup>
      <FormGroup label="احتمال"><FormInput value={d.probability} onChange={e => update('probability', e.target.value)} /></FormGroup>
      <FormGroup label="مرحله">
        <FormSelect value={d.stage} onChange={e => update('stage', e.target.value as any)} options={[{ value: 'negotiation', label: 'مذاکره' }, { value: 'proposal', label: 'پیشن��اد' }, { value: 'closed', label: 'بسته شده' }]} />
      </FormGroup>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { closeModal(); showToast('تغییرات ذخیره شد'); }}>ذخیره</button>
        <button className="py-2.5 px-5 rounded-[10px] text-[13px] cursor-pointer border border-[var(--aw-danger)] text-[var(--aw-danger)] bg-transparent" style={{ fontWeight: 600 }} onClick={handleDelete}>
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  );
}

function NewChatContent() {
  const { chatTab, setChatTab, customers, setCustomers, personnel, setPersonnel, closeModal, showToast, openChat } = useApp();
  const [activeSection, setActiveSection] = useState<'add' | 'select'>('add');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const sectionTabs = chatTab === 'personnel'
    ? [
        { id: 'add' as const, label: 'افزودن پرسنل جدید', icon: 'fa-solid fa-user-plus' },
        { id: 'select' as const, label: 'انتخاب از لیست', icon: 'fa-solid fa-list' },
      ]
    : [
        { id: 'add' as const, label: 'افزودن مخاطب جدید', icon: 'fa-solid fa-user-plus' },
        { id: 'select' as const, label: 'انتخاب از لیست', icon: 'fa-solid fa-list' },
      ];

  const saveAndChat = () => {
    if (!name.trim()) return;
    if (chatTab === 'personnel') {
      const newId = 'p' + Date.now();
      const newPerson = {
        id: newId,
        name: name.trim(),
        role: role.trim() || 'کارمند',
        status: 'online' as const,
        bg: 'aw-bg-indigo',
        init: name.trim()[0],
        lastMsg: '',
        lastTime: 'الان',
        unread: 0,
        voip: phone.trim(),
      };
      setPersonnel(prev => [...prev, newPerson]);
      setChatTab('personnel');
      closeModal();
      showToast('پرسنل جدید اضافه شد');
      setTimeout(() => openChat(newId, 'personnel'), 100);
    } else {
      const newId = 'c' + Date.now();
      const newCustomer = {
        id: newId,
        name: name.trim(),
        contact: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        status: 'active' as const,
        value: '۰',
        lastContact: 'امروز',
      };
      setCustomers(prev => [...prev, newCustomer]);
      setChatTab('customers');
      closeModal();
      showToast('مخاطب جدید اضافه شد');
      setTimeout(() => openChat(newId, 'customer'), 100);
    }
  };

  const existingList = chatTab === 'personnel' ? personnel : customers;

  return (
    <div>
      {/* Section tabs */}
      <div className="flex gap-1 p-1 rounded-[10px] mb-4" style={{ background: 'var(--aw-bg-input)' }}>
        {sectionTabs.map(t => (
          <button
            key={t.id}
            className={`flex-1 py-2 text-center border-none rounded-lg text-[12px] cursor-pointer transition-all whitespace-nowrap ${
              activeSection === t.id ? 'text-white' : 'bg-transparent text-[var(--aw-text-muted)]'
            }`}
            style={activeSection === t.id ? { background: 'var(--aw-primary)', fontWeight: 600 } : { fontWeight: 600 }}
            onClick={() => setActiveSection(t.id)}
          >
            <i className={`${t.icon} ml-1 text-[10px]`} />
            {t.label}
          </button>
        ))}
      </div>

      {activeSection === 'add' ? (
        <div>
          <FormGroup label="نام">
            <FormInput placeholder="نام مخاطب را وارد کنید" value={name} onChange={e => setName(e.target.value)} />
          </FormGroup>
          {chatTab === 'personnel' && (
            <FormGroup label="سمت">
              <FormInput placeholder="سمت یا نقش" value={role} onChange={e => setRole(e.target.value)} />
            </FormGroup>
          )}
          <FormGroup label="شماره تماس">
            <FormInput placeholder="شماره تماس" value={phone} onChange={e => setPhone(e.target.value)} />
          </FormGroup>
          {chatTab !== 'personnel' && (
            <FormGroup label="ایمیل">
              <FormInput placeholder="ایمیل" value={email} onChange={e => setEmail(e.target.value)} />
            </FormGroup>
          )}
          <button
            className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--aw-primary)', fontWeight: 600 }}
            disabled={!name.trim()}
            onClick={saveAndChat}
          >
            <i className="fa-solid fa-plus ml-1.5" />
            {chatTab === 'personnel' ? 'افزودن و شروع گفتگو' : 'افزودن و شروع گفتگو'}
          </button>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto aw-scroll">
          {existingList.length === 0 && (
            <div className="text-center py-8 text-[var(--aw-text-muted)]">
              <i className="fa-solid fa-inbox text-[32px] opacity-30 block mb-3" />
              <p className="text-[13px]">لیست خالی است</p>
            </div>
          )}
          {existingList.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-[12px] cursor-pointer transition-all mb-1 border border-transparent hover:bg-[var(--aw-bg-card-hover)] hover:border-[var(--aw-primary)]"
              onClick={() => {
                closeModal();
                openChat(item.id, chatTab === 'personnel' ? 'personnel' : 'customer');
              }}
            >
              <div
                className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-white flex-shrink-0 ${item.bg || 'aw-bg-cyan'}`}
                style={{ fontWeight: 700, fontSize: 15 }}
              >
                {item.init || item.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px]" style={{ fontWeight: 600 }}>{item.name}</div>
                <div className="text-[11px] text-[var(--aw-text-muted)]">{item.role || item.contact || ''}</div>
              </div>
              <i className="fa-solid fa-comment-dots text-[var(--aw-primary)] text-sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CrmAddContent() {
  const { crmTab, customers, setCustomers, deals, setDeals, closeModal, showToast } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  // Deal fields
  const [dealTitle, setDealTitle] = useState('');
  const [dealCustomer, setDealCustomer] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [dealStage, setDealStage] = useState<'negotiation' | 'proposal' | 'closed'>('negotiation');

  const saveCustomer = () => {
    if (!name) return;
    setCustomers(prev => [...prev, { id: 'c' + Date.now(), name, contact: name, phone, email, status: crmTab === 'leads' ? 'lead' as const : 'active' as const, value: '۰', lastContact: 'امروز' }]);
    closeModal();
    showToast((crmTab === 'leads' ? 'سرنخ' : 'مشتری') + ' جدید اضافه شد');
  };

  const saveDeal = () => {
    if (!dealTitle) return;
    setDeals(prev => [...prev, { id: 'd' + Date.now(), title: dealTitle, customer: dealCustomer, value: dealValue, stage: dealStage, probability: dealStage === 'closed' ? '۱۰۰٪' : '۵۰٪' }]);
    closeModal();
    showToast('معامله جدید اضافه شد');
  };

  if (crmTab === 'deals') {
    return (
      <div>
        <FormGroup label="عنوان معامله"><FormInput placeholder="عنوان معامله" value={dealTitle} onChange={e => setDealTitle(e.target.value)} /></FormGroup>
        <FormGroup label="مشتری">
          <FormSelect value={dealCustomer} onChange={e => setDealCustomer(e.target.value)} options={[{ value: '', label: 'انتخاب مشتری...' }, ...customers.map(c => ({ value: c.name, label: c.name }))]} />
        </FormGroup>
        <FormGroup label="ارزش (ریال)"><FormInput placeholder="مبلغ" value={dealValue} onChange={e => setDealValue(e.target.value)} /></FormGroup>
        <FormGroup label="مرحله">
          <FormSelect value={dealStage} onChange={e => setDealStage(e.target.value as any)} options={[{ value: 'negotiation', label: 'مذاکره' }, { value: 'proposal', label: 'پیشنهاد' }, { value: 'closed', label: 'بسته شده' }]} />
        </FormGroup>
        <button className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={saveDeal}>ذخیره معامله</button>
      </div>
    );
  }

  return (
    <div>
      <FormGroup label="نام"><FormInput placeholder="نام را وارد کنید" value={name} onChange={e => setName(e.target.value)} /></FormGroup>
      <FormGroup label="شماره تماس"><FormInput placeholder="شماره تماس" value={phone} onChange={e => setPhone(e.target.value)} /></FormGroup>
      <FormGroup label="ایمیل"><FormInput placeholder="ایمیل" value={email} onChange={e => setEmail(e.target.value)} /></FormGroup>
      <button className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={saveCustomer}>ذخیره</button>
    </div>
  );
}

function FinDetailContent({ itemId }: { itemId: string }) {
  const { financeData, setFinanceData, closeModal, showToast } = useApp();
  const f = [...financeData.income, ...financeData.expense].find(x => x.id === itemId);
  if (!f) return null;

  const markPaid = () => {
    setFinanceData(prev => ({
      income: prev.income.map(fi => fi.id === itemId ? { ...fi, status: 'paid' as const } : fi),
      expense: prev.expense.map(fi => fi.id === itemId ? { ...fi, status: 'paid' as const } : fi),
    }));
    showToast('وضعیت به پرداخت شده تغییر یافت');
    closeModal();
  };

  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-[28px]" style={{ fontWeight: 800, color: f.status === 'paid' ? 'var(--aw-secondary)' : 'var(--aw-accent)' }}>{f.amount}</div>
        <div className="text-[12px] text-[var(--aw-text-muted)]">ریال</div>
      </div>
      <FormGroup label="شرح"><div className="w-full p-2.5 rounded-[10px] text-[13px] border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>{f.desc}</div></FormGroup>
      <FormGroup label="تاریخ"><div className="w-full p-2.5 rounded-[10px] text-[13px] border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>{f.date}</div></FormGroup>
      <FormGroup label="دسته‌بندی"><div className="w-full p-2.5 rounded-[10px] text-[13px] border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>{f.category}</div></FormGroup>
      <FormGroup label="وضعیت">
        <div className="w-full p-2.5 rounded-[10px] text-[13px] border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}>
          <span className="px-2 py-0.5 rounded-[20px] text-[10px]" style={{ background: f.status === 'paid' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: f.status === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
            {f.status === 'paid' ? 'پرداخت شده' : 'معوق'}
          </span>
        </div>
      </FormGroup>
      <div className="flex gap-2">
        {f.status === 'pending' && (
          <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-secondary)', fontWeight: 600 }} onClick={markPaid}>
            <i className="fa-solid fa-check" /> تایید پرداخت
          </button>
        )}
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={closeModal}>بستن</button>
      </div>
    </div>
  );
}

function FinAddContent({ type }: { type: 'income' | 'expense' }) {
  const { setFinanceData, closeModal, showToast } = useApp();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const save = () => {
    if (!desc || !amount) return;
    const newItem: FinanceItem = {
      id: 'f' + Date.now(),
      desc,
      amount,
      date: 'امروز',
      status: 'pending',
      category: category || (type === 'income' ? 'فروش' : 'عمومی'),
    };
    setFinanceData(prev => ({
      ...prev,
      [type]: [...prev[type], newItem],
    }));
    closeModal();
    showToast((type === 'income' ? 'درآمد' : 'هزینه') + ' جدید ثبت شد');
  };

  return (
    <div>
      <FormGroup label="شرح"><FormInput placeholder="شرح تراکنش" value={desc} onChange={e => setDesc(e.target.value)} /></FormGroup>
      <FormGroup label="مبلغ (ریال)"><FormInput placeholder="مبلغ" value={amount} onChange={e => setAmount(e.target.value)} /></FormGroup>
      <FormGroup label="دسته‌بندی"><FormInput placeholder="دسته‌بندی" value={category} onChange={e => setCategory(e.target.value)} /></FormGroup>
      <button className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={save}>ثبت</button>
    </div>
  );
}

export function AgentSettingsContent() {
  const { agents, company, openModal, closeModal } = useApp();
  const companyAgents = agents.filter(a => !a.company || a.company === company);
  return (
    <div>
      {companyAgents.map(a => (
        <div key={a.id} className="flex items-center gap-3 p-3.5 rounded-xl mb-1 cursor-pointer border border-[var(--aw-border)] hover:border-[var(--aw-primary)]" style={{ background: 'var(--aw-bg-card)' }}
          onClick={() => { closeModal(); setTimeout(() => openModal('تنظیمات: ' + a.name, <SingleAgentSettings agentId={a.id} />), 200); }}>
          <AgentCircle agent={a} size={32} radius={8} fontSize={13} />
          <span className="flex-1 text-[13px]" style={{ fontWeight: 500 }}>{a.name} — {a.role}</span>
          {a.locked && <span className="text-[10px] text-black px-2 py-0.5 rounded-md" style={{ background: 'var(--aw-accent)', fontWeight: 700 }}><i className="fa-solid fa-lock" /></span>}
          <i className="fa-solid fa-chevron-left text-[12px] text-[var(--aw-text-muted)]" />
        </div>
      ))}
    </div>
  );
}

function SingleAgentSettings({ agentId }: { agentId: string }) {
  const { agents, setAgents, closeModal, showToast, openModal } = useApp();
  const a = agents.find(x => x.id === agentId);
  if (!a) return null;

  const update = (field: string, val: any) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, [field]: val } : ag));
  };

  return (
    <div>
      <div className="text-center mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-[26px] mx-auto mb-2.5 ${a.bg}`} style={{ fontWeight: 700 }}>{a.init}</div>
        <h3 className="text-base">{a.name}</h3>
        <p className="text-[12px] text-[var(--aw-text-secondary)]">{a.role}</p>
      </div>
      <button
        onClick={() => { closeModal(); setTimeout(() => openModal('شخصی‌سازی: ' + a.name, <CustomizeAgentContent agentId={agentId} />), 200); }}
        className="w-full flex items-center gap-3 p-3 rounded-xl mb-3 cursor-pointer border-none text-right"
        style={{ background: 'linear-gradient(135deg, #22A6F015, #1E6BFF15)', border: '1px solid #22A6F044' }}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22A6F0, #1E6BFF)' }}>
          <i className="fa-solid fa-wand-magic-sparkles text-[13px] text-white" />
        </div>
        <div className="flex-1">
          <div className="text-[12px]" style={{ fontWeight: 700, color: 'var(--aw-text-primary)' }}>شخصی‌سازی ایجنت</div>
          <div className="text-[10px] text-[var(--aw-text-muted)]">عکس، جنسیت، صدا، سن، لحن، شرایط ارجاع</div>
        </div>
        <i className="fa-solid fa-chevron-left text-[11px] text-[var(--aw-text-muted)]" />
      </button>
      <FormGroup label="نام عامل"><FormInput value={a.name} onChange={e => update('name', e.target.value)} /></FormGroup>
      <FormGroup label="نقش"><FormInput value={a.role} onChange={e => update('role', e.target.value)} /></FormGroup>
      <FormGroup label="شماره داخلی VoIP"><FormInput value={a.voip} onChange={e => update('voip', e.target.value)} /></FormGroup>
      <FormGroup label="دستورالعمل‌ها (Instructions)">
        <textarea className="w-full p-2.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none resize-y min-h-[80px]" style={{ background: 'var(--aw-bg-input)' }} value={a.instructions} onChange={e => update('instructions', e.target.value)} rows={4} />
      </FormGroup>
      <FormGroup label="وضعیت">
        <FormSelect value={String(a.locked)} onChange={e => update('locked', e.target.value === 'true')} options={[{ value: 'false', label: 'فعال' }, { value: 'true', label: 'قفل (نیاز به اشتراک)' }]} />
      </FormGroup>
      <button className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { closeModal(); showToast('تنظیمات ' + a.name + ' ذخیره شد'); }}>ذخیره و بستن</button>
    </div>
  );
}

const PERSONNEL_BG_OPTIONS = ['aw-bg-sky', 'aw-bg-emerald', 'aw-bg-amber', 'aw-bg-rose', 'aw-bg-purple', 'aw-bg-cyan', 'aw-bg-pink', 'aw-bg-indigo'];

function PersonnelSettingsContent() {
  const { personnel, setPersonnel, openModal, closeModal, showToast } = useApp();
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const addNew = () => {
    const id = 'p' + Date.now();
    const newPerson: Personnel = {
      id, name: 'پرسنل جدید', role: 'نقش جدید', status: 'offline',
      bg: PERSONNEL_BG_OPTIONS[personnel.length % PERSONNEL_BG_OPTIONS.length],
      init: 'پ', lastMsg: '', lastTime: 'اکنون', unread: 0,
      voip: String(300 + personnel.length + 1),
      email: '', phone: '', permissions: ['dashboard'],
    };
    setPersonnel(prev => [...prev, newPerson]);
    showToast('پرسنل جدید اضافه شد');
    closeModal();
    setTimeout(() => openModal('تنظیمات: ' + newPerson.name, <SinglePersonnelSettings personnelId={id} />), 200);
  };

  const removePerson = (id: string, name: string) => {
    setPersonnel(prev => prev.filter(p => p.id !== id));
    setConfirmDel(null);
    showToast(`${name} حذف شد`);
  };

  return (
    <div>
      <button onClick={addNew}
        className="w-full mb-3 py-3 px-4 rounded-xl border-none text-white cursor-pointer flex items-center justify-center gap-2 text-[13px]"
        style={{ background: 'linear-gradient(135deg, var(--aw-primary), var(--aw-primary-dark))', fontWeight: 700 }}>
        <i className="fa-solid fa-user-plus text-[13px]" /> افزودن پرسنل جدید
      </button>

      {personnel.map(p => (
        <div key={p.id} className="rounded-xl mb-1.5 border border-[var(--aw-border)] hover:border-[var(--aw-primary)]" style={{ background: 'var(--aw-bg-card)' }}>
          <div className="flex items-center gap-3 p-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-[13px] ${p.bg}`} style={{ fontWeight: 700 }}>{p.init}</div>
            <div className="flex-1 min-w-0 cursor-pointer"
              onClick={() => { closeModal(); setTimeout(() => openModal('تنظیمات: ' + p.name, <SinglePersonnelSettings personnelId={p.id} />), 200); }}>
              <div className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{p.name}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">{p.role} · {toFa((p.permissions || []).length)} سطح دسترسی</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.status === 'online' ? 'var(--aw-online)' : 'var(--aw-offline)' }} />
            <button className="w-8 h-8 rounded-lg border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--aw-primary)]"
              onClick={() => { closeModal(); setTimeout(() => openModal('تنظیمات: ' + p.name, <SinglePersonnelSettings personnelId={p.id} />), 200); }}
              title="ویرایش">
              <i className="fa-solid fa-pen text-[11px]" />
            </button>
            <button className="w-8 h-8 rounded-lg border border-[var(--aw-border)] bg-transparent cursor-pointer flex items-center justify-center text-[#EF4444]"
              onClick={() => setConfirmDel(confirmDel === p.id ? null : p.id)}
              title="حذف">
              <i className="fa-solid fa-trash text-[11px]" />
            </button>
          </div>
          <AnimatePresence>
            {confirmDel === p.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="px-3 pb-3 flex items-center gap-2 border-t border-[var(--aw-border)] pt-2">
                <span className="flex-1 text-[11px] text-[var(--aw-text-secondary)]">آیا از حذف {p.name} مطمئن هستید؟</span>
                <button className="px-3 py-1.5 rounded-lg border-none text-white cursor-pointer text-[11px]" style={{ background: '#EF4444', fontWeight: 600 }}
                  onClick={() => removePerson(p.id, p.name)}>حذف</button>
                <button className="px-3 py-1.5 rounded-lg border border-[var(--aw-border)] bg-transparent cursor-pointer text-[11px] text-[var(--aw-text-secondary)]"
                  onClick={() => setConfirmDel(null)}>انصراف</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function SinglePersonnelSettings({ personnelId }: { personnelId: string }) {
  const { personnel, setPersonnel, closeModal, showToast } = useApp();
  const p = personnel.find(x => x.id === personnelId);
  if (!p) return null;

  const update = (field: string, val: any) => {
    setPersonnel(prev => prev.map(pe => pe.id === personnelId ? { ...pe, [field]: val } : pe));
  };

  return (
    <div>
      <div className="text-center mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-[26px] mx-auto mb-2.5 ${p.bg}`} style={{ fontWeight: 700 }}>{p.init}</div>
        <h3 className="text-base">{p.name}</h3>
        <p className="text-[12px] text-[var(--aw-text-secondary)]">{p.role}</p>
      </div>
      <FormGroup label="نقش"><FormInput value={p.role} onChange={e => update('role', e.target.value)} /></FormGroup>
      <FormGroup label="شماره موبایل / کد ملی"><FormInput value={p.phone || ''} onChange={e => update('phone', e.target.value)} /></FormGroup>

      {/* Access permissions */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] text-[var(--aw-text-secondary)] flex items-center gap-1.5" style={{ fontWeight: 600 }}>
            <i className="fa-solid fa-shield-halved text-[11px] text-[var(--aw-primary)]" />
            سطح دسترسی
          </label>
          <div className="flex items-center gap-1.5">
            <button className="text-[10px] px-2 py-1 rounded-md border border-[var(--aw-border)] bg-transparent cursor-pointer text-[var(--aw-text-secondary)]"
              onClick={() => update('permissions', PERSONNEL_PERMISSIONS.map(x => x.id))}>انتخاب همه</button>
            <button className="text-[10px] px-2 py-1 rounded-md border border-[var(--aw-border)] bg-transparent cursor-pointer text-[var(--aw-text-secondary)]"
              onClick={() => update('permissions', [])}>حذف همه</button>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--aw-border)] overflow-hidden" style={{ background: 'var(--aw-bg-card)' }}>
          {PERSONNEL_PERMISSIONS.map((perm, i) => {
            const checked = (p.permissions || []).includes(perm.id);
            return (
              <div key={perm.id}
                className={`flex items-center gap-3 p-3 cursor-pointer ${i < PERSONNEL_PERMISSIONS.length - 1 ? 'border-b border-[var(--aw-border)]' : ''}`}
                onClick={() => {
                  const current = p.permissions || [];
                  update('permissions', checked ? current.filter(x => x !== perm.id) : [...current, perm.id]);
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: perm.color + '20' }}>
                  <i className={`${perm.icon} text-[12px]`} style={{ color: perm.color }} />
                </div>
                <span className="flex-1 text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 500 }}>{perm.label}</span>
                <div className="w-9 h-5 rounded-full relative transition-colors" style={{ background: checked ? perm.color : 'var(--aw-border)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ [checked ? 'left' : 'right']: '2px' } as any} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-[var(--aw-text-muted)] mt-1.5 flex items-center gap-1">
          <i className="fa-solid fa-circle-info text-[9px]" />
          {toFa((p.permissions || []).length)} از {toFa(PERSONNEL_PERMISSIONS.length)} دسترسی فعال است
        </div>
      </div>

      <button className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { closeModal(); showToast('تنظیمات ' + p.name + ' ذخیره شد'); }}>ذخیره و بستن</button>
    </div>
  );
}

export function ProfileContent() {
  const { role, userProfile, euProfile, setUserProfile, setEuProfile, closeModal, showToast, agents, customers } = useApp();
  const prof = role === 'admin' ? userProfile : euProfile;
  const setProfFn = role === 'admin' ? setUserProfile : setEuProfile;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [verifyStep, setVerifyStep] = useState<0 | 1 | 2 | 3>(0); // 0=hidden, 1=phone, 2=code, 3=success
  const [verifyCode, setVerifyCode] = useState('');
  const [usernameDraft, setUsernameDraft] = useState(prof.username);

  const onAvatarPick = (file: File) => {
    if (!file.type.startsWith('image/')) { showToast('فقط فایل تصویری مجاز است'); return; }
    if (file.size > 2 * 1024 * 1024) { showToast('حجم تصویر باید کمتر از ۲ مگابایت باشد'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfFn(p => ({ ...p, avatarImage: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const removeAvatarImage = () => setProfFn(p => ({ ...p, avatarImage: undefined }));

  const startVerify = () => { setVerifyStep(1); setVerifyCode(''); };
  const sendCode = () => { setVerifyStep(2); showToast('کد تأیید به موبایل ارسال شد'); };
  const confirmCode = () => {
    if (verifyCode.replace(/[^0-9۰-۹]/g, '').length < 4) { showToast('کد ۴ رقمی را وارد کنید'); return; }
    setProfFn(p => ({ ...p, verified: true }));
    setVerifyStep(3);
    showToast('احراز هویت با موفقیت انجام شد');
  };

  return (
    <div>
      {/* Avatar with edit overlay */}
      <div className="text-center mb-4">
        <div className="relative w-24 h-24 mx-auto mb-3">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-[32px] overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--aw-primary), var(--aw-primary-dark))', fontWeight: 700 }}>
            {prof.avatarImage
              ? <img src={prof.avatarImage} alt={prof.name} className="w-full h-full object-cover" />
              : prof.avatar}
          </div>
          <button
            className="absolute bottom-0 left-0 w-8 h-8 rounded-full border-2 border-[var(--aw-bg-card)] cursor-pointer flex items-center justify-center text-white"
            style={{ background: 'var(--aw-primary)' }}
            onClick={() => fileInputRef.current?.click()}
            title="تغییر آواتار"
          >
            <i className="fa-solid fa-camera text-[12px]" />
          </button>
          {prof.avatarImage && (
            <button
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-[var(--aw-bg-card)] cursor-pointer flex items-center justify-center text-white bg-red-500"
              onClick={removeAvatarImage}
              title="حذف تصویر"
            >
              <i className="fa-solid fa-trash text-[11px]" />
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onAvatarPick(f); e.currentTarget.value = ''; }} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="text-lg">{prof.name}</div>
          {prof.verified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px]"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 700 }}>
              <i className="fa-solid fa-circle-check text-[10px]" /> احراز شده
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px]"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 700 }}>
              <i className="fa-solid fa-circle-exclamation text-[10px]" /> احراز نشده
            </span>
          )}
        </div>
        <div className="text-[12px] text-[var(--aw-text-secondary)] mt-1">{prof.role}</div>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center"><div className="text-xl text-[var(--aw-secondary)]" style={{ fontWeight: 800 }}>{toFa(agents.filter(a => !a.locked).length)}</div><div className="text-[10px] text-[var(--aw-text-muted)]">عامل فعال</div></div>
          <div className="text-center"><div className="text-xl text-[var(--aw-primary)]" style={{ fontWeight: 800 }}>{toFa(customers.length)}</div><div className="text-[10px] text-[var(--aw-text-muted)]">مشتری</div></div>
        </div>
      </div>

      {/* Verification flow */}
      {!prof.verified && (
        <div className="mb-4 rounded-[12px] border p-3"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.30)' }}>
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-shield-halved text-[14px]" style={{ color: '#EF4444' }} />
            <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>احراز هویت لازم است</span>
          </div>
          <div className="text-[11.5px] text-[var(--aw-text-secondary)] leading-6 mb-2.5">
            برای استفاده از تمامی امکانات، هویت خود را با کد پیامکی تأیید کنید.
          </div>

          {verifyStep === 0 && (
            <button className="w-full py-2 px-4 border-none rounded-[10px] text-[12px] text-white cursor-pointer"
              style={{ background: '#EF4444', fontWeight: 700 }} onClick={startVerify}>
              شروع احراز هویت
            </button>
          )}

          {verifyStep === 1 && (
            <div>
              <div className="text-[11px] text-[var(--aw-text-muted)] mb-1.5">شماره موبایل</div>
              <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-[10px] border border-[var(--aw-border)]"
                style={{ background: 'var(--aw-bg-input)' }}>
                <i className="fa-solid fa-mobile-screen text-[12px] text-[var(--aw-text-muted)]" />
                <span className="text-[13px]" style={{ fontWeight: 600 }}>{prof.phone}</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-4 border-none rounded-[10px] text-[12px] text-white cursor-pointer"
                  style={{ background: 'var(--aw-primary)', fontWeight: 700 }} onClick={sendCode}>
                  <i className="fa-solid fa-paper-plane text-[10px] ml-1" /> ارسال کد
                </button>
                <button className="px-4 rounded-[10px] border border-[var(--aw-border)] bg-transparent text-[12px] cursor-pointer text-[var(--aw-text-secondary)]"
                  onClick={() => setVerifyStep(0)}>انصراف</button>
              </div>
            </div>
          )}

          {verifyStep === 2 && (
            <div>
              <div className="text-[11px] text-[var(--aw-text-muted)] mb-1.5">کد ۴ رقمی پیامک شده را وارد کنید</div>
              <input
                className="w-full text-center tracking-[8px] py-2.5 rounded-[10px] border border-[var(--aw-border)] text-[18px] text-[var(--aw-text-primary)] outline-none mb-2"
                style={{ background: 'var(--aw-bg-input)', fontWeight: 700, letterSpacing: '8px' }}
                placeholder="----"
                maxLength={4}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/[^0-9۰-۹]/g, '').slice(0, 4))}
              />
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-4 border-none rounded-[10px] text-[12px] text-white cursor-pointer"
                  style={{ background: '#10B981', fontWeight: 700 }} onClick={confirmCode}>
                  <i className="fa-solid fa-check text-[10px] ml-1" /> تأیید کد
                </button>
                <button className="px-4 rounded-[10px] border border-[var(--aw-border)] bg-transparent text-[12px] cursor-pointer text-[var(--aw-text-secondary)]"
                  onClick={() => setVerifyStep(1)}>بازگشت</button>
              </div>
            </div>
          )}
        </div>
      )}

      {verifyStep === 3 && (
        <div className="mb-4 rounded-[12px] border p-3 flex items-center gap-2"
          style={{ background: 'rgba(16,185,129,0.10)', borderColor: 'rgba(16,185,129,0.35)' }}>
          <i className="fa-solid fa-circle-check text-[16px]" style={{ color: '#10B981' }} />
          <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>هویت شما با موفقیت احراز شد.</span>
        </div>
      )}

      {/* Read-only name */}
      <FormGroup label="نام">
        <FormInput value={prof.name} readOnly />
      </FormGroup>

      {/* Username (editable) */}
      <FormGroup label="نام کاربری">
        <FormInput
          value={usernameDraft}
          onChange={e => setUsernameDraft(e.target.value.replace(/\s+/g, '_'))}
          placeholder="مثلاً: ali_neura"
        />
      </FormGroup>

      <FormGroup label="ایمیل">
        <FormInput value={prof.email} onChange={e => setProfFn(p => ({ ...p, email: e.target.value }))} />
      </FormGroup>

      {/* Read-only phone */}
      <FormGroup label="تلفن">
        <FormInput value={prof.phone} readOnly />
      </FormGroup>

      <FormGroup label="بیوگرافی">
        <textarea className="w-full p-2.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none resize-y min-h-[80px]" style={{ background: 'var(--aw-bg-input)' }} value={prof.bio} onChange={e => setProfFn(p => ({ ...p, bio: e.target.value }))} rows={3} />
      </FormGroup>

      <button className="w-full py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer"
        style={{ background: 'var(--aw-primary)', fontWeight: 600 }}
        onClick={() => {
          const trimmed = usernameDraft.trim();
          if (!trimmed) { showToast('نام کاربری نمی‌تواند خالی باشد'); return; }
          setProfFn(p => ({ ...p, username: trimmed }));
          closeModal();
          showToast('پروفایل با موفقیت ذخیره شد');
        }}>
        ذخیره تغییرات
      </button>
    </div>
  );
}

// ========================
// AI Agent Management Content Modals
// ========================
const AGENT_MARKETPLACE = [
  { id: 'm1', name: 'منشی هوشمند', role: 'مدیریت تقویم، جلسات و تماس‌ها', price: '۱.۲M ت / ماه', icon: 'fa-solid fa-headset', color: '#3B82F6', rating: 4.9, hires: 1240 },
  { id: 'm2', name: 'بازاریاب AI', role: 'کمپین، تحلیل لید و سئو محتوا', price: '۲.۵M ت / ماه', icon: 'fa-solid fa-bullhorn', color: '#22A6F0', rating: 4.7, hires: 890 },
  { id: 'm3', name: 'تحلیلگر فروش', role: 'پیش‌بینی فروش و تحلیل قیف', price: '۱.۸M ت / ماه', icon: 'fa-solid fa-chart-line', color: '#10B981', rating: 4.8, hires: 670 },
  { id: 'm4', name: 'پشتیبان مشتری', role: 'پاسخ ۲۴ ساعته به سوالات', price: '۹۰۰K ت / ماه', icon: 'fa-solid fa-life-ring', color: '#F59E0B', rating: 4.6, hires: 2100 },
  { id: 'm5', name: 'حسابدار AI', role: 'صدور فاکتور و گزارش مالی', price: '۲.۲M ت / ماه', icon: 'fa-solid fa-calculator', color: '#8B5CF6', rating: 4.5, hires: 540 },
  { id: 'm6', name: 'تدارکات هوشمند', role: 'مدیریت موجودی و سفارش خرید', price: '۱.۵M ت / ماه', icon: 'fa-solid fa-truck-field', color: '#F97316', rating: 4.7, hires: 430 },
];

function HireAgentContent() {
  const { showToast, closeModal, agents, setAgents, company } = useApp();
  const [search, setSearch] = useState('');
  const filtered = AGENT_MARKETPLACE.filter(a => !search || a.name.includes(search) || a.role.includes(search));
  const BG_BY_COLOR: Record<string, string> = { '#3B82F6': 'aw-bg-blue', '#22A6F0': 'aw-bg-blue', '#10B981': 'aw-bg-green', '#F59E0B': 'aw-bg-orange', '#8B5CF6': 'aw-bg-purple', '#F97316': 'aw-bg-orange' };
  const TEAM_BY_MARKET: Record<string, string> = { m1: 'secretary', m2: 'marketing', m3: 'sales', m4: 'secretary', m5: 'finance', m6: 'procurement' };
  const hire = (m: typeof AGENT_MARKETPLACE[number]) => {
    const newId = `hired_${m.id}`;
    if (agents.some(a => a.id === newId)) { showToast(`${m.name} قبلاً استخدام شده`, 'info'); return; }
    const newAgent: any = {
      id: newId, name: m.name, role: m.role, gender: 'f', bg: BG_BY_COLOR[m.color] || 'aw-bg-blue',
      init: m.name.charAt(0), locked: false, instructions: 'دستورالعمل پیش‌فرض عامل ' + m.name,
      lastMsg: 'تازه استخدام شد', lastTime: 'هم‌اکنون', unread: 0, done: 0, pending: 0,
      voip: String(200 + agents.length), company, team: TEAM_BY_MARKET[m.id] || 'secretary',
    };
    setAgents(prev => [...prev, newAgent]);
    showToast(`${m.name} با موفقیت استخدام شد ✅`, 'success');
    closeModal();
  };
  return (
    <div>
      <div className="p-3 rounded-xl mb-3 flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg, #22A6F022, #1E6BFF22)', border: '1px solid #22A6F044' }}>
        <i className="fa-solid fa-store text-[18px]" style={{ color: '#22A6F0' }} />
        <div className="flex-1">
          <div className="text-[12px]" style={{ fontWeight: 700 }}>مارکت‌پلیس ایجنت‌های Neura</div>
          <div className="text-[10px] text-[var(--aw-text-muted)]">عامل هوشمند مناسب کسب‌وکار خود را انتخاب و استخدام کنید</div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: 'var(--aw-bg-input)', border: '1px solid var(--aw-border)' }}>
        <i className="fa-solid fa-magnifying-glass text-[11px] text-[var(--aw-text-muted)]" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو در ایجنت‌ها..." className="flex-1 bg-transparent border-none outline-none text-[12px] text-[var(--aw-text-primary)]" />
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map(a => (
          <div key={a.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}cc)` }}>
              <i className={`${a.icon} text-[18px]`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px]" style={{ fontWeight: 700 }}>{a.name}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)] mb-1">{a.role}</div>
              <div className="flex items-center gap-2 text-[10px]">
                <span style={{ color: '#FFD700' }}><i className="fa-solid fa-star text-[9px] ml-0.5" />{a.rating}</span>
                <span className="text-[var(--aw-text-muted)]">·</span>
                <span className="text-[var(--aw-text-muted)]">{a.hires.toLocaleString('fa-IR')} استخدام</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px]" style={{ color: a.color, fontWeight: 700 }}>{a.price}</span>
              <button className="px-3 py-1 rounded-md border-none cursor-pointer text-[10px] text-white" style={{ background: a.color, fontWeight: 600 }} onClick={() => hire(a)}>استخدام</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomizeAgentContent({ agentId }: { agentId?: string } = {}) {
  const { agents, setAgents, company, showToast, closeModal } = useApp();
  const companyAgents = agents.filter(a => !a.company || a.company === company);
  const [selected, setSelected] = useState(agentId || companyAgents[0]?.id || '');
  const a = companyAgents.find(x => x.id === selected);
  const [tone, setTone] = useState('صمیمی');
  const [lang, setLang] = useState('فارسی');
  const [gender, setGender] = useState('زن');
  const VOICES_BY_GENDER: Record<string, string[]> = {
    'زن': ['زن - گرم', 'زن - رسمی', 'زن - جوان'],
    'مرد': ['مرد - عمیق', 'مرد - دوستانه', 'مرد - جوان'],
  };
  const [voice, setVoice] = useState(VOICES_BY_GENDER['زن'][0]);
  const onGenderChange = (g: string) => {
    setGender(g);
    setVoice(VOICES_BY_GENDER[g][0]);
    showToast(`صدا به «${VOICES_BY_GENDER[g][0]}» تنظیم شد`, 'info');
  };
  const [age, setAge] = useState('جوان');
  const FEMALE_AVATARS = ['w1','w2','w3','w4','w5','w6','w7','w8','w9','w10','w11','w12','w13'].map(n => `src/avatars/${n}.png`);
  const MALE_AVATARS = ['m1','m2','m3','m4','m5','m6','m7'].map(n => `src/avatars/${n}.png`);
  const avatarList = gender === 'مرد' ? MALE_AVATARS : FEMALE_AVATARS;
  const [avatarPreset, setAvatarPreset] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [welcome, setWelcome] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  // Load the selected agent's saved settings whenever the agent changes
  useEffect(() => {
    if (!a) return;
    setGender(a.gender === 'm' ? 'مرد' : 'زن');
    setTone(a.tone ?? 'صمیمی');
    setLang(a.lang ?? 'فارسی');
    setAge(a.age ?? 'جوان');
    setVoice(a.voice ?? VOICES_BY_GENDER[a.gender === 'm' ? 'مرد' : 'زن'][0]);
    setAvatarPreset(a.avatar ?? null);
    setWelcome(a.welcomeMsg ?? `سلام! من ${a.name} هستم. چطور می‌تونم کمکتون کنم؟`);
    setAgentName(a.name);
    setAgentRole(a.role);
  }, [selected]);
  const [handoff, setHandoff] = useState<Record<string, boolean>>({
    angry: true,
    complex: true,
    finance: true,
    legal: false,
    userRequest: true,
    repeat: false,
  });
  const HANDOFF_RULES = [
    { id: 'angry', label: 'تعامل عصبانی یا ناراضی', icon: 'fa-solid fa-face-angry', color: '#EF4444' },
    { id: 'complex', label: 'سوال خارج از دانش ایجنت', icon: 'fa-solid fa-circle-question', color: '#F59E0B' },
    { id: 'finance', label: 'مطرح شدن موضوعات مالی', icon: 'fa-solid fa-sack-dollar', color: '#22A6F0' },
    { id: 'legal', label: 'موضوعات حقوقی و قراردادی', icon: 'fa-solid fa-gavel', color: '#1E6BFF' },
    { id: 'userRequest', label: 'درخواست طرف مقابل برای صحبت با انسان', icon: 'fa-solid fa-hand', color: '#10B981' },
    { id: 'repeat', label: 'تکرار سوال بیش از ۳ بار', icon: 'fa-solid fa-repeat', color: '#3B82F6' },
  ];
  return (
    <div>
      {!agentId && (
        <FormGroup label="انتخاب ایجنت">
          <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full py-2.5 px-3.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none" style={{ background: 'var(--aw-bg-input)' }}>
            {companyAgents.map(ag => <option key={ag.id} value={ag.id}>{ag.name} — {ag.role}</option>)}
          </select>
        </FormGroup>
      )}
      {a && (
        <>
          <div className="p-3 rounded-xl mb-3 flex items-center gap-3" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
            <div className="relative">
              {avatarPreset
                ? <div className="w-14 h-14 rounded-full overflow-hidden" style={{ border: '2px solid var(--aw-border)' }}><img src={avatarPreset} alt="" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center 18%' }} draggable={false} /></div>
                : <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-[20px] ${a.bg}`} style={{ fontWeight: 700 }}>{a.init}</div>}
              <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--aw-primary)', border: '2px solid var(--aw-bg-card)' }}>
                <i className="fa-solid fa-camera text-[9px] text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[13px]" style={{ fontWeight: 700 }}>{agentName || a.name}</div>
              <div className="text-[11px] text-[var(--aw-text-muted)]">{agentRole || a.role}</div>
            </div>
          </div>
          <FormGroup label="نام و نقش ایجنت">
            <div className="flex flex-col gap-2">
              <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="نام ایجنت" className="w-full py-2.5 px-3.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none" style={{ background: 'var(--aw-bg-input)' }} />
              <input value={agentRole} onChange={e => setAgentRole(e.target.value)} placeholder="نقش ایجنت (مثلاً عامل فروش)" className="w-full py-2.5 px-3.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none" style={{ background: 'var(--aw-bg-input)' }} />
            </div>
          </FormGroup>
          <FormGroup label="تغییر عکس پروفایل">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => showToast('انتخاب از گالری', 'info')} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[10px] border cursor-pointer" style={{ background: 'var(--aw-bg-card)', borderColor: 'var(--aw-border)', color: 'var(--aw-text-primary)' }}>
                <i className="fa-solid fa-images text-[14px]" style={{ color: 'var(--aw-primary)' }} />
                <span className="text-[11px]" style={{ fontWeight: 600 }}>گالری</span>
              </button>
              <button onClick={() => showToast('باز کردن دوربین', 'info')} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[10px] border cursor-pointer" style={{ background: 'var(--aw-bg-card)', borderColor: 'var(--aw-border)', color: 'var(--aw-text-primary)' }}>
                <i className="fa-solid fa-camera-retro text-[14px]" style={{ color: 'var(--aw-primary)' }} />
                <span className="text-[11px]" style={{ fontWeight: 600 }}>دوربین</span>
              </button>
              <button onClick={() => setShowAvatarPicker(v => !v)} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[10px] border cursor-pointer" style={{ background: showAvatarPicker ? 'var(--aw-primary)' : 'var(--aw-bg-card)', borderColor: showAvatarPicker ? 'var(--aw-primary)' : 'var(--aw-border)', color: showAvatarPicker ? '#fff' : 'var(--aw-text-primary)' }}>
                <i className="fa-solid fa-user-astronaut text-[14px]" style={{ color: showAvatarPicker ? '#fff' : 'var(--aw-primary)' }} />
                <span className="text-[11px]" style={{ fontWeight: 600 }}>آواتار</span>
              </button>
            </div>
            {showAvatarPicker && (
              <div className="mt-2 p-2.5 rounded-xl" style={{ background: 'var(--aw-bg-input)', border: '1px solid var(--aw-border)' }}>
                <div className="flex gap-1.5 mb-2.5">
                  {[{ v: 'زن', i: 'fa-solid fa-venus' }, { v: 'مرد', i: 'fa-solid fa-mars' }].map(g => (
                    <button key={g.v} onClick={() => onGenderChange(g.v)} className="flex-1 flex items-center justify-center gap-1.5 text-[11px] py-1.5 rounded-lg border-none cursor-pointer" style={gender === g.v ? { background: 'var(--aw-primary)', color: '#fff', fontWeight: 700 } : { background: 'var(--aw-bg-card)', color: 'var(--aw-text-secondary)', border: '1px solid var(--aw-border)' }}>
                      <i className={`${g.i} text-[10px]`} />{g.v === 'زن' ? 'خانم' : 'آقا'}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {avatarList.map(src => (
                    <button key={src} onClick={() => { setAvatarPreset(src); showToast('آواتار انتخاب شد', 'success'); }} className="w-full aspect-square rounded-full overflow-hidden cursor-pointer p-0" style={{ border: avatarPreset === src ? '2.5px solid var(--aw-primary)' : '2px solid var(--aw-border)', boxShadow: avatarPreset === src ? '0 0 0 3px var(--aw-primary-bg)' : 'none', background: 'var(--aw-bg-card)' }}>
                      <img src={src} alt="" className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center 18%' }} draggable={false} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </FormGroup>
          <FormGroup label="جنسیت ایجنت (تعیین صدا)">
            <div className="flex gap-1.5 flex-wrap">
              {[{ v: 'زن', i: 'fa-solid fa-venus' }, { v: 'مرد', i: 'fa-solid fa-mars' }].map(g => (
                <button key={g.v} onClick={() => onGenderChange(g.v)} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border-none cursor-pointer" style={gender === g.v ? { background: 'var(--aw-primary)', color: '#fff', fontWeight: 600 } : { background: 'var(--aw-bg-card)', color: 'var(--aw-text-secondary)', border: '1px solid var(--aw-border)' }}>
                  <i className={`${g.i} text-[10px]`} />{g.v}
                </button>
              ))}
            </div>
            <div className="mt-2 p-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--aw-bg-input)', border: '1px solid var(--aw-border)' }}>
              <i className="fa-solid fa-volume-high text-[11px]" style={{ color: 'var(--aw-primary)' }} />
              <span className="text-[10px] text-[var(--aw-text-secondary)]">صدای فعلی:</span>
              <span className="text-[11px]" style={{ fontWeight: 700, color: 'var(--aw-primary)' }}>{voice}</span>
              <button onClick={() => showToast('پخش نمونه صدا', 'info')} className="mr-auto px-2 py-0.5 rounded-md border-none cursor-pointer text-[10px] text-white" style={{ background: 'var(--aw-primary)', fontWeight: 600 }}>
                <i className="fa-solid fa-play text-[9px] ml-1" />نمونه
              </button>
            </div>
          </FormGroup>
          <FormGroup label="سن و سال">
            <div className="flex gap-1.5 flex-wrap">
              {['جوان', 'میانسال', 'مسن'].map(s => (
                <button key={s} onClick={() => setAge(s)} className="text-[11px] px-3 py-1.5 rounded-full border-none cursor-pointer" style={age === s ? { background: 'var(--aw-primary)', color: '#fff', fontWeight: 600 } : { background: 'var(--aw-bg-card)', color: 'var(--aw-text-secondary)', border: '1px solid var(--aw-border)' }}>{s}</button>
              ))}
            </div>
          </FormGroup>
          <FormGroup label="لحن گفتگو">
            <div className="flex gap-1.5 flex-wrap">
              {['محاوره‌ای کنترل‌شده', 'صمیمی', 'رسمی'].map(t => (
                <button key={t} onClick={() => setTone(t)} className="text-[11px] px-3 py-1.5 rounded-full border-none cursor-pointer" style={tone === t ? { background: 'var(--aw-primary)', color: '#fff', fontWeight: 600 } : { background: 'var(--aw-bg-card)', color: 'var(--aw-text-secondary)', border: '1px solid var(--aw-border)' }}>{t}</button>
              ))}
            </div>
          </FormGroup>
          <FormGroup label="زبان">
            <div className="flex gap-1.5 flex-wrap">
              {['فارسی', 'انگلیسی', 'عربی', 'دو زبانه'].map(l => (
                <button key={l} onClick={() => setLang(l)} className="text-[11px] px-3 py-1.5 rounded-full border-none cursor-pointer" style={lang === l ? { background: 'var(--aw-primary)', color: '#fff', fontWeight: 600 } : { background: 'var(--aw-bg-card)', color: 'var(--aw-text-secondary)', border: '1px solid var(--aw-border)' }}>{l}</button>
              ))}
            </div>
          </FormGroup>
          <FormGroup label={`صدای ایجنت (${gender})`}>
            <div className="flex gap-1.5 flex-wrap">
              {VOICES_BY_GENDER[gender].map(v => (
                <button key={v} onClick={() => setVoice(v)} className="text-[11px] px-3 py-1.5 rounded-full border-none cursor-pointer" style={voice === v ? { background: 'var(--aw-primary)', color: '#fff', fontWeight: 600 } : { background: 'var(--aw-bg-card)', color: 'var(--aw-text-secondary)', border: '1px solid var(--aw-border)' }}>{v}</button>
              ))}
            </div>
          </FormGroup>
          <FormGroup label="پیام خوش‌آمد">
            <textarea value={welcome} onChange={e => setWelcome(e.target.value)} rows={3} className="w-full p-2.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none resize-y" style={{ background: 'var(--aw-bg-input)' }} />
          </FormGroup>
          <FormGroup label="شرایط ارجاع به اپراتور انسانی">
            <div className="p-2.5 rounded-xl mb-2 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #22A6F015, #1E6BFF15)', border: '1px solid #22A6F033' }}>
              <i className="fa-solid fa-headset text-[12px]" style={{ color: '#22A6F0' }} />
              <span className="text-[10px] text-[var(--aw-text-secondary)]">در صورت فعال بودن، گفتگو به‌صورت خودکار به اپراتور انسانی منتقل می‌شود</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {HANDOFF_RULES.map(r => (
                <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${r.color}1A` }}>
                    <i className={`${r.icon} text-[12px]`} style={{ color: r.color }} />
                  </div>
                  <span className="flex-1 text-[12px]" style={{ fontWeight: 600 }}>{r.label}</span>
                  <button onClick={() => setHandoff(prev => ({ ...prev, [r.id]: !prev[r.id] }))} className="relative w-9 h-5 rounded-full border-none cursor-pointer transition-all" style={{ background: handoff[r.id] ? '#10B981' : 'var(--aw-bg-input)' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: '#fff', [handoff[r.id] ? 'left' : 'right']: 2 }} />
                  </button>
                </div>
              ))}
            </div>
          </FormGroup>
        </>
      )}
      <button className="w-full py-2.5 rounded-[10px] border-none text-white cursor-pointer text-[13px]" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => {
        if (a) {
          setAgents(prev => prev.map(ag => ag.id === a.id ? {
            ...ag,
            name: agentName.trim() || ag.name,
            role: agentRole.trim() || ag.role,
            init: (agentName.trim() || ag.name).charAt(0),
            gender: gender === 'مرد' ? 'm' : 'f',
            tone, lang, age, voice,
            avatar: avatarPreset ?? undefined,
            welcomeMsg: welcome,
          } : ag));
        }
        showToast('شخصی‌سازی ذخیره شد', 'success');
        closeModal();
      }}>ذخیره تنظیمات</button>
    </div>
  );
}

function PermissionsContent() {
  const { agents, company, showToast, closeModal } = useApp();
  const companyAgents = agents.filter(a => !a.company || a.company === company);
  const PERMISSIONS = [
    { id: 'chat', label: 'گفتگو با مشتری', icon: 'fa-solid fa-comments' },
    { id: 'call', label: 'تماس صوتی/تصویری', icon: 'fa-solid fa-phone' },
    { id: 'invoice', label: 'صدور فاکتور', icon: 'fa-solid fa-file-invoice' },
    { id: 'refund', label: 'تایید مرجوعی', icon: 'fa-solid fa-rotate-left' },
    { id: 'discount', label: 'اعمال تخفیف', icon: 'fa-solid fa-tag' },
    { id: 'data', label: 'دسترسی به داده مشتریان', icon: 'fa-solid fa-database' },
    { id: 'finance', label: 'مشاهده گزارش مالی', icon: 'fa-solid fa-coins' },
  ];
  const [perms, setPerms] = useState<Record<string, boolean>>(Object.fromEntries(PERMISSIONS.map(p => [p.id, true])));
  return (
    <div>
      <div className="p-3 rounded-xl mb-3" style={{ background: '#F59E0B15', border: '1px solid #F59E0B33' }}>
        <div className="text-[11px] flex items-center gap-1.5" style={{ color: '#F59E0B', fontWeight: 600 }}>
          <i className="fa-solid fa-shield-halved" />هر تغییر بلافاصله روی همه ایجنت‌ها اعمال می‌شود
        </div>
      </div>
      <div className="text-[11px] text-[var(--aw-text-muted)] mb-2">{companyAgents.length.toLocaleString('fa-IR')} ایجنت فعال در سازمان شما</div>
      <div className="flex flex-col gap-1.5">
        {PERMISSIONS.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--aw-bg-input)' }}>
              <i className={`${p.icon} text-[13px]`} style={{ color: 'var(--aw-primary)' }} />
            </div>
            <span className="flex-1 text-[12px]" style={{ fontWeight: 600 }}>{p.label}</span>
            <button onClick={() => setPerms(prev => ({ ...prev, [p.id]: !prev[p.id] }))} className="relative w-10 h-5 rounded-full border-none cursor-pointer transition-all" style={{ background: perms[p.id] ? '#10B981' : 'var(--aw-bg-input)' }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: '#fff', [perms[p.id] ? 'left' : 'right']: 2 }} />
            </button>
          </div>
        ))}
      </div>
      <button className="w-full py-2.5 rounded-[10px] border-none text-white cursor-pointer text-[13px] mt-4" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { showToast('دسترسی‌ها به‌روزرسانی شد', 'success'); closeModal(); }}>اعمال تغییرات</button>
    </div>
  );
}

function WorkflowContent() {
  const { showToast, closeModal } = useApp();
  const [workflows, setWorkflows] = useState([
    { id: 'w1', name: 'مشتری جدید → معرفی محصول', trigger: 'ثبت‌نام مشتری', steps: 4, active: true, color: '#10B981' },
    { id: 'w2', name: 'سفارش لغو شد → تماس پیگیری', trigger: 'لغو سفارش', steps: 3, active: true, color: '#F59E0B' },
    { id: 'w3', name: 'مشتری غیرفعال ۳۰ روز → کد تخفیف', trigger: 'عدم فعالیت', steps: 2, active: false, color: '#22A6F0' },
    { id: 'w4', name: 'فاکتور پرداخت شد → ارسال رسید + امتیاز', trigger: 'پرداخت موفق', steps: 5, active: true, color: '#3B82F6' },
  ]);
  return (
    <div>
      <div className="p-3 rounded-xl mb-3 flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg, #3B82F622, #1E40AF22)', border: '1px solid #3B82F644' }}>
        <i className="fa-solid fa-diagram-project text-[16px]" style={{ color: '#3B82F6' }} />
        <div className="flex-1">
          <div className="text-[12px]" style={{ fontWeight: 700 }}>ورک‌فلوهای خودکار</div>
          <div className="text-[10px] text-[var(--aw-text-muted)]">اتوماسیون فرآیندها با ترکیب تریگر و اکشن</div>
        </div>
        <button className="px-2.5 py-1 rounded-md border-none cursor-pointer text-[10px] text-white" style={{ background: '#3B82F6', fontWeight: 600 }} onClick={() => showToast('ساخت ورک‌فلو جدید', 'info')}>+ جدید</button>
      </div>
      <div className="flex flex-col gap-2">
        {workflows.map(w => (
          <div key={w.id} className="p-3 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: w.active ? '#10B981' : '#6B7280' }} />
              <span className="text-[12px] flex-1" style={{ fontWeight: 700 }}>{w.name}</span>
              <button onClick={() => setWorkflows(prev => prev.map(x => x.id === w.id ? { ...x, active: !x.active } : x))} className="relative w-9 h-5 rounded-full border-none cursor-pointer" style={{ background: w.active ? '#10B981' : 'var(--aw-bg-input)' }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full" style={{ background: '#fff', [w.active ? 'left' : 'right']: 2 }} />
              </button>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--aw-text-muted)]">
              <span><i className="fa-solid fa-bolt text-[9px] ml-1" style={{ color: w.color }} />تریگر: {w.trigger}</span>
              <span><i className="fa-solid fa-list-ol text-[9px] ml-1" />{w.steps.toLocaleString('fa-IR')} مرحله</span>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-2.5 rounded-[10px] border-none text-white cursor-pointer text-[13px] mt-4" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { showToast('تنظیمات ورک‌فلو ذخیره شد', 'success'); closeModal(); }}>ذخیره</button>
    </div>
  );
}

function ToggleAgentContent() {
  const { agents, company, showToast } = useApp();
  const companyAgents = agents.filter(a => !a.company || a.company === company);
  const [states, setStates] = useState<Record<string, boolean>>(Object.fromEntries(companyAgents.map(a => [a.id, !a.locked])));
  const activeCount = Object.values(states).filter(Boolean).length;
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-3 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #10B98122, transparent)', border: '1px solid #10B98144' }}>
          <div className="text-[18px]" style={{ color: '#10B981', fontWeight: 700 }}>{activeCount.toLocaleString('fa-IR')}</div>
          <div className="text-[10px] text-[var(--aw-text-muted)]">فعال</div>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #6B728022, transparent)', border: '1px solid #6B728044' }}>
          <div className="text-[18px]" style={{ color: '#6B7280', fontWeight: 700 }}>{(companyAgents.length - activeCount).toLocaleString('fa-IR')}</div>
          <div className="text-[10px] text-[var(--aw-text-muted)]">غیرفعال</div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {companyAgents.map(a => (
          <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] ${a.bg}`} style={{ fontWeight: 700, opacity: states[a.id] ? 1 : 0.4 }}>{a.init}</div>
            <div className="flex-1">
              <div className="text-[12px]" style={{ fontWeight: 700, opacity: states[a.id] ? 1 : 0.5 }}>{a.name}</div>
              <div className="text-[10px] text-[var(--aw-text-muted)]">{a.role}</div>
            </div>
            <button onClick={() => { setStates(prev => ({ ...prev, [a.id]: !prev[a.id] })); showToast(`${a.name} ${states[a.id] ? 'غیرفعال' : 'فعال'} شد`, 'info'); }} className="relative w-10 h-5 rounded-full border-none cursor-pointer" style={{ background: states[a.id] ? '#10B981' : 'var(--aw-bg-input)' }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full" style={{ background: '#fff', [states[a.id] ? 'left' : 'right']: 2 }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiSettingsContent() {
  const { showToast, closeModal } = useApp();
  const [kpis, setKpis] = useState([
    { id: 'k1', name: 'تعداد گفتگوی روزانه', target: 50, unit: 'گفتگو', icon: 'fa-solid fa-comments', color: '#3B82F6' },
    { id: 'k2', name: 'نرخ تبدیل (Conversion)', target: 15, unit: '٪', icon: 'fa-solid fa-percent', color: '#10B981' },
    { id: 'k3', name: 'میانگین زمان پاسخ', target: 30, unit: 'ثانیه', icon: 'fa-solid fa-stopwatch', color: '#F59E0B' },
    { id: 'k4', name: 'رضایت مشتری (CSAT)', target: 90, unit: '٪', icon: 'fa-solid fa-face-smile', color: '#22A6F0' },
    { id: 'k5', name: 'حل تیکت در نوبت اول', target: 75, unit: '٪', icon: 'fa-solid fa-check-double', color: '#8B5CF6' },
  ]);
  return (
    <div>
      <div className="p-3 rounded-xl mb-3" style={{ background: 'linear-gradient(135deg, #22A6F022, #1E6BFF22)', border: '1px solid #22A6F044' }}>
        <div className="text-[12px]" style={{ fontWeight: 700 }}><i className="fa-solid fa-gauge-high ml-1.5" />شاخص‌های کلیدی عملکرد (KPI)</div>
        <div className="text-[10px] text-[var(--aw-text-muted)] mt-1">هدف هر شاخص را تعیین کنید تا AI عملکرد ایجنت‌ها را تحلیل کند</div>
      </div>
      <div className="flex flex-col gap-2">
        {kpis.map(k => (
          <div key={k.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--aw-bg-card)', border: '1px solid var(--aw-border)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${k.color}22` }}>
              <i className={`${k.icon} text-[14px]`} style={{ color: k.color }} />
            </div>
            <div className="flex-1">
              <div className="text-[12px] mb-1" style={{ fontWeight: 600 }}>{k.name}</div>
              <div className="flex items-center gap-1.5">
                <input type="number" value={k.target} onChange={e => setKpis(prev => prev.map(x => x.id === k.id ? { ...x, target: Number(e.target.value) } : x))} className="w-20 py-1 px-2 rounded-md border text-[11px] text-[var(--aw-text-primary)] outline-none" style={{ background: 'var(--aw-bg-input)', borderColor: 'var(--aw-border)' }} />
                <span className="text-[10px] text-[var(--aw-text-muted)]">{k.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-2.5 rounded-[10px] border-none text-white cursor-pointer text-[13px] mt-4" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { showToast('اهداف KPI ذخیره شد', 'success'); closeModal(); }}>ذخیره اهداف</button>
    </div>
  );
}

function PlansManagementContent() {
  const { showToast, closeModal } = useApp();
  const PLANS = [
    { id: 'p1', name: 'استارتر', price: '۹۰۰K', period: 'ماهانه', color: '#3B82F6', features: ['۲ ایجنت فعال', '۵۰۰ گفتگو در ماه', 'گزارش پایه', 'پشتیبانی ایمیلی'], current: false },
    { id: 'p2', name: 'حرفه‌ای', price: '۲.۵M', period: 'ماهانه', color: '#10B981', features: ['۱۰ ایجنت فعال', 'گفتگوی نامحدود', 'تحلیل پیشرفته AI', 'API + Webhook', 'پشتیبانی ۲۴/۷'], current: true, badge: 'پلن فعلی' },
    { id: 'p3', name: 'سازمانی', price: '۸M', period: 'ماهانه', color: '#FFD700', features: ['ایجنت نامحدود', 'مدل اختصاصی', 'SLA ۹۹.۹٪', 'استقرار اختصاصی', 'مدیر حساب اختصاصی'], current: false, badge: 'محبوب‌ترین' },
  ];
  return (
    <div>
      <div className="p-3 rounded-xl mb-3 flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg, #FFD70022, #F59E0B22)', border: '1px solid #FFD70044' }}>
        <i className="fa-solid fa-crown text-[18px]" style={{ color: '#FFD700' }} />
        <div className="flex-1">
          <div className="text-[12px]" style={{ fontWeight: 700 }}>پلن فعلی: حرفه‌ای</div>
          <div className="text-[10px] text-[var(--aw-text-muted)]">تمدید بعدی: ۱۴۰۴/۱۲/۲۸ — ۲.۵M ت</div>
        </div>
        <button className="px-2.5 py-1 rounded-md border-none cursor-pointer text-[10px]" style={{ background: '#FFD70022', color: '#F59E0B', fontWeight: 600 }} onClick={() => showToast('پلن تمدید شد', 'success')}>تمدید</button>
      </div>
      <div className="flex flex-col gap-2.5">
        {PLANS.map(p => (
          <div key={p.id} className="p-3 rounded-xl" style={{ background: 'var(--aw-bg-card)', border: p.current ? `2px solid ${p.color}` : '1px solid var(--aw-border)', position: 'relative' }}>
            {p.badge && <span className="absolute -top-2 right-3 text-[9px] px-2 py-0.5 rounded-md text-white" style={{ background: p.color, fontWeight: 700 }}>{p.badge}</span>}
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[14px]" style={{ color: p.color, fontWeight: 700 }}>{p.name}</div>
                <div className="text-[10px] text-[var(--aw-text-muted)]">{p.period}</div>
              </div>
              <div className="text-left">
                <div className="text-[18px]" style={{ fontWeight: 700 }}>{p.price}<span className="text-[10px] text-[var(--aw-text-muted)] mr-1">ت</span></div>
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-2.5">
              {p.features.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--aw-text-secondary)]">
                  <i className="fa-solid fa-check text-[9px]" style={{ color: p.color }} />{f}
                </div>
              ))}
            </div>
            <button disabled={p.current} className="w-full py-2 rounded-lg border-none cursor-pointer text-[11px]" style={p.current ? { background: 'var(--aw-bg-input)', color: 'var(--aw-text-muted)', fontWeight: 600 } : { background: p.color, color: '#fff', fontWeight: 700 }} onClick={() => { showToast(`ارتقا به پلن ${p.name}`, 'success'); closeModal(); }}>
              {p.current ? 'پلن فعلی شما' : 'ارتقا به این پلن'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppSettingsContent() {
  const { showToast, closeModal, theme, setTheme, agents, company, defaultAgent, setDefaultAgent } = useApp();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const companyAgents = agents.filter(a => !a.company || a.company === company);

  const themeOptions: { id: 'dark' | 'light' | 'bw' | 'glass'; icon: string; label: string }[] = [
    { id: 'glass', icon: 'fa-solid fa-sun', label: 'روشن' },
    { id: 'dark', icon: 'fa-solid fa-moon', label: 'تیره' },
    { id: 'bw', icon: 'fa-solid fa-circle-half-stroke', label: 'سیاه‌سفید' },
  ];

  const settingsItems = [
    { icon: 'fa-solid fa-language', label: 'زبان', desc: 'فارسی', toggle: false },
    { icon: 'fa-solid fa-bell', label: 'اعلان‌ها', desc: notifEnabled ? 'فعال' : 'غیرفعال', toggle: true, checked: notifEnabled, onChange: () => { setNotifEnabled(!notifEnabled); showToast(!notifEnabled ? 'اعلان‌ها فعال شد' : 'اعلان‌ها غیرفعال شد'); } },
    { icon: 'fa-solid fa-volume-up', label: 'صدای اعلان', desc: soundEnabled ? 'فعال' : 'غیرفعال', toggle: true, checked: soundEnabled, onChange: () => { setSoundEnabled(!soundEnabled); showToast(!soundEnabled ? 'صدا فعال شد' : 'صدا غیرفعال شد'); } },
    { icon: 'fa-solid fa-database', label: 'پاک‌سازی کش', desc: 'پاک کردن داده‌های موقت', toggle: false, onClick: () => { showToast('کش پاک‌سازی شد'); closeModal(); } },
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
                  ? 'border-[var(--aw-primary)] text-[var(--aw-primary)]'
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

      {/* Default Agent Selector */}
      <div className="mb-4">
        <div className="text-[12px] text-[var(--aw-text-muted)] mb-2 px-1" style={{ fontWeight: 600 }}>عامل پیش‌فرض تماس</div>
        <div className="flex flex-col gap-1.5">
          {companyAgents.map(a => {
            const isSelected = defaultAgent === a.id || (!defaultAgent && a === companyAgents[0]);
            return (
              <button
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[var(--aw-primary)] text-[var(--aw-text-primary)]'
                    : 'border-[var(--aw-border)] text-[var(--aw-text-secondary)]'
                }`}
                style={{
                  background: isSelected ? 'var(--aw-primary-bg)' : 'var(--aw-bg-card)',
                  fontWeight: isSelected ? 700 : 500,
                }}
                onClick={() => {
                  setDefaultAgent(a.id);
                  showToast('عامل پیش‌فرض: ' + a.name);
                }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] ${a.bg}`} style={{ fontWeight: 700 }}>{a.init}</div>
                <div className="flex-1 text-right">
                  <div className="text-[13px]">{a.name}</div>
                  <div className="text-[10px] text-[var(--aw-text-muted)]">{a.role}</div>
                </div>
                {isSelected && <i className="fa-solid fa-check-circle text-[var(--aw-primary)]" />}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-[var(--aw-text-muted)] mt-1.5 px-1">
          <i className="fa-solid fa-info-circle ml-1" />
          با زدن دکمه میکروفون، تماس مستقیم با این عامل برقرار می‌شود
        </div>
      </div>

      {/* Other settings */}
      {settingsItems.map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl mb-1.5 border border-[var(--aw-border)]" style={{ background: 'var(--aw-bg-card)' }}
          onClick={item.onClick}>
          <i className={`${item.icon} text-base w-5 text-center text-[var(--aw-primary)]`} />
          <div className="flex-1">
            <div className="text-[13px]" style={{ fontWeight: 500 }}>{item.label}</div>
            <div className="text-[11px] text-[var(--aw-text-muted)]">{item.desc}</div>
          </div>
          {item.toggle && (
            <button
              className="w-11 h-6 rounded-full border-none cursor-pointer transition-all flex items-center px-0.5"
              style={{ background: item.checked ? 'var(--aw-primary)' : 'var(--aw-bg-input)' }}
              onClick={(e) => { e.stopPropagation(); item.onChange?.(); }}
            >
              <div className="w-5 h-5 rounded-full bg-white transition-all" style={{ transform: item.checked ? 'translateX(0)' : 'translateX(20px)' }} />
            </button>
          )}
          {!item.toggle && item.onClick && (
            <i className="fa-solid fa-chevron-left text-[12px] text-[var(--aw-text-muted)]" />
          )}
        </div>
      ))}
    </div>
  );
}

function AboutContent() {
  return (
    <div className="text-center">
      <img
        src="src/assets/neura-logo-blue.png"
        alt="Neura"
        className="h-14 w-auto object-contain mx-auto mb-4"
        style={{ filter: 'var(--aw-logo-filter)' }}
      />
      <h3 className="text-lg mb-1">Neura</h3>
      <p className="text-[12px] text-[var(--aw-text-secondary)] mb-4">نسخه ۱.۰.۰</p>
      <p className="text-[13px] text-[var(--aw-text-secondary)] mb-4">
        سیستم مدیریت هوشمند کسب‌وکار با عامل‌های AI
      </p>
      <div className="space-y-2 text-[12px] text-[var(--aw-text-muted)]">
        <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)]">
          <span>فریمورک</span>
          <span style={{ fontWeight: 600 }}>React + Tailwind CSS</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[var(--aw-border-light)]">
          <span>طراحی</span>
          <span style={{ fontWeight: 600 }}>RTL / فارسی</span>
        </div>
        <div className="flex justify-between py-2">
          <span>فونت</span>
          <span style={{ fontWeight: 600 }}>Vazirmatn</span>
        </div>
      </div>
    </div>
  );
}

function LogoutContent() {
  const { closeModal, showToast } = useApp();
  return (
    <div>
      <div className="text-center mb-4">
        <i className="fa-solid fa-sign-out-alt text-[40px] text-[var(--aw-danger)] mb-3 block" />
        <p className="text-[14px]">آیا مطمئن هستید که می‌خواهید خارج شوید؟</p>
        <p className="text-[12px] text-[var(--aw-text-muted)] mt-1">تمام داده‌های ذخیره نشده از بین خواهد رفت</p>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 px-5 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-danger)', fontWeight: 600 }} onClick={() => { closeModal(); showToast('با موفقیت خارج شدید'); }}>بله، خروج</button>
        <button className="flex-1 py-2.5 px-5 rounded-[10px] text-[13px] cursor-pointer border border-[var(--aw-border)] text-[var(--aw-text-secondary)]" style={{ background: 'transparent', fontWeight: 600 }} onClick={closeModal}>انصراف</button>
      </div>
    </div>
  );
}

function AgentReportDetail() {
  const { agents, closeModal, openChat, company } = useApp();
  const companyAgents = agents.filter(a => !a.locked && (!a.company || a.company === company));
  return (
    <div>
      {companyAgents.map(a => (
        <div key={a.id} className="flex items-center gap-2.5 py-2.5 border-b border-[var(--aw-border-light)] last:border-none">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm ${a.bg}`} style={{ fontWeight: 700 }}>{a.init}</div>
          <div className="flex-1">
            <div className="text-[13px]" style={{ fontWeight: 600 }}>{a.name}</div>
            <div className="text-[10px] text-[var(--aw-text-muted)]">{a.role}</div>
          </div>
          <div className="text-left text-[11px]">
            <div className="text-[var(--aw-secondary)]">{toFa(a.done)} انجام</div>
            <div className="text-[var(--aw-accent)]">{toFa(a.pending)} معلق</div>
          </div>
          <button className="py-1.5 px-2.5 rounded-[10px] text-[10px] border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-secondary)] cursor-pointer" style={{ fontWeight: 600 }}
            onClick={() => { closeModal(); setTimeout(() => openChat(a.id, 'agent'), 200); }}>چت</button>
        </div>
      ))}
    </div>
  );
}

function FinanceReportDetail() {
  const { closeModal, setAdminScreen } = useApp();
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <FinSumCard value="۱,۰۰۰,۰۰۰,۰۰۰" label="درآمد" color="var(--aw-secondary)" />
        <FinSumCard value="۳۵۰,۰۰۰,۰۰۰" label="هزینه" color="var(--aw-danger)" />
      </div>
      <ReportMetric label="سود خالص" value="۶۵۰,۰۰۰,۰۰۰ ریال" valueColor="var(--aw-primary)" />
      <ReportMetric label="نسبت سود" value="۶۵٪" valueColor="var(--aw-secondary)" />
      <button className="w-full py-2.5 px-5 mt-3 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { closeModal(); setAdminScreen('financeScreen'); }}>رفتن به ماژول مالی</button>
    </div>
  );
}

function CrmReportDetail() {
  const { customers, deals, closeModal, setAdminScreen } = useApp();
  return (
    <div>
      <ReportMetric label="مشتریان فعال" value={toFa(customers.filter(c => c.status === 'active').length)} valueColor="var(--aw-secondary)" />
      <ReportMetric label="سرنخ‌ها" value={toFa(customers.filter(c => c.status === 'lead').length)} valueColor="var(--aw-accent)" />
      <ReportMetric label="معاملات بسته" value={toFa(deals.filter(d => d.stage === 'closed').length)} valueColor="var(--aw-primary)" />
      <ReportMetric label="معاملات باز" value={toFa(deals.filter(d => d.stage !== 'closed').length)} />
      <ReportMetric label="کل ارزش معاملات" value="۱,۹۰۰,۰۰۰,۰۰۰ ریال" valueColor="var(--aw-secondary)" />
      <button className="w-full py-2.5 px-5 mt-3 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={() => { closeModal(); setAdminScreen('crmScreen'); }}>رفتن به CRM</button>
    </div>
  );
}

function ActivityReportDetail() {
  const { personnel, closeModal } = useApp();
  return (
    <div>
      <ReportMetric label="کل پیام‌ها (امروز)" value={toFa(47)} />
      <ReportMetric label="تماس‌های داخلی" value={toFa(12)} />
      <ReportMetric label="تماس‌های خارجی" value={toFa(8)} />
      <ReportMetric label="پرسنل آنلاین" value={toFa(personnel.filter(p => p.status === 'online').length)} valueColor="var(--aw-online)" />
      <ReportMetric label="متوسط زمان پاسخ" value="۲ دقیقه" />
      <ReportMetric label="رضایت مشتریان" value="۹۲٪" valueColor="var(--aw-secondary)" />
      <button className="w-full py-2.5 px-5 mt-3 border-none rounded-[10px] text-[13px] text-white cursor-pointer" style={{ background: 'var(--aw-primary)', fontWeight: 600 }} onClick={closeModal}>بستن</button>
    </div>
  );
}

// ========================
// FORM COMPONENTS
// ========================
export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[12px] text-[var(--aw-text-secondary)] mb-1.5" style={{ fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full py-2.5 px-3.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none focus:border-[var(--aw-primary)]"
      style={{ background: 'var(--aw-bg-input)' }}
    />
  );
}

export function FormSelect({ value, onChange, options }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full py-2.5 px-3.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none appearance-none"
      style={{ background: 'var(--aw-bg-input)' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}


// ========================
// ADMIN AVATAR + AGENT SELECTOR (mobile) — mirrors the personal panel shell
// ========================
const AGENT_PORTRAIT: Record<string, string> = {
  secretary: 'src/assets/avatar-secretary.png',
  marketing: 'src/assets/avatar-marketing.png',
  finance: 'src/assets/avatar-finance.png',
};
const AGENT_HUMAN_NAME: Record<string, string> = {
  secretary: 'نرگس محمدی',
  marketing: 'مریم فتحی',
  finance: 'علی ناصری',
};
function AdminAvatarBlock() {
  const { agentTeam, setAgentTeam, setAdminScreen, agents, company } = useApp();
  const [open, setOpen] = useState(false);
  const [groupIdx, setGroupIdx] = useState(0);
  const teamOrder: TeamKey[] = ['secretary', 'marketing', 'finance', 'procurement', 'sales'];
  const active = agentTeam ? TEAM_CONFIGS[agentTeam] : null;
  // All agents belonging to the current team (base + any hired into it), for this company
  const group = agents.filter(a => (!a.company || a.company === company) && (a.team || a.id) === agentTeam);
  useEffect(() => { setGroupIdx(0); }, [agentTeam]);
  const safeIdx = group.length ? Math.min(groupIdx, group.length - 1) : 0;
  const teamAgent = group[safeIdx];
  const displayName = teamAgent?.name || AGENT_HUMAN_NAME[agentTeam || ''] || 'دستیار';
  const portraitSrc = teamAgent?.avatar || AGENT_PORTRAIT[agentTeam || ''] || 'src/assets/avatar-portrait.png';

  const pick = (key: TeamKey) => {
    const cfg = TEAM_CONFIGS[key];
    setAgentTeam(key);
    if (cfg?.navItems?.[0]) setAdminScreen(cfg.navItems[0].id);
    setOpen(false);
  };

  return (
    <div className="md:hidden flex flex-col items-center relative" style={{ zIndex: 30 }} data-chat-top-anchor>
      <EuAvatar
        palette="cyan"
        portrait={portraitSrc}
        name={displayName}
        cornerSlot={<AgentSelector />}
        swipeCount={group.length}
        swipeIndex={safeIdx}
        onSwipeLeft={() => group.length > 1 && setGroupIdx(i => (i + 1) % group.length)}
        onSwipeRight={() => group.length > 1 && setGroupIdx(i => (i - 1 + group.length) % group.length)}
      />
    </div>
  );
}

// ========================
// ADMIN PANEL MAIN
// ========================
export default function AdminPanel() {
  const { adminScreen, agents, company, defaultAgent, startCall, showToast, agentTeam, chat, closeChat, briefingSeen, setBriefingSeen } = useApp();
  const showBriefing = !briefingSeen;
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
   <MarketingProvider>
    <div className="neura-admin flex h-full min-h-0 relative" style={{ direction: 'rtl' }}>
      {/* Desktop Sidebar (collapsible) — RIGHT side */}
      <AdminSidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(p => !p)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0" style={{ order: 2 }}>
        <AdminHeader />
        {!showBriefing && <AdminAvatarBlock />}

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            {showBriefing ? (
              <motion.div key="briefing" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <DailyBriefingScreen onDismiss={() => setBriefingSeen(true)} />
              </motion.div>
            ) : (
              <>
                {adminScreen === 'chatsScreen' && <motion.div key="chats" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><ChatsScreen /></motion.div>}
                {adminScreen === 'dashboardScreen' && <DashboardScreen key="dashboard" />}
                {adminScreen === 'crmScreen' && <motion.div key="crm" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><CrmScreen /></motion.div>}
                {adminScreen === 'financeScreen' && <motion.div key="finance" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><FinanceScreen /></motion.div>}
                {adminScreen === 'reportsScreen' && <ReportsScreen key="reports" />}
                {adminScreen === 'tasksScreen' && <motion.div key="tasks" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><TasksScreen /></motion.div>}
                {adminScreen === 'inventoryScreen' && <motion.div key="inventory" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><InventoryScreen /></motion.div>}
                {adminScreen === 'purchaseRequestScreen' && <motion.div key="purchaseRequest" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><PurchaseRequestScreen /></motion.div>}
                {adminScreen === 'salesFunnelScreen' && <motion.div key="salesFunnel" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesFunnelScreen /></motion.div>}
                {adminScreen === 'salesForecastScreen' && <motion.div key="salesForecast" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesForecastScreen /></motion.div>}
                {adminScreen === 'campaignScreen' && <motion.div key="campaign" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><MarketingCampaignScreen /></motion.div>}
                {adminScreen === 'secPlanningScreen' && <motion.div key="secPlanning" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SecPlanningScreen /></motion.div>}
                {adminScreen === 'secCrmLiteScreen' && <motion.div key="secCrmLite" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SecCrmLiteScreen /></motion.div>}
                {adminScreen === 'secPerformanceScreen' && <motion.div key="secPerformance" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SecPerformanceScreen /></motion.div>}
                {adminScreen === 'secDailyFinanceScreen' && <motion.div key="secDailyFinance" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SecDailyFinanceScreen /></motion.div>}
                {adminScreen === 'mktConversationsScreen' && <motion.div key="mktConversations" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><MktConversationsScreen /></motion.div>}
                {adminScreen === 'mktLeadsScreen' && <motion.div key="mktLeads" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><MktLeadsScreen /></motion.div>}
                {adminScreen === 'mktApprovalsScreen' && <motion.div key="mktApprovals" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><MktApprovalsScreen /></motion.div>}
                {adminScreen === 'mktCalendarScreen' && <motion.div key="mktCalendar" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><MktCalendarScreen /></motion.div>}
                {adminScreen === 'mktSegmentScreen' && <motion.div key="mktSegment" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><MktSegmentScreen /></motion.div>}
                {adminScreen === 'mktPerformanceScreen' && <motion.div key="mktPerformance" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><MktPerformanceScreen /></motion.div>}
                {adminScreen === 'procRequestsScreen' && <motion.div key="procRequests" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><ProcRequestsScreen /></motion.div>}
                {adminScreen === 'procOrdersScreen' && <motion.div key="procOrders" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><ProcOrdersScreen /></motion.div>}
                {adminScreen === 'procDeliveryScreen' && <motion.div key="procDelivery" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><ProcDeliveryScreen /></motion.div>}
                {adminScreen === 'procFinanceScreen' && <motion.div key="procFinance" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><ProcFinanceScreen /></motion.div>}
                {adminScreen === 'salesPosScreen' && <motion.div key="salesPos" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesPosScreen /></motion.div>}
                {adminScreen === 'salesOrdersScreen' && <motion.div key="salesOrders" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesOrdersScreen /></motion.div>}
                {adminScreen === 'salesInvoicesScreen' && <motion.div key="salesInvoices" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesInvoicesScreen /></motion.div>}
                {adminScreen === 'salesMenuScreen' && <motion.div key="salesMenu" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesMenuScreen /></motion.div>}
                {adminScreen === 'salesCustomersScreen' && <motion.div key="salesCustomers" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesCustomersScreen /></motion.div>}
                {adminScreen === 'salesQuickReportScreen' && <motion.div key="salesQuickReport" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesQuickReportScreen /></motion.div>}
                {adminScreen === 'salesConversationsScreen' && <motion.div key="salesConversations" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesConversationsScreen /></motion.div>}
                {adminScreen === 'salesShiftScreen' && <motion.div key="salesShift" className="flex flex-col h-full" variants={pageVariants} initial="initial" animate="animate" exit="exit"><SalesShiftScreen /></motion.div>}
              </>
            )}
          </AnimatePresence>
        </div>

        {!showBriefing && <AdminNav />}

        {/* Close chat FAB — opposite side (mobile only) */}
        <AnimatePresence>
          {!showBriefing && chat.open && (
            <motion.button
              className="absolute bottom-16 right-4 w-[40px] h-[40px] rounded-full border-none text-white cursor-pointer z-40 flex items-center justify-center md:hidden"
              style={{
                background: 'linear-gradient(135deg, #64748b, #475569)',
                boxShadow: '0 4px 12px rgba(100,116,139,0.4)',
                marginBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              whileHover={{ scale: 1.15, boxShadow: '0 6px 20px rgba(100,116,139,0.55)' }}
              whileTap={{ scale: 0.8 }}
              onClick={closeChat}
            >
              <i className="fa-solid fa-xmark text-[16px]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
   </MarketingProvider>
  );
}
