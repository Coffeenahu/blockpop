import type { PieceShape } from './types';

export const GRID_SIZE = 8;

export const PIECE_SHAPES: Omit<PieceShape, 'id'>[] = [
  { shape: [[1]], color: '#FF5733' }, // 1x1
  { shape: [[1, 1]], color: '#33FF57' }, // 1x2
  { shape: [[1], [1]], color: '#3357FF' }, // 2x1
  { shape: [[1, 1], [1, 1]], color: '#F333FF' }, // 2x2
  { shape: [[1, 1, 1]], color: '#FFBD33' }, // 1x3
  { shape: [[1], [1], [1]], color: '#33FFF3' }, // 3x1
  { shape: [[1, 1, 1, 1]], color: '#FF33A1' }, // 1x4
  { shape: [[1], [1], [1], [1]], color: '#A133FF' }, // 4x1
  { shape: [[1, 0], [1, 1]], color: '#33FFBD' }, // L shape
  { shape: [[0, 1], [1, 1]], color: '#FF3333' }, // Inverse L
  { shape: [[1, 1, 1], [0, 1, 0]], color: '#F3FF33' }, // T shape
];
