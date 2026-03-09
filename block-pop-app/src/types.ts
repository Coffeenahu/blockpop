export interface CellState {
  filled: boolean;
  color?: string;
  pop?: boolean;
}

export type GridData = CellState[][];

export interface PieceShape {
  id: string;
  shape: number[][]; // e.g., [[1,1], [1,1]]
  color: string;
  difficulty: 'simple' | 'normal' | 'hard';
}

export type ThemeId = 'dark' | 'light' | 'neon' | 'pastel';

export interface VisualEffect {
  id: string;
  x: number;
  y: number;
  text?: string;
  color?: string;
  tx?: string;
  ty?: string;
  type: 'score' | 'particle';
}

