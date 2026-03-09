# Visual FX & Juice Plan Document

> Version: 1.0.0 | Created: 2026-03-09 | Status: Approved

## 1. Executive Summary
'Block Pop'의 Stage 1을 완벽하게 마무리하기 위해, 점수 팝업(Score Popup)과 라인 제거 파티클(Particle) 효과를 구현합니다. 플레이어의 액션에 즉각적이고 화려한 피드백을 제공하여 게임의 몰입감을 극대화하는 것이 목표입니다.

## 2. Goals and Objectives
- **점수 팝업**: 블록 배치 및 줄 제거 시 해당 위치에서 점수가 떠오르는 연출 구현
- **파티클 효과**: 줄이 터질 때 블록 색상의 파편이 흩어지는 효과 추가
- **콤보 연출 강화**: 콤보 수치에 따른 텍스트 크기 및 색상 변화 적용

## 3. Scope
### In Scope
- `ScorePopup` 컴포넌트 및 상태 관리 (App.tsx)
- CSS 기반 파티클 애니메이션 및 동적 생성 로직
- 콤보 수치별 UI 스케일링 애니메이션

### Out of Scope
- 복잡한 Canvas 기반 물리 엔진 (성능을 위해 CSS/DOM 위주로 구현)
- 사운드 효과 연동 (Stage 4 예정)

## 4. Success Criteria
| Criterion | Metric | Target |
|-----------|--------|--------|
| Hitting Feel | Subjective Test | "Very satisfying" |
| Performance | FPS | 60 FPS 유지 (애니메이션 중 버벅임 없음) |
| Stability | Memory Leak | 팝업/파티클 요소의 확실한 제거 보장 |
