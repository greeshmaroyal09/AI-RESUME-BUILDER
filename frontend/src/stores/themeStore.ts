import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initTheme: () => void;
}

const applyThemeToDOM = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    applyThemeToDOM(nextTheme);
    set({ theme: nextTheme });
  },
  initTheme: () => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark' | null) || 'dark';
    applyThemeToDOM(savedTheme);
    set({ theme: savedTheme });
  },
}));
