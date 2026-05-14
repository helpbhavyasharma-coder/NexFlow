export function Button({ className = '', variant = 'primary', ...props }) {
  const styles = variant === 'ghost' ? 'bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white' : 'bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-glow hover:opacity-95';
  return <button className={`rounded-2xl px-4 py-2 font-semibold transition active:scale-95 ${styles} ${className}`} {...props} />;
}
