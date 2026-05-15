import { CheckCircle2, ClipboardList, Copy, LogOut, Plus, Search, Sun, UserPlus, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useWorkspaceStore } from '../store/workspaceStore.js';

export function DashboardLayout() {
  const { user, logout, updateProfile } = useAuthStore();
  const { teams, activeTeam, tasks, taskFilter, setTaskFilter, selectTeam, onlineUsers, createTeam, joinTeam } = useWorkspaceStore();
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ username: user?.username || '', avatar: user?.avatar || maleAvatar(user?.email || 'Bhavya') });

  async function handleCreateTeam(event) {
    event.preventDefault();
    if (!teamName.trim()) return;
    await createTeam({ name: teamName, description: 'Team workspace' });
    setTeamName('');
    toast.success('New group created');
  }

  async function handleJoinTeam(event) {
    event.preventDefault();
    if (!inviteCode.trim()) return;
    await joinTeam(inviteCode.trim());
    setInviteCode('');
    toast.success('Joined group');
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    await updateProfile(profile);
    setProfileOpen(false);
    toast.success('Profile updated');
  }

  function copyInviteCode() {
    if (!activeTeam?.inviteCode) return;
    navigator.clipboard.writeText(activeTeam.inviteCode);
    toast.success('Invite code copied');
  }

  const activeCount = tasks.filter((task) => task.status !== 'COMPLETED').length;
  const workingCount = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((task) => task.status === 'COMPLETED').length;
  const myMembership = activeTeam?.members?.find((member) => member.userId === user?.id);
  const owner = activeTeam?.members?.find((member) => member.role === 'OWNER')?.user;

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-white">
      <div className="flex h-full overflow-hidden">
        <aside className="hidden h-full w-72 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-black/45 p-4 backdrop-blur-2xl lg:flex">
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
            <SidebarItem icon={<ClipboardList size={17} />} label="All Tasks" count={tasks.length} active={taskFilter === 'all'} onClick={() => setTaskFilter('all')} />
            <SidebarItem icon={<Sun size={17} />} label="Pending" count={tasks.filter((task) => task.status === 'PENDING').length} active={taskFilter === 'pending'} onClick={() => setTaskFilter('pending')} />
            <SidebarItem icon={<Users size={17} />} label="Working Now" count={workingCount} active={taskFilter === 'working'} onClick={() => setTaskFilter('working')} />
            <SidebarItem icon={<CheckCircle2 size={17} />} label="Completed" count={completedCount} active={taskFilter === 'completed'} onClick={() => setTaskFilter('completed')} />
            <SidebarItem icon={<XCircle size={17} />} label="Not Completed" count={activeCount} active={taskFilter === 'active'} onClick={() => setTaskFilter('active')} />
          </nav>

          <div className="my-4 border-t border-white/10" />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-black uppercase text-white/55">Selected Group</span>
              <span className="rounded-full bg-cyan-500/20 px-2 py-1 font-bold text-cyan-200">{myMembership?.role || 'MEMBER'}</span>
            </div>
            <p className="truncate text-sm font-black">{activeTeam?.name || 'No group selected'}</p>
            <p className="mt-1 truncate text-white/55">Group admin: {owner?.username || 'Unknown'}</p>
            {activeTeam?.inviteCode && <button onClick={copyInviteCode} className="mt-3 flex w-full items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-left font-bold"><span className="truncate">Invite: {activeTeam.inviteCode}</span><Copy size={14} /></button>}
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-white/45">
              <span>Groups</span>
              <span>{onlineUsers.length} online</span>
            </div>
            <div className="space-y-2">
              {teams.map((team) => {
                const ownerName = team.members?.find((member) => member.role === 'OWNER')?.user?.username;
                return <button key={team.id} onClick={() => selectTeam(team.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${activeTeam?.id === team.id ? 'bg-white/15 ring-1 ring-cyan-300/40' : 'hover:bg-white/10'}`}>
                  <div className="flex items-center justify-between gap-2"><span className="truncate font-bold">{team.name}</span><span className="text-xs text-white/45">{team.tasks?.length || 0}</span></div>
                  <p className="truncate text-xs text-white/45">Admin: {ownerName || 'Unknown'}</p>
                </button>;
              })}
            </div>
          </div>

          <div className="mt-4 text-xs font-black uppercase text-white/45">Join or create group</div>
          <form onSubmit={handleJoinTeam} className="mt-2 flex gap-2">
            <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Paste invite code" className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs outline-none placeholder:text-white/35" />
            <button className="rounded-lg bg-cyan-500 px-3" title="Join group"><UserPlus size={15} /></button>
          </form>

          <form onSubmit={handleCreateTeam} className="mt-2 flex gap-2">
            <input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="New group name" className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs outline-none placeholder:text-white/35" />
            <button className="rounded-lg bg-white/10 px-3" title="Create group"><Plus size={15} /></button>
          </form>

          <div className="flex items-center justify-between pt-4">
            <ThemeToggle />
            <button onClick={logout} className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"><LogOut size={18} /></button>
          </div>
        </aside>
        <main className="h-full min-w-0 flex-1 overflow-hidden p-3 md:p-4">
          <Outlet />
        </main>
      </div>
      <nav className="fixed bottom-3 left-3 right-3 z-40 flex justify-around rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-white backdrop-blur-xl lg:hidden">
        <button onClick={() => setProfileOpen(true)}><Sun /></button><button onClick={() => setTaskFilter('all')}><ClipboardList /></button><button onClick={() => setTaskFilter('working')}><Users /></button><button onClick={logout}><LogOut /></button>
      </nav>
      {profileOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={handleProfileSave} className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-2xl">
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

function SidebarItem({ icon, label, count, active, onClick }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${active ? 'bg-white/15 ring-1 ring-white/40' : 'hover:bg-white/10'}`}>{icon}<span className="flex-1">{label}</span>{count !== undefined && <span className="rounded bg-white/10 px-2 text-xs">{count}</span>}</button>;
}

function maleAvatar(seed) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

function femaleAvatar(seed) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}
