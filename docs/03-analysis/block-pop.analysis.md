# Block Pop 갭 분석 (Gap Analysis)

> Version: 2.0.0 | Created: 2026-03-08 | Updated: 2026-03-09

## Match Rate: 95%

## 갭 요약 (Gap Summary)
| 카테고리 | 설계 (Design) | 구현 (Implementation) | 상태 |
|----------|--------|----------------|--------|
| 아키텍처 | App + 3 hooks + 4 components | 설계와 동일 | 일치 |
| 데이터 모델 | CellState, GridData, PieceShape, VisualEffect | 설계와 동일 | 일치 |
| 게임 상수 | 10개 상수 정의 | constants.ts에 모두 구현 | 일치 |
| 게임 로직 | 배치, 제거, 종료, 점수, 콤보, 난이도 | 설계와 동일 | 일치 |
| 콤보 시스템 | grace 3턴, 배수 0.5 step | useCombo 훅으로 구현 | 일치 |
| 난이도 시스템 | 3단계 가중치 | utils.ts에 구현 | 일치 |
| 시각 효과 | Pop, 점수팝업, 파티클, screen-shake | useVisualEffects 훅 + CSS | 일치 |
| 고정 슬롯 | (PieceShape \| null)[] 3칸 | 설계와 동일 | 일치 |
| 반응형 | 100dvh, clamp, min() | 설계와 동일 | 일치 |
| 드래그 앤 드롭 | Desktop + Mobile touch | 설계와 동일 | 일치 |
| 테스트 | 9개 테스트 케이스 정의 | 미구현 | 미흡 |

## 이전 분석 대비 개선 (v1.0 → v2.0)

### 해결된 갭
1. **매직 넘버 제거** — 콤보, 점수, 난이도, 파티클 관련 상수를 `constants.ts`로 이동
2. **God component 분리** — App.tsx에서 useCombo, useVisualEffects, useCellCoordinates 커스텀 훅으로 로직 분리
3. **중복 CSS 규칙** — `.cell.preview` 중복 정의를 하나로 통합
4. **@ts-ignore 제거** — `as React.CSSProperties` 캐스팅으로 교체
5. **getComputedStyle 캐싱** — useCellCoordinates 훅에서 resize 이벤트 기반 캐싱
6. **placeableStatus 최적화** — useMemo로 감싸서 불필요한 재계산 방지
7. **설계 문서 갱신** — Beta 2 이후 추가 기능 전체 반영 (v2.0.0)

### 남은 갭
1. **테스트 커버리지 0%** — utils.ts의 순수 함수에 대한 단위 테스트 미작성

## 권장 사항 (Recommendations)
1. **단위 테스트 추가**: utils.ts의 canPlacePiece, checkLines, isGameOver, generateRandomPiece에 테스트 작성
2. **Grace 표시 상수화**: combo-grace의 ★☆ 반복 횟수가 App.tsx에서 하드코딩(3)되어 있음 → COMBO_GRACE_TURNS 참조로 변경 가능
