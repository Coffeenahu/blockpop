import React from 'react';
import type { PieceShape } from '../types';
import Piece from './Piece';

interface PieceContainerProps {
  currentPieces: (PieceShape | null)[];
  onPointerDown: (e: React.PointerEvent, piece: PieceShape, offsetRow: number, offsetCol: number) => void;
  onRotate: (idx: number) => void;
  placeableStatus: boolean[];
  rotateCharges: number;
}

const PieceContainer: React.FC<PieceContainerProps> = ({ 
  currentPieces, 
  onPointerDown, 
  onRotate,
  placeableStatus,
  rotateCharges
}) => {
  return (
    <div className="pieces-container">
      {currentPieces.map((piece, idx) => (
        <div key={idx} className="piece-slot-wrapper">
          <div className="piece-slot">
            {piece && (
              <Piece
                piece={piece}
                onPointerDown={onPointerDown}
                disabled={placeableStatus[idx]} // 시각적으로만 흐리게 표시
              />
            )}
          </div>
          {piece && (
            <button 
              className="rotate-btn" 
              onClick={() => onRotate(idx)}
              disabled={rotateCharges <= 0} // 배치 불가 상태여도 회전권만 있으면 회전 가능
            >
              ⟳ ({rotateCharges})
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(PieceContainer);
