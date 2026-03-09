# Combo System & Block Diversity Plan Document

> Version: 1.0.0 | Created: 2026-03-09 | Status: Approved

## 1. Executive Summary
본 계획서는 'Block Pop'의 첫 번째 개선 단계로, 연속 콤보 시스템(Combo System), 블록 다양화(Block Diversity), 그리고 시각적 피드백(Juice) 강화를 목표로 합니다. 이를 통해 게임의 타격감과 난이도 밸런스를 확보합니다.

## 2. Goals and Objectives
- **콤보 시스템**: 연속 라인 제거 시 점수 배율 적용 및 보너스 점수 부여
- **블록 다양성**: 복잡한 모양의 블록(3x3, 대형 L/T 등) 추가
- **난이도 밸런스**: 점수에 따른 고난도 블록 등장 확률 가중치 시스템 구축
- **시각 효과**: 라인 제거 시 파티클 및 화면 흔들림 효과 구현

## 3. Scope
### In Scope
- `PIECE_SHAPES` 상수 확장 (새로운 블록 모양 추가)
- `App.tsx` 내 연속 콤보 상태 관리 및 점수 계산 로직 수정
- `utils.ts`에 난이도별 블록 선택 로직(Weighted Random) 추가
- 라인 제거 시 시각적 효과를 위한 CSS/JS 연출 추가

### Out of Scope
- 사운드 효과 (Stage 4 예정)
- 최고 점수 저장 (Stage 2 예정)

## 4. Success Criteria
| Criterion | Metric | Target |
|-----------|--------|--------|
| Combo Feedback | Visual Indicator | 콤보 발생 시 UI에 명확한 텍스트 표시 |
| Difficulty | Play Duration | 고득점 시 게임 오버 발생 확률 유의미한 증가 |
| Visual | Satisfaction | 라인 제거 시의 시각적 만족도 향상 |

## 5. Timeline
| Milestone | Description |
|-----------|-------------|
| 1. Design | 상세 데이터 구조 및 UI 설계 |
| 2. Implement | 블록 추가 및 콤보 로직 구현 |
| 3. Visuals | 애니메이션 및 파티클 효과 적용 |
| 4. Balancing | 난이도 가중치 튜닝 |

## 6. Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| 과도한 난이도 | 게임 이탈 | 저점수 구간에서는 쉬운 블록 위주 배치 보장 |
| 성능 저하 | FPS 하락 | 애니메이션을 단순화하거나 하드웨어 가속 활용 |
