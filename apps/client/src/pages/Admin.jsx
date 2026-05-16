import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, LogOut, MessageCircle, RefreshCw, ShieldCheck, Users, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';

const tokenKey = 'nexflow-admin-token';

const metricIcons = {
  totalUsers: Users,
  totalTeams: Workflow,
  totalTasks: CheckCircle2,
  totalMessages: MessageCircle,
};

export default function Admin() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(tokenKey));
  const [form, setForm] = useState({ email: '', password: '' });
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('teams');

  async function login(event) {
    event.preventDefault();
    const { data } = await api.post('/admin/login', form);
    localStorage.setItem(tokenKey, data.adminToken);
    setAdminToken(data.adminToken);
    setForm({ email: '', password: '' });
    toast.success('Admin panel unlocked');
  }

  async function loadOverview(token = adminToken) {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get('/admin/overview', { headers: { Authorization: `Bearer ${token}` } });
      setOverview(data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem(tokenKey);
        setAdminToken(null);
      }
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    setAdminToken(null);
    setOverview(null);
  }

  useEffect(() => {
    loadOverview();
  }, [adminToken]);

  if (!adminToken) {
    return (
      <div className="grid min-h-[100svh] overflow-x-hidden bg-slate-950 text-white lg:grid-cols-[1fr_500px]">
        <section className="relative flex min-h-[40vh] flex-col justify-center overflow-hidden px-5 py-8 sm:px-10 lg:min-h-[100svh]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(34,211,238,0.32),transparent_28%),radial-gradient(circle_at_70%_68%,rgba(37,99,235,0.24),transparent_28%)]" />
          <div className="relative max-w-3xl">
            <img src="/brand/nexflow-full-logo-cropped.webp" alt="NexFlow" className="mb-8 h-24 w-auto sm:h-28 lg:h-32" />
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black leading-tight sm:text-5xl xl:text-6xl">
              Monitor NexFlow from one private admin command center.
            </motion.h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              See registered users, created groups, member roles, task activity, chat volume and platform health without entering each workspace.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['Users', 'Groups', 'Activity'].map((item, index) => (
                <motion.div key={item} animate={{ y: [0, index % 2 ? 8 : -8, 0] }} transition={{ repeat: Infinity, duration: 5 + index, ease: 'easeInOut' }} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <BarChart3 className="mb-3 text-cyan-200" size={22} />
                  <p className="font-black">{item}</p>
                  <p className="mt-1 text-sm text-slate-400">Realtime owner visibility</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center px-5 py-8">
          <form onSubmit={login} className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-cyan-400 text-slate-950">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Admin Login</h2>
                <p className="text-sm text-slate-400">Private owner access only</p>
              </div>
            </div>
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Admin email" className="mb-3 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none ring-cyan-300 transition placeholder:text-white/35 focus:ring-2" autoComplete="off" />
            <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Admin password" type="password" className="mb-4 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none ring-cyan-300 transition placeholder:text-white/35 focus:ring-2" autoComplete="new-password" />
            <button className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-black text-slate-950 transition hover:bg-cyan-300">Unlock Admin Panel</button>
            <a href="/login" className="mt-4 block text-center text-sm font-bold text-cyan-100">Back to app login</a>
          </form>
        </section>
      </div>
    );
  }

  const summary = overview?.summary || {};
  const metrics = [
    ['totalUsers', 'Registered Users', summary.totalUsers || 0],
    ['totalTeams', 'Groups Created', summary.totalTeams || 0],
    ['totalTasks', 'Total Tasks', summary.totalTasks || 0],
    ['totalMessages', 'Chat Messages', summary.totalMessages || 0],
  ];

  return (
    <div className="h-screen overflow-y-auto bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/brand/bluelogo-trans.webp" alt="NexFlow" className="h-10 w-10 rounded-lg bg-white object-contain p-1" />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black sm:text-2xl">NexFlow Admin</h1>
              <p className="truncate text-xs text-slate-400">Platform monitoring and user analytics</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => loadOverview()} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/15"><RefreshCw size={15} /> Refresh</button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg bg-rose-500/20 px-3 py-2 text-sm font-bold text-rose-100 transition hover:bg-rose-500"><LogOut size={15} /> Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([key, label, value]) => {
            const Icon = metricIcons[key];
            return <MetricCard key={key} icon={<Icon size={22} />} label={label} value={value} />;
          })}
        </div>

        <section className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <h2 className="mb-4 text-lg font-black">Task Status</h2>
            <StatusBars tasksByStatus={overview?.tasksByStatus || {}} />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <h2 className="mb-4 text-lg font-black">Recent Registrations</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(overview?.recentUsers || []).map((user) => <UserMini key={user.id} user={user} />)}
            </div>
          </div>
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
          <TabButton active={activeView === 'teams'} onClick={() => setActiveView('teams')}>Groups & Members</TabButton>
          <TabButton active={activeView === 'users'} onClick={() => setActiveView('users')}>Registered Users</TabButton>
        </div>

        {loading && <div className="mt-6 rounded-lg bg-white/10 p-4 text-sm text-slate-300">Loading admin analytics...</div>}
        {!loading && activeView === 'teams' && <TeamsView teams={overview?.teams || []} />}
        {!loading && activeView === 'users' && <UsersView users={overview?.users || []} />}
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">{icon}</div>
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function StatusBars({ tasksByStatus }) {
  const rows = ['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
  const max = Math.max(1, ...rows.map((row) => tasksByStatus[row] || 0));
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row}>
          <div className="mb-2 flex justify-between text-sm"><span className="font-bold">{row.replace('_', ' ')}</span><span className="text-slate-400">{tasksByStatus[row] || 0}</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${((tasksByStatus[row] || 0) / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function UserMini({ user }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-black/20 p-3">
      <img src={user.avatar || avatar(user.email)} className="h-10 w-10 rounded-full bg-white" />
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{user.username}</p>
        <p className="truncate text-xs text-slate-400">{user.email}</p>
      </div>
    </div>
  );
}

function TeamsView({ teams }) {
  return (
    <section className="mt-5 grid gap-4">
      {teams.map((team) => (
        <article key={team.id} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h3 className="text-xl font-black">{team.name}</h3>
              <p className="mt-1 text-sm text-slate-400">Owner: {team.owner?.username} ({team.owner?.email})</p>
              <p className="mt-1 text-xs text-slate-500">Invite: {team.inviteCode} · Created {formatDate(team.createdAt)}</p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <Count label="Members" value={team._count?.members || 0} />
              <Count label="Tasks" value={team._count?.tasks || 0} />
              <Count label="Bundles" value={team._count?.bundles || 0} />
              <Count label="Messages" value={team._count?.messages || 0} />
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {team.members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-lg bg-black/20 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={member.user?.avatar || avatar(member.user?.email)} className="h-9 w-9 rounded-full bg-white" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{member.user?.username}</p>
                    <p className="truncate text-xs text-slate-400">{member.user?.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-cyan-400/15 px-2 py-1 text-[11px] font-black text-cyan-100">{member.role}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function UsersView({ users }) {
  return (
    <section className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
      <div className="grid min-w-[820px] grid-cols-[1.2fr_1.4fr_repeat(5,0.7fr)] gap-3 border-b border-white/10 px-4 py-3 text-xs font-black uppercase text-slate-400">
        <span>User</span><span>Email</span><span>Groups</span><span>Owned</span><span>Assigned</span><span>Done</span><span>Chats</span>
      </div>
      <div className="overflow-x-auto">
        {(users || []).map((user) => (
          <div key={user.id} className="grid min-w-[820px] grid-cols-[1.2fr_1.4fr_repeat(5,0.7fr)] gap-3 border-b border-white/5 px-4 py-3 text-sm">
            <span className="font-bold">{user.username}</span>
            <span className="truncate text-slate-300">{user.email}</span>
            <span>{user._count?.memberships || 0}</span>
            <span>{user._count?.ownedTeams || 0}</span>
            <span>{user._count?.assigned || 0}</span>
            <span>{user._count?.completed || 0}</span>
            <span>{user._count?.chatMessages || 0}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Count({ label, value }) {
  return <div className="rounded-lg bg-black/20 px-3 py-2"><p className="font-black">{value}</p><p className="text-slate-500">{label}</p></div>;
}

function TabButton({ active, onClick, children }) {
  return <button onClick={onClick} className={`rounded-lg px-4 py-2 text-sm font-black transition ${active ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/15'}`}>{children}</button>;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(date));
}

function avatar(seed = 'NexFlow') {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffffff`;
}
