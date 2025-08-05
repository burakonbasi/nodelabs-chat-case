import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  systemTheme: 'light' | 'dark';
  activeTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemTheme: 'light',
      activeTheme: 'light',

      setTheme: (theme) => {
        set({ theme });
        get().initTheme();
      },

      toggleTheme: () => {
        const { theme } = get();
        if (theme === 'light') {
          get().setTheme('dark');
        } else if (theme === 'dark') {
          get().setTheme('light');
        } else {
          // If system, switch to opposite of current system theme
          const { systemTheme } = get();
          get().setTheme(systemTheme === 'light' ? 'dark' : 'light');
        }
      },

      initTheme: () => {
        const { theme } = get();
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        
        set({ systemTheme });

        const activeTheme = theme === 'system' ? systemTheme : theme;
        set({ activeTheme });

        // Update HTML class
        if (activeTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      store.initTheme();
    }
  });
}