# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

The app lives in `block-pop-app/`. All commands must be run from that subdirectory.

```
blockpop/
├── block-pop-app/       # React + Vite app (work here)
│   ├── src/
│   │   ├── App.tsx          # Root component — assembles hooks + components
│   │   ├── hooks/
│   │   │   ├── useCombo.ts        # Combo count, grace, multiplier, color
│   │   │   ├── useVisualEffects.ts # Score popups + particle effects
│   │   │   └── useCellCoordinates.ts # Grid ref, cell position, cached CSS vars
│   │   ├── components/
│   │   │   ├── GameBoard.tsx    # Layout wrapper: Grid + PieceContainer
│   │   │   ├── Grid.tsx         # 8×8 board, drag event targets (forwardRef)
│   │   │   ├── PieceContainer.tsx # 3 fixed slots (nullable pieces)
│   │   │   └── Piece.tsx        # Draggable piece with canvas ghost + disabled state
│   │   ├── utils.ts         # Pure game logic (no React)
│   │   ├── constants.ts     # Game constants (grid, scoring, combo, difficulty, effects)
│   │   └── types.ts         # CellState, GridData, PieceShape, VisualEffect
│   └── vite.config.ts       # base: '/blockpop/' for GitHub Pages
└── .github/workflows/deploy.yml  # Auto-deploys main → GitHub Pages
```

## Commands

All commands run from `block-pop-app/`:

```bash
cd block-pop-app
npm install       # install dependencies
npm run dev       # start dev server (localhost)
npm run build     # TypeScript check + Vite build → dist/
npm run lint      # ESLint
npm run preview   # preview production build locally
```

No test runner is configured.

## Architecture

**App.tsx** assembles game state (grid, score, currentPieces, drag state) with three custom hooks:
- `useCombo` — combo count, grace period, multiplier calculation, color stages
- `useVisualEffects` — score popup + particle effect creation/cleanup
- `useCellCoordinates` — grid DOM ref, cell position math, cached CSS custom property values

**Game loop**:
1. `startNewRound()` generates 3 `PieceShape`s with score-based difficulty weighting
2. Player drags a piece onto `Grid`; cells carry `data-row`/`data-col` attributes for hit-testing
3. On drop: `canPlacePiece` validates, grid is updated immutably, then `checkLines` scans all rows and columns
4. If lines cleared: combo increments, cells get `pop: true` → CSS animation → cleared after POP_ANIMATION_MS timeout, score popup + particles spawn
5. Game-over is a derived `useMemo` value, gated on `!isAnimating`
6. When all 3 pieces are placed (all slots null), `startNewRound()` fires via `setTimeout(..., 0)`

**Combo**: consecutive line clears build combo (multiplier = 1 + (n-1) × 0.5). Grace period of 3 turns before reset. Screen shake at combo ≥ 2.

**Pieces**: 21 shapes across 3 difficulty tiers (simple/normal/hard). `currentPieces` is a fixed-length `(PieceShape | null)[]` — used slots become null, positions preserved.

**Touch support**: `onTouchMove`/`onTouchEnd` use `document.elementFromPoint` to resolve the cell under the finger. A floating piece preview follows `touchPos`.

**Constants**: all magic numbers live in `constants.ts` (scoring, combo, difficulty thresholds, effect durations, particles per cell).

**Deployment**: pushing to `main` triggers GitHub Actions → builds and deploys `dist/` to GitHub Pages. Vite `base` is `/blockpop/`.

## Workflow Preference

Before making any code changes, always:
1. Summarize what was requested in your own words
2. Explain which files will be changed and how
3. Wait for confirmation before proceeding
