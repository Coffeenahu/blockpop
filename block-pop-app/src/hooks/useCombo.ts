import { useState, useCallback } from 'react';
import { COMBO_GRACE_TURNS, COMBO_MULTIPLIER_STEP } from '../constants';

export function useCombo() {
  const [comboCount, setComboCount] = useState(0);
  const [comboGrace, setComboGrace] = useState(0);

  const getComboColor = (count: number) => {
    if (count <= 2) return '#ffcc00';
    if (count <= 4) return '#ff9900';
    if (count <= 6) return '#ff3300';
    return '#ff00ff';
  };

  const getComboMultiplier = (count: number) =>
    1 + (count - 1) * COMBO_MULTIPLIER_STEP;

  const incrementCombo = useCallback(() => {
    setComboCount((prev) => prev + 1);
    setComboGrace(COMBO_GRACE_TURNS);
  }, []);

  const decrementGrace = useCallback(() => {
    setComboGrace((prev) => {
      const next = prev - 1;
      if (next <= 0) setComboCount(0);
      return next;
    });
  }, []);

  const resetCombo = useCallback(() => {
    setComboCount(0);
    setComboGrace(0);
  }, []);

  return {
    comboCount,
    comboGrace,
    getComboColor,
    getComboMultiplier,
    incrementCombo,
    decrementGrace,
    resetCombo,
  };
}
