import { create } from 'zustand';
import * as Constants from '@/utils/constants';

interface ThemeState {
  isDark: boolean;
  setDark: (isDark: boolean) => void;
}

const getClientIsDark = () => {
  const isDark = localStorage.getItem(Constants.LOCAL_THEME_MODE);
  if (isDark != null) {
    return isDark === 'true';
  }
  return !(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
};

export const useThemeStore = create<ThemeState>()((set) => ({
  isDark: getClientIsDark(),
  setDark: (isDark) => {
    localStorage.setItem(Constants.LOCAL_THEME_MODE, String(isDark));
    set({ isDark });
  }
}));
