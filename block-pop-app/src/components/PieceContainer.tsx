import React from 'react';
import type { PieceShape } from '../types';
import Piece from './Piece';

interface PieceContainerProps {
  currentPieces: PieceShape[];
  onDragStart: (piece: PieceShape, offsetRow: number, offsetCol: number) => void;
}

const PieceContainer: React.FC<PieceContainerProps> = ({ currentPieces, onDragStart }) => {
  return (
    <div className="pieces-container">
      {currentPieces.map((piece) => (
        <Piece
          key={piece.id}
          piece={piece}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
};

export default React.memo(PieceContainer);
