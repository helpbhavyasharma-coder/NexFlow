import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronDown, Circle, Clock, MessageCircle, Play, Plus, Search, Star, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useWorkspaceStore } from '../../store/workspaceStore.js';

export function TodoTaskList() {
  const user = useAuthStore((state) => state.user);
  const { activeTeam, tasks, taskFilter, createTask, startTask, completeTask, cancelTask } = useWorkspaceStore();
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const today = new Date();

  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedTaskId) || null, [selectedTaskId, tasks]);
  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (taskFilter === 'pending') return task.status === 'PENDING';
    if (taskFilter === 'working') return task.status === 'IN_PROGRESS';
    if (taskFilter === 'completed') return task.status === 'COMPLETED';
    if (taskFilter === 'active') return task.status !== 'COMPLETED';
    return true;
  }), [tasks, search, taskFilter]);
  const activeTasks = filteredTasks.filter((task) => task.status !== 'COMPLETED');
  const completedTasks = filteredTasks.filter((task) => task.status === 'COMPLETED');

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim() || !activeTeam) return;
    await createTask({ teamId: activeTeam.id, title, priority: 'MEDIUM' });
    setTitle('');
  }

  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="relative min-h-0 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,165,233,.28),rgba(15,23,42,.35)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="relative flex h-full min-h-0 flex-col p-4 pb-24 md:p-8 md:pb-8">
          <div className="shrink-0 pb-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black">My Day</h1>
                <p className="mt-1 text-sm text-white/75">{today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-black/25 p-2 backdrop-blur-xl">
                <Search size={18} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" className="w-40 bg-transparent text-sm outline-none placeholder:text-white/60" />
              </div>
            </div>
            <div className="mt-3 inline-flex rounded-xl bg-black/25 px-3 py-2 text-sm font-semibold backdrop-blur-xl">
              {activeTeam ? `${activeTeam.name} - ${labelForFilter(taskFilter)}` : 'Create or join a group'}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            <AnimatePresence>
              {activeTasks.map((task) => <TaskRow key={task.id} task={task} currentUserId={user?.id} selected={selectedTask?.id === task.id} onSelect={() => setSelectedTaskId(task.id)} onStart={() => startTask(task.id)} onComplete={() => completeTask(task.id)} onCancel={() => cancelTask(task.id)} />)}
            </AnimatePresence>

            {completedTasks.length > 0 && (
              <div className="pt-2">
                <button onClick={() => setShowCompleted(!showCompleted)} className="mb-2 flex items-center gap-2 rounded-lg bg-black/35 px-3 py-2 text-sm font-semibold text-white backdrop-blur-xl"><ChevronDown size={16} className={showCompleted ? '' : '-rotate-90'} /> Completed <span className="rounded bg-white/15 px-2">{completedTasks.length}</span></button>
                {showCompleted && <div className="space-y-2">{completedTasks.map((task) => <TaskRow key={task.id} task={task} completed selected={selectedTask?.id === task.id} onSelect={() => setSelectedTaskId(task.id)} />)}</div>}
              </div>
            )}

            {filteredTasks.length === 0 && <div className="rounded-xl bg-black/45 p-5 text-center text-sm font-semibold text-white/70 backdrop-blur-xl">No tasks found in this view.</div>}
          </div>

          <form onSubmit={addTask} className="mt-4 flex shrink-0 items-center gap-3 rounded-xl bg-black/80 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
            <Plus size={20} />
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task" className="flex-1 bg-transparent outline-none placeholder:text-white/60" />
            <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">Add</button>
          </form>
        </div>
      </section>

      <aside className="hidden min-h-0 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 text-white shadow-2xl xl:block">
        {selectedTask ? <TaskDetail task={selectedTask} currentUserId={user?.id} onStart={() => startTask(selectedTask.id)} onComplete={() => completeTask(selectedTask.id)} onCancel={() => cancelTask(selectedTask.id)} /> : <EmptyDetail activeTeam={activeTeam} tasks={tasks} />}
      </aside>
    </div>
  );
}

function TaskRow({ task, currentUserId, selected, completed, onSelect, onStart, onComplete, onCancel }) {
  const working = task.status === 'IN_PROGRESS';
  const canCancel = working && task.startedBy === currentUserId;
  const canComplete = !completed && (!working || task.startedBy === currentUserId);
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: completed ? 0.62 : 1, y: 0 }} exit={{ opacity: 0, x: -20 }} onClick={onSelect} className={`group flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-white backdrop-blur-xl transition ${selected ? 'border-cyan-300 bg-cyan-950/70' : 'border-white/5 bg-zinc-900/85 hover:bg-zinc-800/90'}`}>
      <button disabled={!canComplete} onClick={(event) => { event.stopPropagation(); onComplete?.(); }} className={`grid h-5 w-5 place-items-center rounded-full border ${completed ? 'cursor-default border-slate-400 bg-slate-400 text-slate-950' : canComplete ? 'border-white/70 hover:border-cyan-300' : 'cursor-not-allowed border-white/25'}`}>{completed ? <Check size={13} /> : <Circle size={14} className="opacity-0" />}</button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${completed ? 'line-through text-white/55' : ''}`}>{task.title}</p>
        <p className="mt-0.5 text-xs text-white/50">{task.status === 'IN_PROGRESS' && task.starter ? `${task.starter.username} is working` : task.description || 'Tasks'}</p>
      </div>
      {canCancel && <button onClick={(event) => { event.stopPropagation(); onCancel?.(); }} className="rounded-lg bg-rose-500/20 p-2 opacity-100 transition hover:bg-rose-500 sm:opacity-0 sm:group-hover:opacity-100" title="Cancel working"><X size={14} /></button>}
      {!working && task.status !== 'COMPLETED' && <button onClick={(event) => { event.stopPropagation(); onStart?.(); }} className="rounded-lg bg-white/10 p-2 opacity-100 transition hover:bg-cyan-500 sm:opacity-0 sm:group-hover:opacity-100" title="Start working"><Play size={14} /></button>}
      <Star size={18} className="text-white/55" />
    </motion.div>
  );
}

function TaskDetail({ task, currentUserId, onStart, onComplete, onCancel }) {
  const working = task.status === 'IN_PROGRESS';
  const canCancel = working && task.startedBy === currentUserId;
  const canComplete = task.status !== 'COMPLETED' && (!working || task.startedBy === currentUserId);
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto p-6">
      <div className="rounded-3xl bg-white/10 p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Task Details</h2><Star size={20} /></div>
        <h3 className="text-2xl font-black">{task.title}</h3>
        <p className="mt-2 text-sm text-white/60">{task.description || 'No description added yet.'}</p>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <DetailItem icon={<Clock size={16} />} label="Status" value={task.status.replace('_', ' ')} />
        <DetailItem icon={<CalendarDays size={16} />} label="Deadline" value={task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'} />
        <DetailItem icon={<MessageCircle size={16} />} label="Comments" value={`${task.comments?.length || 0} comments`} />
        {task.starter && <DetailItem icon={<UserPlus size={16} />} label="Working" value={`${task.starter.username} is working on it`} />}
      </div>
      <div className="mt-auto grid gap-3">
        {canCancel && <button onClick={onCancel} className="rounded-2xl bg-rose-500 px-4 py-3 font-bold text-white">Cancel Working</button>}
        {!working && task.status !== 'COMPLETED' && <button onClick={onStart} className="rounded-2xl bg-cyan-500 px-4 py-3 font-bold text-white">Start Working</button>}
        {canComplete && <button onClick={onComplete} className="rounded-2xl bg-white px-4 py-3 font-bold text-slate-950">Mark Complete</button>}
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"><span className="flex items-center gap-2 text-white/55">{icon}{label}</span><b>{value}</b></div>;
}

function EmptyDetail({ activeTeam, tasks }) {
  return <div className="grid h-full place-items-center p-8 text-center"><div><h2 className="text-2xl font-black">{activeTeam?.name || 'NexFlow'}</h2><p className="mt-2 text-white/55">Select a task to see details, assignment, comments, and realtime work state.</p><div className="mt-6 rounded-3xl bg-white/10 p-5"><b className="text-4xl">{tasks.filter((task) => task.status === 'COMPLETED').length}</b><p className="text-sm text-white/55">tasks completed</p></div></div></div>;
}

function labelForFilter(taskFilter) {
  if (taskFilter === 'pending') return 'Pending';
  if (taskFilter === 'working') return 'Working now';
  if (taskFilter === 'completed') return 'Completed';
  if (taskFilter === 'active') return 'Not completed';
  return 'All tasks';
}
