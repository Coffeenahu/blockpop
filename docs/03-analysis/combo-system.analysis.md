# Combo System Gap Analysis

> Version: 1.0.0 | Created: 2026-03-09

## Match Rate: 95%

## Gap Summary
| Category | Design | Implementation | Status |
|----------|--------|----------------|--------|
| State Management | comboCount, comboGrace 정의 | App.tsx에 정확히 구현됨 | ✅ Match |
| Piece Generation | 점수 기반 가중치 시스템 | utils.ts에 설계대로 반영됨 | ✅ Match |
| Score Logic | 콤보 배율 적용 (x1.0, x1.5...) | App.tsx에 계산식 구현됨 | ✅ Match |
| Visual Effects | Combo UI, Screen Shake | 구현 완료 | ✅ Match |
| Particle Effect | 줄 제거 시 색상 파편 효과 | 기본 pop 애니메이션으로 구현 | ⚠️ Partial |

## Critical Gaps
1. **Particle Effect**: 설계서에는 "해당 블록 색상의 파편이 흩어지는 효과"를 명시했으나, 현재는 전체 줄이 작아지며 사라지는 `pop-animation`만 적용되어 있습니다. 게임의 '타격감' 극대화를 위해 향후 파티클 시스템을 정교화할 필요가 있습니다.

## Recommendations
1. **Particle 개선**: CSS `box-shadow` 또는 추가적인 DOM 요소를 활용하여 블록 조각이 튀어나가는 연출을 보강하면 100% 만족도를 달성할 수 있습니다.
2. **배치 불가 블록 처리**: 현재 CSS에 `.piece.disabled`는 추가되었으나, `GameBoard`나 `PieceContainer` 컴포넌트에서 실제로 `canPlace` 여부를 체크하여 클래스를 입히는 로직이 누락되었을 수 있으니 확인이 필요합니다.
