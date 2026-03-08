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
}

