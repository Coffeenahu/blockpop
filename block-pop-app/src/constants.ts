import type { PieceShape, ThemeId } from './types';

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

// Storage keys
export const SOUND_STORAGE_KEY = 'block-pop-sound';
export const THEME_STORAGE_KEY = 'block-pop-theme';

// Sound file paths (public/sounds/)
export const SOUND_FILES = {
  bgm:      '/blockpop/sounds/bgm.mp3',
  place:    '/blockpop/sounds/place.mp3',
  clear:    '/blockpop/sounds/clear.mp3',
  combo:    '/blockpop/sounds/combo.mp3',
  gameover: '/blockpop/sounds/gameover.mp3',
} as const;
export type SoundId = keyof typeof SOUND_FILES;

// Theme definitions
export interface ThemeDef {
  id: ThemeId;
  label: string;
  cssVars: Record<string, string>;
  blockColors: string[];
}

export const THEMES: ThemeDef[] = [
  {
    id: 'dark',
    label: '🌑',
    cssVars: { '--bg-color': '#1a1a1a', '--grid-bg': '#2d2d2d', '--text-color': '#ffffff', '--grid-border': '#3d3d3d' },
    blockColors: ['#FF5733','#33FF57','#3357FF','#FFBD33','#33FFF3','#F333FF','#FF33A1','#A133FF','#33FFBD','#FF3333'],
  },
  {
    id: 'light',
    label: '☀️',
    cssVars: { '--bg-color': '#f0f0f0', '--grid-bg': '#d8d8d8', '--text-color': '#111111', '--grid-border': '#bbbbbb' },
    blockColors: ['#E53E3E','#38A169','#3182CE','#D69E2E','#00B5D8','#805AD5','#DD6B20','#D53F8C','#319795','#2B6CB0'],
  },
  {
    id: 'neon',
    label: '⚡',
    cssVars: { '--bg-color': '#0a0a0f', '--grid-bg': '#12121f', '--text-color': '#00ffcc', '--grid-border': '#1a1a3a' },
    blockColors: ['#FF0080','#00FF41','#00BFFF','#FFE600','#FF6600','#BF00FF','#00FFC8','#FF3366','#33FFCC','#FF9900'],
  },
  {
    id: 'pastel',
    label: '🌸',
    cssVars: { '--bg-color': '#fdf6f0', '--grid-bg': '#ede0d4', '--text-color': '#5a4a42', '--grid-border': '#d4c4b8' },
    blockColors: ['#FFB3B3','#B3FFB3','#B3CCFF','#FFE4B3','#B3FFFF','#F0B3FF','#FFB3D9','#C4B3FF','#B3F0D9','#FFD9B3'],
  },
];

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
