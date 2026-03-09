import React from 'react';
import type { PieceShape } from '../types';
import Piece from './Piece';

interface PieceContainerProps {
  currentPieces: (PieceShape | null)[];
  onPointerDown: (e: React.PointerEvent, piece: PieceShape, offsetRow: number, offsetCol: number) => void;
  placeableStatus: boolean[];
}

const PieceContainer: React.FC<PieceContainerProps> = ({ 
  currentPieces, 
  onPointerDown, 
  placeableStatus,
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
                disabled={placeableStatus[idx]}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(PieceContainer);
