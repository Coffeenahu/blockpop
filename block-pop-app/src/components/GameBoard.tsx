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
  onPointerDown: (e: React.PointerEvent, piece: PieceShape, offsetRow: number, offsetCol: number, isFromHold?: boolean) => void;
  onRotate: (idx: number) => void;
  onShuffle: () => void;
  previewCells: [number, number][];
  placeableStatus: boolean[];
  gridRef: React.RefObject<HTMLDivElement | null>;
  visualEffects: any[]; // 이펙트 데이터 추가
}

const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  currentPieces,
  heldPiece,
  swappedThisTurn,
  heldPiecePlaceable,
  rotateCharges,
  shuffleCharges,
  onPointerDown,
  onRotate,
  onShuffle,
  previewCells,
  placeableStatus,
  gridRef,
  visualEffects,
}) => {
  return (
    <div className="game-board-layout">
      <div className="side-panel">
        <div className="hold-container">
          <div className="hold-label">HOLD</div>
          <div className={`hold-slot ${swappedThisTurn ? 'used' : ''} ${!heldPiecePlaceable ? 'not-placeable' : ''}`}>
            {heldPiece && (
              <Piece
                piece={heldPiece}
                onPointerDown={(e, p, r, c) => onPointerDown(e, p, r, c, true)}
                disabled={swappedThisTurn}
              />
            )}
          </div>
        </div>
        
        <div className="shuffle-container">
          <button 
            className="shuffle-btn" 
            onClick={onShuffle} 
            disabled={shuffleCharges <= 0}
          >
            🔄 SHUFFLE ({shuffleCharges})
          </button>
        </div>
      </div>
      
      {/* 그리드와 이펙트를 묶는 상대 좌표 컨테이너 */}
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
      
      <PieceContainer
        currentPieces={currentPieces}
        onPointerDown={onPointerDown}
        onRotate={onRotate}
        placeableStatus={placeableStatus}
        rotateCharges={rotateCharges}
      />
    </div>
  );
};

export default React.memo(GameBoard);
