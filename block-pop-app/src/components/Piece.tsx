import React from 'react';
import type { PieceShape } from '../types';

interface PieceProps {
  piece: PieceShape;
  onPointerDown: (e: React.PointerEvent, piece: PieceShape, offsetRow: number, offsetCol: number) => void;
  disabled?: boolean;
}

const Piece: React.FC<PieceProps> = ({ piece, onPointerDown, disabled }) => {
  const getPieceCellSize = (target: HTMLElement) => {
    const cell = target.closest('.piece-cell') as HTMLElement | null;
    return cell ? cell.offsetWidth : 30;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = getPieceCellSize(e.target as HTMLElement);
    const gap = 2;
    const step = cellSize + gap;
    
    // 사용자가 터치한 지점을 정확하게 오프셋으로 계산 (Snap 제거)
    // 이를 통해 대형 블록을 어디를 잡든 손가락 위치가 유지됨
    let offsetCol = Math.floor((e.clientX - rect.left) / step);
    let offsetRow = Math.floor((e.clientY - rect.top) / step);
    
    // 범위 제한 (Hitbox 패딩 대응)
    offsetCol = Math.max(0, Math.min(piece.shape[0].length - 1, offsetCol));
    offsetRow = Math.max(0, Math.min(piece.shape.length - 1, offsetRow));
    
    onPointerDown(e, piece, offsetRow, offsetCol);
  };

  return (
    <div
      className={`piece ${disabled ? 'disabled' : ''}`}
      onPointerDown={handlePointerDown}
      style={{ 
        touchAction: 'none',
        padding: '10px', 
        margin: '-10px'
      }}
    >
      {piece.shape.map((row, rIdx) => (
        <div key={rIdx} className="piece-row">
          {row.map((val, cIdx) => (
            <div
              key={cIdx}
              className="piece-cell"
              style={{
                backgroundColor: val === 1 ? piece.color : 'transparent',
                opacity: val === 1 ? 1 : 0, 
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default React.memo(Piece);
