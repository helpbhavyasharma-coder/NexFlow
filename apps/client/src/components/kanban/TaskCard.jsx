import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MessageCircle, Play } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { useWorkspaceStore } from '../../store/workspaceStore.js';

export function TaskCard({ task }) {
  const { startTask, completeTask } = useWorkspaceStore();
  const completed = task.status === 'COMPLETED';
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: completed ? 0.55 : 1, y: 0 }} className="glass card-hover rounded-3xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`font-bold ${completed ? 'line-through' : ''}`}>{task.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-300">{task.description || 'No description added.'}</p>
        </div>
        <span className="rounded-full bg-cyan-400/15 px-2 py-1 text-xs font-bold text-cyan-500">{task.priority}</span>
      </div>
      {task.starter && task.status === 'IN_PROGRESS' && <div className="mt-4 flex items-center gap-2 rounded-2xl bg-violet-500/15 px-3 py-2 text-sm text-violet-300"><span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />{task.starter.username} is working on this task</div>}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><MessageCircle size={14} />{task.comments?.length || 0}</span>
        <span className="flex items-center gap-1"><Clock size={14} />{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
      </div>
      <div className="mt-4 flex gap-2">
        {task.status !== 'COMPLETED' && <Button className="flex-1 text-sm" onClick={() => startTask(task.id)}><Play size={14} className="inline" /> Start Working</Button>}
        {task.status !== 'COMPLETED' && <Button variant="ghost" className="text-sm" onClick={() => completeTask(task.id)}><CheckCircle2 size={16} /></Button>}
      </div>
    </motion.article>
  );
}
