import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    // Fonction pour déterminer le thème résolu
    const getResolvedTheme = (): ResolvedTheme => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    // Appliquer le thème
    const applyTheme = () => {
      const resolved = getResolvedTheme();
      setResolvedTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      localStorage.setItem('theme', theme);
    };

    applyTheme();

    // Écouter les changements de préférences système si le thème est "system"
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
  };
};
