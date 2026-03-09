# Block Pop Roadmap Plan Document

> Version: 1.0.0 | Created: 2026-03-09 | Status: Approved

## 1. Executive Summary
본 문서는 'Block Pop' 프로토타입을 'Block Blast' 수준의 완성도와 재미를 갖춘 게임으로 발전시키기 위한 4단계 개선 로드맵을 정의합니다. 핵심 타격감 개선부터 전략적 요소 추가까지 단계별로 진행합니다.

## 2. Goals and Objectives
- **Goal 1**: Block Blast 스타일의 연속 콤보 시스템을 통한 몰입감 증대
- **Goal 2**: 시각적 피드백 강화를 통한 '손맛(Juice)' 확보
- **Goal 3**: 장기적인 플레이 동기 부여를 위한 기록 관리 및 전략 요소 추가

## 3. Scope (4-Stage Roadmap)

### Stage 1: Core Juice & Combo System + Block Diversity
- **연속 콤보(Combo)**: 블록 배치 시 연속으로 줄을 지울 경우 점수 배수 적용 (x2, x3...)
- **시각적 강화**: 라인 제거 시 파티클 효과, 화면 흔들림(Screen Shake)
- **점수 연출**: 블록 위 '+10', '+100' 등 텍스트 애니메이션 팝업
- **블록 다양화**: 3x3 사각형, 초대형 L자, Z/S 모양 등 복잡한 블록 추가
- **난이도 조절 로직**: 점수에 따른 어려운 블록 등장 확률 가중치 시스템 도입

### Stage 2: UX & Accessibility
- **지속성**: `localStorage` 연동 최고 점수 기록 유지
- **가이드**: 현재 블록 중 배치 불가능한 블록 반투명 처리 (Visual Hint)
- **최적화**: 모바일 브라우저 환경에서의 터치 인터랙션 미세 조정

### Stage 3: Strategic Depth
- **Hold 시스템**: 블록 하나를 저장해두고 교체하여 사용할 수 있는 기능
- **Shuffle/Rotate**: 블록 3개를 새로 고치거나 회전시킬 수 있는 기회 제공 (제한적)
- **Multi-line**: 한 번에 여러 줄 제거 시 점수 가중치 대폭 상승

### Stage 4: Polish & Advanced Features
- **Sound**: 배경 음악 및 액션별 효과음(배치, 제거, 게임오버) 추가
- **Revive**: 게임 오버 시 광고 시청 또는 점수 차감을 통한 1회 부활
- **Themes**: 다크 모드 및 블록 디자인 스킨 선택 기능

## 4. Success Criteria
| Criterion | Metric | Target |
|-----------|--------|--------|
| Game Feel | User Feedback | "Good hitting sensation" |
| Retention | LocalStorage Check | High score persists after refresh |
| Stability | Error Rate | 0 console errors during play |

## 5. Timeline (Projected)
| Milestone | Description |
|-----------|-------------|
| Stage 1 | Combo & Visual FX Implementation |
| Stage 2 | High Score & Placement Guide |
| Stage 3 | Hold Slot & Multi-line Bonus |
| Stage 4 | Sound & Theme Integration |

## 6. Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance | FPS Drop on FX | Canvas 또는 CSS 최적화, 과도한 DOM 애니메이션 자제 |
| Complexity | Code Maintenance | App.tsx 상태 분리 및 커스텀 훅 활용 |
