import React, { useCallback, useRef } from 'react';
import type { PieceShape } from '../types';

interface PieceProps {
  piece: PieceShape;
  onDragStart: (piece: PieceShape, offsetRow: number, offsetCol: number) => void;
}

const Piece: React.FC<PieceProps> = ({ piece, onDragStart }) => {
  const dragOffsetRef = useRef<[number, number]>([0, 0]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    const [offsetRow, offsetCol] = dragOffsetRef.current;
    const cellSize = 30;
    const gap = 2;
    const step = cellSize + gap;
    const cols = piece.shape[0].length;
    const rows = piece.shape.length;

    const canvas = document.createElement('canvas');
    canvas.width = cols * step - gap;
    canvas.height = rows * step - gap;
    canvas.style.position = 'fixed';
    canvas.style.top = '-9999px';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      piece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val === 1) {
            ctx.fillStyle = piece.color;
            ctx.fillRect(c * step, r * step, cellSize, cellSize);
          }
        });
      });
    }

    e.dataTransfer.setDragImage(
      canvas,
      offsetCol * step + cellSize / 2,
      offsetRow * step + cellSize / 2,
    );

    setTimeout(() => document.body.removeChild(canvas), 0);
    onDragStart(piece, offsetRow, offsetCol);
  }, [onDragStart, piece]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const step = 32; // 30px cell + 2px gap
    const offsetCol = Math.max(0, Math.floor((touch.clientX - rect.left) / step));
    const offsetRow = Math.max(0, Math.floor((touch.clientY - rect.top) / step));
    dragOffsetRef.current = [offsetRow, offsetCol];
    onDragStart(piece, offsetRow, offsetCol);
  }, [onDragStart, piece]);

  return (
    <div
      className="piece"
      draggable
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
    >
      {piece.shape.map((row, rIdx) => (
        <div key={rIdx} className="piece-row">
          {row.map((val, cIdx) => (
            <div
              key={cIdx}
              className="piece-cell"
              style={{
                backgroundColor: val === 1 ? piece.color : 'transparent',
              }}
              onMouseDown={() => { dragOffsetRef.current = [rIdx, cIdx]; }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default React.memo(Piece);
