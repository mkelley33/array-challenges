import { useEffect, useState } from 'react';

import { useSettingsStore } from '@/stores/settings-store';

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Resolves the settings theme ('system' | 'light' | 'dark') to the concrete theme in effect. */
export function useEffectiveTheme(): 'dark' | 'light' {
  const theme = useSettingsStore((state) => state.theme);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent): void => {
      setSystemDark(event.matches);
    };
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
    };
  }, []);

  if (theme === 'system') {
    return systemDark ? 'dark' : 'light';
  }
  return theme;
}

/** Applies the effective theme by toggling the `dark` class Tailwind's dark variant is bound to. */
export function useApplyTheme(): void {
  const effective = useEffectiveTheme();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', effective === 'dark');
  }, [effective]);
}
