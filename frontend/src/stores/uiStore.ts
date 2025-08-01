import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  isProfileOpen: boolean;
  theme: 'light' | 'dark';
  
  toggleSidebar: () => void;
  toggleSearch: () => void;
  toggleProfile: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isSearchOpen: false,
  isProfileOpen: false,
  theme: 'light',

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  toggleProfile: () => set((state) => ({ isProfileOpen: !state.isProfileOpen })),
  setTheme: (theme) => set({ theme }),
}));