import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(persist((set, get) => ({
  theme: 'dark',
  toggleTheme() {
    const theme = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
  applyTheme() {
    document.documentElement.classList.toggle('dark', get().theme === 'dark');
  },
}), { name: 'nexflow-theme' }));
