import { useCallback, useRef, useEffect } from 'react';

export function useCellCoordinates() {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellSizeRef = useRef(0);
  const gapRef = useRef(4);
  const paddingRef = useRef(4);

  useEffect(() => {
    const update = () => {
      const grid = gridRef.current;
      if (!grid) return;
      // 실제 DOM에서 셀 크기 측정
      const firstCell = grid.querySelector('.cell') as HTMLElement | null;
      if (firstCell) {
        cellSizeRef.current = firstCell.offsetWidth;
      }
      // grid의 gap과 padding도 실제 값으로
      const styles = getComputedStyle(grid);
      gapRef.current = parseFloat(styles.gap) || 4;
      paddingRef.current = parseFloat(styles.paddingLeft) || 4;
    };
    // 초기 렌더 후 측정
    requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const getCellCoordinates = useCallback((row: number, col: number) => {
    const cellSize = cellSizeRef.current;
    const gap = gapRef.current;
    const padding = paddingRef.current;
    return {
      x: padding + col * (cellSize + gap) + cellSize / 2,
      y: padding + row * (cellSize + gap) + cellSize / 2,
    };
  }, []);

  const getPieceCellSize = useCallback(() => {
    const cell = document.querySelector('.piece-cell') as HTMLElement | null;
    return cell ? cell.offsetWidth : 30;
  }, []);

  return { gridRef, getCellCoordinates, getPieceCellSize };
}
