'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Determine initial active theme from document class or localStorage
    const isDark = document.documentElement.classList.contains('dark') ||
      localStorage.getItem('vw-theme') === 'dark' ||
      (!localStorage.getItem('vw-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
      setThemeState('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setThemeState('light');
    }
  }, []);

  const toggle = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextTheme: Theme = isCurrentlyDark ? 'light' : 'dark';

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      localStorage.setItem('vw-theme', nextTheme);
    } catch (e) {}

    setThemeState(nextTheme);
  };

  const setTheme = (next: Theme) => {
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('vw-theme', next);
    } catch (e) {}
    setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
