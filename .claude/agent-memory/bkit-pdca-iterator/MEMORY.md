# PDCA Iterator Agent Memory - block-pop

## Project Structure
- App: `C:\Claudecode\blockpop\block-pop-app\src\`
- Framework: React + TypeScript (Vite)
- Grid: 8x8, drag-and-drop piece placement

## Iteration History

### Iteration 1 (2026-03-08)
- Start match rate: 85%
- Target: >= 90%
- All 6 code bugs fixed + 3 feature gaps closed

### Iteration 2 (2026-03-08)
- Start match rate: ~96%
- Target: >= 98%
- Previous agent claimed fixes but actual files showed issues unresolved

### Iteration 3 (2026-03-08)
- Start match rate: ~96% (actual code, not reports)
- Target: >= 99%
- Read actual files — confirmed all 5 fixes were still needed
- Fix 1: Added pop-animation guard to isGameOver useEffect in App.tsx
- Fix 2: Replaced stale closure `currentPieces.length === 1` with functional setCurrentPieces updater
- Fix 3: Wrapped handleDragStart, handleDragEnter, handleDrop, restartGame in useCallback
- Fix 4: Grid.tsx — React.memo, useMemo Set for O(1) preview lookup, useCallback on internal handlers, preview background color
- Fix 5: Created GameBoard.tsx (App -> GameBoard -> Grid + PieceContainer); App now imports GameBoard
- Build: tsc --noEmit and vite build both passed cleanly with 0 errors

## Bug Patterns Encountered

### False Game-Over During Animation
- Root cause: `isGameOver` effect ran while pop cells were still `filled: true` (animation in-flight)
- Fix: guard the effect with `grid.some(row => row.some(cell => cell.pop))` — skip check while animating
- File: `App.tsx`

### Stale Closure in State Updater
- Root cause: `currentPieces.length === 1` read stale closure after `setCurrentPieces` queued
- Fix: use functional `setCurrentPieces(prev => { ... })` and `setTimeout(() => startNewRound(), 0)` from inside
- File: `App.tsx`

### Duplicate Entries in popCells
- Root cause: row-loop and col-loop both push intersection cells to `popCells`
- Fix: `Set<string>` dedup guard with `${r},${c}` keys in `addPopCell` helper
- File: `utils.ts`

## Feature Additions

### Drag Preview (Grid.tsx)
- Approach: `previewCells: [number, number][]` prop passed from App (computed in handleDragEnter)
- Grid builds a `Set<string>` via useMemo for O(1) lookup per cell during render
- Preview style: `backgroundColor: 'rgba(255,255,255,0.3)'` applied inline when `inPreview`
- CSS class `.preview` still applied alongside the inline style
- No internal hoverCell state in Grid — App owns the preview computation

## Conventions / Preferences
- `React.memo` on all pure display components (Grid, Piece, PieceContainer, GameBoard)
- `useCallback` on all handlers passed as props (prevents memo bypassing)
- `useMemo` for any O(n²) computation in render path (e.g., canPlacePiece / Set building)
- Functional state updaters preferred over closure reads for async-safe state access
- `substring` not `substr` (deprecated)
- Responsive widths: `width: 100%; max-width: Xpx; box-sizing: border-box`

## Component Hierarchy (post-Iteration 2)
- App → GameBoard → Grid + PieceContainer → Piece
- App → (ScoreBoard inline in header div)
- GameBoard: `C:\Claudecode\blockpop\block-pop-app\src\components\GameBoard.tsx`
