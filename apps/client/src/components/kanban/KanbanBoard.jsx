import { DndContext } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { TaskCard } from './TaskCard.jsx';

const columns = [
  ['PENDING', 'Pending'],
  ['IN_PROGRESS', 'In Progress'],
  ['REVIEW', 'Review'],
  ['COMPLETED', 'Completed'],
];

export function KanbanBoard({ tasks }) {
  return (
    <DndContext>
      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map(([status, label]) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          return (
            <motion.section key={status} layout className="min-h-[420px] rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black">{label}</h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold dark:bg-white/10">{columnTasks.length}</span>
              </div>
              <div className="space-y-4">
                {columnTasks.length ? columnTasks.map((task) => <TaskCard key={task.id} task={task} />) : <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/10">No tasks here yet</div>}
              </div>
            </motion.section>
          );
        })}
      </div>
    </DndContext>
  );
}
