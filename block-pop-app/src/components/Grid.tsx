import React, { useMemo, useCallback } from 'react';
import type { GridData } from '../types';

interface GridProps {
  grid: GridData;
  onDrop: (row: number, col: number) => void;
  onDragEnter: (row: number, col: number) => void;
  previewCells: [number, number][];
}

const Grid: React.FC<GridProps> = ({ grid, onDrop, onDragEnter, previewCells }) => {
  // Fix 4: O(1) Set lookup instead of O(n) Array.some() per cell
  const previewSet = useMemo(
    () => new Set(previewCells.map(([r, c]) => `${r},${c}`)),
    [previewCells]
  );

  // Fix 4: useCallback on drag handlers inside Grid
  const handleDragOver = useCallback(
    (e: React.DragEvent, row: number, col: number) => {
      e.preventDefault();
      onDragEnter(row, col);
    },
    [onDragEnter]
  );

  const handleDrop = useCallback(
    (row: number, col: number) => {
      onDrop(row, col);
    },
    [onDrop]
  );

  return (
    <div className="grid">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const inPreview = previewSet.has(`${rowIndex},${colIndex}`);
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              data-row={rowIndex}
              data-col={colIndex}
              className={`cell ${cell.filled ? 'filled' : ''} ${cell.pop ? 'pop' : ''} ${inPreview ? 'preview' : ''}`}
              style={{
                backgroundColor: inPreview
                  ? 'rgba(255,255,255,0.3)'
                  : cell.filled
                  ? cell.color
                  : undefined,
              }}
              onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
              onDrop={() => handleDrop(rowIndex, colIndex)}
            />
          );
        })
      )}
    </div>
  );
};

// Fix 4: Wrap with React.memo
export default React.memo(Grid);
