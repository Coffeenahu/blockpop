# 설계서 - 오프셋이 적용된 포인터 기반 드래그 시스템 (v1.0.0)

## 1. 목적
HTML5 Drag API의 한계를 극복하고, 마우스와 터치에서 동일하게 작동하는 통합 포인터 시스템을 구축합니다. 또한 사용자의 시야를 방해하지 않도록 드래그 시 블록을 포인터보다 위로 띄워 표시합니다.

## 2. 상수 정의
- **`DRAG_LIFT_PX`**: 80px
  - 드래그 중인 블록과 포인터 사이의 수직 간격.

## 3. 핵심 메커니즘

### 3.1 Pointer Capture
- `onPointerDown` 시 해당 포인터 아이디에 대해 `setPointerCapture`를 컨테이너 요소에 실행합니다.
- 이를 통해 포인터가 브라우저 창 밖으로 나가거나 요소 범위를 벗어나도 이벤트를 지속적으로 추적할 수 있습니다.

### 3.2 좌표 보정 (Coordinate Offset)
- **부유 위치 (Floating Position)**: 
  - `PointerPos.y - (dragOffset.row * cellSize) - (cellSize / 2) - DRAG_LIFT_PX`
- **감지 위치 (Detection Position)**:
  - `document.elementFromPoint(PointerPos.x, PointerPos.y - DRAG_LIFT_PX)`
  - 실제 블록이 떠 있는 위치를 기준으로 그리드 셀을 감지하여 배치 위치를 결정합니다.

## 4. 컴포넌트 구조 변경

### 4.1 Piece 컴포넌트
- 기존 `draggable` 속성 및 `onDragStart` 이벤트 제거.
- `onPointerDown` 이벤트 핸들러 추가.
- 터치 시 브라우저 기본 스크롤 동작 방지를 위해 `touch-action: none` 스타일 적용.

### 4.2 App 컴포넌트
- 전역적인 `onPointerMove` 및 `onPointerUp` 핸들러 구현.
- `elementFromPoint`를 통한 실시간 그리드 셀 감지 로직.
- `floating-piece` 렌더링을 위한 좌표 계산 및 상태 관리.

## 5. UI/UX 디자인
- **시각적 피드백**: 
  - 드래그 시작 시 블록 크기를 10% 확대 (`scale(1.1)`).
  - 블록 하단에 그림자(`drop-shadow`)를 추가하여 입체감 부여.
  - 드래그 중인 위치가 그리드 위에 있을 때 배치 예정 셀을 반투명하게 강조(Preview).
