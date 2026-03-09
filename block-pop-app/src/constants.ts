import type { PieceShape } from './types';

export const GRID_SIZE = 8;

// Scoring
export const PLACEMENT_POINTS_PER_CELL = 10;
export const LINE_CLEAR_BASE_POINTS = 100;

// Combo
export const COMBO_GRACE_TURNS = 3;
export const COMBO_MULTIPLIER_STEP = 0.5;

// Difficulty thresholds (score-based)
export const DIFFICULTY_THRESHOLD_NORMAL = 500;
export const DIFFICULTY_THRESHOLD_HARD = 1500;

// Visual effects
export const PARTICLES_PER_CELL = 6;
export const EFFECT_DURATION_MS = 1800;
export const POP_ANIMATION_MS = 400;
export const DRAG_LIFT_PX = 80;

export const PIECE_SHAPES: Omit<PieceShape, 'id'>[] = [
  // Simple
  { shape: [[1]], color: '#FF5733', difficulty: 'simple' }, // 1x1
  { shape: [[1, 1]], color: '#33FF57', difficulty: 'simple' }, // 1x2
  { shape: [[1], [1]], color: '#3357FF', difficulty: 'simple' }, // 2x1
  { shape: [[1, 1, 1]], color: '#FFBD33', difficulty: 'simple' }, // 1x3
  { shape: [[1], [1], [1]], color: '#33FFF3', difficulty: 'simple' }, // 3x1
  { shape: [[1, 1], [1, 1]], color: '#F333FF', difficulty: 'simple' }, // 2x2

  // Normal
  { shape: [[1, 1, 1, 1]], color: '#FF33A1', difficulty: 'normal' }, // 1x4
  { shape: [[1], [1], [1], [1]], color: '#A133FF', difficulty: 'normal' }, // 4x1
  { shape: [[1, 0], [1, 1]], color: '#33FFBD', difficulty: 'normal' }, // small L
  { shape: [[0, 1], [1, 1]], color: '#FF3333', difficulty: 'normal' }, // small Inverse L
  { shape: [[1, 1, 1], [0, 1, 0]], color: '#F3FF33', difficulty: 'normal' }, // T shape
  { shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: '#FF5733', difficulty: 'normal' }, // Big L
  { shape: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: '#33FF57', difficulty: 'normal' }, // Big Inverse L

  // Hard
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: '#3357FF', difficulty: 'hard' }, // 3x3 Square
  { shape: [[1, 1, 1, 1, 1]], color: '#FFBD33', difficulty: 'hard' }, // 1x5
  { shape: [[1], [1], [1], [1], [1]], color: '#33FFF3', difficulty: 'hard' }, // 5x1
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#F333FF', difficulty: 'hard' }, // Z shape
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#FF33A1', difficulty: 'hard' }, // S shape
  { shape: [[1, 1, 1], [0, 1, 0], [0, 1, 0]], color: '#A133FF', difficulty: 'hard' }, // Big T
  { shape: [[1, 0, 1], [1, 1, 1]], color: '#33FFBD', difficulty: 'hard' }, // U shape
];
