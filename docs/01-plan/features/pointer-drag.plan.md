# PDCA 계획서 - 오프셋이 적용된 포인터 기반 드래그 시스템

## 1. 계획 (Plan)
### 목표
HTML5 Drag API를 통합 포인터 이벤트(Pointer Event) 시스템으로 교체하고, 블록을 집었을 때 사용자의 손가락이나 마우스 포인터보다 약간 위(`DRAG_LIFT_PX`)에 표시되도록 수직 오프셋("리프트") 기능을 구현합니다.

### 요구 사항
- 마우스와 터치 모두에서 드래그 가능해야 함.
- 집어 올린 블록은 시인성 확보를 위해 포인터보다 약 80px 위에 표시되어야 함.
- `elementFromPoint`를 사용하여 정확한 드롭 지점을 감지해야 함.
- 모바일과 데스크톱에서 동일하게 작동해야 함.

### 성공 기준
- [x] HTML5 Drag API (`draggable`, `onDragStart` 등) 제거.
- [x] `PointerEvents` (`onPointerDown`, `onPointerMove`, `onPointerUp`) 구현.
- [x] 블록이 수직 오프셋을 가지고 포인터를 따라다님.
- [x] 블록이 그리드에 정확히 배치됨.
- [x] 드래그 중 시각적 피드백(프리뷰)이 정상 작동함.

## 2. 설계 (Design)
### 상수 추가
- `constants.ts`에 `DRAG_LIFT_PX = 80` 추가.

### Piece 컴포넌트
- `onDragStart`/`onTouchStart`를 `onPointerDown`으로 교체.
- 클릭/터치된 셀의 오프셋을 계산하여 `App`으로 전달.

### App 컴포넌트
- 상태: `draggedPiece`, `dragOffset`, `pointerPos`.
- 컨테이너에 `onPointerMove` 및 `onPointerUp` 리스너 연결.
- `document.elementFromPoint(pointerPos.x, pointerPos.y - DRAG_LIFT_PX)`를 사용하여 대상 셀 계산.
- `floating-piece` 위치에 `DRAG_LIFT_PX` 적용.

## 3. 실행 (Do)
1. `constants.ts` 수정.
2. `Piece.tsx`가 `onPointerDown`을 사용하도록 업데이트.
3. `Grid.tsx`에서 HTML5 드래그 이벤트 제거.
4. `App.tsx`에서 통합 포인터 이벤트를 처리하고 오프셋을 적용하도록 수정.

## 4. 검증 (Check)
- 데스크톱 드래그 테스트.
- 모바일(또는 시뮬레이터) 드래그 테스트.
- 블록이 위로 떠서 이동하는지 확인.
- 배치 로직의 정확성 확인.

## 5. 개선 (Act)
- 최종 폴리싱 및 버그 수정.
- 완료 보고서 작성.
