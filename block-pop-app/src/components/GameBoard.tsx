import React from 'react';
import type { GridData, PieceShape } from '../types';
import Grid from './Grid';
import PieceContainer from './PieceContainer';

interface GameBoardProps {
  grid: GridData;
  currentPieces: PieceShape[];
  onDrop: (row: number, col: number) => void;
  onDragEnter: (row: number, col: number) => void;
  onDragStart: (piece: PieceShape, offsetRow: number, offsetCol: number) => void;
  previewCells: [number, number][];
  draggedPiece: PieceShape | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  currentPieces,
  onDrop,
  onDragEnter,
  onDragStart,
  previewCells,
}) => {
  return (
    <>
      <Grid
        grid={grid}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        previewCells={previewCells}
      />
      <PieceContainer currentPieces={currentPieces} onDragStart={onDragStart} />
    </>
  );
};

export default React.memo(GameBoard);
