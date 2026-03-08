import { GRID_SIZE, PIECE_SHAPES } from './constants';
import type { GridData, PieceShape } from './types';

export const createEmptyGrid = (): GridData => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ filled: false }))
  );
};

export const generateRandomPiece = (): PieceShape => {
  const randomIndex = Math.floor(Math.random() * PIECE_SHAPES.length);
  const basePiece = PIECE_SHAPES[randomIndex];
  return {
    ...basePiece,
    id: Math.random().toString(36).substring(2, 11),
  };
};

export const canPlacePiece = (
  grid: GridData,
  piece: PieceShape,
  row: number,
  col: number
): boolean => {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] === 1) {
        const targetRow = row + r;
        const targetCol = col + c;

        if (
          targetRow < 0 ||
          targetRow >= GRID_SIZE ||
          targetCol < 0 ||
          targetCol >= GRID_SIZE ||
          grid[targetRow][targetCol].filled
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

export const checkLines = (grid: GridData): { newGrid: GridData; linesCleared: number; popCells: [number, number][] } => {
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every((cell) => cell.filled)) {
      rowsToClear.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let allFilled = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!grid[r][c].filled) {
        allFilled = false;
        break;
      }
    }
    if (allFilled) {
      colsToClear.push(c);
    }
  }

  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  const popCells: [number, number][] = [];
  const seen = new Set<string>();

  const addPopCell = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (!seen.has(key)) {
      seen.add(key);
      newGrid[r][c].pop = true;
      popCells.push([r, c]);
    }
  };

  rowsToClear.forEach((r) => {
    for (let c = 0; c < GRID_SIZE; c++) {
      addPopCell(r, c);
    }
  });

  colsToClear.forEach((c) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      addPopCell(r, c);
    }
  });

  return { newGrid, linesCleared: rowsToClear.length + colsToClear.length, popCells };
};

export const isGameOver = (grid: GridData, currentPieces: PieceShape[]): boolean => {
  if (currentPieces.length === 0) return false;

  for (const piece of currentPieces) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlacePiece(grid, piece, r, c)) {
          return false;
        }
      }
    }
  }
  return true;
};
