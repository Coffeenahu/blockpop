import React from 'react';
import type { GridData, PieceShape } from '../types';
import Grid from './Grid';
import PieceContainer from './PieceContainer';
import Piece from './Piece';

interface GameBoardProps {
  grid: GridData;
  currentPieces: (PieceShape | null)[];
  heldPiece: PieceShape | null;
  swappedThisTurn: boolean;
  heldPiecePlaceable: boolean;
  rotateCharges: number;
  shuffleCharges: number;
  isRotateMode: boolean;
  isHoldAvailableGuide: boolean;
  onPointerDown: (e: React.PointerEvent, piece: PieceShape, offsetRow: number, offsetCol: number, isFromHold?: boolean) => void;
  onShuffle: () => void;
  onToggleRotateMode: () => void;
  previewCells: [number, number][];
  placeableStatus: boolean[];
  gridRef: React.RefObject<HTMLDivElement | null>;
  visualEffects: any[];
}

const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  currentPieces,
  heldPiece,
  swappedThisTurn,
  heldPiecePlaceable,
  rotateCharges,
  shuffleCharges,
  isRotateMode,
  isHoldAvailableGuide,
  onPointerDown,
  onShuffle,
  onToggleRotateMode,
  previewCells,
  placeableStatus,
  gridRef,
  visualEffects,
}) => {
  // Hold 슬롯에 있는 피스의 크기가 5칸인 경우 축소 배율 계산
  const getHoldScale = (piece: PieceShape | null) => {
    if (!piece) return 1;
    const maxDim = Math.max(piece.shape.length, piece.shape[0].length);
    return maxDim >= 5 ? 0.75 : 1;
  };

  return (
    <div className="game-board-layout">
      <div className="grid-relative-container" style={{ position: 'relative' }}>
        <Grid
          grid={grid}
          previewCells={previewCells}
          ref={gridRef}
        />
        
        <div className="effects-overlay">
          {visualEffects.map((effect) => (
            effect.type === 'score' ? (
              <div key={effect.id} className="score-popup" style={{ left: effect.x, top: effect.y }}>
                {effect.text}
              </div>
            ) : (
              <div
                key={effect.id}
                className="particle"
                style={{
                  left: effect.x,
                  top: effect.y,
                  backgroundColor: effect.color,
                  '--tx': effect.tx,
                  '--ty': effect.ty,
                } as React.CSSProperties}
              />
            )
          ))}
        </div>
      </div>
      
      <div className="bottom-controls-container">
        <PieceContainer
          currentPieces={currentPieces}
          onPointerDown={onPointerDown}
          placeableStatus={placeableStatus}
        />

        <div className="action-buttons-row">
          <div className={`hold-container ${isHoldAvailableGuide ? 'guide-highlight' : ''}`}>
            <div className="hold-label">
              {isHoldAvailableGuide ? 'MOVE TO HOLD!' : 'HOLD'}
            </div>
            <div 
              className={`hold-slot ${swappedThisTurn ? 'used' : ''} ${!heldPiecePlaceable ? 'not-placeable' : ''}`}
              style={{ transform: `scale(${getHoldScale(heldPiece)})` }}
            >
              {heldPiece && (
                <Piece
                  piece={heldPiece}
                  onPointerDown={(e, p, r, c) => onPointerDown(e, p, r, c, true)}
                  disabled={swappedThisTurn}
                />
              )}
            </div>
          </div>

          <div className="item-buttons-group">
            <button 
              className={`rotate-mode-btn ${isRotateMode ? 'active' : ''}`}
              onClick={onToggleRotateMode}
              disabled={rotateCharges <= 0}
            >
              ⟳ ROTATE ({rotateCharges})
            </button>
            <button 
              className="shuffle-btn" 
              onClick={onShuffle} 
              disabled={shuffleCharges <= 0}
            >
              🔄 SHUFFLE ({shuffleCharges})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameBoard);
