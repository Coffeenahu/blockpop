import React, { useCallback } from 'react';
import type { PieceShape } from '../types';

interface PieceProps {
  piece: PieceShape;
  onPointerDown: (e: React.PointerEvent, piece: PieceShape, offsetRow: number, offsetCol: number) => void;
  disabled?: boolean;
}

const Piece: React.FC<PieceProps> = ({ piece, onPointerDown, disabled }) => {
  /** shape 내 첫 번째 채워진 셀의 좌표 반환 (기본 오프셋용) */
  const getFirstFilledCell = useCallback((): [number, number] => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] === 1) return [r, c];
      }
    }
    return [0, 0];
  }, [piece.shape]);

  /** 피스 영역의 실제 셀 크기를 DOM에서 측정 */
  const getPieceCellSize = (target: HTMLElement) => {
    const cell = target.closest('.piece-cell') as HTMLElement | null;
    return cell ? cell.offsetWidth : 30;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // disabled 상태(배치 불가 등)여도 드래그(Hold 이동)는 가능하게 함
    // 단, swappedThisTurn 같은 강제 비활성화는 App에서 처리
    
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = getPieceCellSize(e.target as HTMLElement);
    const gap = 2;
    const step = cellSize + gap;
    
    let offsetCol = Math.floor((e.clientX - rect.left) / step);
    let offsetRow = Math.floor((e.clientY - rect.top) / step);
    
    offsetCol = Math.max(0, Math.min(piece.shape[0].length - 1, offsetCol));
    offsetRow = Math.max(0, Math.min(piece.shape.length - 1, offsetRow));
    
    if (piece.shape[offsetRow][offsetCol] !== 1) {
      [offsetRow, offsetCol] = getFirstFilledCell();
    }
    
    onPointerDown(e, piece, offsetRow, offsetCol);
  };

  return (
    <div
      className={`piece ${disabled ? 'disabled' : ''}`}
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
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
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default React.memo(Piece);
