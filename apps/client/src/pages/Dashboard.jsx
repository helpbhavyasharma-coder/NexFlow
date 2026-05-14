import { useEffect, useMemo, useState } from 'react';
import { AnalyticsPanel } from '../components/dashboard/AnalyticsPanel.jsx';
import { NotificationPanel } from '../components/dashboard/NotificationPanel.jsx';
import { KanbanBoard } from '../components/kanban/KanbanBoard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useWorkspaceStore } from '../store/workspaceStore.js';

export default function Dashboard() {
  const { activeTeam, tasks, analytics, notifications, loadTeams, loadNotifications, wireRealtime, createTask } = useWorkspaceStore();
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  useEffect(() => { loadTeams(); loadNotifications(); wireRealtime(); }, []);
  const visibleTasks = useMemo(() => tasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase())), [tasks, search]);
  async function addTask(event) { event.preventDefault(); if (!title.trim() || !activeTeam) return; await createTask({ teamId: activeTeam.id, title, priority: 'MEDIUM' }); setTitle(''); }
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <div className="glass rounded-[2rem] p-4">
          <form onSubmit={addTask} className="grid gap-3 md:grid-cols-[1fr_220px_auto]"><Input placeholder="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} /><Input placeholder="Create a task" value={title} onChange={(event) => setTitle(event.target.value)} /><Button>Add Task</Button></form>
        </div>
        <KanbanBoard tasks={visibleTasks} />
      </section>
      <aside className="space-y-5"><AnalyticsPanel analytics={analytics} /><NotificationPanel notifications={notifications} /><div className="glass rounded-[2rem] p-5"><h2 className="font-black">Advanced Ready</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Pomodoro, Need Help, AI assistant hooks, PWA, keyboard shortcuts, and activity timeline architecture are ready to extend.</p></div></aside>
    </div>
  );
}
