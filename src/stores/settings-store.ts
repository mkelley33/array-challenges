import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';

export const MAX_FONT_SIZE = 20;
export const MIN_FONT_SIZE = 12;

export interface SettingsState {
  fontSize: number;
  setFontSize: (fontSize: number) => void;
  setTabSize: (tabSize: 2 | 4) => void;
  setTheme: (theme: Theme) => void;
  tabSize: 2 | 4;
  theme: Theme;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 14,
      setFontSize: (fontSize) => set({ fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, fontSize)) }),
      setTabSize: (tabSize) => set({ tabSize }),
      setTheme: (theme) => set({ theme }),
      tabSize: 2,
      theme: 'system',
    }),
    { name: 'array-challenges-settings' },
  ),
);
