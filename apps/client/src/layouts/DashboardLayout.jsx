import { Bell, CalendarDays, Flag, Inbox, LogOut, Plus, Search, Star, Sun, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useWorkspaceStore } from '../store/workspaceStore.js';

export function DashboardLayout() {
  const { user, logout, updateProfile } = useAuthStore();
  const { teams, activeTeam, tasks, selectTeam, onlineUsers, createTeam, joinTeam } = useWorkspaceStore();
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ username: user?.username || '', avatar: user?.avatar || maleAvatar(user?.email || 'Bhavya') });

  async function handleCreateTeam(event) {
    event.preventDefault();
    if (!teamName.trim()) return;
    await createTeam({ name: teamName, description: 'Team workspace' });
    setTeamName('');
    toast.success('Team created');
  }

  async function handleJoinTeam(event) {
    event.preventDefault();
    if (!inviteCode.trim()) return;
    await joinTeam(inviteCode);
    setInviteCode('');
    toast.success('Joined team');
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    await updateProfile(profile);
    setProfileOpen(false);
    toast.success('Profile updated');
  }

  const completedCount = tasks.filter((task) => task.status === 'COMPLETED').length;
  const activeCount = tasks.length - completedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-black/45 p-4 backdrop-blur-2xl lg:flex">
          <button onClick={() => setProfileOpen(true)} className="mb-4 flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-white/10">
            <img src={user?.avatar || maleAvatar(user?.email || 'NexFlow')} className="h-12 w-12 rounded-full ring-2 ring-cyan-300/40" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase">{user?.username || 'NexFlow User'}</p>
              <p className="truncate text-xs text-white/55">{user?.email}</p>
            </div>
          </button>

          <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <Search size={16} className="text-white/45" />
            <input placeholder="Search" className="w-full bg-transparent text-sm outline-none placeholder:text-white/45" />
          </div>

          <nav className="space-y-1 text-sm">
            <SidebarItem icon={<Sun size={17} />} label="My Day" count={activeCount} active />
            <SidebarItem icon={<Star size={17} />} label="Important" />
            <SidebarItem icon={<CalendarDays size={17} />} label="Planned" />
            <SidebarItem icon={<Users size={17} />} label="Assigned to me" />
            <SidebarItem icon={<Flag size={17} />} label="Flagged" />
            <SidebarItem icon={<Inbox size={17} />} label="Tasks" count={tasks.length} />
          </nav>

          <div className="my-4 border-t border-white/10" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-white/45">
              <span>Teams</span>
              <span>{onlineUsers.length} online</span>
            </div>
            {teams.map((team) => (
              <button key={team.id} onClick={() => selectTeam(team.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${activeTeam?.id === team.id ? 'bg-white/15' : 'hover:bg-white/10'}`}>
                <div className="flex items-center justify-between"><span className="truncate">{team.name}</span><span className="text-xs text-white/45">{team.tasks?.length || 0}</span></div>
              </button>
            ))}
          </div>

          <form onSubmit={handleJoinTeam} className="mt-4 flex gap-2">
            <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Invite code" className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs outline-none placeholder:text-white/35" />
            <button className="rounded-lg bg-cyan-500 px-3"><UserPlus size={15} /></button>
          </form>

          <form onSubmit={handleCreateTeam} className="mt-2 flex gap-2">
            <input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="New team" className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs outline-none placeholder:text-white/35" />
            <button className="rounded-lg bg-white/10 px-3"><Plus size={15} /></button>
          </form>

          <div className="mt-auto flex items-center justify-between pt-4">
            <ThemeToggle />
            <button onClick={logout} className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"><LogOut size={18} /></button>
          </div>
        </aside>
        <main className="flex-1 p-3 md:p-4">
          <Outlet />
        </main>
      </div>
      <nav className="fixed bottom-3 left-3 right-3 z-40 flex justify-around rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-white backdrop-blur-xl lg:hidden">
        <button onClick={() => setProfileOpen(true)}><Sun /></button><button><Users /></button><button><Bell /></button><button onClick={logout}><LogOut /></button>
      </nav>
      {profileOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={handleProfileSave} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Edit Profile</h2>
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded-xl bg-white/10 px-3 py-2">Close</button>
            </div>
            <div className="mb-5 flex items-center gap-4">
              <img src={profile.avatar} className="h-20 w-20 rounded-full bg-white ring-2 ring-cyan-300/40" />
              <div>
                <p className="font-bold">{user?.email}</p>
                <p className="text-sm text-white/50">Choose an avatar and update your name.</p>
              </div>
            </div>
            <label className="mb-2 block text-sm font-semibold text-white/70">Name</label>
            <input value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} className="mb-4 w-full rounded-xl bg-white/10 px-4 py-3 outline-none" autoComplete="off" />
            <div className="mb-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setProfile({ ...profile, avatar: maleAvatar(user?.email || profile.username) })} className={`rounded-2xl border p-4 ${profile.avatar.includes('adventurer') ? 'border-cyan-300 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}>
                <img src={maleAvatar(user?.email || profile.username)} className="mx-auto h-16 w-16 rounded-full bg-white" />
                <span className="mt-2 block text-sm font-bold">Male</span>
              </button>
              <button type="button" onClick={() => setProfile({ ...profile, avatar: femaleAvatar(user?.email || profile.username) })} className={`rounded-2xl border p-4 ${profile.avatar.includes('avataaars') ? 'border-cyan-300 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}>
                <img src={femaleAvatar(user?.email || profile.username)} className="mx-auto h-16 w-16 rounded-full bg-white" />
                <span className="mt-2 block text-sm font-bold">Female</span>
              </button>
            </div>
            <button className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-black text-white">Save Profile</button>
          </form>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, label, count, active }) {
  return <button className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}>{icon}<span className="flex-1">{label}</span>{count !== undefined && <span className="rounded bg-white/10 px-2 text-xs">{count}</span>}</button>;
}

function maleAvatar(seed) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

function femaleAvatar(seed) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}
