import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from './components/Icon';

type Kind = 'expense' | 'income';
type Tab = 'home' | 'transactions' | 'analytics' | 'budgets' | 'profile';
type Budget = { category: string; limit: number };
type BudgetState = { monthly: number; categories: Budget[] };
type Goal = { id: number; name: string; current: number; target: number };
type Transaction = {
  id: number;
  title: string;
  category: string;
  kind: Kind;
  amount: number;
  date: string;
  note?: string;
};

const categoryMeta: Record<string, { icon: IconName; color: string }> = {
  Food: { icon: 'food', color: 'coral' },
  Housing: { icon: 'home', color: 'purple' },
  Travel: { icon: 'car', color: 'blue' },
  Lifestyle: { icon: 'sparkles', color: 'pink' },
  Home: { icon: 'grid', color: 'mint' },
  Income: { icon: 'arrowDown', color: 'green' },
  Shopping: { icon: 'bag', color: 'yellow' },
};

const nav: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'transactions', label: 'Activity', icon: 'receipt' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'budgets', label: 'Budgets', icon: 'target' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
// Compact amounts the Indian way (₹1K, ₹2.5 L, ₹1.2 Cr). Intl's own compact form for en-IN prints "T" for thousand, which reads like trillion.
function money(minor: number, compact = false) {
  const rupees = minor / 100;
  if (!compact || Math.abs(rupees) < 1000) return inr.format(rupees);
  const a = Math.abs(rupees); const sign = rupees < 0 ? '-' : '';
  const fmt = (n: number, unit: string) => `${sign}₹${Math.round(n * 10) / 10}${unit}`;
  return a >= 1e7 ? fmt(a / 1e7, ' Cr') : a >= 1e5 ? fmt(a / 1e5, ' L') : fmt(a / 1e3, 'K');
}

// Everything is saved on this device only (localStorage). No server, no account.
function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ } }, [key, value]);
  return [value, setValue] as const;
}

// Local-time date helpers (toISOString would give the UTC date, which is wrong late at night / early morning in India).
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ym = (d = new Date()) => ymd(d).slice(0, 7);

// Object.groupBy is missing from older Android WebViews, so use a small helper.
function groupBy<T>(list: T[], key: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of list) (out[key(item)] ||= []).push(item);
  return out;
}

const sumOf = (list: Transaction[], kind: Kind) => list.filter((t) => t.kind === kind).reduce((s, t) => s + t.amount, 0);
const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [transactions, setTransactions] = usePersisted<Transaction[]>('expenza-transactions', []);
  const [name, setName] = usePersisted<string>('expenza-name', '');
  const [budgets, setBudgets] = usePersisted<BudgetState>('expenza-budgets', { monthly: 0, categories: [] });
  const [goals, setGoals] = usePersisted<Goal[]>('expenza-goals', []);
  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState<'add' | 'transfer' | null>(null);
  const [addKind, setAddKind] = useState<Kind>('expense');
  const openAdd = (kind: Kind = 'expense') => { setAddKind(kind); setModal('add'); };
  const [toast, setToast] = useState('');
  const [light, setLight] = useState(() => localStorage.getItem('expenza-theme') === 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    localStorage.setItem('expenza-theme', light ? 'light' : 'dark');
  }, [light]);

  const monthTx = useMemo(() => transactions.filter((t) => t.date.startsWith(ym())), [transactions]);
  const totals = useMemo(() => {
    const income = sumOf(transactions, 'income');
    const expense = sumOf(transactions, 'expense');
    return { income, expense, balance: income - expense };
  }, [transactions]);
  const monthTotals = useMemo(() => ({ income: sumOf(monthTx, 'income'), expense: sumOf(monthTx, 'expense') }), [monthTx]);

  const toastTimer = useRef<number | undefined>(undefined);
  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="phone-frame">
        <div className="statusbar"><span>9:41</span><span className="status-icons"><Icon name="signal" /><Icon name="wifi" /><Icon name="battery" /></span></div>
        <div className="screen-content">
          {tab === 'home' && (
            <Home
              name={name}
              transactions={transactions}
              totals={totals}
              monthTotals={monthTotals}
              hidden={hidden}
              onToggleHidden={() => setHidden((v) => !v)}
              onAdd={openAdd}
              onTransfer={() => setModal('transfer')}
              onNavigate={setTab}
            />
          )}
          {tab === 'transactions' && (
            <Transactions items={transactions} onAdd={openAdd} onDelete={(id) => { setTransactions((all) => all.filter((t) => t.id !== id)); notify('Transaction deleted'); }} />
          )}
          {tab === 'analytics' && <Analytics all={transactions} items={monthTx} totals={monthTotals} />}
          {tab === 'budgets' && <Budgets monthTx={monthTx} budgets={budgets} setBudgets={setBudgets} goals={goals} setGoals={setGoals} notify={notify} />}
          {tab === 'profile' && (
            <Profile
              light={light}
              onTheme={() => setLight((v) => !v)}
              name={name}
              onName={(n) => { setName(n); notify('Profile updated'); }}
              onReset={() => {
                if (!window.confirm('Erase all transactions, budgets and goals from this device? This cannot be undone.')) return;
                setTransactions([]); setBudgets({ monthly: 0, categories: [] }); setGoals([]); setName(''); setTab('home'); notify('All data erased');
              }}
              notify={notify}
              exportable={{ name, transactions, budgets, goals }}
            />
          )}
        </div>
        <nav className="bottom-nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <button key={item.id} className={tab === item.id ? 'nav-item active' : 'nav-item'} onClick={() => setTab(item.id)}>
              <span className="nav-icon"><Icon name={item.icon} /></span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </section>
      {modal === 'add' && <AddTransaction initialKind={addKind} onClose={() => setModal(null)} onSave={(item) => { setTransactions((all) => [item, ...all]); setModal(null); notify('Transaction added successfully'); }} />}
      {modal === 'transfer' && <Transfer onClose={() => setModal(null)} onDone={(item) => { setTransactions((all) => [item, ...all]); setModal(null); notify('Transfer completed'); }} />}
      {toast && <div className="toast"><span className="success-dot"><Icon name="check" /></span>{toast}</div>}
    </main>
  );
}



function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <header className="page-header"><div>{subtitle && <p className="eyebrow">{subtitle}</p>}<h1>{title}</h1></div>{action}</header>;
}

function Home({ name, transactions, totals, monthTotals, hidden, onToggleHidden, onAdd, onTransfer, onNavigate }: {
  name: string; transactions: Transaction[]; totals: { income: number; expense: number; balance: number }; monthTotals: { income: number; expense: number }; hidden: boolean;
  onToggleHidden: () => void; onAdd: (kind?: Kind) => void; onTransfer: () => void; onNavigate: (tab: Tab) => void;
}) {
  return <div className="page enter">
    <Header title={name ? `Hello, ${name.split(' ')[0]}` : 'Hello there'} subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} action={<button className="avatar" onClick={() => onNavigate('profile')}>{initialsOf(name) || <Icon name="user" />}<span /></button>} />
    <div className="month-selector"><button><Icon name="chevronLeft" /></button><span>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span><button><Icon name="chevronRight" /></button></div>
    <section className="balance-card">
      <div className="orb" /><div className="card-top"><span>Total balance</span><button onClick={onToggleHidden}><Icon name={hidden ? 'eyeOff' : 'eye'} /></button></div>
      <h2>{hidden ? '₹ ••••••' : money(totals.balance)}</h2>
      <div className="balance-change"><Icon name={monthTotals.income >= monthTotals.expense ? 'trendingUp' : 'trendingDown'} /> {money(Math.abs(monthTotals.income - monthTotals.expense), true)} <span>{monthTotals.income >= monthTotals.expense ? 'saved this month' : 'overspent this month'}</span></div>
      <div className="balance-stats"><div><span><i className="income"><Icon name="arrowDown" /></i> Income</span><b>{hidden ? '••••' : money(monthTotals.income, true)}</b></div><div><span><i className="expense"><Icon name="arrowUp" /></i> Expenses</span><b>{hidden ? '••••' : money(monthTotals.expense, true)}</b></div></div>
    </section>
    <section><div className="section-title"><h3>Quick actions</h3></div><div className="quick-grid">
      <button onClick={() => onAdd('expense')}><i className="purple"><Icon name="plus" /></i><span>Add expense</span></button>
      <button onClick={() => onAdd('income')}><i className="mint"><Icon name="arrowDown" /></i><span>Add income</span></button>
      <button onClick={onTransfer}><i className="blue"><Icon name="send" /></i><span>Transfer</span></button>
      <button onClick={() => onNavigate('analytics')}><i className="pink"><Icon name="chart" /></i><span>Reports</span></button>
    </div></section>
    <SpendingCard items={transactions} />
    <section><div className="section-title"><h3>Recent activity</h3><button onClick={() => onNavigate('transactions')}>View all</button></div><div className="transaction-card">{transactions.length ? transactions.slice(0, 4).map((t) => <TransactionRow key={t.id} item={t} />) : <Empty icon="receipt" title="No transactions yet" text="Tap Add expense or Add income to get started." />}</div></section>
  </div>;
}

function SpendingCard({ items }: { items: Transaction[] }) {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const perDay = days.map((d) => items.filter((t) => t.kind === 'expense' && t.date === ymd(d)).reduce((s, t) => s + t.amount, 0));
  const prev = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return ymd(d); });
  const prevTotal = items.filter((t) => t.kind === 'expense' && prev.includes(t.date)).reduce((s, t) => s + t.amount, 0);
  const total = perDay.reduce((a, b) => a + b, 0);
  const max = Math.max(...perDay, 1);
  const change = prevTotal ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;
  return <section className="spending-card"><div className="section-title"><div><p className="eyebrow">Last 7 days</p><h3>Spending overview</h3></div></div><div className="chart-total"><b>{money(total)}</b>{change !== null && <span><Icon name={change <= 0 ? 'trendingDown' : 'trendingUp'} /> {Math.abs(change)}%</span>}</div><div className="bar-chart">{perDay.map((v, i) => <div key={i} className={i === 6 ? 'bar-column selected' : 'bar-column'}><i style={{ height: `${Math.max(4, (v / max) * 100)}%` }} /> <small>{days[i].toLocaleDateString('en-IN', { weekday: 'narrow' })}</small></div>)}</div></section>;
}

function TransactionRow({ item, onDelete }: { item: Transaction; onDelete?: () => void }) {
  const meta = categoryMeta[item.category] || categoryMeta.Shopping;
  return <div className="transaction-row"><i className={`category ${meta.color}`}><Icon name={meta.icon} /></i><div className="transaction-info"><b>{item.title}</b><span>{item.category} · {new Date(item.date + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div><div className="transaction-amount"><b className={item.kind}>{item.kind === 'income' ? '+' : '−'}{money(item.amount)}</b>{onDelete && <button className="delete-btn" onClick={onDelete}><Icon name="trash" /></button>}</div></div>;
}

function Transactions({ items, onAdd, onDelete }: { items: Transaction[]; onAdd: () => void; onDelete: (id: number) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Kind>('all');
  const filtered = items.filter((t) => (filter === 'all' || t.kind === filter) && `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase()));
  const groups = groupBy(filtered, (t) => t.date);
  return <div className="page enter">
    <Header title="Transactions" subtitle={`${items.length} records`} action={<button className="circle-btn" onClick={() => onAdd()}><Icon name="plus" /></button>} />
    <label className="search"><Icon name="search" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transactions" /><button><Icon name="sliders" /></button></label>
    <div className="filter-tabs">{(['all','expense','income'] as const).map((f) => <button className={filter === f ? 'active' : ''} onClick={() => setFilter(f)} key={f}>{f[0].toUpperCase() + f.slice(1)}</button>)}</div>
    {filtered.length === 0 ? <Empty icon="search" title="Nothing found" text="Try another search or filter." /> : Object.entries(groups).sort(([a],[b]) => b.localeCompare(a)).map(([date, list]) => <section className="history-group" key={date}><div className="history-date"><b>{new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</b><span>{money((list || []).reduce((s,t) => s + (t.kind === 'expense' ? t.amount : 0), 0))}</span></div><div className="transaction-card">{(list || []).map((t) => <TransactionRow key={t.id} item={t} onDelete={() => onDelete(t.id)} />)}</div></section>)}
  </div>;
}

function Analytics({ all, items, totals }: { all: Transaction[]; items: Transaction[]; totals: { income: number; expense: number } }) {
  const expenses = items.filter((t) => t.kind === 'expense');
  const byCategory = Object.entries(groupBy(expenses, (t) => t.category)).map(([category, list]) => ({ category, amount: list.reduce((s, t) => s + t.amount, 0) })).sort((a, b) => b.amount - a.amount);
  const savings = totals.income ? Math.round((totals.income - totals.expense) / totals.income * 100) : 0;
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return d; });
  const monthly = months.map((d) => all.filter((t) => t.kind === 'expense' && t.date.startsWith(ym(d))).reduce((s, t) => s + t.amount, 0));
  const max = Math.max(...monthly, 1);
  const pts = monthly.map((v, i) => [i * (340 / 5), 118 - (v / max) * 100] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return <div className="page enter">
    <Header title="Analytics" subtitle={new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} />
    <section className="analytics-card"><div className="donut-wrap"><div className="donut"><div><span>Spent this month</span><b>{money(totals.expense, true)}</b></div></div></div><div className="legend">{byCategory.slice(0, 4).map((c, i) => <div key={c.category}><i className={`dot d${i}`} /><span>{c.category}</span><b>{totals.expense ? Math.round(c.amount / totals.expense * 100) : 0}%</b></div>)}{!byCategory.length && <div><span>No expenses this month</span></div>}</div></section>
    <div className="insight-grid"><article><i><Icon name="piggy" /></i><span>Savings rate</span><b>{savings}%</b><small>{totals.income ? 'Income vs spending' : 'Add income to see this'}</small></article><article><i><Icon name="calendar" /></i><span>Daily average</span><b>{money(totals.expense / new Date().getDate(), true)}</b><small>This month so far</small></article></div>
    <section className="trend-card"><div className="section-title"><div><p className="eyebrow">6 month trend</p><h3>Monthly spending</h3></div></div><div className="line-chart"><svg viewBox="0 0 340 130" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8B7CFF" stopOpacity=".35"/><stop offset="1" stopColor="#8B7CFF" stopOpacity="0"/></linearGradient></defs><path className="area" d={`${line} L340 130 L0 130Z`}/><path className="line" d={line}/></svg><div className="months">{months.map((d) => <span key={d.getTime()}>{d.toLocaleDateString('en-IN', { month: 'short' })}</span>)}</div></div></section>
    <section><div className="section-title"><h3>Top categories</h3></div><div className="category-list">{byCategory.slice(0, 3).map((c) => <div key={c.category}><span>{c.category}</span><b>{money(c.amount)}</b><i><em style={{ width: `${Math.max(8, c.amount / (byCategory[0]?.amount || 1) * 100)}%` }} /></i></div>)}</div></section>
  </div>;
}

function FormSheet({ title, submit, fields, onClose, onSubmit, secondary }: {
  title: string; submit: string; onClose: () => void;
  fields: { key: string; placeholder: string; numeric?: boolean; initial?: string }[];
  onSubmit: (values: Record<string, string>) => void;
  secondary?: { label: string; onClick: () => void };
}) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.key, f.initial || ''])));
  return <div className="modal-backdrop"><div className="sheet enter-up"><div className="sheet-handle" /><div className="sheet-header"><button onClick={onClose} aria-label="Close"><Icon name="close" /></button><h2>{title}</h2><span /></div>
    <div style={{ display: 'grid', gap: '.7rem', margin: '1.4rem 0' }}>{fields.map((f) => <label className="merchant-input" key={f.key}><input aria-label={f.placeholder} inputMode={f.numeric ? 'numeric' : undefined} value={values[f.key] || ''} onChange={(e) => setValues((v) => ({ ...v, [f.key]: f.numeric ? e.target.value.replace(/\D/g, '') : e.target.value }))} placeholder={f.placeholder} /></label>)}</div>
    <button className="primary-button" onClick={() => onSubmit(values)}>{submit}</button>
    {secondary && <button className="text-button" style={{ marginTop: '1rem' }} onClick={secondary.onClick}>{secondary.label}</button>}
  </div></div>;
}

function Budgets({ monthTx, budgets, setBudgets, goals, setGoals, notify }: {
  monthTx: Transaction[]; budgets: BudgetState; setBudgets: (b: BudgetState) => void; goals: Goal[]; setGoals: (g: Goal[]) => void; notify: (s: string) => void;
}) {
  const [sheet, setSheet] = useState<'budget' | 'goal' | { goal: Goal } | null>(null);
  const spentTotal = sumOf(monthTx, 'expense');
  const spentIn = (c: string) => monthTx.filter((t) => t.kind === 'expense' && t.category.toLowerCase() === c.toLowerCase()).reduce((s, t) => s + t.amount, 0);
  const pct = budgets.monthly ? Math.round(spentTotal / budgets.monthly * 100) : 0;
  return <div className="page enter"><Header title="Budgets" subtitle="Plan with confidence" action={<button className="circle-btn" aria-label="Set budget" onClick={() => setSheet('budget')}><Icon name="plus" /></button>} />
    <section className="budget-hero"><div className="progress-ring"><span>{budgets.monthly ? `${pct}%` : '–'}</span></div><div><span>{budgets.monthly ? 'Available this month' : 'No monthly budget yet'}</span><h2>{budgets.monthly ? money(Math.max(0, budgets.monthly - spentTotal)) : 'Set one'}</h2><small>{budgets.monthly ? `${money(spentTotal)} of ${money(budgets.monthly)} spent` : 'Tap + and leave the category empty'}</small></div></section>
    <div className="section-title"><h3>Category budgets</h3><button onClick={() => setSheet('budget')}>Edit</button></div><div className="budget-list">{budgets.categories.map((b) => <article key={b.category}><i className="category purple"><Icon name={categoryMeta[b.category]?.icon || 'wallet'} /></i><div><span><b>{b.category}</b><small>{money(spentIn(b.category))} / {money(b.limit)}</small></span><div className="progress"><i style={{ width: `${Math.min(100, spentIn(b.category) / b.limit * 100)}%` }} /></div></div></article>)}{!budgets.categories.length && <Empty icon="target" title="No category budgets" text="Tap + to limit spending on Food, Travel and more." />}</div>
    <div className="section-title"><h3>Savings goals</h3><button onClick={() => setSheet('goal')}>Add goal</button></div><div className="goals">{goals.map((g, index) => <article key={g.id}><div className="goal-icon"><Icon name={index % 2 ? 'plane' : 'shield'} /></div><div><b>{g.name}</b><span>{money(g.current)} of {money(g.target)}</span><div className="progress mint-progress"><i style={{ width: `${Math.min(100, g.current / g.target * 100)}%` }} /></div></div><button aria-label={`Add money to ${g.name}`} onClick={() => setSheet({ goal: g })}><Icon name="plus" /></button></article>)}{!goals.length && <Empty icon="piggy" title="No goals yet" text="Create a savings goal and track your progress." />}</div>
    {sheet === 'budget' && <FormSheet title="Set a budget" submit="Save budget" onClose={() => setSheet(null)} fields={[{ key: 'category', placeholder: 'Category, e.g. Food (empty = monthly)' }, { key: 'limit', placeholder: 'Limit in ₹ (0 removes it)', numeric: true }]}
      onSubmit={(v) => {
        const category = (v.category || '').trim(); const limit = Number(v.limit || 0) * 100;
        if (!category) setBudgets({ ...budgets, monthly: limit });
        else {
          const rest = budgets.categories.filter((b) => b.category.toLowerCase() !== category.toLowerCase());
          setBudgets({ ...budgets, categories: limit ? [...rest, { category: category[0].toUpperCase() + category.slice(1), limit }] : rest });
        }
        setSheet(null); notify('Budget saved');
      }} />}
    {sheet === 'goal' && <FormSheet title="New savings goal" submit="Create goal" onClose={() => setSheet(null)} fields={[{ key: 'name', placeholder: 'Goal name' }, { key: 'target', placeholder: 'Target in ₹', numeric: true }]}
      onSubmit={(v) => { if (!v.name?.trim() || !Number(v.target)) return notify('Enter a name and a target'); setGoals([...goals, { id: Date.now(), name: v.name.trim(), current: 0, target: Number(v.target) * 100 }]); setSheet(null); notify('Goal created'); }} />}
    {sheet && typeof sheet === 'object' && 'goal' in sheet && <FormSheet title={sheet.goal.name} submit="Add to goal" onClose={() => setSheet(null)} fields={[{ key: 'amount', placeholder: 'Amount in ₹', numeric: true }]}
      secondary={{ label: 'Delete this goal', onClick: () => { const id = sheet.goal.id; setGoals(goals.filter((x) => x.id !== id)); setSheet(null); notify('Goal deleted'); } }}
      onSubmit={(v) => { const a = Number(v.amount || 0) * 100; if (!a) return notify('Enter an amount'); const id = sheet.goal.id; setGoals(goals.map((x) => x.id === id ? { ...x, current: Math.min(x.target, x.current + a) } : x)); setSheet(null); notify('Added to goal'); }} />}
  </div>;
}

function Profile({ light, onTheme, name, onName, onReset, notify, exportable }: {
  light: boolean; onTheme: () => void; name: string; onName: (n: string) => void; onReset: () => void; notify: (s: string) => void;
  exportable: { name: string; transactions: Transaction[]; budgets: BudgetState; goals: Goal[] };
}) {
  const [editing, setEditing] = useState(false);
  const exportData = () => {
    const blob = new Blob([JSON.stringify(exportable, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'expenza-data.json'; a.click(); URL.revokeObjectURL(a.href);
    notify('Data export ready');
  };
  return <div className="page enter"><Header title="Profile" subtitle="Your Expenza" /><section className="profile-hero"><div className="large-avatar">{initialsOf(name) || <Icon name="user" />}</div><h2>{name || 'Your name'}</h2><span>Stored only on this device</span><button onClick={() => setEditing(true)}>Edit profile</button></section>
    <div className="settings-group"><p className="eyebrow">Preferences</p><Setting icon="moon" title="Appearance" subtitle={light ? 'Light mode' : 'Dark mode'} action={<button className={light ? 'switch' : 'switch on'} onClick={onTheme}><i /></button>} /><Setting icon="coins" title="Currency" subtitle="Indian Rupee (₹)" /></div>
    <div className="settings-group"><p className="eyebrow">Data & privacy</p><Setting icon="lock" title="Private by design" subtitle="No account, no server — data never leaves your phone" /><Setting icon="download" title="Export your data" subtitle="Download as JSON" onClick={exportData} /></div>
    <button className="logout" onClick={onReset}><Icon name="logout" /> Erase all data</button><p className="version">Expenza 1.0 · Personal edition</p>
    {editing && <FormSheet title="Edit profile" submit="Save" onClose={() => setEditing(false)} fields={[{ key: 'name', placeholder: 'Your name', initial: name }]} onSubmit={(v) => { onName((v.name || '').trim()); setEditing(false); }} />}
  </div>;
}

function Setting({ icon, title, subtitle, action, onClick }: { icon: IconName; title: string; subtitle: string; action?: React.ReactNode; onClick?: () => void }) {
  const content = <><i><Icon name={icon} /></i><span><b>{title}</b><small>{subtitle}</small></span>{action || <Icon name="chevronRight" />}</>;
  return action
    ? <div className="setting">{content}</div>
    : <button className="setting" onClick={onClick}>{content}</button>;
}

function AddTransaction({ initialKind, onClose, onSave }: { initialKind: Kind; onClose: () => void; onSave: (t: Transaction) => void }) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [merchant, setMerchant] = useState('');
  const [saving, setSaving] = useState(false);
  const tap = (v: string) => setAmount((a) => v === 'back' ? a.slice(0,-1) : a.length < 8 ? a + v : a);
  const save = () => {
    if (!amount || Number(amount) === 0) return;
    setSaving(true);
    window.setTimeout(() => onSave({ id: Date.now(), title: merchant || category, category: kind === 'income' ? 'Income' : category, kind, amount: Number(amount)*100, date: ymd() }), 650);
  };
  return <div className="modal-backdrop"><div className="sheet amount-sheet enter-up"><div className="sheet-handle" /><div className="sheet-header"><button onClick={onClose}><Icon name="close" /></button><h2>Add transaction</h2><button className="text-button" onClick={save}>Save</button></div>
    <div className="segmented transaction-toggle"><button className={kind==='expense'?'active':''} onClick={() => setKind('expense')}>Expense</button><button className={kind==='income'?'active income-tab':''} onClick={() => setKind('income')}>Income</button></div>
    <div className="amount-display"><span>₹</span><b>{amount || '0'}</b><i /></div>
    <div className="category-scroll">{['Food','Housing','Travel','Shopping','Lifestyle'].map((c) => { const m = categoryMeta[c] || categoryMeta.Shopping; return <button key={c} className={category===c?'selected':''} onClick={() => setCategory(c)}><i className={`category ${m.color}`}><Icon name={m.icon} /></i><span>{c}</span></button>})}</div>
    <label className="merchant-input"><Icon name="store" /><input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Merchant or description" /></label>
    <div className="keypad amount-keypad">{['1','2','3','4','5','6','7','8','9','00','0','back'].map((n) => <button key={n} onClick={() => tap(n)}>{n === 'back' ? <Icon name="backspace" /> : <b>{n}</b>}</button>)}</div>
    <button className={saving ? 'primary-button saving' : 'primary-button'} onClick={save}>{saving ? <><Icon name="check" /> Saved</> : `Add ${kind}`}</button>
  </div></div>;
}

function Transfer({ onClose, onDone }: { onClose: () => void; onDone: (t: Transaction) => void }) {
  const [step, setStep] = useState(1); const [amount, setAmount] = useState('');
  const people = [{ initials:'NM', name:'Neha', color:'purple' },{ initials:'RS', name:'Rohan', color:'mint' },{ initials:'PM', name:'Priya', color:'pink' },{ initials:'VK', name:'Vikram', color:'blue' }];
  const [person, setPerson] = useState(people[0]);
  return <div className="modal-backdrop"><div className="sheet transfer-sheet enter-up"><div className="sheet-handle" /><div className="sheet-header"><button onClick={step===1?onClose:()=>setStep(1)}><Icon name={step===1?'close':'arrowLeft'} /></button><h2>{step===1?'Quick transfer':'Confirm transfer'}</h2><span /></div>
    {step===1 ? <><p className="sheet-label">Send to</p><div className="people">{people.map((p) => <button className={person.name===p.name?'selected':''} key={p.name} onClick={() => setPerson(p)}><i className={p.color}>{p.initials}</i><span>{p.name}</span></button>)}</div><label className="merchant-input" style={{ marginBottom: '1rem' }}><Icon name="user" /><input aria-label="Recipient name" value={person.name} onChange={(e) => setPerson({ initials: (e.target.value.trim()[0] || '?').toUpperCase(), name: e.target.value, color: 'purple' })} placeholder="Or type a name" /></label><div className="transfer-amount"><span>₹</span><input autoFocus value={amount} inputMode="numeric" onChange={(e) => setAmount(e.target.value.replace(/\D/g,''))} placeholder="0" /></div><button className="primary-button" disabled={!amount || !person.name.trim()} onClick={() => setStep(2)}>Continue <Icon name="arrowRight" /></button></> :
    <div className="confirm-transfer"><i className={person.color}>{person.initials}</i><p>Sending to</p><h3>{person.name}</h3><div className="confirm-amount">{money(Number(amount)*100)}</div><div className="confirm-details"><span>Transfer fee <b>Free</b></span><span>Arrives <b>Instantly</b></span></div><button className="primary-button" onClick={() => onDone({ id:Date.now(), title:`Transfer to ${person.name}`, category:'Transfer', kind:'expense', amount:Number(amount)*100, date:ymd() })}>Confirm transfer <Icon name="arrowRight" /></button></div>}
  </div></div>;
}

function Empty({ icon, title, text }: { icon: IconName; title: string; text: string }) { return <div className="empty"><i><Icon name={icon} /></i><h3>{title}</h3><p>{text}</p></div>; }
