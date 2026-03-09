import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import './App.css';
import type { GridData, PieceShape, ThemeId } from './types';
import {
  PLACEMENT_POINTS_PER_CELL,
  LINE_CLEAR_BASE_POINTS,
  PARTICLES_PER_CELL,
  POP_ANIMATION_MS,
  DRAG_LIFT_PX,
  GRID_SIZE,
  REVIVE_SCORE_THRESHOLD,
  REVIVE_SCORE_PENALTY,
  REVIVE_CLEAR_ROWS,
  THEMES,
} from './constants';
import {
  createEmptyGrid,
  generateRandomPiece,
  canPlacePiece,
  checkLines,
  isGameOver,
  rotateMatrix,
  clearBottomRows,
} from './utils';
import GameBoard from './components/GameBoard';
import { useCombo } from './hooks/useCombo';
import { useVisualEffects } from './hooks/useVisualEffects';
import { useCellCoordinates } from './hooks/useCellCoordinates';
import { useSound } from './hooks/useSound';
import { useTheme } from './hooks/useTheme';

const initialPieces = (grid: GridData, score: number, blockColors?: string[]): (PieceShape | null)[] => {
  let pieces: (PieceShape | null)[] = [];
  let isAnyPlaceable = false;
  let attempts = 0;
  while (!isAnyPlaceable && attempts < 15) {
    pieces = [
      generateRandomPiece(score, blockColors),
      generateRandomPiece(score, blockColors),
      generateRandomPiece(score, blockColors),
    ];
    isAnyPlaceable = pieces.some(p => {
      if (!p) return false;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlacePiece(grid, p, r, c)) return true;
        }
      }
      return false;
    });
    attempts++;
  }
  return pieces;
};

function App() {
  const [grid, setGrid] = useState<GridData>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentPieces, setCurrentPieces] = useState<(PieceShape | null)[]>([]);
  const [heldPiece, setHeldPiece] = useState<PieceShape | null>(null);
  const [swappedThisTurn, setSwappedThisTurn] = useState(false);
  
  const [rotateCharges, setRotateCharges] = useState(3);
  const [shuffleCharges, setShuffleCharges] = useState(1);
  const [lastChargeScore, setLastChargeScore] = useState(0);
  const [lastShuffleScore, setLastShuffleScore] = useState(0);
  const [isRotateMode, setIsRotateMode] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<PieceShape | null>(null);
  const [draggedFromHold, setDraggedFromHold] = useState(false);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [previewCells, setPreviewCells] = useState<[number, number][]>([]);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);

  const { comboCount, comboGrace, getComboColor, getComboMultiplier, incrementCombo, decrementGrace, resetCombo } = useCombo();
  const { visualEffects, addEffect } = useVisualEffects();
  const { gridRef, getCellCoordinates, getPieceCellSize } = useCellCoordinates();
  const { isMuted, toggleMute, playSound, startBgm, stopBgm } = useSound();
  const { themeId, setTheme, getBlockColors } = useTheme();

  // 테마 변경 시 기존 그리드/피스 색상을 새 팔레트로 리맵
  const prevThemeIdRef = useRef<ThemeId>(themeId);
  useEffect(() => {
    const prevId = prevThemeIdRef.current;
    prevThemeIdRef.current = themeId;
    if (prevId === themeId) return;
    const prevColors = THEMES.find((t) => t.id === prevId)?.blockColors ?? [];
    const newColors = THEMES.find((t) => t.id === themeId)?.blockColors ?? [];
    if (!prevColors.length || !newColors.length) return;
    const remap = (color: string) => {
      const idx = prevColors.indexOf(color);
      return idx >= 0 ? newColors[idx % newColors.length] : color;
    };
    setGrid((prev) => prev.map((row) => row.map((cell) =>
      cell.filled && cell.color ? { ...cell, color: remap(cell.color) } : cell
    )));
    setCurrentPieces((prev) => prev.map((p) => p ? { ...p, color: remap(p.color) } : p));
    setHeldPiece((prev) => prev ? { ...prev, color: remap(prev.color) } : prev);
  }, [themeId]);

  useEffect(() => { setCurrentPieces(initialPieces(grid, 0, getBlockColors())); }, []);

  useEffect(() => {
    const savedBest = localStorage.getItem('block-pop-best-score');
    if (savedBest) setBestScore(parseInt(savedBest, 10));
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('block-pop-best-score', score.toString());
    }
  }, [score, bestScore]);

  useEffect(() => {
    if (score - lastChargeScore >= 2000) {
      setRotateCharges(prev => Math.min(prev + 1, 3));
      setLastChargeScore(Math.floor(score / 2000) * 2000);
    }
    if (score - lastShuffleScore >= 2000) {
      setShuffleCharges(prev => Math.min(prev + 1, 2));
      setLastShuffleScore(Math.floor(score / 2000) * 2000);
    }
  }, [score, lastChargeScore, lastShuffleScore]);

  const startNewRound = useCallback((currentScore: number, currentGrid: GridData) => {
    setCurrentPieces(initialPieces(currentGrid, currentScore, getBlockColors()));
  }, [getBlockColors]);

  const isAnimating = grid.some((row) => row.some((cell) => cell.pop));

  const isHoldAvailableGuide = useMemo(() => {
    if (heldPiece !== null) return false;
    const activePieces = currentPieces.filter((p): p is PieceShape => p !== null);
    if (activePieces.length !== 1) return false;
    return !activePieces.some(p => {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (canPlacePiece(grid, p, r, c)) return true;
        }
      }
      return false;
    });
  }, [grid, currentPieces, heldPiece]);

  const computedGameOver = useMemo(() => {
    if (isAnimating || gameOver) return gameOver;
    if (isHoldAvailableGuide) return false;
    const piecesToCheck = [...currentPieces.filter((p): p is PieceShape => p !== null)];
    if (heldPiece) piecesToCheck.push(heldPiece);
    if (piecesToCheck.length > 0 && isGameOver(grid, piecesToCheck)) return true;
    return false;
  }, [grid, currentPieces, heldPiece, isAnimating, gameOver, isHoldAvailableGuide]);

  /** 지능형 유연 흡착 (Flex-Snapping): 주변 1칸 이내의 배치 가능한 최적의 위치를 찾음 */
  const findBestPlacement = useCallback((baseRow: number, baseCol: number, piece: PieceShape): [number, number] | null => {
    const targetRow = baseRow - dragOffset[0];
    const targetCol = baseCol - dragOffset[1];

    // 1순위: 현재 위치가 가능하면 바로 반환
    if (canPlacePiece(grid, piece, targetRow, targetCol)) {
      return [targetRow, targetCol];
    }

    // 2순위: 주변 3x3 영역 검색 (자석 효과)
    // 검색 순서: 상하좌우 -> 대각선
    const searchOffsets = [
      [0, 1], [0, -1], [1, 0], [-1, 0], // 상하좌우
      [1, 1], [1, -1], [-1, 1], [-1, -1] // 대각선
    ];

    for (const [dr, dc] of searchOffsets) {
      const nr = targetRow + dr;
      const nc = targetCol + dc;
      if (canPlacePiece(grid, piece, nr, nc)) {
        return [nr, nc];
      }
    }

    return null;
  }, [grid, dragOffset]);

  const handleDragEnter = useCallback(
    (row: number, col: number) => {
      if (!draggedPiece) return;
      
      const bestPos = findBestPlacement(row, col, draggedPiece);
      
      if (bestPos) {
        const [targetRow, targetCol] = bestPos;
        const cells: [number, number][] = [];
        draggedPiece.shape.forEach((rShape, r) => {
          rShape.forEach((val, c) => {
            if (val === 1) cells.push([targetRow + r, targetCol + c]);
          });
        });
        setPreviewCells(cells);
      } else {
        setPreviewCells([]);
      }
    },
    [draggedPiece, findBestPlacement]
  );

  const handleDrop = useCallback(
    (row: number, col: number) => {
      setPreviewCells([]);
      if (!draggedPiece) return;
      
      const bestPos = findBestPlacement(row, col, draggedPiece);
      if (!bestPos) {
        setDraggedPiece(null);
        return;
      }

      const [targetRow, targetCol] = bestPos;
      const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
      let latestScore = score;
      const placementPoints = draggedPiece.shape.flat().filter((v) => v === 1).length * PLACEMENT_POINTS_PER_CELL;

      draggedPiece.shape.forEach((pieceRow, r) => {
        pieceRow.forEach((val, c) => {
          if (val === 1) {
            newGrid[targetRow + r][targetCol + c] = { filled: true, color: draggedPiece.color };
          }
        });
      });

      const { newGrid: gridWithPop, linesCleared, popCells } = checkLines(newGrid);

      if (linesCleared > 0) {
        incrementCombo();
        const newComboCount = comboCount + 1;
        const baseLineScore = Math.pow(linesCleared, 2) * LINE_CLEAR_BASE_POINTS;
        const comboBonus = Math.floor(baseLineScore * getComboMultiplier(newComboCount));
        playSound(newComboCount >= 2 ? 'combo' : 'clear');

        setGrid(gridWithPop);
        latestScore = score + placementPoints + comboBonus;
        setScore(latestScore);

        const avgX = popCells.reduce((sum, [, c]) => sum + getCellCoordinates(0, c).x, 0) / popCells.length;
        const avgY = popCells.reduce((sum, [r]) => sum + getCellCoordinates(r, 0).y, 0) / popCells.length;
        
        let popupText = `+${comboBonus}`;
        if (linesCleared === 2) popupText = `DOUBLE! ${popupText}`;
        if (linesCleared === 3) popupText = `TRIPLE! ${popupText}`;
        if (linesCleared >= 4) popupText = `MEGA! ${popupText}`;
        
        addEffect({ x: avgX, y: avgY, text: popupText, type: 'score' });

        popCells.forEach(([r, c]) => {
          const coords = getCellCoordinates(r, c);
          const cellColor = newGrid[r][c].color || '#fff';
          for (let i = 0; i < PARTICLES_PER_CELL; i++) {
            addEffect({ x: coords.x, y: coords.y, color: cellColor, tx: `${(Math.random() - 0.5) * 150}px`, ty: `${(Math.random() - 0.5) * 150}px`, type: 'particle' });
          }
        });

        setTimeout(() => {
          setGrid((currentGrid) => {
            const finalGrid = currentGrid.map((r) => r.map((c) => ({ ...c })));
            popCells.forEach(([r, c]) => { finalGrid[r][c] = { filled: false }; });
            return finalGrid;
          });
        }, POP_ANIMATION_MS);
      } else {
        if (comboCount > 0) decrementGrace();
        setGrid(newGrid);
        latestScore = score + placementPoints;
        setScore(latestScore);
        playSound('place');
      }

      if (draggedFromHold) setHeldPiece(null);
      else {
        const remaining = currentPieces.map((p) => (p?.id === draggedPiece.id ? null : p));
        setCurrentPieces(remaining);
        if (remaining.every((p) => p === null)) setTimeout(() => startNewRound(latestScore, newGrid), 0);
      }
      setSwappedThisTurn(false);
      setDraggedPiece(null);
      setDraggedFromHold(false);
    },
    [draggedPiece, grid, startNewRound, comboCount, incrementCombo, decrementGrace, getComboMultiplier, score, addEffect, getCellCoordinates, draggedFromHold, currentPieces, findBestPlacement, playSound]
  );

  const detectGridCell = useCallback((clientX: number, clientY: number) => {
    if (!gridRef.current) return { row: undefined, col: undefined };
    const rect = gridRef.current.getBoundingClientRect();
    const checkX = clientX;
    const checkY = clientY - DRAG_LIFT_PX;
    const margin = 20;
    if (checkX < rect.left - margin || checkX > rect.right + margin || checkY < rect.top - margin || checkY > rect.bottom + margin) {
      return { row: undefined, col: undefined };
    }
    const relativeX = checkX - rect.left;
    const relativeY = checkY - rect.top;
    const gridStyle = window.getComputedStyle(gridRef.current);
    const cellSize = parseFloat(gridStyle.getPropertyValue('--cell-size')) || (rect.width / GRID_SIZE);
    const step = cellSize + 4;
    let col = Math.floor(relativeX / step);
    let row = Math.floor(relativeY / step);
    col = Math.max(0, Math.min(GRID_SIZE - 1, col));
    row = Math.max(0, Math.min(GRID_SIZE - 1, row));
    return { row: row.toString(), col: col.toString() };
  }, [gridRef]);

  const handlePointerDown = useCallback((e: React.PointerEvent, piece: PieceShape, offsetRow: number, offsetCol: number, isFromHold = false) => {
    if (isRotateMode && rotateCharges > 0) {
      if (isFromHold) setHeldPiece({ ...piece, shape: rotateMatrix(piece.shape) });
      else setCurrentPieces(prev => prev.map(p => p?.id === piece.id ? { ...p, shape: rotateMatrix(p.shape) } : p));
      setRotateCharges(prev => prev - 1);
      setIsRotateMode(false);
      return;
    }
    setDraggedPiece(piece);
    setDragOffset([offsetRow, offsetCol]);
    setDraggedFromHold(isFromHold);
    setPointerPos({ x: e.clientX, y: e.clientY });
    const container = document.querySelector('.game-container') as HTMLElement;
    if (container) container.setPointerCapture(e.pointerId);
  }, [isRotateMode, rotateCharges]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggedPiece) return;
    setPointerPos({ x: e.clientX, y: e.clientY });
    const { row, col } = detectGridCell(e.clientX, e.clientY);
    if (row !== undefined && col !== undefined) handleDragEnter(parseInt(row), parseInt(col));
    else setPreviewCells([]);
  }, [draggedPiece, handleDragEnter, detectGridCell]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggedPiece) return;
    const checkX = e.clientX;
    const checkY = e.clientY - DRAG_LIFT_PX;
    const elAtPoint = document.elementFromPoint(checkX, checkY) as HTMLElement | null;
    const holdSlot = elAtPoint?.closest('.hold-slot') as HTMLElement | null;
    if (holdSlot && !swappedThisTurn && !draggedFromHold) {
      const prevHeld = heldPiece;
      setHeldPiece(draggedPiece);
      const nextPieces = currentPieces.map(p => p?.id === draggedPiece.id ? prevHeld : p);
      setCurrentPieces(nextPieces);
      if (nextPieces.every(p => p === null)) setTimeout(() => startNewRound(score, grid), 0);
      setSwappedThisTurn(true);
      setDraggedPiece(null);
      setPreviewCells([]);
      setPointerPos(null);
      return;
    }
    const { row, col } = detectGridCell(e.clientX, e.clientY);
    if (row !== undefined && col !== undefined) handleDrop(parseInt(row), parseInt(col));
    else {
      setPreviewCells([]);
      setDraggedPiece(null);
      setDraggedFromHold(false);
    }
    setPointerPos(null);
  }, [draggedPiece, handleDrop, heldPiece, swappedThisTurn, draggedFromHold, currentPieces, score, grid, startNewRound, detectGridCell]);

  const handleShuffle = useCallback(() => {
    if (shuffleCharges <= 0) return;
    setCurrentPieces(initialPieces(grid, score));
    setShuffleCharges(prev => prev - 1);
  }, [shuffleCharges, score, grid]);

  // 게임오버 사운드 (최초 1회)
  const gameOverSoundFired = useRef(false);
  useEffect(() => {
    if (computedGameOver && !gameOverSoundFired.current) {
      gameOverSoundFired.current = true;
      playSound('gameover');
      stopBgm();
    }
    if (!computedGameOver) {
      gameOverSoundFired.current = false;
    }
  }, [computedGameOver, playSound, stopBgm]);

  const canRevive = !reviveUsed && score >= bestScore * REVIVE_SCORE_THRESHOLD && bestScore > 0;

  const handleRevive = useCallback(() => {
    const newScore = Math.floor(score * REVIVE_SCORE_PENALTY);
    setScore(newScore);
    setGrid((prev) => clearBottomRows(prev, REVIVE_CLEAR_ROWS));
    setReviveUsed(true);
    setGameOver(false);
    startBgm();
  }, [score, startBgm]);

  const restartGame = useCallback(() => {
    const newGrid = createEmptyGrid();
    setGrid(newGrid);
    setScore(0);
    resetCombo();
    setGameOver(false);
    setReviveUsed(false);
    setHeldPiece(null);
    setSwappedThisTurn(false);
    setRotateCharges(3);
    setShuffleCharges(1);
    setLastChargeScore(0);
    setLastShuffleScore(0);
    setIsRotateMode(false);
    setCurrentPieces(initialPieces(newGrid, 0, getBlockColors()));
    startBgm();
  }, [resetCombo, getBlockColors, startBgm]);

  const pieceCellSize = getPieceCellSize();
  const step = pieceCellSize + 2;

  const placeableStatus = useMemo(() =>
    currentPieces.map((piece) => {
      if (!piece) return false;
      const tempGrid = grid.map(row => row.map(cell => ({ ...cell, filled: cell.filled && !cell.pop })));
      return !tempGrid.some((_, r) => tempGrid[0].some((_, c) => canPlacePiece(tempGrid, piece, r, c)));
    }),
    [grid, currentPieces]
  );

  const heldPiecePlaceable = useMemo(() => {
    if (!heldPiece) return true;
    const tempGrid = grid.map(row => row.map(cell => ({ ...cell, filled: cell.filled && !cell.pop })));
    return tempGrid.some((_, r) => tempGrid[0].some((_, c) => canPlacePiece(tempGrid, heldPiece, r, c)));
  }, [grid, heldPiece]);

  return (
    <div
      className={`game-container ${comboCount > 1 ? 'screen-shake' : ''} ${isRotateMode ? 'rotate-mode-active' : ''} ${isHoldAvailableGuide ? 'hold-guide-active' : ''}`}
      key={comboCount}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="game-inner">
      <div className="header">
        <div className="header-top-row">
          <div className="theme-btn-group">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-btn ${themeId === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
                title={t.id}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className={`mute-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className="score-container">
          <div className="score">Score: {score}</div>
          <div className="best-score">Best: {bestScore}</div>
        </div>
        <div className="combo-container">
          {comboCount > 1 && (
            <>
              <div className="combo-text" style={{ color: getComboColor(comboCount) }}>COMBO x{comboCount}</div>
              <div className="combo-grace">Grace: {'★'.repeat(comboGrace)}{'☆'.repeat(3 - comboGrace)}</div>
            </>
          )}
        </div>
      </div>

      <div className="game-board-container">
        <GameBoard
          grid={grid}
          currentPieces={currentPieces}
          heldPiece={heldPiece}
          swappedThisTurn={swappedThisTurn}
          heldPiecePlaceable={heldPiecePlaceable}
          rotateCharges={rotateCharges}
          shuffleCharges={shuffleCharges}
          isRotateMode={isRotateMode}
          isHoldAvailableGuide={isHoldAvailableGuide}
          onPointerDown={handlePointerDown}
          onShuffle={handleShuffle}
          onToggleRotateMode={() => setIsRotateMode(!isRotateMode)}
          previewCells={previewCells}
          placeableStatus={placeableStatus}
          gridRef={gridRef}
          visualEffects={visualEffects}
        />
      </div>
      </div>

      {draggedPiece && pointerPos && (
        <div
          className="floating-piece"
          style={{
            left: pointerPos.x - (dragOffset[1] * step) - (pieceCellSize / 2),
            top: pointerPos.y - (dragOffset[0] * step) - (pieceCellSize / 2) - DRAG_LIFT_PX,
          }}
        >
          {draggedPiece.shape.map((row, rIdx) => (
            <div key={rIdx} className="floating-piece-row">
              {row.map((val, cIdx) => (
                <div key={cIdx} className="floating-piece-cell" style={{ backgroundColor: val === 1 ? draggedPiece.color : 'transparent' }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {computedGameOver && (
        <div className="game-over">
          <h2>GAME OVER</h2>
          <p>Final Score: {score}</p>
          {canRevive && (
            <button className="revive-btn" onClick={handleRevive}>
              💀 REVIVE (-30%)
            </button>
          )}
          <button className="restart-btn" onClick={restartGame}>Try Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
