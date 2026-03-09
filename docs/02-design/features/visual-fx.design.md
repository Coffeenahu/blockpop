# Visual FX & Juice Design Document

> Version: 1.0.0 | Created: 2026-03-09 | Status: Draft

## 1. Overview
Stage 1의 타격감을 완성하는 시각 효과들의 구체적인 데이터 모델과 연출 방식을 설계합니다. 점수 팝업, 라인 파티클, 콤보 연출을 포함합니다.

## 2. Architecture

### 2.1 State Management (App.tsx)
- `visualEffects`: 현재 활성화된 시각 효과 요소들의 리스트
  - `popups: { id: string, x: number, y: number, text: string, type: 'score' | 'combo' }[]`
  - `particles: { id: string, x: number, y: number, color: string }[]`

### 2.2 Trigger Logic
- **Block Drop**: 배치된 블록의 중앙 좌표 계산 -> `+10` 점수 팝업 생성
- **Line Clear**: 제거된 줄의 각 셀 좌표 -> 파티클 생성 / 제거된 라인 수에 따라 `+100` 팝업 생성
- **Combo Up**: 콤보 증가 시 -> 기존 콤보 텍스트 크기 일시 확대 (Pulsing)

## 3. Data Model

### 3.1 Visual Element Types
```typescript
interface VisualEffect {
  id: string;
  x: number;
  y: number;
  content: string | number;
  color?: string;
  type: 'score' | 'particle' | 'combo-popup';
  duration: number; // ms
}
```

## 4. UI/UX 연출 상세

### 4.1 점수 팝업 (Score Popup)
- **애니메이션**: 생성 후 0.6초간 위로 50px 상승하며 서서히 투명해짐 (`y -= step`, `opacity -= 0.1`)
- **스타일**: 볼드체, 외곽선(Stroke) 처리하여 그리드 위에서도 잘 보이게 설정

### 4.2 파티클 (Particles)
- **생성 방식**: 줄이 터질 때 각 셀 중앙에서 4~6개의 작은 조각(`div`) 생성
- **운동**: 랜덤한 각도(`0~360`)와 힘으로 흩어지며 아래로 떨어지는 물리 연출 (CSS `@keyframes` 활용)
- **색상**: 해당 줄을 채웠던 블록의 색상을 그대로 사용

### 4.3 콤보 텍스트 (Combo Enhancement)
- **Pulsing**: `comboCount`가 올라갈 때 텍스트를 `1.5배` 키웠다가 다시 줄이는 연출 (`transform: scale(1.5) -> 1.0`)
- **Color Gradients**: 콤보 단계가 높아질수록 색상을 점점 화려하게(노랑 -> 주황 -> 빨강 -> 반짝이는 무지개색) 변화

## 5. Test Plan
| Test Case | Expected Result |
|-----------|-----------------|
| 블록 배치 시 | 배치 지점에서 "+10" 텍스트가 떠오르는지 확인 |
| 2줄 동시 제거 시 | "+200" 팝업이 크게 나타나는지 확인 |
| 500ms 후 | 모든 팝업 요소가 DOM에서 제거되는지 확인 (메모리 관리) |
| 콤보 5회 이상 | 콤보 텍스트 색상이 화려하게 변하는지 확인 |
