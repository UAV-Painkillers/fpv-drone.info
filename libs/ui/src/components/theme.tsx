import { useCallback, useEffect, useState } from 'react';

/**
 * Inline no-flash script for the document <head>: applies `.dark` before
 * first paint. localStorage("fpv-theme") wins; OS preference is default.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("fpv-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('fpv-theme', next);
    } catch {
      // private mode — theme just won't persist
    }
    setTheme(next);
  }, []);

  return { theme, toggle };
}

export function ThemeToggle({ label }: { label?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label ?? 'Toggle dark mode'}
      title={label ?? 'Toggle dark mode'}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg hover:bg-surface-sunken"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
