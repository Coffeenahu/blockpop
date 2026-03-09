# 설계서 - Stage 2: UX 및 접근성 강화 (v1.0.0)

## 1. 개요
본 설계서는 게임의 지속성을 높이고 사용자에게 명확한 피드백을 제공하기 위한 Stage 2 단계의 UX 및 접근성 개선 사항을 정의합니다.

## 2. 주요 기능 설계

### 2.1 최고 점수 시스템 (High Score Persistence)
- **목적**: 브라우저를 새로고침하거나 닫았다가 다시 열어도 사용자의 최고 기록을 유지하여 도전 욕구를 자극함.
- **메커니즘**: 
  - 게임 종료(`computedGameOver`) 시 현재 `score`와 `localStorage`에 저장된 `highScore`를 비교.
  - 현재 점수가 더 높으면 `localStorage.setItem('block-pop-high-score', score)`를 통해 업데이트.
  - 앱 초기화 시 `localStorage.getItem('block-pop-high-score')`로 값을 불러와 상태(`bestScore`)로 관리.
- **UI 표시**: 현재 점수 상단 또는 옆에 "Best: {bestScore}" 형태로 상시 표시.

### 2.2 배치 가이드 시스템 (Visual Placement Hint)
- **목적**: 현재 제공된 3개의 블록 중 그리드의 빈 공간에 더 이상 배치할 수 없는 블록을 시각적으로 구분하여 사용자에게 전략적 힌트를 제공함.
- **메커니즘**:
  - 그리드 상태(`grid`)나 대기 블록(`currentPieces`)이 변경될 때마다 각 블록의 배치 가능 여부를 실시간으로 계산.
  - `canPlacePiece` 유틸리티 함수를 사용하여 그리드 전체를 순회하며 최소 하나의 유효한 위치가 있는지 확인.
  - **결과값**: `boolean[]` 형태의 `placeableStatus` 상태로 관리.
- **UI 연출**: 
  - 배치 불가능한 블록(piece)에 `.not-placeable` 클래스 적용.
  - CSS: `opacity: 0.3`, `filter: grayscale(1)` 처리하여 비활성화된 느낌 부여.

### 2.3 터치 인터랙션 최적화 (Mobile Fine-tuning)
- **목적**: Pointer Event 시스템의 안정성을 높이고 모바일 브라우저 특유의 간섭을 제거함.
- **개선 사항**:
  - `touch-action: none`이 모든 드래그 관련 요소(`game-container`, `piece`, `grid`)에 올바르게 적용되었는지 재확인.
  - 드래그 시작 시 가벼운 진동(Haptic Feedback) 지원 고려 (`window.navigator.vibrate(10)` - 선택 사항).
  - 긴급 탈출: 드래그 중 예상치 못한 상태에 빠질 경우를 대비해 전역 `pointercancel` 핸들러 보강.

## 3. 데이터 흐름 및 상태 관리
- **추가 상태**:
  - `bestScore`: `number` (localStorage 연동)
  - `placeableStatus`: `boolean[]` (useMemo를 통한 파생 상태)

## 4. UI 변경 사항
- **Header**: "Score: {score}" 옆에 "Best: {bestScore}" 추가.
- **PieceContainer**: `placeableStatus[idx]` 값을 `Piece` 컴포넌트의 `disabled` 프롭으로 전달.

## 5. 성공 기준
- [ ] 브라우저 재시작 후에도 최고 점수가 유지됨.
- [ ] 배치 불가능한 블록이 즉시 반투명하게 변함.
- [ ] 게임 종료 시 최고 점수 갱신 연출이 정상 작동함.
