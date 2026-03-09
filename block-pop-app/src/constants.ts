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

// Revive
export const REVIVE_SCORE_THRESHOLD = 0.3; // 최고점의 30% 이상 달성 시 부활 가능
export const REVIVE_SCORE_PENALTY = 0.7;   // 부활 시 현재 점수의 70%로 차감
export const REVIVE_CLEAR_ROWS = 4;        // 부활 시 하단 N행 제거

// Block color palette (Monochrome Lime Palette for Khaki Theme)
export const BLOCK_COLORS = [
  '#cadf9e', // Primary Lime
  '#cadf9e',
  '#cadf9e',
  '#cadf9e',
  '#cadf9e',
  '#cadf9e',
  '#cadf9e',
  '#cadf9e',
  '#cadf9e',
  '#cadf9e',
] as const;

// Storage keys
export const SOUND_STORAGE_KEY = 'block-pop-sound';

// Sound file paths (public/sounds/)
export const SOUND_FILES = {
  bgm:      '/blockpop/sounds/bgm.mp3',
  place:    '/blockpop/sounds/place.mp3',
  clear:    '/blockpop/sounds/clear.mp3',
  combo:    '/blockpop/sounds/combo.mp3',
  gameover: '/blockpop/sounds/gameover.mp3',
} as const;
export type SoundId = keyof typeof SOUND_FILES;


export const PIECE_SHAPES: Omit<PieceShape, 'id'>[] = [
  // Simple — BLOCK_COLORS[0~5]
  { shape: [[1]], color: BLOCK_COLORS[0], difficulty: 'simple' }, // 1x1
  { shape: [[1, 1]], color: BLOCK_COLORS[1], difficulty: 'simple' }, // 1x2
  { shape: [[1], [1]], color: BLOCK_COLORS[2], difficulty: 'simple' }, // 2x1
  { shape: [[1, 1, 1]], color: BLOCK_COLORS[3], difficulty: 'simple' }, // 1x3
  { shape: [[1], [1], [1]], color: BLOCK_COLORS[4], difficulty: 'simple' }, // 3x1
  { shape: [[1, 1], [1, 1]], color: BLOCK_COLORS[5], difficulty: 'simple' }, // 2x2

  // Normal — BLOCK_COLORS[6~9, 0~2]
  { shape: [[1, 1, 1, 1]], color: BLOCK_COLORS[6], difficulty: 'normal' }, // 1x4
  { shape: [[1], [1], [1], [1]], color: BLOCK_COLORS[7], difficulty: 'normal' }, // 4x1
  { shape: [[1, 0], [1, 1]], color: BLOCK_COLORS[8], difficulty: 'normal' }, // small L
  { shape: [[0, 1], [1, 1]], color: BLOCK_COLORS[9], difficulty: 'normal' }, // small Inverse L
  { shape: [[1, 1, 1], [0, 1, 0]], color: BLOCK_COLORS[0], difficulty: 'normal' }, // T shape
  { shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: BLOCK_COLORS[1], difficulty: 'normal' }, // Big L
  { shape: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: BLOCK_COLORS[2], difficulty: 'normal' }, // Big Inverse L

  // Hard — BLOCK_COLORS[3~9]
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: BLOCK_COLORS[3], difficulty: 'hard' }, // 3x3 Square
  { shape: [[1, 1, 1, 1, 1]], color: BLOCK_COLORS[4], difficulty: 'hard' }, // 1x5
  { shape: [[1], [1], [1], [1], [1]], color: BLOCK_COLORS[5], difficulty: 'hard' }, // 5x1
  { shape: [[1, 1, 0], [0, 1, 1]], color: BLOCK_COLORS[6], difficulty: 'hard' }, // Z shape
  { shape: [[0, 1, 1], [1, 1, 0]], color: BLOCK_COLORS[7], difficulty: 'hard' }, // S shape
  { shape: [[1, 1, 1], [0, 1, 0], [0, 1, 0]], color: BLOCK_COLORS[8], difficulty: 'hard' }, // Big T
  { shape: [[1, 0, 1], [1, 1, 1]], color: BLOCK_COLORS[9], difficulty: 'hard' }, // U shape
];
