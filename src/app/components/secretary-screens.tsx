import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './app-context';
import { toFa } from './data';
import { FormGroup, FormInput, FormSelect } from './admin-panel';
import { QuickForm } from './quick-actions';

// ========================
// SHARED STYLES
// ========================
const cardStyle: React.CSSProperties = {
  background: 'var(--aw-bg-card)',
  borderRadius: 14,
  border: '1px solid var(--aw-border)',
};
const tabBarStyle: React.CSSProperties = {
  background: 'var(--aw-eu-nav-bg)',
  border: '1px solid var(--aw-eu-nav-border)',
  borderRadius: 9999,
  padding: 3,
  backdropFilter: 'blur(20px)',
};
const activeTabStyle: React.CSSProperties = {
  background: 'var(--aw-bg-card)',
  borderRadius: 9999,
  color: 'var(--aw-text-primary)',
  fontWeight: 700,
  boxShadow: 'inset 0 0 0 1px var(--aw-border), 0 2px 6px rgba(0,0,0,0.10)',
};
const inactiveTabStyle: React.CSSProperties = {
  background: 'transparent',
  borderRadius: 9999,
  color: 'var(--aw-text-secondary)',
};

function TabBar({ tabs, active, onChange }: { tabs: { id: string; label: string; icon: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 p-1 mx-4 mt-3 mb-2 overflow-x-auto aw-noscroll" style={tabBarStyle}>
      {tabs.map(t => (
        <button
          key={t.id}
          className="flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 border-none cursor-pointer transition-all text-[11px]"
          style={active === t.id ? activeTabStyle : inactiveTabStyle}
          onClick={() => onChange(t.id)}
        >
          <i className={`${t.icon} text-[13px]`} />
          <span style={{ whiteSpace: 'nowrap' }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ title, icon, count }: { title: string; icon: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
      <i className={`${icon} text-[14px] text-[#22A6F0]`} />
      <span className="text-[14px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{title}</span>
      {count !== undefined && (
        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(46,134,255,0.15)', color: '#22A6F0' }}>{count}</span>
      )}
    </div>
  );
}

// ========================
// 1. PLANNING SCREEN (برنامه‌ریزی)
// ========================
const PLANNING_TABS = [
  { id: 'tasks', label: 'تسک‌ها', icon: 'fa-solid fa-list-check' },
  { id: 'todo', label: 'To-Do', icon: 'fa-solid fa-square-check' },
  { id: 'calendar', label: 'تقویم', icon: 'fa-solid fa-calendar' },
  { id: 'meetings', label: 'جلسات', icon: 'fa-solid fa-users' },
  { id: 'reminders', label: 'یادآوری‌ها', icon: 'fa-solid fa-bell' },
];

const MOCK_REMINDERS = [
  { id: 1, title: 'تماس با شرکت آلفا', when: 'امروز ۱۵:۰۰', type: 'call', repeat: 'یک‌بار' },
  { id: 2, title: 'ارسال گزارش روزانه', when: 'هر روز ۱۸:۰۰', type: 'report', repeat: 'روزانه' },
  { id: 3, title: 'پیگیری فاکتور شرکت بتا', when: 'فردا ۱۰:۰۰', type: 'invoice', repeat: 'یک‌بار' },
  { id: 4, title: 'بک‌آپ هفتگی سیستم', when: 'پنج‌شنبه ۲۲:۰۰', type: 'system', repeat: 'هفتگی' },
  { id: 5, title: 'یادآوری جلسه هیئت‌مدیره', when: 'شنبه ۰۹:۰۰', type: 'meeting', repeat: 'یک‌بار' },
];

const REMINDER_TYPE_ICONS: Record<string, string> = {
  call: 'fa-solid fa-phone',
  report: 'fa-solid fa-file-lines',
  invoice: 'fa-solid fa-file-invoice',
  system: 'fa-solid fa-gear',
  meeting: 'fa-solid fa-users',
};

const MOCK_TASKS = [
  { id: 1, title: 'تماس با تأمین‌کننده قطعات', priority: 'high', status: 'doing', assignee: 'علی محمدی', due: 'امروز ۱۶:۰۰', team: 'تدارکات' },
  { id: 2, title: 'آماده‌سازی گزارش هفتگی', priority: 'medium', status: 'todo', assignee: 'سارا احمدی', due: 'فردا ۱۰:۰۰', team: 'مالی' },
  { id: 3, title: 'بررسی درخواست‌های مرخصی', priority: 'low', status: 'done', assignee: 'مریم کریمی', due: 'دیروز', team: 'اداری' },
  { id: 4, title: 'هماهنگی جلسه با مشتری VIP', priority: 'high', status: 'doing', assignee: 'نرگس رضایی', due: 'امروز ۱۴:۳۰', team: 'فروش' },
  { id: 5, title: 'ارسال پیش‌فاکتور به شرکت آلفا', priority: 'medium', status: 'todo', assignee: 'رضا حسینی', due: 'چهارشنبه', team: 'فروش' },
];

const MOCK_TODOS = [
  { id: 1, text: 'خرید لوازم اداری', done: false },
  { id: 2, text: 'رزرو سالن کنفرانس برای پنج‌شنبه', done: true },
  { id: 3, text: 'ارسال ایمیل پیگیری به شرکت بتا', done: false },
  { id: 4, text: 'آپدیت لیست مخاطبین', done: false },
  { id: 5, text: 'چک کردن صورت‌حساب تلفن', done: true },
  { id: 6, text: 'هماهنگی با راننده برای ارسال بسته', done: false },
];

const MOCK_CALENDAR = [
  { id: 1, title: 'جلسه تیم فروش', time: '۰۹:۰۰ - ۱۰:۰۰', color: '#10B981', day: 'امروز', dayNum: 5 },
  { id: 2, title: 'تماس با مشتری جدید', time: '۱۱:۰۰ - ۱۱:۳۰', color: '#3B82F6', day: 'امروز', dayNum: 5 },
  { id: 3, title: 'جلسه بودجه ماهانه', time: '۱۴:۰۰ - ۱۵:۳۰', color: '#8B5CF6', day: 'امروز', dayNum: 5 },
  { id: 4, title: 'بررسی عملکرد تیم', time: '۱۶:۰۰ - ۱۷:۰۰', color: '#F97316', day: 'فردا', dayNum: 6 },
  { id: 5, title: 'ناهار کاری با شرکا', time: '۱۲:۳۰ - ۱۴:۰۰', color: '#22A6F0', day: 'فردا', dayNum: 6 },
  { id: 6, title: 'جلسه برنامه‌ریزی فصلی', time: '۱۰:۰۰ - ۱۲:۰۰', color: '#F59E0B', day: '', dayNum: 12 },
  { id: 7, title: 'مصاحبه استخدامی', time: '۱۵:۰۰ - ۱۶:۰۰', color: '#06B6D4', day: '', dayNum: 18 },
  { id: 8, title: 'دورهمی پایان ماه', time: '۱۸:۰۰ - ۲۰:۰۰', color: '#22A6F0', day: '', dayNum: 29 },
  { id: 9, title: 'ارائه گزارش به مدیریت', time: '۰۹:۰۰ - ۱۰:۳۰', color: '#8B5CF6', day: '', dayNum: 22 },
  { id: 10, title: 'آموزش نرم‌افزار جدید', time: '۱۱:۰۰ - ۱۳:۰۰', color: '#10B981', day: '', dayNum: 15 },
];

const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const JALALI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

const MOCK_MEETINGS = [
  { id: 1, title: 'جلسه هفتگی مدیران', time: 'شنبه ۰۹:۰۰', attendees: 5, location: 'سالن کنفرانس', status: 'confirmed' },
  { id: 2, title: 'جلسه با مشتری VIP', time: 'یکشنبه ۱۴:۰۰', attendees: 3, location: 'دفتر مدیریت', status: 'pending' },
  { id: 3, title: 'بررسی پروژه جدید', time: 'دوشنبه ۱۱:۰۰', attendees: 8, location: 'آنلاین', status: 'confirmed' },
  { id: 4, title: 'آموزش تیم فروش', time: 'سه‌شنبه ۱۰:۰۰', attendees: 12, location: 'سالن آموزش', status: 'confirmed' },
];

const priorityColors: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const priorityLabels: Record<string, string> = { high: 'فوری', medium: 'متوسط', low: 'عادی' };
const statusLabels: Record<string, string> = { todo: 'انجام نشده', doing: 'در حال انجام', done: 'انجام شده' };

type TaskItem = { id: number; title: string; priority: string; status: string; assignee: string; due: string; team: string };
type CalEvent = { id: number; title: string; time: string; color: string; day: string; dayNum: number };
type MeetingItem = { id: number; title: string; time: string; attendees: number; location: string; status: string };

const EVENT_COLORS = ['#10B981','#3B82F6','#8B5CF6','#F97316','#22A6F0','#F59E0B','#06B6D4','#EF4444'];

function NewMeetingForm({ onCreate }: { onCreate: (m: any) => void }) {
  const { closeModal, showToast, agents, personnel } = useApp();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('سالن کنفرانس');
  const [picked, setPicked] = useState<string[]>([]);

  const agentPeople = (agents || []).filter((a: any) => !a.locked).map((a: any) => ({ key: 'a-' + a.id, name: a.name, sub: a.role, init: a.init, bg: a.bg }));
  const staffPeople = (personnel || []).map((p: any) => ({ key: 'p-' + p.id, name: p.name, sub: p.role, init: p.name[0], bg: 'bg-blue-500' }));
  const toggle = (k: string) => setPicked(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);

  const PersonRow = (p: any) => {
    const on = picked.includes(p.key);
    return (
      <button key={p.key} onClick={() => toggle(p.key)} className="flex items-center gap-2.5 p-2 rounded-[10px] border-none cursor-pointer text-right transition-colors w-full" style={{ background: on ? 'var(--aw-primary-bg)' : 'transparent' }}>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] flex-shrink-0 ${p.bg}`} style={{ fontWeight: 700 }}>{p.init}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-[12.5px] truncate" style={{ fontWeight: 600, color: 'var(--aw-text-primary)' }}>{p.name}</span>
          <span className="block text-[10px] text-[var(--aw-text-muted)] truncate">{p.sub}</span>
        </span>
        <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: on ? 'var(--aw-eu-primary)' : 'transparent', border: on ? 'none' : '1.5px solid var(--aw-border)' }}>
          {on && <i className="fa-solid fa-check text-white text-[10px]" />}
        </span>
      </button>
    );
  };

  const inputStyle: React.CSSProperties = { background: 'var(--aw-bg-input)', border: '1px solid var(--aw-border)', color: 'var(--aw-text-primary)', borderRadius: 12, padding: '11px 13px', fontSize: 13, width: '100%', outline: 'none', fontFamily: "'Kamand', 'Vazirmatn', sans-serif" };

  const submit = () => {
    if (!title.trim()) { showToast('عنوان جلسه را وارد کنید'); return; }
    onCreate({ id: Date.now(), title, time: time || '—', attendees: picked.length || 1, location, status: 'pending' });
    closeModal();
    showToast('جلسه جدید ایجاد شد');
  };

  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px]" style={{ color: 'var(--aw-text-secondary)', fontWeight: 600 }}>عنوان جلسه</label>
        <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="مثلاً جلسه هفتگی مدیران" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px]" style={{ color: 'var(--aw-text-secondary)', fontWeight: 600 }}>زمان</label>
        <input style={inputStyle} value={time} onChange={e => setTime(e.target.value)} placeholder="مثلاً شنبه ۰۹:۰۰" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px]" style={{ color: 'var(--aw-text-secondary)', fontWeight: 600 }}>محل برگزاری</label>
        <select style={inputStyle} value={location} onChange={e => setLocation(e.target.value)}>
          {['سالن کنفرانس', 'دفتر مدیریت', 'آنلاین', 'سالن آموزش'].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px]" style={{ color: 'var(--aw-text-secondary)', fontWeight: 600 }}>
          نفرات حاضر در جلسه {picked.length > 0 && <span style={{ color: 'var(--aw-eu-primary)' }}>({toFa(picked.length)})</span>}
        </label>
        <div className="flex flex-col gap-1 max-h-[260px] overflow-y-auto aw-scroll p-1.5 rounded-[12px]" style={{ background: 'var(--aw-bg-input)', border: '1px solid var(--aw-border)' }}>
          <div className="text-[10px] px-1 pt-0.5 pb-1" style={{ color: 'var(--aw-text-muted)', fontWeight: 700 }}>ایجنت‌ها</div>
          {agentPeople.map(PersonRow)}
          <div className="text-[10px] px-1 pt-2 pb-1 mt-1 border-t border-[var(--aw-border)]" style={{ color: 'var(--aw-text-muted)', fontWeight: 700 }}>کارمندان</div>
          {staffPeople.map(PersonRow)}
        </div>
      </div>
      <button onClick={submit} className="mt-1 w-full rounded-[12px] border-none cursor-pointer text-white py-3 text-[14px]" style={{ background: 'var(--aw-primary)', fontWeight: 700, fontFamily: "'Kamand', 'Vazirmatn', sans-serif" }}>ثبت جلسه</button>
    </div>
  );
}

export function SecPlanningScreen() {
  const { openModal, showToast } = useApp();
  const [tab, setTab] = useState('tasks');
  const [todos, setTodos] = useState(MOCK_TODOS);
  const [tasks, setTasks] = useState<TaskItem[]>(MOCK_TASKS);
  const [events, setEvents] = useState<CalEvent[]>(MOCK_CALENDAR);
  const [meetings, setMeetings] = useState<MeetingItem[]>(MOCK_MEETINGS);
  const [calMonth, setCalMonth] = useState(11);
  const [reminders, setReminders] = useState(MOCK_REMINDERS);
  const [calYear, setCalYear] = useState(1404);
  const [selectedDay, setSelectedDay] = useState<number | null>(5);

  const [taskForm, setTaskForm] = useState<TaskItem | null>(null);
  const [eventForm, setEventForm] = useState<CalEvent | null>(null);
  const [meetingForm, setMeetingForm] = useState<MeetingItem | null>(null);

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const blankTask = (): TaskItem => ({ id: Date.now(), title: '', priority: 'medium', status: 'todo', assignee: '', due: '', team: '' });
  const blankEvent = (): CalEvent => ({ id: Date.now(), title: '', time: '', color: EVENT_COLORS[0], day: '', dayNum: selectedDay || 1 });
  const blankMeeting = (): MeetingItem => ({ id: Date.now(), title: '', time: '', attendees: 1, location: '', status: 'pending' });

  const saveTask = (t: TaskItem) => {
    if (!t.title.trim()) return;
    setTasks(prev => prev.some(x => x.id === t.id) ? prev.map(x => x.id === t.id ? t : x) : [...prev, t]);
    setTaskForm(null);
  };
  const removeTask = (id: number) => setTasks(prev => prev.filter(x => x.id !== id));

  const saveEvent = (e: CalEvent) => {
    if (!e.title.trim()) return;
    setEvents(prev => prev.some(x => x.id === e.id) ? prev.map(x => x.id === e.id ? e : x) : [...prev, e]);
    setEventForm(null);
  };
  const removeEvent = (id: number) => setEvents(prev => prev.filter(x => x.id !== id));

  const saveMeeting = (m: MeetingItem) => {
    if (!m.title.trim()) return;
    setMeetings(prev => prev.some(x => x.id === m.id) ? prev.map(x => x.id === m.id ? m : x) : [...prev, m]);
    setMeetingForm(null);
  };
  const removeMeeting = (id: number) => setMeetings(prev => prev.filter(x => x.id !== id));
  const confirmMeeting = (id: number) => setMeetings(prev => prev.map(x => x.id === id ? { ...x, status: 'confirmed' } : x));

  const inputCls = "w-full bg-[var(--aw-bg-input)] border border-[var(--aw-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--aw-text-primary)] outline-none";
  const btnPrimary = "px-3 py-2 rounded-lg border-none text-white text-[12px] cursor-pointer";
  const btnGhost = "px-3 py-2 rounded-lg border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-muted)] text-[12px] cursor-pointer";

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={PLANNING_TABS} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto px-4 pb-24 aw-scroll">
        <AnimatePresence mode="wait">
          {tab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              {!taskForm && (
                <button className="p-3 flex items-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[14px] cursor-pointer hover:border-[#22A6F0] transition-colors bg-transparent" onClick={() => setTaskForm(blankTask())}>
                  <i className="fa-solid fa-plus text-[14px] text-[#22A6F0]" />
                  <span className="text-[13px] text-[var(--aw-text-muted)]">افزودن تسک جدید</span>
                </button>
              )}
              {taskForm && (
                <div className="p-3 flex flex-col gap-2" style={cardStyle}>
                  <input className={inputCls} placeholder="عنوان تسک" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} autoFocus />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputCls} placeholder="مسئول" value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })} />
                    <input className={inputCls} placeholder="تیم" value={taskForm.team} onChange={e => setTaskForm({ ...taskForm, team: e.target.value })} />
                    <input className={inputCls} placeholder="موعد (مثلاً امروز ۱۶:۰۰)" value={taskForm.due} onChange={e => setTaskForm({ ...taskForm, due: e.target.value })} />
                    <select className={inputCls} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option value="high">فوری</option>
                      <option value="medium">متوسط</option>
                      <option value="low">عادی</option>
                    </select>
                    <select className={inputCls} value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                      <option value="todo">انجام نشده</option>
                      <option value="doing">در حال انجام</option>
                      <option value="done">انجام شده</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button className={btnGhost} onClick={() => setTaskForm(null)}>انصراف</button>
                    <button className={btnPrimary} style={{ background: '#22A6F0' }} onClick={() => saveTask(taskForm)}>ذخیره</button>
                  </div>
                </div>
              )}
              {tasks.map(task => (
                <div key={task.id} className="p-3 flex flex-col gap-2 group" style={cardStyle}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{task.title}</span>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${priorityColors[task.priority]}22`, color: priorityColors[task.priority] }}>
                          {priorityLabels[task.priority]}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>
                          {statusLabels[task.status]}
                        </span>
                        <span className="text-[10px] text-[var(--aw-text-muted)]">
                          <i className="fa-solid fa-building text-[9px] ml-1" />{task.team}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-regular fa-clock text-[9px] ml-1" />{task.due}</span>
                      <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-user text-[9px] ml-1" />{task.assignee}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 justify-end">
                    <button className="w-7 h-7 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer hover:text-[#22A6F0]" onClick={() => setTaskForm({ ...task })} title="ویرایش"><i className="fa-solid fa-pen" /></button>
                    <button className="w-7 h-7 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer hover:text-red-400" onClick={() => removeTask(task.id)} title="حذف"><i className="fa-solid fa-trash" /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          {tab === 'todo' && (
            <motion.div key="todo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-1.5 pt-2">
              {todos.map(item => (
                <button
                  key={item.id}
                  className="p-3 flex items-center gap-3 border-none cursor-pointer w-full text-right"
                  style={{ ...cardStyle, background: item.done ? 'var(--aw-bg-hover)' : 'var(--aw-bg-card)' }}
                  onClick={() => toggleTodo(item.id)}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: item.done ? 'linear-gradient(135deg, #22A6F0, #1B4FE8)' : 'transparent',
                      border: item.done ? 'none' : '2px solid var(--aw-border)',
                    }}
                  >
                    {item.done && <i className="fa-solid fa-check text-[10px] text-white" />}
                  </div>
                  <span className={`text-[13px] flex-1 transition-all ${item.done ? 'line-through text-[var(--aw-text-muted)]' : 'text-[var(--aw-text-primary)]'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
              <div className="mt-2 p-3 flex items-center gap-3 border-2 border-dashed border-[var(--aw-border)] rounded-[14px] cursor-pointer hover:border-[#22A6F0] transition-colors">
                <i className="fa-solid fa-plus text-[14px] text-[#22A6F0]" />
                <span className="text-[13px] text-[var(--aw-text-muted)]">افزودن آیتم جدید...</span>
              </div>
            </motion.div>
          )}
          {tab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-3 pt-2">
              {/* Calendar Grid */}
              <div className="p-3" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                  <button className="w-8 h-8 rounded-lg border-none cursor-pointer flex items-center justify-center" style={{ background: 'var(--aw-bg-hover)' }} onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else { setCalMonth(m => m - 1); } setSelectedDay(null); }}>
                    <i className="fa-solid fa-chevron-right text-[11px] text-[var(--aw-text-muted)]" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[var(--aw-text-primary)]" style={{ fontWeight: 700 }}>{JALALI_MONTHS[calMonth]}</span>
                    <span className="text-[13px] text-[var(--aw-text-muted)]">{calYear}</span>
                  </div>
                  <button className="w-8 h-8 rounded-lg border-none cursor-pointer flex items-center justify-center" style={{ background: 'var(--aw-bg-hover)' }} onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else { setCalMonth(m => m + 1); } setSelectedDay(null); }}>
                    <i className="fa-solid fa-chevron-left text-[11px] text-[var(--aw-text-muted)]" />
                  </button>
                </div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {JALALI_WEEKDAYS.map(wd => (
                    <div key={wd} className="text-center text-[10px] text-[var(--aw-text-muted)] py-1" style={{ fontWeight: 600 }}>{wd}</div>
                  ))}
                </div>
                {/* Days grid */}
                {(() => {
                  const daysInMonth = calMonth <= 5 ? 31 : calMonth <= 10 ? 30 : 29;
                  const startDayOfWeek = calMonth === 11 ? 0 : (calMonth * 2 + 1) % 7;
                  const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
                  const cells = Array.from({ length: totalCells }, (_, i) => {
                    const dayNum = i - startDayOfWeek + 1;
                    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null;
                  });
                  const today = calMonth === 11 && calYear === 1404 ? 5 : -1;
                  return (
                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((d, i) => {
                        if (d === null) return <div key={`e-${i}`} className="h-9" />;
                        const eventColors = events.filter(e => e.dayNum === d).map(e => e.color);
                        const hasEvent = eventColors.length > 0;
                        const isToday = d === today;
                        const isSelected = d === selectedDay;
                        const isFriday = i % 7 === 6;
                        return (
                          <button
                            key={d}
                            className="h-9 rounded-lg border-none cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all relative"
                            style={{
                              background: isSelected ? 'linear-gradient(135deg, #22A6F0, #1B4FE8)' : isToday ? 'rgba(46,134,255,0.12)' : 'transparent',
                              color: isSelected ? '#fff' : isFriday ? '#EF4444' : 'var(--aw-text-primary)',
                              fontWeight: isToday || isSelected ? 700 : 400,
                              fontSize: 13,
                            }}
                            onClick={() => setSelectedDay(d)}
                          >
                            {d}
                            {hasEvent && (
                              <div className="flex gap-0.5 absolute bottom-0.5">
                                {eventColors.slice(0, 3).map((c, ci) => (
                                  <span key={ci} className="w-1 h-1 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.8)' : c }} />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              {/* Events for selected day */}
              {selectedDay !== null && (() => {
                const dayEvents = events.filter(e => e.dayNum === selectedDay);
                return (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 px-1">
                      <i className="fa-solid fa-calendar-day text-[12px] text-[#22A6F0]" />
                      <span className="text-[12px] text-[var(--aw-text-muted)]" style={{ fontWeight: 600 }}>{selectedDay} {JALALI_MONTHS[calMonth]}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(46,134,255,0.15)', color: '#22A6F0' }}>{dayEvents.length} رویداد</span>
                    </div>
                    {!eventForm && (
                      <button className="p-3 flex items-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[14px] cursor-pointer hover:border-[#22A6F0] transition-colors bg-transparent" onClick={() => setEventForm({ ...blankEvent(), dayNum: selectedDay })}>
                        <i className="fa-solid fa-plus text-[14px] text-[#22A6F0]" />
                        <span className="text-[13px] text-[var(--aw-text-muted)]">افزودن قرار جدید</span>
                      </button>
                    )}
                    {eventForm && (
                      <div className="p-3 flex flex-col gap-2" style={cardStyle}>
                        <input className={inputCls} placeholder="عنوان قرار" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} autoFocus />
                        <input className={inputCls} placeholder="ساعت (مثلاً ۰۹:۰۰ - ۱۰:۰۰)" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
                        <input className={inputCls} type="number" min={1} max={31} placeholder="روز" value={eventForm.dayNum} onChange={e => setEventForm({ ...eventForm, dayNum: parseInt(e.target.value) || 1 })} />
                        <div className="flex flex-wrap gap-1.5">
                          {EVENT_COLORS.map(c => (
                            <button key={c} className="w-6 h-6 rounded-full border-2 cursor-pointer" style={{ background: c, borderColor: eventForm.color === c ? '#fff' : 'transparent', boxShadow: eventForm.color === c ? '0 0 0 2px ' + c : 'none' }} onClick={() => setEventForm({ ...eventForm, color: c })} />
                          ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button className={btnGhost} onClick={() => setEventForm(null)}>انصراف</button>
                          <button className={btnPrimary} style={{ background: '#22A6F0' }} onClick={() => saveEvent(eventForm)}>ذخیره</button>
                        </div>
                      </div>
                    )}
                    {dayEvents.map(event => (
                      <div key={event.id} className="p-3 flex items-center gap-3" style={cardStyle}>
                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: event.color }} />
                        <div className="flex-1">
                          <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{event.title}</span>
                          <div className="text-[11px] text-[var(--aw-text-muted)] mt-0.5">
                            <i className="fa-regular fa-clock text-[9px] ml-1" />{event.time}
                          </div>
                        </div>
                        <button className="w-7 h-7 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer hover:text-[#22A6F0]" onClick={() => setEventForm({ ...event })} title="ویرایش"><i className="fa-solid fa-pen" /></button>
                        <button className="w-7 h-7 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer hover:text-red-400" onClick={() => removeEvent(event.id)} title="حذف"><i className="fa-solid fa-trash" /></button>
                      </div>
                    ))}
                    {dayEvents.length === 0 && !eventForm && (
                      <div className="p-4 flex flex-col items-center gap-2" style={cardStyle}>
                        <i className="fa-regular fa-calendar text-[24px] text-[var(--aw-text-muted)]" style={{ opacity: 0.4 }} />
                        <span className="text-[12px] text-[var(--aw-text-muted)]">{selectedDay} {JALALI_MONTHS[calMonth]} — رویدادی ثبت نشده</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}
          {tab === 'meetings' && (
            <motion.div key="meetings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              <button onClick={() => openModal('ایجاد جلسه جدید', <NewMeetingForm onCreate={(m) => setMeetings(prev => [m, ...prev])} />)} className="p-3 flex items-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[14px] cursor-pointer hover:border-[#22A6F0] transition-colors bg-transparent">
                <i className="fa-solid fa-plus text-[14px] text-[#22A6F0]" />
                <span className="text-[13px] text-[var(--aw-text-muted)]">ایجاد جلسه جدید</span>
              </button>
              {meetings.map(m => (
                <div key={m.id} className="p-3" style={cardStyle}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{m.title}</span>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-[var(--aw-text-muted)]"><i className="fa-regular fa-clock text-[9px] ml-1" />{m.time}</span>
                        <span className="text-[11px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-users text-[9px] ml-1" />{m.attendees} نفر</span>
                        <span className="text-[11px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-location-dot text-[9px] ml-1" />{m.location}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full`} style={{
                      background: m.status === 'confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: m.status === 'confirmed' ? '#10B981' : '#F59E0B',
                    }}>
                      {m.status === 'confirmed' ? 'تأیید شده' : 'در انتظار'}
                    </span>
                  </div>
                  <div className="flex gap-1 justify-end mt-2">
                    {m.status !== 'confirmed' && (
                      <button className="w-7 h-7 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer hover:text-[#10B981]" onClick={() => confirmMeeting(m.id)} title="تأیید"><i className="fa-solid fa-check" /></button>
                    )}
                    <button className="w-7 h-7 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer hover:text-red-400" onClick={() => removeMeeting(m.id)} title="حذف"><i className="fa-solid fa-trash" /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          {tab === 'reminders' && (
            <motion.div key="reminders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              <button onClick={() => openModal('یادآوری جدید', <QuickForm submitLabel="ثبت یادآوری" toast="یادآوری جدید ثبت شد" onSubmit={(v) => setReminders(prev => [{ id: Date.now(), title: v.title, when: v.when || '—', type: 'call', repeat: v.repeat || 'یک‌بار' }, ...prev])} fields={[{ key: 'title', label: 'عنوان یادآوری' }, { key: 'when', label: 'زمان', type: 'time' }, { key: 'repeat', label: 'تکرار', type: 'select', options: ['یک‌بار', 'روزانه', 'هفتگی', 'ماهانه'] }]} />)} className="p-3 flex items-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[14px] cursor-pointer hover:border-[#22A6F0] transition-colors bg-transparent">
                <i className="fa-solid fa-plus text-[14px] text-[#22A6F0]" />
                <span className="text-[13px] text-[var(--aw-text-muted)]">ایجاد یادآوری جدید</span>
              </button>
              {reminders.map(r => (
                <div key={r.id} className="p-3 flex items-center gap-3" style={cardStyle}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(46,134,255,0.15)' }}>
                    <i className={`${REMINDER_TYPE_ICONS[r.type] || 'fa-solid fa-bell'} text-[13px] text-[#22A6F0]`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{r.title}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-regular fa-clock text-[8px] ml-1" />{r.when}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>{r.repeat}</span>
                    </div>
                  </div>
                  <button onClick={() => showToast('یادآوری ویرایش شد')} className="w-7 h-7 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer hover:text-[#22A6F0]" title="ویرایش"><i className="fa-solid fa-pen" /></button>
                  <button onClick={() => setReminders(prev => prev.filter(x => x.id !== r.id))} className="w-7 h-7 rounded-md border-none bg-transparent text-[var(--aw-text-muted)] text-[11px] cursor-pointer hover:text-red-400" title="حذف"><i className="fa-solid fa-trash" /></button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ========================
// 2. CRM LITE SCREEN (ارتباط با مشتری)
// ========================
const CRM_LITE_TABS = [
  { id: 'contacts', label: 'مخاطبین', icon: 'fa-solid fa-address-book' },
  { id: 'leads', label: 'سرنخ‌ها', icon: 'fa-solid fa-user-plus' },
  { id: 'followup', label: 'پیگیری مشتریان', icon: 'fa-solid fa-bell' },
  { id: 'activity', label: 'تاریخچه فعالیت', icon: 'fa-solid fa-timeline' },
];

const CRM_KPIS = [
  { label: 'کل مخاطبین', value: '۲۴۸', icon: 'fa-solid fa-address-book', color: '#22A6F0' },
  { label: 'سرنخ فعال', value: '۳۲', icon: 'fa-solid fa-fire', color: '#F59E0B' },
  { label: 'ارزش پایپ‌لاین', value: '۵۲۰م', icon: 'fa-solid fa-sack-dollar', color: '#10B981' },
  { label: 'پیگیری معوق', value: '۵', icon: 'fa-solid fa-bell-slash', color: '#EF4444' },
];

const CONTACT_SEGMENTS = ['همه', 'مشتری', 'تأمین‌کننده', 'شریک', 'سرنخ'];

const CRM_ACTIVITIES = [
  { id: 1, kind: 'call', title: 'تماس با احمد رضایی', desc: 'پیگیری پیش‌فاکتور — مدت ۸ دقیقه', when: 'امروز ۱۱:۲۰', icon: 'fa-solid fa-phone', color: '#10B981' },
  { id: 2, kind: 'email', title: 'ارسال ایمیل به فاطمه حسینی', desc: 'ارسال نمونه قرارداد و شرایط همکاری', when: 'امروز ۱۰:۰۵', icon: 'fa-solid fa-envelope', color: '#3B82F6' },
  { id: 3, kind: 'meeting', title: 'جلسه با محمد کریمی', desc: 'بررسی نهایی پروژه و امضای قرارداد', when: 'دیروز ۱۴:۰۰', icon: 'fa-solid fa-users', color: '#8B5CF6' },
  { id: 4, kind: 'note', title: 'یادداشت برای زهرا محمدی', desc: 'علاقه‌مند به پکیج طلایی، نیاز به تخفیف ویژه دارد', when: 'دیروز ۱۱:۳۰', icon: 'fa-solid fa-note-sticky', color: '#F59E0B' },
  { id: 5, kind: 'whatsapp', title: 'پیام واتساپ به علی نوری', desc: 'ارسال کاتالوگ و لیست قیمت', when: 'دیروز ۰۹:۴۵', icon: 'fa-brands fa-whatsapp', color: '#16a34a' },
  { id: 6, kind: 'sms', title: 'ارسال پیامک به سارا کاظمی', desc: 'یادآوری جلسه فردا ساعت ۱۱', when: '۲ روز پیش', icon: 'fa-solid fa-comment-sms', color: '#06b6d4' },
];

const LEAD_PIPELINE_STAGES = [
  { id: 'جدید', color: '#3B82F6', icon: 'fa-solid fa-seedling' },
  { id: 'تماس اول', color: '#F59E0B', icon: 'fa-solid fa-phone-volume' },
  { id: 'پیگیری', color: '#8B5CF6', icon: 'fa-solid fa-arrows-rotate' },
];

const MOCK_CONTACTS = [
  { id: 1, name: 'احمد رضایی', phone: '۰۹۱۲۱۲۳۴۵۶۷', email: 'a.rezaei@alfa.ir', company: 'شرکت آلفا', role: 'مدیر خرید', type: 'مشتری', tier: 'VIP', lastContact: '۲ روز پیش', active: true },
  { id: 2, name: 'فاطمه حسینی', phone: '۰۹۱۳۲۳۴۵۶۷۸', email: 'f.hosseini@beta.com', company: 'فروشگاه بتا', role: 'مدیرعامل', type: 'تأمین‌کننده', tier: 'طلایی', lastContact: 'امروز', active: true },
  { id: 3, name: 'محمد کریمی', phone: '۰۹۱۴۳۴۵۶۷۸۹', email: 'm.karimi@gamma.org', company: 'مؤسسه گاما', role: 'مدیر فنی', type: 'شریک', tier: 'استراتژیک', lastContact: 'هفته پیش', active: true },
  { id: 4, name: 'زهرا محمدی', phone: '۰۹۱۵۴۵۶۷۸۹۰', email: 'z.mohammadi@delta.ir', company: 'شرکت دلتا', role: 'سرپرست فروش', type: 'مشتری', tier: 'نقره‌ای', lastContact: '۳ روز پیش', active: false },
  { id: 5, name: 'علی نوری', phone: '۰۹۱۶۵۶۷۸۹۰۱', email: 'a.nouri@epsilon.co', company: 'صنایع اپسیلون', role: 'مدیر بازرگانی', type: 'مشتری', tier: 'طلایی', lastContact: 'دیروز', active: true },
];

const MOCK_LEADS = [
  { id: 1, name: 'شرکت زتا', contact: 'حسین امینی', source: 'وبسایت', status: 'جدید', value: '۵۰ میلیون', date: 'امروز' },
  { id: 2, name: 'فروشگاه اتا', contact: 'مریم صادقی', source: 'معرفی', status: 'تماس اول', value: '۲۰ میلیون', date: 'دیروز' },
  { id: 3, name: 'مجموعه تتا', contact: 'رضا بهرامی', source: 'تبلیغات', status: 'پیگیری', value: '۱۰۰ میلیون', date: '۳ روز پیش' },
  { id: 4, name: 'گروه یوتا', contact: 'سارا کاظمی', source: 'شبکه‌های اجتماعی', status: 'جدید', value: '۳۵ میلیون', date: 'امروز' },
];

type FollowupItem = {
  id: number;
  title: string;
  contact: string;
  company: string;
  assignee: string;
  due: string;
  status: 'overdue' | 'upcoming';
  type: 'call' | 'email' | 'meeting' | 'task' | 'invoice';
  state: string;
};

const MOCK_FOLLOWUPS: FollowupItem[] = [
  { id: 1, title: 'تماس پیگیری مشتری', contact: 'احمد رضایی', company: 'شرکت آلفا', assignee: 'سارا احمدی', due: '۲ ساعت گذشته', status: 'overdue', type: 'call', state: 'در انتظار تماس' },
  { id: 2, title: 'پیگیری فاکتور ارسالی', contact: 'زهرا محمدی', company: 'شرکت دلتا', assignee: 'رضا حسینی', due: 'دیروز', status: 'overdue', type: 'invoice', state: 'بدون پاسخ' },
  { id: 3, title: 'پاسخ به درخواست مشتری', contact: 'علی نوری', company: 'صنایع اپسیلون', assignee: 'مریم کریمی', due: '۳ ساعت گذشته', status: 'overdue', type: 'email', state: 'منتظر پاسخ' },
  { id: 4, title: 'ارسال پیش‌فاکتور', contact: 'فاطمه حسینی', company: 'فروشگاه بتا', assignee: 'سارا احمدی', due: 'دیروز', status: 'overdue', type: 'invoice', state: 'آماده ارسال' },
  { id: 5, title: 'تماس مجدد با سرنخ', contact: 'حسین امینی', company: 'شرکت زتا', assignee: 'نرگس رضایی', due: '۴ ساعت گذشته', status: 'overdue', type: 'call', state: 'تماس ناموفق قبلی' },
  { id: 6, title: 'ارسال قیمت', contact: 'مریم صادقی', company: 'فروشگاه اتا', assignee: 'رضا حسینی', due: 'فردا ۱۰:۰۰', status: 'upcoming', type: 'email', state: 'در حال آماده‌سازی' },
  { id: 7, title: 'جلسه حضوری', contact: 'محمد کریمی', company: 'مؤسسه گاما', assignee: 'علی محمدی', due: 'چهارشنبه ۱۴:۰۰', status: 'upcoming', type: 'meeting', state: 'تأیید شده' },
  { id: 8, title: 'ارسال نمونه محصول', contact: 'علی نوری', company: 'صنایع اپسیلون', assignee: 'مریم کریمی', due: 'پنج‌شنبه', status: 'upcoming', type: 'task', state: 'برنامه‌ریزی شده' },
  { id: 9, title: 'تماس مجدد', contact: 'سارا کاظمی', company: 'گروه یوتا', assignee: 'نرگس رضایی', due: 'جمعه ۱۱:۰۰', status: 'upcoming', type: 'call', state: 'موعد مقرر' },
  { id: 10, title: 'پیگیری نتیجه جلسه', contact: 'رضا بهرامی', company: 'مجموعه تتا', assignee: 'علی محمدی', due: 'شنبه ۰۹:۰۰', status: 'upcoming', type: 'meeting', state: 'پس از جلسه' },
];

const FOLLOWUP_TYPE_LABELS: Record<string, string> = {
  call: 'تماس',
  email: 'پیام/ایمیل',
  meeting: 'جلسه',
  task: 'اقدام',
  invoice: 'فاکتور',
};

const leadStatusColors: Record<string, string> = { 'جدید': '#3B82F6', 'تماس اول': '#F59E0B', 'پیگیری': '#8B5CF6' };
const typeIcons: Record<string, string> = { call: 'fa-solid fa-phone', email: 'fa-solid fa-envelope', meeting: 'fa-solid fa-users', task: 'fa-solid fa-list-check' };

function FollowupCard({ item, variant }: { item: FollowupItem; variant: 'overdue' | 'upcoming' }) {
  const { showToast } = useApp();
  const isOverdue = variant === 'overdue';
  const accent = isOverdue ? '#EF4444' : '#3B82F6';
  const accentBg = isOverdue ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)';
  const borderColor = isOverdue ? 'rgba(239,68,68,0.3)' : 'var(--aw-border)';

  const primaryActions = item.type === 'call'
    ? [{ id: 'call', label: 'تماس', icon: 'fa-solid fa-phone' }, { id: 'msg', label: 'پیام', icon: 'fa-solid fa-message' }]
    : item.type === 'email'
    ? [{ id: 'send', label: 'ارسال', icon: 'fa-solid fa-paper-plane' }, { id: 'call', label: 'تماس', icon: 'fa-solid fa-phone' }]
    : item.type === 'meeting'
    ? [{ id: 'join', label: 'مشاهده', icon: 'fa-solid fa-eye' }, { id: 'result', label: 'ثبت نتیجه', icon: 'fa-solid fa-clipboard-check' }]
    : item.type === 'invoice'
    ? [{ id: 'send', label: 'ارسال', icon: 'fa-solid fa-paper-plane' }, { id: 'view', label: 'مشاهده', icon: 'fa-solid fa-file-invoice' }]
    : [{ id: 'do', label: 'انجام', icon: 'fa-solid fa-play' }, { id: 'call', label: 'تماس', icon: 'fa-solid fa-phone' }];

  return (
    <div className="p-3 flex flex-col gap-2.5" style={{ ...cardStyle, borderColor }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: accentBg }}>
          <i className={`${typeIcons[item.type]} text-[14px]`} style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{item.title}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
              {FOLLOWUP_TYPE_LABELS[item.type]}
            </span>
          </div>
          <div className="text-[11px] text-[var(--aw-text-primary)] mt-1" style={{ fontWeight: 500 }}>
            <i className="fa-solid fa-building text-[9px] ml-1 text-[var(--aw-text-muted)]" />
            {item.company} <span className="text-[var(--aw-text-muted)]">• {item.contact}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-user-tie text-[8px] ml-1" />{item.assignee}</span>
            <span className="text-[10px]" style={{ color: accent }}><i className="fa-regular fa-clock text-[8px] ml-1" />{item.due}</span>
            <span className="text-[10px] text-[var(--aw-text-muted)]">• {item.state}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--aw-border)]">
        {primaryActions.map(a => (
          <button key={a.id} onClick={() => showToast(a.label + ' انجام شد')} className="text-[10px] px-2.5 py-1.5 rounded-lg border-none cursor-pointer text-white" style={{ background: 'linear-gradient(135deg, #22A6F0, #1B4FE8)' }}>
            <i className={`${a.icon} text-[9px] ml-1`} />{a.label}
          </button>
        ))}
        <button onClick={() => showToast('پیگیری به‌عنوان «انجام‌شده» ثبت شد')} className="text-[10px] px-2.5 py-1.5 rounded-lg border border-[var(--aw-border)] cursor-pointer bg-transparent text-[var(--aw-text-secondary)]">
          <i className="fa-solid fa-check text-[9px] ml-1" />انجام شد
        </button>
        <button onClick={() => showToast('پیگیری ارجاع داده شد')} className="text-[10px] px-2.5 py-1.5 rounded-lg border border-[var(--aw-border)] cursor-pointer bg-transparent text-[var(--aw-text-secondary)]">
          <i className="fa-solid fa-share text-[9px] ml-1" />ارجاع
        </button>
        <button onClick={() => showToast('زمان پیگیری تغییر کرد')} className="text-[10px] px-2.5 py-1.5 rounded-lg border border-[var(--aw-border)] cursor-pointer bg-transparent text-[var(--aw-text-secondary)]">
          <i className="fa-solid fa-calendar text-[9px] ml-1" />تغییر زمان
        </button>
      </div>
    </div>
  );
}

export function SecCrmLiteScreen() {
  const { openModal, showToast, startCall } = useApp();
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [tab, setTab] = useState('contacts');
  const [contactQuery, setContactQuery] = useState('');
  const [contactSegment, setContactSegment] = useState('همه');
  const [leadQuery, setLeadQuery] = useState('');
  const [leadStage, setLeadStage] = useState<string>('همه');

  const filteredContacts = contacts.filter(c => {
    if (contactSegment !== 'همه' && c.type !== contactSegment) return false;
    if (!contactQuery.trim()) return true;
    const q = contactQuery.trim();
    return c.name.includes(q) || c.company.includes(q) || c.phone.includes(q);
  });

  const filteredLeads = leads.filter(l => {
    if (leadStage !== 'همه' && l.status !== leadStage) return false;
    if (!leadQuery.trim()) return true;
    const q = leadQuery.trim();
    return l.name.includes(q) || l.contact.includes(q);
  });

  const searchInputCls = "w-full bg-[var(--aw-bg-input)] border border-[var(--aw-border)] rounded-[10px] pr-9 pl-3 py-2 text-[12px] text-[var(--aw-text-primary)] outline-none focus:border-[#22A6F0]";

  return (
    <div className="flex flex-col h-full">
      {/* KPI strip */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-4 gap-1.5">
          {CRM_KPIS.map((k, i) => (
            <div key={i} className="p-2 flex flex-col items-center text-center" style={{ ...cardStyle, background: `linear-gradient(135deg, ${k.color}15, ${k.color}05)` }}>
              <i className={`${k.icon} text-[12px] mb-1`} style={{ color: k.color }} />
              <span className="text-[14px]" style={{ fontWeight: 800, color: k.color }}>{k.value}</span>
              <span className="text-[9px] text-[var(--aw-text-muted)] mt-0.5">{k.label}</span>
            </div>
          ))}
        </div>
      </div>

      <TabBar tabs={CRM_LITE_TABS} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto px-4 pb-24 aw-scroll">
        <AnimatePresence mode="wait">
          {tab === 'contacts' && (
            <motion.div key="contacts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--aw-text-muted)]" />
                <input value={contactQuery} onChange={e => setContactQuery(e.target.value)} placeholder="جستجو نام، شرکت یا شماره..." className={searchInputCls} />
              </div>
              <div className="flex gap-1.5 overflow-x-auto aw-scroll pb-1">
                {CONTACT_SEGMENTS.map(s => (
                  <button
                    key={s}
                    onClick={() => setContactSegment(s)}
                    className="px-2.5 py-1 rounded-full text-[11px] border cursor-pointer whitespace-nowrap transition-all"
                    style={contactSegment === s
                      ? { background: 'linear-gradient(135deg, #22A6F0, #1B4FE8)', borderColor: '#22A6F0', color: 'white', fontWeight: 700 }
                      : { background: 'transparent', borderColor: 'var(--aw-border)', color: 'var(--aw-text-secondary)', fontWeight: 600 }}
                  >{s}</button>
                ))}
              </div>
              <button onClick={() => openModal('افزودن مخاطب جدید', <QuickForm onSubmit={(v) => setContacts(prev => [{ id: Date.now(), name: v.name, phone: v.phone || '', email: '', company: v.company || '', role: '', type: v.seg || 'مشتری', tier: 'عادی', lastContact: 'امروز' } as any, ...prev])} submitLabel="افزودن مخاطب" toast="مخاطب جدید افزوده شد" fields={[{ key: 'name', label: 'نام مخاطب' }, { key: 'phone', label: 'شماره تماس', type: 'tel' }, { key: 'company', label: 'شرکت / سازمان' }, { key: 'seg', label: 'دسته', type: 'select', options: ['مشتری', 'تأمین‌کننده', 'همکار'] }]} />)} className="p-2.5 flex items-center justify-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[12px] cursor-pointer bg-transparent hover:border-[#22A6F0] transition-colors text-[12px] text-[#22A6F0]">
                <i className="fa-solid fa-user-plus" />افزودن مخاطب جدید
              </button>

              {filteredContacts.map(c => (
                <div key={c.id} className="p-3 flex flex-col gap-2" style={cardStyle}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22A6F0, #1B4FE8)' }}>
                        <span className="text-white text-[14px]" style={{ fontWeight: 700 }}>{c.name[0]}</span>
                      </div>
                      <span className="absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-[var(--aw-bg-card)]" style={{ background: c.active ? '#10B981' : '#94a3b8' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{c.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>{c.type}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(46,134,255,0.12)', color: '#22A6F0' }}><i className="fa-solid fa-star text-[8px] ml-0.5" />{c.tier}</span>
                      </div>
                      <div className="text-[11px] text-[var(--aw-text-muted)] mt-0.5">
                        <i className="fa-solid fa-building text-[9px] ml-1" />{c.company} <span>• {c.role}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-phone text-[8px] ml-1" />{c.phone}</span>
                        <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-regular fa-clock text-[8px] ml-1" />{c.lastContact}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-2 border-t border-[var(--aw-border)]">
                    {[
                      { icon: 'fa-solid fa-phone', color: '#22A6F0', label: 'تماس' },
                      { icon: 'fa-solid fa-comment-sms', color: '#06b6d4', label: 'پیامک' },
                      { icon: 'fa-brands fa-whatsapp', color: '#16a34a', label: 'واتساپ' },
                      { icon: 'fa-solid fa-envelope', color: '#3b82f6', label: 'ایمیل' },
                      { icon: 'fa-solid fa-note-sticky', color: '#f59e0b', label: 'یادداشت' },
                    ].map(a => (
                      <button key={a.label} className="flex-1 py-1.5 rounded-md border-none cursor-pointer flex items-center justify-center gap-1 text-[10px]" style={{ background: `${a.color}15`, color: a.color, fontWeight: 600 }}>
                        <i className={`${a.icon} text-[10px]`} />{a.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <div className="p-6 flex flex-col items-center gap-2 text-[var(--aw-text-muted)]" style={cardStyle}>
                  <i className="fa-solid fa-magnifying-glass text-[20px]" style={{ opacity: 0.4 }} />
                  <span className="text-[12px]">مخاطبی یافت نشد</span>
                </div>
              )}
            </motion.div>
          )}
          {tab === 'leads' && (
            <motion.div key="leads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              {/* Pipeline summary */}
              <div className="grid grid-cols-3 gap-1.5">
                {LEAD_PIPELINE_STAGES.map(s => {
                  const items = MOCK_LEADS.filter(l => l.status === s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setLeadStage(leadStage === s.id ? 'همه' : s.id)}
                      className="p-2.5 flex flex-col items-center text-center cursor-pointer transition-all"
                      style={{ ...cardStyle, background: leadStage === s.id ? `${s.color}22` : `linear-gradient(135deg, ${s.color}10, ${s.color}03)`, borderColor: leadStage === s.id ? s.color : 'var(--aw-border)' }}
                    >
                      <i className={`${s.icon} text-[12px] mb-1`} style={{ color: s.color }} />
                      <span className="text-[14px]" style={{ fontWeight: 800, color: s.color }}>{toFa(String(items.length))}</span>
                      <span className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">{s.id}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--aw-text-muted)]" />
                <input value={leadQuery} onChange={e => setLeadQuery(e.target.value)} placeholder="جستجو سرنخ..." className={searchInputCls} />
              </div>

              <button onClick={() => openModal('ثبت سرنخ جدید', <QuickForm onSubmit={(v) => setLeads(prev => [{ id: Date.now(), name: v.name, contact: v.contact || '', source: v.source || 'سایر', status: 'جدید', value: '—', date: 'امروز' } as any, ...prev])} submitLabel="ثبت سرنخ" toast="سرنخ جدید ثبت شد" fields={[{ key: 'name', label: 'عنوان سرنخ' }, { key: 'contact', label: 'نام تماس' }, { key: 'phone', label: 'شماره تماس', type: 'tel' }, { key: 'source', label: 'منبع', type: 'select', options: ['تماس ورودی', 'وب‌سایت', 'معرفی', 'شبکه اجتماعی'] }]} />)} className="p-2.5 flex items-center justify-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[12px] cursor-pointer bg-transparent hover:border-[#22A6F0] transition-colors text-[12px] text-[#22A6F0]">
                <i className="fa-solid fa-plus" />ثبت سرنخ جدید
              </button>

              {filteredLeads.map(l => (
                <div key={l.id} className="p-3" style={cardStyle}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{l.name}</span>
                      <div className="text-[11px] text-[var(--aw-text-muted)] mt-0.5"><i className="fa-solid fa-user text-[9px] ml-1" />{l.contact}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${leadStatusColors[l.status]}22`, color: leadStatusColors[l.status] }}>{l.status}</span>
                        <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-bullseye text-[8px] ml-1" />{l.source}</span>
                        <span className="text-[10px] text-[#10B981]"><i className="fa-solid fa-coins text-[8px] ml-1" />{l.value}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-[var(--aw-text-muted)]">{l.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2 pt-2 border-t border-[var(--aw-border)]">
                    <button onClick={() => startCall(l.name, 'سرنخ', 'aw-bg-cyan', l.name.slice(0,2), l.contact || '')} className="flex-1 text-[10px] py-1.5 rounded-md border-none cursor-pointer text-white" style={{ background: 'linear-gradient(135deg, #22A6F0, #1B4FE8)', fontWeight: 600 }}>
                      <i className="fa-solid fa-phone text-[9px] ml-1" />تماس
                    </button>
                    <button onClick={() => showToast('سرنخ به تیم فروش ارجاع شد')} className="flex-1 text-[10px] py-1.5 rounded-md border-none cursor-pointer text-white" style={{ background: 'linear-gradient(135deg, #10B981, #047857)', fontWeight: 600 }}>
                      <i className="fa-solid fa-share text-[9px] ml-1" />ارجاع به فروش
                    </button>
                    <button onClick={() => showToast('سرنخ به مرحله بعد منتقل شد')} className="text-[10px] px-2.5 py-1.5 rounded-md border border-[var(--aw-border)] cursor-pointer bg-transparent text-[var(--aw-text-secondary)]" style={{ fontWeight: 600 }}>
                      <i className="fa-solid fa-arrow-right text-[9px] ml-1" />مرحله بعد
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          {tab === 'followup' && (
            <motion.div key="followup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              <SectionHeader title="عقب‌افتاده‌ها" icon="fa-solid fa-exclamation-triangle" count={MOCK_FOLLOWUPS.filter(f => f.status === 'overdue').length} />
              {MOCK_FOLLOWUPS.filter(f => f.status === 'overdue').map(f => (
                <FollowupCard key={f.id} item={f} variant="overdue" />
              ))}
              <SectionHeader title="پیش رو" icon="fa-solid fa-clock" count={MOCK_FOLLOWUPS.filter(f => f.status === 'upcoming').length} />
              {MOCK_FOLLOWUPS.filter(f => f.status === 'upcoming').map(f => (
                <FollowupCard key={f.id} item={f} variant="upcoming" />
              ))}
            </motion.div>
          )}
          {tab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              <div className="flex gap-1.5 overflow-x-auto aw-scroll pb-1">
                {['همه', 'تماس', 'پیامک', 'ایمیل', 'واتساپ', 'جلسه', 'یادداشت'].map(f => (
                  <button key={f} className="px-2.5 py-1 rounded-full text-[11px] border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-secondary)] cursor-pointer whitespace-nowrap" style={{ fontWeight: 600 }}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="relative pr-4 mt-1">
                <div className="absolute right-[7px] top-0 bottom-0 w-px bg-[var(--aw-border)]" />
                {CRM_ACTIVITIES.map(a => (
                  <div key={a.id} className="relative pb-3">
                    <span className="absolute right-[-13px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--aw-bg-card)] flex-shrink-0" style={{ background: a.color }} />
                    <div className="p-2.5 mr-2" style={cardStyle}>
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}22` }}>
                          <i className={`${a.icon} text-[11px]`} style={{ color: a.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{a.title}</span>
                            <span className="text-[10px] text-[var(--aw-text-muted)] whitespace-nowrap">{a.when}</span>
                          </div>
                          <div className="text-[11px] text-[var(--aw-text-secondary)] mt-0.5 leading-relaxed">{a.desc}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ========================
// 3. REPORTS SCREEN (گزارش عملکرد منشی)
// ========================
const PERF_STATS = [
  { label: 'تسک‌های انجام‌شده', value: '۲۴', icon: 'fa-solid fa-check-circle', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  { label: 'تسک‌های عقب‌افتاده', value: '۳', icon: 'fa-solid fa-exclamation-triangle', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  { label: 'جلسات برگزارشده', value: '۸', icon: 'fa-solid fa-users', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { label: 'سرنخ‌های ایجادشده', value: '۱۲', icon: 'fa-solid fa-user-plus', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
];

const PERF_RECENT_ACTIVITIES = [
  { id: 1, title: 'تماس با شرکت آلفا انجام شد', kind: 'call', time: 'امروز ۱۱:۲۰', icon: 'fa-solid fa-phone', color: '#10B981' },
  { id: 2, title: 'جلسه هفتگی تیم برگزار شد', kind: 'meeting', time: 'امروز ۰۹:۳۰', icon: 'fa-solid fa-users', color: '#3B82F6' },
  { id: 3, title: 'اطلاعات مشتری جدید ثبت شد', kind: 'data', time: 'دیروز ۱۶:۴۵', icon: 'fa-solid fa-user-plus', color: '#8B5CF6' },
  { id: 4, title: 'گزارش روزانه به مدیریت ارسال شد', kind: 'report', time: 'دیروز ۱۸:۰۰', icon: 'fa-solid fa-paper-plane', color: '#22A6F0' },
  { id: 5, title: 'تسک «هماهنگی جلسه بودجه» تکمیل شد', kind: 'task', time: 'دیروز ۱۴:۱۰', icon: 'fa-solid fa-check-circle', color: '#10B981' },
];

const PERF_RECENT_MEETINGS = [
  { id: 1, title: 'جلسه هفتگی تیم', attendees: 6, duration: '۴۵ دقیقه', date: 'امروز ۰۹:۳۰' },
  { id: 2, title: 'تماس با مشتری VIP', attendees: 2, duration: '۲۰ دقیقه', date: 'دیروز ۱۵:۰۰' },
  { id: 3, title: 'جلسه بررسی بودجه', attendees: 4, duration: '۶۰ دقیقه', date: 'دیروز ۱۰:۰۰' },
];

const PERF_PERIODIC_REPORTS = [
  { id: 'daily', label: 'گزارش روزانه', desc: 'خلاصه فعالیت‌های امروز', icon: 'fa-solid fa-calendar-day', color: '#10B981' },
  { id: 'weekly', label: 'گزارش هفتگی', desc: 'عملکرد ۷ روز گذشته', icon: 'fa-solid fa-calendar-week', color: '#3B82F6' },
  { id: 'monthly', label: 'گزارش ماهانه', desc: 'تحلیل عملکرد ماه جاری', icon: 'fa-solid fa-calendar', color: '#8B5CF6' },
];

const PERF_ALERTS = [
  { id: 1, title: 'تسک عقب‌افتاده', desc: 'پاسخ به ایمیل مشتری دلتا — ۲ روز تأخیر', icon: 'fa-solid fa-clock', severity: 'high' },
  { id: 2, title: 'مشتری بدون پاسخ', desc: 'شرکت بتا — ۳ پیام پیگیری بدون پاسخ', icon: 'fa-solid fa-comment-slash', severity: 'high' },
  { id: 3, title: 'تماس ناموفق', desc: 'سرنخ شرکت زتا — ۲ تماس بی‌پاسخ', icon: 'fa-solid fa-phone-slash', severity: 'medium' },
  { id: 4, title: 'جلسه لغوشده', desc: 'جلسه با مؤسسه گاما — لغو شد، نیاز به برنامه‌ریزی مجدد', icon: 'fa-solid fa-calendar-xmark', severity: 'medium' },
  { id: 5, title: 'درخواست ارجاع به مدیر', desc: 'مشتری دلتا — درخواست تخفیف ویژه', icon: 'fa-solid fa-user-tie', severity: 'low' },
];

const ALERT_SEVERITY: Record<string, { bg: string; color: string; border: string; label: string }> = {
  high: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'rgba(239,68,68,0.3)', label: 'فوری' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.3)', label: 'متوسط' },
  low: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: 'rgba(59,130,246,0.3)', label: 'اطلاع' },
};

function ViewAllButton({ label = 'مشاهده همه' }: { label?: string }) {
  return (
    <button className="w-full mt-2 py-2 rounded-lg border border-dashed border-[var(--aw-border)] cursor-pointer bg-transparent text-[11px] text-[var(--aw-text-muted)] hover:text-[#22A6F0] hover:border-[#22A6F0] transition-colors">
      {label} <i className="fa-solid fa-chevron-left text-[9px] mr-1" />
    </button>
  );
}

export function SecPerformanceScreen() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pb-24 aw-scroll">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {PERF_STATS.map((stat, i) => (
            <motion.div
              key={i}
              className="p-3 flex items-center gap-3"
              style={cardStyle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.bg }}>
                <i className={`${stat.icon} text-[16px]`} style={{ color: stat.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-[20px] text-[var(--aw-text-primary)]" style={{ fontWeight: 800 }}>{stat.value}</div>
                <div className="text-[10px] text-[var(--aw-text-muted)] truncate">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activities */}
        <SectionHeader title="فعالیت‌های اخیر" icon="fa-solid fa-bolt" count={PERF_RECENT_ACTIVITIES.length} />
        <div className="flex flex-col gap-1.5 mt-1">
          {PERF_RECENT_ACTIVITIES.map(a => (
            <div key={a.id} className="p-2.5 flex items-center gap-3" style={cardStyle}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}22` }}>
                <i className={`${a.icon} text-[11px]`} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] text-[var(--aw-text-primary)]">{a.title}</span>
                <div className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">{a.time}</div>
              </div>
            </div>
          ))}
          <ViewAllButton />
        </div>

        {/* Recent Meetings */}
        <SectionHeader title="جلسات اخیر" icon="fa-solid fa-users" count={PERF_RECENT_MEETINGS.length} />
        <div className="flex flex-col gap-1.5 mt-1">
          {PERF_RECENT_MEETINGS.map(m => (
            <div key={m.id} className="p-2.5 flex items-center gap-3" style={cardStyle}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.12)' }}>
                <i className="fa-solid fa-video text-[11px] text-[#3B82F6]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] text-[var(--aw-text-primary)]">{m.title}</span>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-[var(--aw-text-muted)]">{m.date}</span>
                  <span className="text-[10px] text-[var(--aw-text-muted)]">• {m.attendees} نفر</span>
                  <span className="text-[10px] text-[var(--aw-text-muted)]">• {m.duration}</span>
                </div>
              </div>
            </div>
          ))}
          <ViewAllButton label="مشاهده همه جلسات" />
        </div>

        {/* Periodic Reports */}
        <SectionHeader title="گزارش‌های دوره‌ای" icon="fa-solid fa-file-lines" />
        <div className="flex flex-col gap-1.5 mt-1">
          {PERF_PERIODIC_REPORTS.map(r => (
            <button key={r.id} className="p-3 flex items-center gap-3 border-none cursor-pointer w-full text-right" style={cardStyle}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${r.color}22` }}>
                <i className={`${r.icon} text-[13px]`} style={{ color: r.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{r.label}</span>
                <div className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">{r.desc}</div>
              </div>
              <i className="fa-solid fa-chevron-left text-[10px] text-[var(--aw-text-muted)]" />
            </button>
          ))}
        </div>

        {/* Management Alerts */}
        <SectionHeader title="هشدارهای مدیریتی" icon="fa-solid fa-triangle-exclamation" count={PERF_ALERTS.length} />
        <div className="flex flex-col gap-1.5 mt-1">
          {PERF_ALERTS.map(a => {
            const sev = ALERT_SEVERITY[a.severity];
            return (
              <div key={a.id} className="p-3 flex items-start gap-3" style={{ ...cardStyle, borderColor: sev.border }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: sev.bg }}>
                  <i className={`${a.icon} text-[13px]`} style={{ color: sev.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{a.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
                  </div>
                  <div className="text-[10px] text-[var(--aw-text-muted)] mt-0.5 leading-relaxed">{a.desc}</div>
                </div>
              </div>
            );
          })}
          <ViewAllButton label="مشاهده همه هشدارها" />
        </div>
      </div>
    </div>
  );
}

// ========================
// 4. DAILY FINANCE SCREEN (مالی روزانه)
// ========================
const DAILY_FIN_TABS = [
  { id: 'receipts', label: 'دریافت‌ها', icon: 'fa-solid fa-arrow-down' },
  { id: 'payments', label: 'پرداخت‌ها', icon: 'fa-solid fa-arrow-up' },
  { id: 'referrals', label: 'ارجاع به مالی‌ـاداری', icon: 'fa-solid fa-share-from-square' },
];

const MOCK_RECEIPTS = [
  { id: 1, from: 'شرکت آلفا', amount: '۱۲,۵۰۰,۰۰۰', method: 'کارت‌خوان', date: 'امروز ۱۱:۳۰', ref: 'RC-۱۰۲۳', desc: 'بابت پیش‌فاکتور فروردین' },
  { id: 2, from: 'فروشگاه بتا', amount: '۵,۸۰۰,۰۰۰', method: 'انتقال بانکی', date: 'امروز ۰۹:۱۵', ref: 'RC-۱۰۲۲', desc: 'تسویه سفارش هفته گذشته' },
  { id: 3, from: 'مؤسسه گاما', amount: '۳۲,۰۰۰,۰۰۰', method: 'چک', date: 'دیروز ۱۶:۴۰', ref: 'RC-۱۰۲۱', desc: 'چک یک‌ماهه' },
  { id: 4, from: 'شخص حقیقی', amount: '۲,۳۰۰,۰۰۰', method: 'نقد', date: 'دیروز ۱۴:۰۰', ref: 'RC-۱۰۲۰', desc: 'فروش حضوری' },
];

const MOCK_PAYMENTS_OUT = [
  { id: 1, title: 'خرید لوازم اداری', amount: '۱,۲۰۰,۰۰۰', recipient: 'فروشگاه پاپیروس', method: 'کارت به کارت', date: 'امروز', desc: 'کاغذ A4 و تونر' },
  { id: 2, title: 'هزینه پیک و ارسال', amount: '۴۵۰,۰۰۰', recipient: 'پیک موتوری', method: 'نقد', date: 'امروز', desc: 'ارسال مدارک به مشتری' },
  { id: 3, title: 'پذیرایی', amount: '۸۵۰,۰۰۰', recipient: 'سوپر محلی', method: 'نقد', date: 'دیروز', desc: 'آب و خوراکی جلسه' },
  { id: 4, title: 'تعمیر پرینتر', amount: '۲,۵۰۰,۰۰۰', recipient: 'فنی پرنیان', method: 'انتقال بانکی', date: 'دیروز', desc: 'تعویض هد و سرویس کامل' },
];

const REFERRAL_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  invoice: { label: 'صدور فاکتور', icon: 'fa-solid fa-file-invoice', color: '#3B82F6' },
  correction: { label: 'اصلاح سند', icon: 'fa-solid fa-pen-to-square', color: '#F59E0B' },
  debt: { label: 'بررسی بدهی', icon: 'fa-solid fa-scale-balanced', color: '#EF4444' },
  discrepancy: { label: 'مغایرت', icon: 'fa-solid fa-triangle-exclamation', color: '#F97316' },
  report: { label: 'گزارش مالی', icon: 'fa-solid fa-chart-pie', color: '#8B5CF6' },
  tax: { label: 'مالیات', icon: 'fa-solid fa-landmark', color: '#06B6D4' },
  payroll: { label: 'حقوق و دستمزد', icon: 'fa-solid fa-money-check-dollar', color: '#10B981' },
};

const MOCK_REFERRALS = [
  { id: 1, type: 'invoice', title: 'صدور فاکتور رسمی برای شرکت آلفا', desc: 'سفارش RC-۱۰۲۳ نیاز به فاکتور رسمی دارد', date: 'امروز ۱۱:۴۰', status: 'pending' },
  { id: 2, type: 'discrepancy', title: 'مغایرت در واریزی فروشگاه بتا', desc: 'مبلغ واریزی با پیش‌فاکتور ۲۰۰هزار اختلاف دارد', date: 'امروز ۱۰:۰۵', status: 'pending' },
  { id: 3, type: 'debt', title: 'بررسی بدهی معوق مؤسسه گاما', desc: 'فاکتور بهمن‌ماه هنوز تسویه نشده', date: 'دیروز', status: 'in_progress' },
  { id: 4, type: 'correction', title: 'اصلاح سند هزینه تعمیر پرینتر', desc: 'دسته‌بندی نادرست ثبت شده است', date: 'دیروز', status: 'pending' },
  { id: 5, type: 'report', title: 'درخواست گزارش دریافتی هفتگی', desc: 'برای جلسه مدیریت روز شنبه', date: '۲ روز پیش', status: 'done' },
];

const REFERRAL_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'در انتظار' },
  in_progress: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'در حال بررسی' },
  done: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'انجام شد' },
};

function NewReferralContent() {
  const { closeModal, showToast } = useApp();
  const [type, setType] = useState('invoice');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('normal');
  const [relatedRef, setRelatedRef] = useState('');
  const [target, setTarget] = useState<'agent' | 'human'>('agent');
  const [humanAssignee, setHumanAssignee] = useState('manager');

  const submit = () => {
    if (!title.trim()) { showToast('عنوان درخواست را وارد کنید'); return; }
    showToast(target === 'agent' ? 'درخواست به ایجنت مالی‌ـاداری ارجاع شد' : 'درخواست به مسئول انسانی ارجاع شد');
    closeModal();
  };

  return (
    <div className="p-4">
      <FormGroup label="ارجاع به *">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: 'agent' as const, label: 'ایجنت مالی‌ـاداری', icon: 'fa-solid fa-robot', desc: 'پاسخ خودکار و فوری' },
            { v: 'human' as const, label: 'مسئول انسانی', icon: 'fa-solid fa-user-tie', desc: 'بررسی توسط همکار' },
          ].map(t => (
            <button
              key={t.v}
              onClick={() => setTarget(t.v)}
              className="p-3 rounded-[12px] cursor-pointer transition-all flex flex-col items-center text-center gap-1"
              style={{
                background: target === t.v ? 'rgba(46,134,255,0.10)' : 'var(--aw-bg-input)',
                border: `1.5px solid ${target === t.v ? '#22A6F0' : 'var(--aw-border)'}`,
              }}
            >
              <i className={`${t.icon} text-[16px]`} style={{ color: target === t.v ? '#22A6F0' : 'var(--aw-text-muted)' }} />
              <span className="text-[12px]" style={{ color: target === t.v ? '#22A6F0' : 'var(--aw-text-primary)', fontWeight: target === t.v ? 700 : 600 }}>{t.label}</span>
              <span className="text-[10px] text-[var(--aw-text-muted)]">{t.desc}</span>
            </button>
          ))}
        </div>
      </FormGroup>
      {target === 'human' && (
        <FormGroup label="مسئول انسانی">
          <FormSelect
            value={humanAssignee}
            onChange={e => setHumanAssignee(e.target.value)}
            options={[
              { value: 'manager', label: 'مدیر مالی‌ـاداری' },
              { value: 'accountant', label: 'حسابدار ارشد' },
              { value: 'payroll', label: 'کارشناس حقوق و دستمزد' },
              { value: 'tax', label: 'کارشناس مالیاتی' },
            ]}
          />
        </FormGroup>
      )}
      <FormGroup label="نوع درخواست *">
        <FormSelect
          value={type}
          onChange={e => setType(e.target.value)}
          options={Object.entries(REFERRAL_TYPES).map(([v, t]) => ({ value: v, label: t.label }))}
        />
      </FormGroup>
      <FormGroup label="عنوان درخواست *">
        <FormInput placeholder="مثلاً: صدور فاکتور رسمی برای شرکت آلفا" value={title} onChange={e => setTitle(e.target.value)} />
      </FormGroup>
      <FormGroup label="توضیحات">
        <textarea
          placeholder="جزئیات و توضیحات لازم برای واحد مالی‌ـاداری..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
          className="w-full py-2.5 px-3.5 rounded-[10px] border border-[var(--aw-border)] text-[13px] text-[var(--aw-text-primary)] outline-none focus:border-[var(--aw-primary)] resize-none"
          style={{ background: 'var(--aw-bg-input)' }}
        />
      </FormGroup>
      <FormGroup label="شماره سند مرتبط (اختیاری)">
        <FormInput placeholder="مثلاً: RC-۱۰۲۳" value={relatedRef} onChange={e => setRelatedRef(e.target.value)} />
      </FormGroup>
      <FormGroup label="اولویت">
        <div className="flex gap-2">
          {[
            { v: 'low', label: 'عادی', color: '#10B981' },
            { v: 'normal', label: 'متوسط', color: '#F59E0B' },
            { v: 'high', label: 'فوری', color: '#EF4444' },
          ].map(p => (
            <button
              key={p.v}
              onClick={() => setPriority(p.v)}
              className="flex-1 py-2 px-3 rounded-[10px] text-[12px] cursor-pointer transition-all"
              style={{
                background: priority === p.v ? `${p.color}22` : 'var(--aw-bg-input)',
                color: priority === p.v ? p.color : 'var(--aw-text-secondary)',
                border: `1px solid ${priority === p.v ? p.color : 'var(--aw-border)'}`,
                fontWeight: priority === p.v ? 700 : 500,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </FormGroup>
      <div className="flex gap-2 mt-2">
        <button
          onClick={closeModal}
          className="flex-1 py-2.5 rounded-[10px] text-[13px] cursor-pointer border border-[var(--aw-border)] bg-transparent text-[var(--aw-text-secondary)]"
        >
          انصراف
        </button>
        <button
          onClick={submit}
          className="flex-1 py-2.5 rounded-[10px] text-[13px] text-white cursor-pointer border-none"
          style={{ background: 'linear-gradient(135deg, #22A6F0, #1B4FE8)', fontWeight: 700 }}
        >
          <i className="fa-solid fa-share-from-square ml-1.5" />
          ارجاع به مالی‌ـاداری
        </button>
      </div>
    </div>
  );
}

export function SecDailyFinanceScreen() {
  const { openModal } = useApp();
  const [receipts, setReceipts] = useState(MOCK_RECEIPTS);
  const [payments, setPayments] = useState(MOCK_PAYMENTS_OUT);
  const [tab, setTab] = useState('receipts');

  const parseAmount = (s: string) => {
    const en = s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[^\d]/g, '');
    return parseInt(en || '0', 10);
  };
  const formatShort = (n: number) => {
    if (n >= 1_000_000) return toFa((n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)) + 'م';
    if (n >= 1_000) return toFa(String(Math.round(n / 1_000))) + 'ه';
    return toFa(String(n));
  };

  const todayReceipts = MOCK_RECEIPTS.filter(r => r.date.startsWith('امروز'));
  const todayPayments = MOCK_PAYMENTS_OUT.filter(p => p.date === 'امروز');
  const todayReceiptsCount = todayReceipts.length;
  const todayPaymentsCount = todayPayments.length;
  const todayReceiptsSum = todayReceipts.reduce((s, r) => s + parseAmount(r.amount), 0);
  const todayPaymentsSum = todayPayments.reduce((s, p) => s + parseAmount(p.amount), 0);
  const pendingReferralsCount = MOCK_REFERRALS.filter(r => r.status !== 'done').length;

  return (
    <div className="flex flex-col h-full">
      {/* Top 3-counter summary */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 flex flex-col items-center text-center" style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.02))' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <i className="fa-solid fa-arrow-down text-[11px] text-[#10B981]" />
            </div>
            <span className="text-[16px] text-[#10B981]" style={{ fontWeight: 800 }}>{toFa(String(todayReceiptsCount))}</span>
            <span className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">دریافتی امروز</span>
            <span className="text-[10px] text-[#10B981] mt-0.5" style={{ fontWeight: 700 }}>{formatShort(todayReceiptsSum)} <span className="text-[9px] text-[var(--aw-text-muted)]">تومان</span></span>
          </div>
          <div className="p-2.5 flex flex-col items-center text-center" style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.02))' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <i className="fa-solid fa-arrow-up text-[11px] text-[#EF4444]" />
            </div>
            <span className="text-[16px] text-[#EF4444]" style={{ fontWeight: 800 }}>{toFa(String(todayPaymentsCount))}</span>
            <span className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">پرداختی امروز</span>
            <span className="text-[10px] text-[#EF4444] mt-0.5" style={{ fontWeight: 700 }}>{formatShort(todayPaymentsSum)} <span className="text-[9px] text-[var(--aw-text-muted)]">تومان</span></span>
          </div>
          <div className="p-2.5 flex flex-col items-center text-center" style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(46,134,255,0.10), rgba(46,134,255,0.02))' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(46,134,255,0.15)' }}>
              <i className="fa-solid fa-share-from-square text-[11px] text-[#22A6F0]" />
            </div>
            <span className="text-[16px] text-[#22A6F0]" style={{ fontWeight: 800 }}>{toFa(String(pendingReferralsCount))}</span>
            <span className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">ارجاع باز</span>
          </div>
        </div>
      </div>

      <TabBar tabs={DAILY_FIN_TABS} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto px-4 pb-24 aw-scroll">
        <AnimatePresence mode="wait">
          {tab === 'receipts' && (
            <motion.div key="receipts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              {receipts.map(r => (
                <div key={r.id} className="p-3" style={cardStyle}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{r.from}</span>
                      <div className="text-[11px] text-[var(--aw-text-secondary)] mt-1 leading-relaxed">{r.desc}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-credit-card text-[8px] ml-1" />{r.method}</span>
                        <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-hashtag text-[8px] ml-1" />{r.ref}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[13px] text-[#10B981]" style={{ fontWeight: 700 }}>{r.amount}</span>
                      <span className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">{r.date}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => openModal('ثبت دریافت جدید', <QuickForm onSubmit={(v) => setReceipts(prev => [{ id: Date.now(), from: v.from, amount: v.amount || '0', method: v.method || 'نقدی', date: 'امروز', ref: 'RC-' + Date.now().toString().slice(-4), desc: '' } as any, ...prev])} submitLabel="ثبت دریافت" toast="دریافت جدید ثبت شد" fields={[{ key: 'from', label: 'پرداخت‌کننده' }, { key: 'amount', label: 'مبلغ (تومان)' }, { key: 'method', label: 'روش', type: 'select', options: ['نقدی', 'کارت‌به‌کارت', 'چک', 'حواله'] }]} />)} className="w-full p-3 flex items-center justify-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[14px] cursor-pointer bg-transparent hover:border-[#10B981] transition-colors text-[13px] text-[#10B981]">
                <i className="fa-solid fa-plus" />ثبت دریافت جدید
              </button>
            </motion.div>
          )}
          {tab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              {payments.map(p => (
                <div key={p.id} className="p-3" style={cardStyle}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{p.title}</span>
                      <div className="text-[11px] text-[var(--aw-text-secondary)] mt-1 leading-relaxed">{p.desc}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-user text-[8px] ml-1" />{p.recipient}</span>
                        <span className="text-[10px] text-[var(--aw-text-muted)]"><i className="fa-solid fa-credit-card text-[8px] ml-1" />{p.method}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[13px] text-[#EF4444]" style={{ fontWeight: 700 }}>{p.amount}</span>
                      <span className="text-[10px] text-[var(--aw-text-muted)] mt-0.5">{p.date}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => openModal('ثبت پرداخت جدید', <QuickForm onSubmit={(v) => setPayments(prev => [{ id: Date.now(), title: v.to, amount: v.amount || '0', recipient: v.to, method: v.method || 'نقدی', date: 'امروز', desc: '' } as any, ...prev])} submitLabel="ثبت پرداخت" toast="پرداخت جدید ثبت شد" fields={[{ key: 'to', label: 'دریافت‌کننده' }, { key: 'amount', label: 'مبلغ (تومان)' }, { key: 'method', label: 'روش', type: 'select', options: ['نقدی', 'کارت‌به‌کارت', 'چک', 'حواله'] }]} />)} className="w-full p-3 flex items-center justify-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[14px] cursor-pointer bg-transparent hover:border-[#EF4444] transition-colors text-[13px] text-[#EF4444]">
                <i className="fa-solid fa-plus" />ثبت پرداخت جدید
              </button>
            </motion.div>
          )}
          {tab === 'referrals' && (
            <motion.div key="referrals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 pt-2">
              {MOCK_REFERRALS.map(ref => {
                const type = REFERRAL_TYPES[ref.type];
                const st = REFERRAL_STATUS[ref.status];
                return (
                  <div key={ref.id} className="p-3" style={cardStyle}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${type.color}22` }}>
                        <i className={`${type.icon} text-[13px]`} style={{ color: type.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[13px] text-[var(--aw-text-primary)]" style={{ fontWeight: 600 }}>{ref.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                        <div className="text-[11px] text-[var(--aw-text-secondary)] mt-1 leading-relaxed">{ref.desc}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${type.color}15`, color: type.color }}>{type.label}</span>
                          <span className="text-[10px] text-[var(--aw-text-muted)]">{ref.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => openModal('ثبت درخواست برای مالی‌ـاداری', <NewReferralContent />)}
                className="w-full p-3 flex items-center justify-center gap-2 border-2 border-dashed border-[var(--aw-border)] rounded-[14px] cursor-pointer bg-transparent hover:border-[#22A6F0] transition-colors text-[13px] text-[#22A6F0]"
              >
                <i className="fa-solid fa-plus" />ثبت درخواست برای مالی‌ـاداری
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}