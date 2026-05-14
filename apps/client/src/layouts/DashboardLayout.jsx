import { BarChart3, Bell, LogOut, Plus, Search, Users } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useWorkspaceStore } from '../store/workspaceStore.js';

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { teams, activeTeam, selectTeam, onlineUsers } = useWorkspaceStore();
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#22d3ee33,transparent_30%),radial-gradient(circle_at_top_right,#8b5cf633,transparent_35%)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 p-5 lg:block">
          <div className="mb-8 text-2xl font-black tracking-tight">Nex<span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Flow</span></div>
          <div className="space-y-2">
            {teams.map((team) => <button key={team.id} onClick={() => selectTeam(team.id)} className={`w-full rounded-2xl px-4 py-3 text-left transition ${activeTeam?.id === team.id ? 'bg-cyan-400/20 text-cyan-300' : 'hover:bg-white/10'}`}>{team.name}</button>)}
          </div>
          <div className="mt-8 rounded-3xl bg-white/10 p-4 text-sm"><Users size={18} /> <b>{onlineUsers.length}</b> teammates online</div>
        </aside>
        <main className="flex-1 p-4 lg:p-8">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.username}</p>
              <h1 className="text-3xl font-black">{activeTeam?.name || 'NexFlow Workspace'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-2xl bg-white/70 px-4 py-3 dark:bg-white/10 md:flex"><Search size={18} /></div>
              <ThemeToggle />
              <Button><Plus size={16} className="inline" /> New Task</Button>
              <Button variant="ghost" onClick={logout}><LogOut size={16} /></Button>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
      <nav className="fixed bottom-4 left-4 right-4 flex justify-around rounded-3xl border border-white/10 bg-slate-950/80 p-3 text-white backdrop-blur-xl lg:hidden"><Users /><BarChart3 /><Bell /></nav>
    </div>
  );
}
