'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id="vw-theme-toggle"
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      className="
        fixed bottom-6 right-6 z-50
        w-12 h-12 rounded-full
        flex items-center justify-center
        border border-slate-300 dark:border-slate-600
        bg-white dark:bg-slate-800
        text-slate-700 dark:text-amber-400
        shadow-xl shadow-slate-900/15 dark:shadow-black/50
        hover:scale-110 active:scale-95
        transition-all duration-200 cursor-pointer
      "
    >
      {isDark ? (
        <Sun size={21} className="text-amber-400 fill-amber-400/20" />
      ) : (
        <Moon size={21} className="text-slate-700 fill-slate-700/10" />
      )}
    </button>
  );
}
