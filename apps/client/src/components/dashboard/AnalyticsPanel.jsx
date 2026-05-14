import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function AnalyticsPanel({ analytics }) {
  if (!analytics) return null;
  return (
    <div className="glass rounded-[2rem] p-5">
      <h2 className="mb-4 text-lg font-black">Productivity Overview</h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-3xl bg-cyan-400/10 p-4"><p>Total</p><b className="text-3xl">{analytics.total}</b></div>
        <div className="rounded-3xl bg-violet-500/10 p-4"><p>Completed</p><b className="text-3xl">{analytics.byStatus?.COMPLETED || 0}</b></div>
      </div>
      <div className="mt-5 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.weekly}><XAxis dataKey="day" hide /><YAxis hide /><Tooltip /><Bar dataKey="completed" radius={[12, 12, 0, 0]} fill="#22d3ee" /></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
