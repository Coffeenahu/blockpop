# Gap Analysis - Pointer-based Drag with Offset

## 1. 개요
- **대상 기능**: 포인터 기반 드래그 시스템 (Pointer-based Drag with Offset)
- **분석 일자**: 2026년 3월 9일
- **분석 도구**: gap-detector (codebase_investigator)

## 2. 설계 vs 구현 비교 (Gap Analysis)

| 항목 | 설계(Design) 상태 | 구현(Implementation) 상태 | 일치 여부 | 비고 |
|------|-------------------|--------------------------|-----------|------|
| **드래그 API** | HTML5 Drag & Touch 분리 (v2.0.0) | Pointer Events 통합 구현 | ❌ 불일치 | 설계서 업데이트 필요 |
| **드래그 오프셋** | 명시되지 않음 | `DRAG_LIFT_PX (80px)` 적용 | ❌ 추가됨 | 설계서에 반영 필요 |
| **셀 감지 방식** | DragEnter/Over 이벤트 기반 | `elementFromPoint` 기반 | ❌ 변경됨 | 설계서 수정 필요 |
| **문서 언어** | 한국어 규정 (GEMINI.md) | 영어로 작성됨 (Plan/Report) | ❌ 불일치 | 한국어 번역 및 재작성 필요 |

## 3. 분석 결과 요약
- **일치율(Match Rate)**: **75%**
- **주요 격차**:
  1. 최근 작업된 `pointer-drag.plan.md`와 `pointer-drag.report.md`가 `GEMINI.md` 규정을 위반하고 영어로 작성되었습니다.
  2. 메인 설계서인 `block-pop.design.md`가 최신 Pointer Event 기반 드래그 시스템을 반영하지 못하고 구버전(HTML5 Drag API)에 머물러 있습니다.
  3. `pointer-drag` 전용 설계 문서(`pointer-drag.design.md`)가 누락되었습니다.

## 4. 향후 조치 사항 (Action Items)
1. 영어로 작성된 `plan.md` 및 `report.md`를 한국어로 번역 및 교체.
2. `docs/02-design/features/pointer-drag.design.md` 신규 생성.
3. `docs/02-design/features/block-pop.design.md` 최신화 (Pointer Event 시스템 반영).
4. 모든 문서를 `GEMINI.md` 규정에 맞춰 한국어로 유지.
