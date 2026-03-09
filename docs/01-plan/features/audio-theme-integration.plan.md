# Audio & Theme Integration Plan Document

> Version: 1.0.0 | Created: 2026-03-09 | Status: Draft

## 1. Executive Summary

본 계획서는 'Block Pop'의 Stage 4 폴리싱 단계로, **사운드 시스템**, **부활(Revive) 메커니즘**, **테마/스킨 선택** 기능을 구현하여 완성도 높은 모바일 게임 경험을 제공하는 것을 목표로 합니다. 이 단계는 게임의 마지막 완성 단계로, 몰입감과 재방문 동기를 크게 강화합니다.

## 2. Goals and Objectives

- **사운드**: 배경 음악(BGM) 및 액션별 효과음(SFX)으로 타격감·몰입감 강화
- **부활**: 게임 오버 시 1회 부활 기회 제공으로 재도전 동기 부여
- **테마**: 다크/라이트 모드, 블록 색상 팔레트 선택으로 개인화 경험 제공

## 3. Scope

### In Scope

#### 3.1 Sound System
- **BGM**: 루프 가능한 배경 음악 1~2트랙 (경쾌한 멜로디, 페이드 인/아웃)
- **SFX 목록**:
  - 블록 배치 시: 짧은 클릭/드롭 음
  - 라인 클리어 시: 경쾌한 팡 사운드
  - 콤보 발생 시: 상승하는 음계 효과음
  - 게임 오버 시: 낮고 묵직한 종료음
- **음소거 토글**: 화면 상단에 뮤트 버튼, `localStorage`로 설정 유지
- **구현 방식**: Web Audio API (`AudioContext`) 또는 `<audio>` 태그 기반

#### 3.2 Revive System
- 게임 오버 화면에 "부활하기" 버튼 표시 (1회만 사용 가능)
- **부활 조건**: 최고 점수의 50% 이상 달성 시 버튼 활성화 (초저점 구제 방지)
- **부활 방식**: 점수 30% 차감 + 그리드 일부 클리어 (하단 4행 제거)
- `localStorage`에 게임당 사용 여부 기록 (세션 재시작 시 리셋)

#### 3.3 Theme System
- **테마 종류**:
  - `dark` (기본): 현재 다크 배경 유지
  - `light`: 밝은 배경, 진한 텍스트
  - `neon`: 형광 계열 블록 색상 팔레트
  - `pastel`: 파스텔 계열 블록 색상 팔레트
- **적용 범위**: CSS 커스텀 프로퍼티(`--bg-color`, `--grid-bg` 등) 교체 방식
- **블록 팔레트**: 테마별 `PIECE_COLORS` 배열 정의, 블록 생성 시 해당 팔레트 사용
- **설정 유지**: `localStorage` 저장/복원
- **UI**: 게임 오버 화면 또는 메인 화면 상단에 테마 선택 아이콘 버튼

### Out of Scope
- 광고(Ads) 기반 부활 (수익화 미적용)
- 서버 연동 리더보드
- 커스텀 사운드 업로드
- 애니메이션 스킨 (블록 움직임 이펙트 변경)

## 4. Technical Approach

### 사운드 관리
```
src/hooks/useSound.ts      — AudioContext 관리, 뮤트 상태, SFX 재생
src/assets/sounds/         — mp3/ogg 파일 (bgm.mp3, place.mp3, clear.mp3, combo.mp3, gameover.mp3)
constants.ts               — SOUND_ENABLED_KEY (localStorage 키)
```

### 테마 관리
```
src/hooks/useTheme.ts      — 테마 상태, localStorage 저장/복원, CSS var 적용
src/constants.ts           — THEMES 배열 (id, label, cssVars, blockColors)
src/types.ts               — ThemeId 타입 추가
```

### 부활 관리
```
App.tsx                    — reviveUsed 상태, handleRevive 핸들러
utils.ts                   — clearBottomRows(grid, n) 헬퍼 함수
```

## 5. Success Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| 사운드 반응성 | SFX 지연 | 액션 후 50ms 이내 재생 |
| 음소거 유지 | localStorage | 새로고침 후에도 설정 유지 |
| 부활 조건 | 활성화율 | 최고점 50% 이상 달성 시 정확히 표시 |
| 테마 전환 | 반응 속도 | 버튼 클릭 즉시 전체 UI 전환 |
| 설정 유지 | localStorage | 테마 선택이 재방문 시에도 유지 |

## 6. Timeline

| Milestone | Description |
|-----------|-------------|
| 1. Design | 사운드 파일 선정, 테마 CSS 변수 설계, 부활 로직 설계 |
| 2. Sound | `useSound` 훅 구현, SFX 연결, 뮤트 UI |
| 3. Revive | 게임 오버 화면 부활 버튼, 그리드 클리어 로직 |
| 4. Theme | `useTheme` 훅, 테마 CSS, 팔레트 교체, 선택 UI |
| 5. Polish | 전체 통합 테스트, 사운드·테마 조화 확인 |

## 7. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 사운드 파일 용량 | 초기 로딩 지연 | mp3 압축 (128kbps), lazy loading |
| iOS Safari 자동재생 제한 | BGM 미재생 | 첫 사용자 인터랙션 후 AudioContext 초기화 |
| 테마 전환 시 깜빡임 | 시각적 불쾌감 | CSS transition 적용, `data-theme` 속성 기반 전환 |
| 부활 악용 | 게임 밸런스 붕괴 | 세션당 1회 제한, 최소 점수 조건 |
