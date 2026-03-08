import { useState, useEffect, useCallback } from 'react';
import './App.css';
import type { GridData, PieceShape } from './types';
import {
  createEmptyGrid,
  generateRandomPiece,
  canPlacePiece,
  checkLines,
  isGameOver,
} from './utils';
import GameBoard from './components/GameBoard';

function App() {
  const [grid, setGrid] = useState<GridData>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [currentPieces, setCurrentPieces] = useState<PieceShape[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<PieceShape | null>(null);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  const [previewCells, setPreviewCells] = useState<[number, number][]>([]);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);

  const startNewRound = useCallback(() => {
    const newPieces = [
      generateRandomPiece(),
      generateRandomPiece(),
      generateRandomPiece(),
    ];
    setCurrentPieces(newPieces);
  }, []);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  // Fix 1: Guard game-over check while pop animation is in flight
  useEffect(() => {
    const animating = grid.some((row) => row.some((cell) => cell.pop));
    if (animating) return;
    if (currentPieces.length > 0 && isGameOver(grid, currentPieces)) {
      setGameOver(true);
    }
  }, [grid, currentPieces]);

  const handleDragStart = useCallback((piece: PieceShape, offsetRow: number, offsetCol: number) => {
    setDraggedPiece(piece);
    setDragOffset([offsetRow, offsetCol]);
  }, []);

  const handleDragEnter = useCallback(
    (row: number, col: number) => {
      if (!draggedPiece) return;

      const targetRow = row - dragOffset[0];
      const targetCol = col - dragOffset[1];

      if (canPlacePiece(grid, draggedPiece, targetRow, targetCol)) {
        const cells: [number, number][] = [];
        draggedPiece.shape.forEach((rShape, r) => {
          rShape.forEach((val, c) => {
            if (val === 1) {
              cells.push([targetRow + r, targetCol + c]);
            }
          });
        });
        setPreviewCells(cells);
      } else {
        setPreviewCells([]);
      }
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

        draggedPiece.shape.forEach((pieceRow, r) => {
          pieceRow.forEach((val, c) => {
            if (val === 1) {
              newGrid[targetRow + r][targetCol + c] = {
                filled: true,
                color: draggedPiece.color,
              };
            }
          });
        });

        const { newGrid: gridWithPop, linesCleared, popCells } = checkLines(newGrid);

        if (linesCleared > 0) {
          setGrid(gridWithPop);
          setScore(
            (prev) =>
              prev +
              draggedPiece.shape.flat().filter((v) => v === 1).length * 10 +
              linesCleared * 100
          );

          setTimeout(() => {
            setGrid((currentGrid) => {
              const finalGrid = currentGrid.map((r) => r.map((c) => ({ ...c })));
              popCells.forEach(([r, c]) => {
                finalGrid[r][c] = { filled: false };
              });
              return finalGrid;
            });
          }, 400);
        } else {
          setGrid(newGrid);
          setScore(
            (prev) =>
              prev + draggedPiece.shape.flat().filter((v) => v === 1).length * 10
          );
        }

        // Fix 2: functional updater reads latest state; start new round when all pieces used
        setCurrentPieces((prev) => {
          const remaining = prev.filter((p) => p.id !== draggedPiece.id);
          if (remaining.length === 0) {
            setTimeout(() => startNewRound(), 0);
          }
          return remaining;
        });
      }
      setDraggedPiece(null);
    },
    [draggedPiece, dragOffset, grid, startNewRound]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggedPiece) return;
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    const row = el?.dataset.row;
    const col = el?.dataset.col;
    if (row !== undefined && col !== undefined) {
      handleDragEnter(parseInt(row), parseInt(col));
    }
  }, [draggedPiece, handleDragEnter]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    const row = el?.dataset.row;
    const col = el?.dataset.col;
    if (row !== undefined && col !== undefined) {
      handleDrop(parseInt(row), parseInt(col));
    } else {
      setPreviewCells([]);
      setDraggedPiece(null);
    }
    setTouchPos(null);
  }, [handleDrop]);

  const restartGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setScore(0);
    setGameOver(false);
    startNewRound();
  }, [startNewRound]);

  const step = 32; // 30px cell + 2px gap

  return (
    <div
      className="game-container"
      onDragEnd={() => setPreviewCells([])}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="header">
        <h1>BLOCK POP</h1>
        <div className="score">Score: {score}</div>
      </div>

      {/* Fix 5: Use GameBoard instead of Grid + PieceContainer directly */}
      <GameBoard
        grid={grid}
        currentPieces={currentPieces}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragStart={handleDragStart}
        previewCells={previewCells}
        draggedPiece={draggedPiece}
      />

      {draggedPiece && touchPos && (
        <div
          className="floating-piece"
          style={{
            left: touchPos.x - dragOffset[1] * step - 15,
            top: touchPos.y - dragOffset[0] * step - 15,
          }}
        >
          {draggedPiece.shape.map((row, rIdx) => (
            <div key={rIdx} className="floating-piece-row">
              {row.map((val, cIdx) => (
                <div
                  key={cIdx}
                  className="floating-piece-cell"
                  style={{ backgroundColor: val === 1 ? draggedPiece.color : 'transparent' }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>GAME OVER</h2>
          <p>Final Score: {score}</p>
          <button className="restart-btn" onClick={restartGame}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
