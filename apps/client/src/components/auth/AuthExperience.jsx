import { motion } from 'framer-motion';
import { BarChart3, Bell, CheckCircle2, KanbanSquare, MessageCircle, Sparkles, Users } from 'lucide-react';

const features = [
  { icon: KanbanSquare, label: 'Realtime Kanban', text: 'Tasks move instantly across every team member screen.' },
  { icon: MessageCircle, label: 'Team Chat', text: 'Groups, messages, typing and work context stay together.' },
  { icon: BarChart3, label: 'Analytics', text: 'Track active work, completed tasks and team momentum.' },
  { icon: Bell, label: 'Smart Alerts', text: 'Notifications keep people aligned without losing focus.' },
];

const stats = [
  ['Live sync', 'Socket-powered workspace updates'],
  ['Role control', 'Owner, admin, member and viewer access'],
  ['Focus flow', 'Start working prevents duplicate task overlap'],
];

export function AuthExperience({ mode, title, subtitle, children }) {
  const isLogin = mode === 'login';
  return (
    <div className="relative h-screen overflow-y-auto bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.28),transparent_28%),radial-gradient(circle_at_78%_24%,rgba(37,99,235,0.24),transparent_26%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative mx-auto grid min-h-screen w-full max-w-7xl items-start gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="order-2 flex flex-col justify-center rounded-none py-3 lg:order-1 lg:min-h-[760px] lg:py-4"
        >
          <div className="mb-5 hidden items-center gap-4 lg:mb-8 lg:flex">
            <img src="/brand/Fulllogo-trans.webp" alt="NexFlow" className="h-20 w-auto object-contain xl:h-24" />
          </div>

          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 sm:text-xs lg:mb-4 lg:tracking-[0.18em]"
            >
              <Sparkles size={14} />
              Built for fast-moving teams
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl"
            >
              Manage every task, team and conversation in one live workspace.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:mt-5 sm:text-lg sm:leading-7"
            >
              NexFlow brings Kanban planning, team roles, realtime chat, notifications and analytics into a clean workflow your team can use daily.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="mt-7 hidden gap-3 sm:grid sm:grid-cols-2"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  animate={{ y: [0, index % 2 ? 8 : -8, 0] }}
                  transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
                  className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-black">{feature.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{feature.text}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-4 hidden gap-3 text-sm sm:mt-6 sm:grid sm:grid-cols-3">
            {stats.map(([label, text]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 font-black text-cyan-100"><CheckCircle2 size={16} />{label}</div>
                <p className="text-xs leading-5 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="order-1 flex items-start justify-center pb-0 lg:order-2 lg:min-h-[520px] lg:items-center lg:pb-0"
        >
          <div className="w-full max-w-md rounded-lg border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl sm:p-7">
            <div className="mb-5 flex items-center gap-4 lg:hidden">
              <img src="/brand/Fulllogo-trans.webp" alt="NexFlow" className="h-16 w-auto object-contain sm:h-20" />
            </div>
            <div className="mb-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-950 shadow-glow">
                <Users size={22} />
              </div>
              <h2 className="text-3xl font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
            </div>
            {children}
            <div className="mt-6 rounded-lg bg-black/25 p-3 text-center text-xs text-slate-400">
              {isLogin ? 'New to NexFlow?' : 'Already working in NexFlow?'}{' '}
              <Link className="font-black text-cyan-200" to={isLogin ? '/register' : '/login'}>
                {isLogin ? 'Create your workspace account' : 'Login to your workspace'}
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
