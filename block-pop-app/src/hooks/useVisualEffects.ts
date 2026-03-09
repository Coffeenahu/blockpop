import { useState, useCallback } from 'react';
import type { VisualEffect } from '../types';
import { EFFECT_DURATION_MS } from '../constants';

export function useVisualEffects() {
  const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([]);

  const addEffect = useCallback((effect: Omit<VisualEffect, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setVisualEffects((prev) => [...prev, { ...effect, id }]);
    setTimeout(() => {
      setVisualEffects((prev) => prev.filter((e) => e.id !== id));
    }, EFFECT_DURATION_MS);
  }, []);

  const clearEffects = useCallback(() => {
    setVisualEffects([]);
  }, []);

  return { visualEffects, addEffect, clearEffects };
}
