import { useState, useCallback, useMemo, useEffect } from 'react';
import './App.css';
import type { GridData, PieceShape } from './types';
import {
  PLACEMENT_POINTS_PER_CELL,
  LINE_CLEAR_BASE_POINTS,
  PARTICLES_PER_CELL,
  POP_ANIMATION_MS,
  DRAG_LIFT_PX,
} from './constants';
import {
  createEmptyGrid,
  generateRandomPiece,
  canPlacePiece,
  checkLines,
  isGameOver,
  rotateMatrix,
} from './utils';
import GameBoard from './components/GameBoard';
import { useCombo } from './hooks/useCombo';
import { useVisualEffects } from './hooks/useVisualEffects';
import { useCellCoordinates } from './hooks/useCellCoordinates';

const initialPieces = (grid: GridData, score: number): (PieceShape | null)[] => {
  let pieces: (PieceShape | null)[] = [];
  let isAnyPlaceable = false;
  let attempts = 0;
  while (!isAnyPlaceable && attempts < 15) {
    pieces = [generateRandomPiece(score), generateRandomPiece(score), generateRandomPiece(score)];
    isAnyPlaceable = pieces.some(p => {
      if (!p) return false;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
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
  const [draggedPiece, setDraggedPiece] = useState<PieceShape | null>(null);
  const [draggedFromHold, setDraggedFromHold] = useState(false);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [previewCells, setPreviewCells] = useState<[number, number][]>([]);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);

  const { comboCount, comboGrace, getComboColor, getComboMultiplier, incrementCombo, decrementGrace, resetCombo } = useCombo();
  const { visualEffects, addEffect } = useVisualEffects();
  const { gridRef, getCellCoordinates, getPieceCellSize } = useCellCoordinates();

  useEffect(() => { setCurrentPieces(initialPieces(grid, 0)); }, []);

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
    setCurrentPieces(initialPieces(currentGrid, currentScore));
  }, []);

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

  const handleDragEnter = useCallback(
    (row: number, col: number) => {
      if (!draggedPiece) return;
      const targetRow = row - dragOffset[0];
      const targetCol = col - dragOffset[1];
      if (canPlacePiece(grid, draggedPiece, targetRow, targetCol)) {
        const cells: [number, number][] = [];
        draggedPiece.shape.forEach((rShape, r) => {
          rShape.forEach((val, c) => {
            if (val === 1) cells.push([targetRow + r, targetCol + c]);
          });
        });
        setPreviewCells(cells);
      } else setPreviewCells([]);
    },
    [draggedPiece, dragOffset, grid]
  );

  const handleDrop = useCallback(
    (row: number, col: number) => {
      setPreviewCells([]);
      if (!draggedPiece) return;
      const targetRow = row - dragOffset[0];
      const targetCol = col - dragOffset[1];

      if (canPlacePiece(grid, draggedPiece, targetRow, targetCol)) {
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
        }

        if (draggedFromHold) setHeldPiece(null);
        else {
          const remaining = currentPieces.map((p) => (p?.id === draggedPiece.id ? null : p));
          setCurrentPieces(remaining);
          if (remaining.every((p) => p === null)) setTimeout(() => startNewRound(latestScore, newGrid), 0);
        }
        setSwappedThisTurn(false);
      }
      setDraggedPiece(null);
      setDraggedFromHold(false);
    },
    [draggedPiece, dragOffset, grid, startNewRound, comboCount, incrementCombo, decrementGrace, getComboMultiplier, score, addEffect, getCellCoordinates, draggedFromHold, currentPieces]
  );

  /** 그리드 좌표 감지 핵심 로직 (강화된 버전) */
  const detectGridCell = useCallback((clientX: number, clientY: number) => {
    // 블록이 떠 있으므로 감지 지점 보정
    const checkX = clientX;
    const checkY = clientY - DRAG_LIFT_PX;

    // 해당 좌표의 요소 찾기
    let el = document.elementFromPoint(checkX, checkY) as HTMLElement | null;
    
    // 셀 사이의 간격(Gap)이나 가장자리를 터치한 경우 인접 셀 찾기
    if (el && !el.dataset.row) {
      el = el.closest('.cell') as HTMLElement | null;
    }

    const row = el?.dataset.row;
    const col = el?.dataset.col;
    return { row, col };
  }, []);

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
    
    // Hold 슬롯 감지 (오프셋 보정 적용 지점 기준)
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

  const restartGame = useCallback(() => {
    const newGrid = createEmptyGrid();
    setGrid(newGrid);
    setScore(0);
    resetCombo();
    setGameOver(false);
    setHeldPiece(null);
    setSwappedThisTurn(false);
    setRotateCharges(3);
    setShuffleCharges(1);
    setLastChargeScore(0);
    setLastShuffleScore(0);
    setIsRotateMode(false);
    setCurrentPieces(initialPieces(newGrid, 0));
  }, [resetCombo]);

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
      <div className="header">
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
          <button className="restart-btn" onClick={restartGame}>Try Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
