import { Bell } from 'lucide-react';

export function NotificationPanel({ notifications }) {
  return (
    <div className="glass rounded-[2rem] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Bell size={18} /> Notifications</h2>
      <div className="space-y-3">
        {notifications.slice(0, 6).map((notification) => <div key={notification.id} className="rounded-2xl bg-white/60 p-3 text-sm dark:bg-white/10">{notification.content}</div>)}
        {!notifications.length && <p className="text-sm text-slate-500">No notifications yet.</p>}
      </div>
    </div>
  );
}
