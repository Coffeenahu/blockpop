import { useState, useEffect, useCallback } from 'react';
import type { ThemeId } from '../types';
import { THEMES, THEME_STORAGE_KEY } from '../constants';

export function useTheme() {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as ThemeId) || 'dark';
  });

  const applyTheme = useCallback((id: ThemeId) => {
    const theme = THEMES.find((t) => t.id === id);
    if (!theme) return;
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  // 초기 로드 시 저장된 테마 적용
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId, applyTheme]);

  const setTheme = useCallback(
    (id: ThemeId) => {
      setThemeIdState(id);
      localStorage.setItem(THEME_STORAGE_KEY, id);
    },
    []
  );

  const getBlockColors = useCallback((): string[] => {
    return THEMES.find((t) => t.id === themeId)?.blockColors ?? THEMES[0].blockColors;
  }, [themeId]);

  return { themeId, setTheme, getBlockColors };
}
