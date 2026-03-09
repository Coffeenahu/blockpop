import React, { useMemo } from 'react';
import type { GridData } from '../types';

interface GridProps {
  grid: GridData;
  previewCells: [number, number][];
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ grid, previewCells }, ref) => {
    const previewSet = useMemo(
      () => new Set(previewCells.map(([r, c]) => `${r},${c}`)),
      [previewCells]
    );

    return (
      <div className="grid" ref={ref}>
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
              />
            );
          })
        )}
      </div>
    );
  }
);

export default React.memo(Grid);
