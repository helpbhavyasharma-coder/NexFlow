import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore.js';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  return <button onClick={toggleTheme} className="rounded-2xl border border-white/10 p-3 transition hover:bg-white/10">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
