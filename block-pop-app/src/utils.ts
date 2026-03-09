import { PIECE_SHAPES, GRID_SIZE, DIFFICULTY_THRESHOLD_NORMAL, DIFFICULTY_THRESHOLD_HARD } from './constants';
import type { GridData, PieceShape } from './types';

export const createEmptyGrid = (): GridData => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ filled: false }))
  );
};

export const generateRandomPiece = (score: number = 0): PieceShape => {
  let weights: { simple: number; normal: number; hard: number };

  if (score < DIFFICULTY_THRESHOLD_NORMAL) {
    weights = { simple: 0.9, normal: 0.1, hard: 0.0 };
  } else if (score < DIFFICULTY_THRESHOLD_HARD) {
    weights = { simple: 0.6, normal: 0.3, hard: 0.1 };
  } else {
    weights = { simple: 0.4, normal: 0.4, hard: 0.2 };
  }

  const random = Math.random();
  let targetDifficulty: 'simple' | 'normal' | 'hard';

  if (random < weights.simple) {
    targetDifficulty = 'simple';
  } else if (random < weights.simple + weights.normal) {
    targetDifficulty = 'normal';
  } else {
    targetDifficulty = 'hard';
  }

  const filteredShapes = PIECE_SHAPES.filter(
    (s) => s.difficulty === targetDifficulty
  );
  
  // Fallback to simple if no shapes found for difficulty
  const finalShapes = filteredShapes.length > 0 
    ? filteredShapes 
    : PIECE_SHAPES.filter(s => s.difficulty === 'simple');

  const randomShape = finalShapes[Math.floor(Math.random() * finalShapes.length)];

  return {
    ...randomShape,
    id: Math.random().toString(36).substring(2, 9),
  } as PieceShape;
};

export const canPlacePiece = (
  grid: GridData,
  piece: PieceShape,
  row: number,
  col: number
): boolean => {
  const shape = piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
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

export const checkLines = (grid: GridData) => {
  const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (newGrid[r].every((cell) => cell.filled)) {
      rowsToClear.push(r);
    }
  }

  // Check cols
  for (let c = 0; c < GRID_SIZE; c++) {
    let allFilled = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!newGrid[r][c].filled) {
        allFilled = false;
        break;
      }
    }
    if (allFilled) {
      colsToClear.push(c);
    }
  }

  const popCells: [number, number][] = [];
  rowsToClear.forEach((r) => {
    for (let c = 0; c < GRID_SIZE; c++) {
      newGrid[r][c].pop = true;
      popCells.push([r, c]);
    }
  });
  colsToClear.forEach((c) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      newGrid[r][c].pop = true;
      popCells.push([r, c]);
    }
  });

  return {
    newGrid,
    linesCleared: rowsToClear.length + colsToClear.length,
    popCells,
  };
};

export const isGameOver = (grid: GridData, pieces: PieceShape[]): boolean => {
  return pieces.every((piece) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlacePiece(grid, piece, r, c)) {
          return false;
        }
      }
    }
    return true;
  });
};

/** 2차원 행렬을 90도 시계 방향으로 회전 */
export const rotateMatrix = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  // 행과 열이 바뀐 새 행렬 생성
  const result = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return result;
};
