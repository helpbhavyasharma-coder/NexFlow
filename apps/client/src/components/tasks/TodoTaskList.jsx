import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronDown, Circle, Clock, FolderKanban, MessageCircle, Play, Plus, RotateCcw, Search, Star, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useWorkspaceStore } from '../../store/workspaceStore.js';

export function TodoTaskList() {
  const user = useAuthStore((state) => state.user);
  const { openProfile, openTeamHub, unreadChatCount = 0, userAvatar } = useOutletContext() || {};
  const { activeTeam, tasks, bundles, activeBundleId, taskFilter, setActiveBundleId, createBundle, deleteBundle, createTask, startTask, completeTask, reopenTask, cancelTask, deleteTask } = useWorkspaceStore();
  const [title, setTitle] = useState('');
  const [bundleName, setBundleName] = useState('');
  const [taskBundleId, setTaskBundleId] = useState('none');
  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [closedBundles, setClosedBundles] = useState({});
  const today = new Date();

  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedTaskId) || null, [selectedTaskId, tasks]);
  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeBundleId === 'none' && task.bundleId) return false;
    if (activeBundleId !== 'all' && activeBundleId !== 'none' && task.bundleId !== activeBundleId) return false;
    if (taskFilter === 'pending') return task.status === 'PENDING';
    if (taskFilter === 'working') return task.status === 'IN_PROGRESS';
    if (taskFilter === 'completed') return task.status === 'COMPLETED';
    if (taskFilter === 'active') return task.status !== 'COMPLETED';
    return true;
  }), [tasks, search, taskFilter, activeBundleId]);
  const activeTasks = filteredTasks.filter((task) => task.status !== 'COMPLETED');
  const completedTasks = filteredTasks.filter((task) => task.status === 'COMPLETED');
  const myRole = activeTeam?.members?.find((member) => member.userId === user?.id)?.role || 'VIEWER';
  const canWorkTasks = ['MEMBER', 'ADMIN', 'OWNER'].includes(myRole);
  const canDeleteTasks = ['ADMIN', 'OWNER'].includes(myRole);
  const activeBundleSections = useMemo(() => {
    const noBundleTasks = activeTasks.filter((task) => !task.bundleId);
    return [
      { id: 'none', name: 'No bundle', tasks: noBundleTasks },
      ...bundles.map((bundle) => ({ id: bundle.id, name: bundle.name, tasks: activeTasks.filter((task) => task.bundleId === bundle.id) })),
    ].filter((section) => section.tasks.length || activeBundleId === 'all');
  }, [activeTasks, bundles, activeBundleId]);

  useEffect(() => {
    setTaskBundleId(activeBundleId === 'all' ? 'none' : activeBundleId);
  }, [activeBundleId]);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim() || !activeTeam) return;
    await createTask({ teamId: activeTeam.id, bundleId: taskBundleId === 'none' ? null : taskBundleId, title, priority: 'MEDIUM' });
    setTitle('');
  }

  async function addBundle(event) {
    event.preventDefault();
    if (!bundleName.trim() || !activeTeam) return;
    await createBundle({ teamId: activeTeam.id, name: bundleName.trim() });
    setBundleName('');
  }

  function toggleBundleSection(bundleId) {
    setClosedBundles((current) => ({ ...current, [bundleId]: !current[bundleId] }));
  }

  async function handleDeleteBundle(bundle) {
    if (!bundle?.id) return;
    const count = tasks.filter((task) => task.bundleId === bundle.id).length;
    const suffix = count ? ` ${count} task${count === 1 ? '' : 's'} will move to No bundle.` : '';
    if (!window.confirm(`Delete bundle "${bundle.name}"?${suffix}`)) return;
    await deleteBundle(bundle.id);
  }

  return (
    <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="relative min-h-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/60 shadow-2xl sm:rounded-[2rem]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,165,233,.28),rgba(15,23,42,.35)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="relative flex h-full min-h-0 flex-col p-3 pb-24 sm:p-4 sm:pb-28 md:p-4 md:pb-4 2xl:p-5">
          <div className="shrink-0 pb-2 text-white">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                {userAvatar && <button onClick={openProfile} className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white ring-2 ring-cyan-300/40 lg:hidden" title="Profile"><img src={userAvatar} className="h-9 w-9 rounded-full" /></button>}
                <div className="min-w-0">
                <h1 className="text-3xl font-black leading-none md:text-4xl">My Day</h1>
                <p className="mt-1 text-xs font-semibold text-white/75">{today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-black/25 px-3 py-2 backdrop-blur-xl sm:w-56 sm:flex-none md:py-1.5">
                  <Search size={16} className="shrink-0" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/60 md:text-xs" />
                </div>
                <button onClick={openTeamHub} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500 text-white shadow-xl transition hover:bg-cyan-400 md:h-11 md:w-11" title="Team chat">
                  <MessageCircle size={20} />
                  {unreadChatCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-black">{unreadChatCount}</span>}
                </button>
              </div>
            </div>
            <div className="mt-2 inline-flex max-w-full rounded-lg bg-black/25 px-3 py-1 text-[11px] font-semibold backdrop-blur-xl">
              {activeTeam ? `${activeTeam.name} - ${bundleLabel(activeBundleId, bundles)} - ${labelForFilter(taskFilter)}` : 'Create or join a group'}
            </div>
          </div>

          <div className="mb-2 shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <BundleButton label="All" count={tasks.length} active={activeBundleId === 'all'} onClick={() => setActiveBundleId('all')} />
              <BundleButton label="No bundle" count={tasks.filter((task) => !task.bundleId).length} active={activeBundleId === 'none'} onClick={() => setActiveBundleId('none')} />
              {bundles.map((bundle) => <BundleButton key={bundle.id} label={bundle.name} count={tasks.filter((task) => task.bundleId === bundle.id).length} active={activeBundleId === bundle.id} onClick={() => setActiveBundleId(bundle.id)} onDelete={canDeleteTasks ? () => handleDeleteBundle(bundle) : undefined} />)}
            </div>
            <form onSubmit={addBundle} className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1.5 text-white backdrop-blur-xl md:py-1">
              <FolderKanban size={14} className="shrink-0 text-cyan-200" />
              <input value={bundleName} onChange={(event) => setBundleName(event.target.value)} placeholder="Create bundle / project" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-white/50" />
              <button className="rounded-md bg-white/10 px-3 py-1 text-xs font-bold transition hover:bg-white/20">Create</button>
            </form>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {activeBundleId === 'all' ? (
              <div className="space-y-2">
                {activeBundleSections.map((section) => (
                  <div key={section.id} className="overflow-hidden rounded-lg bg-black/25 backdrop-blur-xl">
                    <button onClick={() => toggleBundleSection(section.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-black text-white transition hover:bg-white/10">
                      <ChevronDown size={15} className={closedBundles[section.id] ? '-rotate-90' : ''} />
                      <FolderKanban size={14} className="text-cyan-200" />
                      <span className="min-w-0 flex-1 truncate">{section.name}</span>
                      <span className="rounded bg-white/15 px-2 py-0.5">{section.tasks.length}</span>
                      {section.id !== 'none' && canDeleteTasks && <span onClick={(event) => { event.stopPropagation(); handleDeleteBundle(section); }} className="grid h-6 w-6 place-items-center rounded-md text-white/60 transition hover:bg-rose-500 hover:text-white" title="Delete bundle"><Trash2 size={13} /></span>}
                    </button>
                    {!closedBundles[section.id] && (
                      <div className="space-y-2 p-2 pt-0">
                        <AnimatePresence>
                          {section.tasks.map((task) => <TaskRow key={task.id} task={task} currentUserId={user?.id} canWorkTasks={canWorkTasks} canDeleteTasks={canDeleteTasks} selected={selectedTask?.id === task.id} onSelect={() => setSelectedTaskId(task.id)} onStart={() => startTask(task.id)} onComplete={() => completeTask(task.id)} onReopen={() => reopenTask(task.id)} onCancel={() => cancelTask(task.id)} onDelete={() => handleDeleteTask(task, deleteTask, selectedTaskId, setSelectedTaskId)} />)}
                          {!section.tasks.length && <div className="rounded-lg bg-black/25 px-3 py-2 text-xs font-semibold text-white/45">No active tasks in this bundle.</div>}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                {activeTasks.map((task) => <TaskRow key={task.id} task={task} currentUserId={user?.id} canWorkTasks={canWorkTasks} canDeleteTasks={canDeleteTasks} selected={selectedTask?.id === task.id} onSelect={() => setSelectedTaskId(task.id)} onStart={() => startTask(task.id)} onComplete={() => completeTask(task.id)} onReopen={() => reopenTask(task.id)} onCancel={() => cancelTask(task.id)} onDelete={() => handleDeleteTask(task, deleteTask, selectedTaskId, setSelectedTaskId)} />)}
              </AnimatePresence>
            )}

            {completedTasks.length > 0 && (
              <div className="pt-2">
                <button onClick={() => setShowCompleted(!showCompleted)} className="mb-2 flex items-center gap-2 rounded-lg bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl"><ChevronDown size={15} className={showCompleted ? '' : '-rotate-90'} /> Completed <span className="rounded bg-white/15 px-2">{completedTasks.length}</span></button>
                {showCompleted && <div className="space-y-2">{completedTasks.map((task) => <TaskRow key={task.id} task={task} currentUserId={user?.id} canWorkTasks={canWorkTasks} canDeleteTasks={canDeleteTasks} completed selected={selectedTask?.id === task.id} onSelect={() => setSelectedTaskId(task.id)} onReopen={() => reopenTask(task.id)} onDelete={() => handleDeleteTask(task, deleteTask, selectedTaskId, setSelectedTaskId)} />)}</div>}
              </div>
            )}

            {filteredTasks.length === 0 && <div className="rounded-xl bg-black/45 p-5 text-center text-sm font-semibold text-white/70 backdrop-blur-xl">No tasks found in this view.</div>}
          </div>

          <form onSubmit={addTask} className="mt-3 flex shrink-0 items-center gap-2 rounded-xl bg-black/85 px-3 py-2.5 text-white shadow-2xl backdrop-blur-xl">
            <button type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 transition hover:bg-cyan-500" title="Add task"><Plus size={18} /></button>
            <select value={taskBundleId} onChange={(event) => setTaskBundleId(event.target.value)} className="max-w-36 shrink-0 rounded-lg bg-white/10 px-2 py-2 text-xs font-bold outline-none">
              <option className="bg-slate-950" value="none">No bundle</option>
              {bundles.map((bundle) => <option key={bundle.id} className="bg-slate-950" value={bundle.id}>{bundle.name}</option>)}
            </select>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/60" />
            <button className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-black text-white transition hover:bg-cyan-400">Add</button>
          </form>
        </div>
      </section>

      <aside className="hidden min-h-0 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 text-white shadow-2xl xl:block">
        {selectedTask ? <TaskDetail task={selectedTask} currentUserId={user?.id} canWorkTasks={canWorkTasks} canDeleteTasks={canDeleteTasks} onStart={() => startTask(selectedTask.id)} onComplete={() => completeTask(selectedTask.id)} onReopen={() => reopenTask(selectedTask.id)} onCancel={() => cancelTask(selectedTask.id)} onDelete={() => handleDeleteTask(selectedTask, deleteTask, selectedTaskId, setSelectedTaskId)} /> : <EmptyDetail activeTeam={activeTeam} tasks={tasks} />}
      </aside>
    </div>
  );
}

function TaskRow({ task, currentUserId, canWorkTasks, canDeleteTasks, selected, completed, onSelect, onStart, onComplete, onReopen, onCancel, onDelete }) {
  const working = task.status === 'IN_PROGRESS';
  const canCancel = working && task.startedBy === currentUserId;
  const canComplete = canWorkTasks && !completed && (!working || task.startedBy === currentUserId);
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: completed ? 0.62 : 1, y: 0 }} exit={{ opacity: 0, x: -20 }} onClick={onSelect} className={`group flex min-h-[58px] cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-white backdrop-blur-xl transition ${selected ? 'border-cyan-300 bg-cyan-950/70' : 'border-white/5 bg-zinc-900/85 hover:bg-zinc-800/90'}`}>
      <button disabled={!canComplete} onClick={(event) => { event.stopPropagation(); onComplete?.(); }} className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${completed ? 'cursor-default border-slate-400 bg-slate-400 text-slate-950' : canComplete ? 'border-white/70 hover:border-cyan-300' : 'cursor-not-allowed border-white/25'}`}>{completed ? <Check size={13} /> : <Circle size={13} className="opacity-0" />}</button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-black ${completed ? 'line-through text-white/55' : ''}`}>{task.title}</p>
        <p className="mt-0.5 truncate text-xs text-white/55">{task.bundle?.name ? `${task.bundle.name} - ` : ''}{task.status === 'IN_PROGRESS' && task.starter ? `${task.starter.username} is working` : task.description || 'No bundle'}</p>
      </div>
      {canWorkTasks && canCancel && <button onClick={(event) => { event.stopPropagation(); onCancel?.(); }} className="shrink-0 rounded-lg bg-rose-500/20 p-2 opacity-100 transition hover:bg-rose-500 sm:opacity-0 sm:group-hover:opacity-100" title="Cancel working"><X size={14} /></button>}
      {canWorkTasks && completed && <button onClick={(event) => { event.stopPropagation(); onReopen?.(); }} className="shrink-0 rounded-lg bg-white/10 p-2 transition hover:bg-cyan-500" title="Uncomplete"><RotateCcw size={14} /></button>}
      {canWorkTasks && !working && task.status !== 'COMPLETED' && <button onClick={(event) => { event.stopPropagation(); onStart?.(); }} className="shrink-0 rounded-lg bg-white/10 p-2 opacity-100 transition hover:bg-cyan-500 sm:opacity-0 sm:group-hover:opacity-100" title="Start working"><Play size={14} /></button>}
      {canDeleteTasks && <button onClick={(event) => { event.stopPropagation(); onDelete?.(); }} className="shrink-0 rounded-lg bg-white/10 p-2 opacity-100 transition hover:bg-rose-500 sm:opacity-0 sm:group-hover:opacity-100" title="Delete task"><Trash2 size={14} /></button>}
      <Star size={18} className="shrink-0 text-white/55" />
    </motion.div>
  );
}

function TaskDetail({ task, currentUserId, canWorkTasks, canDeleteTasks, onStart, onComplete, onReopen, onCancel, onDelete }) {
  const working = task.status === 'IN_PROGRESS';
  const canCancel = working && task.startedBy === currentUserId;
  const canComplete = canWorkTasks && task.status !== 'COMPLETED' && (!working || task.startedBy === currentUserId);
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
        {canWorkTasks && canCancel && <button onClick={onCancel} className="rounded-2xl bg-rose-500 px-4 py-3 font-bold text-white">Cancel Working</button>}
        {canWorkTasks && !working && task.status !== 'COMPLETED' && <button onClick={onStart} className="rounded-2xl bg-cyan-500 px-4 py-3 font-bold text-white">Start Working</button>}
        {canComplete && <button onClick={onComplete} className="rounded-2xl bg-white px-4 py-3 font-bold text-slate-950">Mark Complete</button>}
        {canWorkTasks && task.status === 'COMPLETED' && <button onClick={onReopen} className="rounded-2xl bg-cyan-500 px-4 py-3 font-bold text-white">Mark Uncomplete</button>}
        {canDeleteTasks && <button onClick={onDelete} className="rounded-2xl bg-rose-500/20 px-4 py-3 font-bold text-rose-100 transition hover:bg-rose-500">Delete Task</button>}
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"><span className="flex items-center gap-2 text-white/55">{icon}{label}</span><b>{value}</b></div>;
}

function BundleButton({ label, count, active, onClick, onDelete }) {
  return (
    <button onClick={onClick} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-black transition ${active ? 'bg-cyan-500 text-white' : 'bg-black/35 text-white/75 hover:bg-black/50'}`}>
      <span className="max-w-36 truncate">{label}</span>
      <span className="rounded bg-black/20 px-2">{count}</span>
      {onDelete && <span onClick={(event) => { event.stopPropagation(); onDelete(); }} className="-mr-1 grid h-5 w-5 place-items-center rounded text-white/70 transition hover:bg-rose-500 hover:text-white" title="Delete bundle"><Trash2 size={12} /></span>}
    </button>
  );
}

async function handleDeleteTask(task, deleteTask, selectedTaskId, setSelectedTaskId) {
  if (!window.confirm(`Delete "${task.title}"?`)) return;
  await deleteTask(task.id);
  if (selectedTaskId === task.id) setSelectedTaskId(null);
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

function bundleLabel(activeBundleId, bundles) {
  if (activeBundleId === 'all') return 'All bundles';
  if (activeBundleId === 'none') return 'No bundle';
  return bundles.find((bundle) => bundle.id === activeBundleId)?.name || 'Bundle';
}
