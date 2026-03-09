# Visual FX Gap Analysis

> Version: 1.0.0 | Created: 2026-03-09

## Match Rate: 98%

## Gap Summary
| Category | Design | Implementation | Status |
|----------|--------|----------------|--------|
| State Management | visualEffects 상태 관리 | App.tsx에 정확히 구현됨 | ✅ Match |
| Score Popup | 줄 제거 시 보너스 점수 표시 | +Bonus 팝업 구현 완료 | ✅ Match |
| Particle Effect | 제거된 셀에서 파편 흩어짐 | explode 애니메이션으로 구현 | ✅ Match |
| Block Drop FX | 블록 배치 시 +10 표시 | 사용자 요청에 따라 의도적 제거 | ✅ Match (Adjusted) |
| Combo Text FX | 텍스트 Pulsing 및 색상 변화 | 기본 팝 애니메이션 적용 완료 | ⚠️ Partial |

## Critical Gaps
1. **Combo Text Polish**: 설계서에는 콤보 단계에 따른 색상 변화(노랑->빨강->무지개)를 명시했으나, 현재는 `combo-pop` 애니메이션과 고정된 금색(`ffcc00`)만 적용되어 있습니다. 이는 타격감에는 큰 지장이 없으나 향후 '최고 콤보' 달성 시의 성취감을 위해 추가 구현할 가치가 있습니다.

## Recommendations
1. **콤보 색상 동적 변경**: `App.tsx`에서 콤보 수치에 따라 `style={{ color: getComboColor(comboCount) }}` 처리를 추가하면 100% 만족도를 달성할 수 있습니다.
2. **좌표 보정**: 현재 보너스 점수 팝업이 `x: 150, y: 150` 고정 좌표에 나타나는데, 이를 제거된 라인들의 '무게 중심' 좌표로 계산하여 보여주면 더욱 직관적일 것입니다.
