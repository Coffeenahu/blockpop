# Audio & Theme Integration Design Document

> Version: 1.0.0 | Created: 2026-03-09 | Status: Draft
> Ref: [Plan](../../01-plan/features/audio-theme-integration.plan.md)

## 1. Overview

Stage 4의 사운드 시스템, 부활 메커니즘, 테마 시스템을 위한 기술적 설계를 정의합니다. 기존 아키텍처(`useCombo`, `useVisualEffects`, `useCellCoordinates` 훅 패턴)에 맞춰 `useSound`와 `useTheme` 훅을 추가하고, App.tsx에 Revive 상태를 통합합니다.

## 2. Architecture

### 2.1 새 파일 구조

```
block-pop-app/src/
├── hooks/
│   ├── useSound.ts          — 사운드 상태, 재생, 뮤트 관리
│   └── useTheme.ts          — 테마 상태, CSS 변수 적용, localStorage
├── assets/sounds/           — 오디오 파일 (mp3)
│   ├── bgm.mp3
│   ├── place.mp3
│   ├── clear.mp3
│   ├── combo.mp3
│   └── gameover.mp3
└── constants.ts             — THEMES, SOUND_STORAGE_KEY, THEME_STORAGE_KEY 추가
```

### 2.2 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `types.ts` | `ThemeId` 타입 추가 |
| `constants.ts` | `THEMES`, `REVIVE_SCORE_THRESHOLD`, 스토리지 키 추가 |
| `App.tsx` | `useSound`, `useTheme` 훅 연결, Revive 상태·핸들러 추가 |
| `App.css` | 테마 CSS 변수, 뮤트 버튼·테마 선택 UI 스타일 추가 |

---

## 3. 상세 설계

### 3.1 Sound System

#### `useSound.ts` 인터페이스

```typescript
type SoundId = 'bgm' | 'place' | 'clear' | 'combo' | 'gameover';

interface UseSoundReturn {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (id: SoundId) => void;
  startBgm: () => void;
  stopBgm: () => void;
}
```

#### 내부 동작

- `AudioContext` 생성은 첫 사용자 인터랙션(`pointerdown`) 이후 수행 (iOS Safari 자동재생 정책 대응)
- 각 SFX는 `AudioBuffer`를 미리 `fetch` + `decodeAudioData`로 캐싱 (`useEffect`에서 비동기 로드)
- BGM은 `<audio>` 태그 (`loop`, `volume 0.4`) 방식으로 분리 관리 (모바일 배터리 최적화)
- 뮤트 상태는 `localStorage.setItem(SOUND_STORAGE_KEY, 'muted')` 저장

#### `constants.ts` 추가 항목

```typescript
export const SOUND_STORAGE_KEY = 'block-pop-sound';
export const SOUND_FILES: Record<SoundId, string> = {
  bgm: '/sounds/bgm.mp3',
  place: '/sounds/place.mp3',
  clear: '/sounds/clear.mp3',
  combo: '/sounds/combo.mp3',
  gameover: '/sounds/gameover.mp3',
};
```

#### App.tsx 연결 포인트

| 이벤트 | 재생 사운드 |
|--------|------------|
| 블록 드롭 성공 (라인 클리어 없음) | `place` |
| 라인 클리어 | `clear` |
| 콤보 발생 (comboCount >= 2) | `combo` |
| 게임 오버 | `gameover` |
| 게임 시작 / 재시작 | `startBgm()` |

---

### 3.2 Revive System

#### 상태 (App.tsx)

```typescript
const [reviveUsed, setReviveUsed] = useState(false);
```

#### 조건

```typescript
// 게임 오버 화면에서 부활 버튼 표시 조건
const canRevive = !reviveUsed && score >= bestScore * REVIVE_SCORE_THRESHOLD;
// REVIVE_SCORE_THRESHOLD = 0.3 (최고점의 30% 이상 달성 시)
```

> Plan에서 50%로 정의했으나, 초반 플레이어 이탈 방지를 위해 **30%로 하향** 조정

#### `handleRevive()` 로직

```typescript
const handleRevive = useCallback(() => {
  // 1. 점수 30% 차감
  const newScore = Math.floor(score * 0.7);
  setScore(newScore);

  // 2. 그리드 하단 4행 제거 (utils.ts의 clearBottomRows 사용)
  setGrid(prev => clearBottomRows(prev, 4));

  // 3. 상태 초기화
  setReviveUsed(true);
  setGameOver(false);
}, [score]);
```

#### `utils.ts` 추가 함수

```typescript
export function clearBottomRows(grid: GridData, count: number): GridData {
  // 하단 count행을 빈 셀로 교체한 새 그리드 반환
}
```

#### UI (게임 오버 오버레이)

```
┌─────────────────────┐
│    GAME OVER        │
│  Final Score: 1200  │
│                     │
│  [REVIVE -30%]  ←  canRevive 시 표시
│  [Try Again]        │
└─────────────────────┘
```

---

### 3.3 Theme System

#### `ThemeId` 타입 (types.ts)

```typescript
export type ThemeId = 'dark' | 'light' | 'neon' | 'pastel';
```

#### `THEMES` 상수 (constants.ts)

```typescript
export interface ThemeDef {
  id: ThemeId;
  label: string;
  cssVars: Record<string, string>;
  blockColors: string[];  // PIECE_SHAPES color 오버라이드용
}

export const THEMES: ThemeDef[] = [
  {
    id: 'dark',
    label: '🌑 Dark',
    cssVars: { '--bg-color': '#1a1a1a', '--grid-bg': '#2d2d2d', '--text-color': '#ffffff', '--grid-border': '#3d3d3d' },
    blockColors: ['#FF5733','#33FF57','#3357FF','#FFBD33','#33FFF3','#F333FF','#FF33A1','#A133FF','#33FFBD','#FF3333'],
  },
  {
    id: 'light',
    label: '☀️ Light',
    cssVars: { '--bg-color': '#f0f0f0', '--grid-bg': '#d8d8d8', '--text-color': '#111111', '--grid-border': '#bbbbbb' },
    blockColors: ['#E53E3E','#38A169','#3182CE','#D69E2E','#00B5D8','#805AD5','#DD6B20','#D53F8C','#319795','#2B6CB0'],
  },
  {
    id: 'neon',
    label: '⚡ Neon',
    cssVars: { '--bg-color': '#0a0a0f', '--grid-bg': '#12121f', '--text-color': '#00ffcc', '--grid-border': '#1a1a3a' },
    blockColors: ['#FF0080','#00FF41','#00BFFF','#FFE600','#FF6600','#BF00FF','#00FFC8','#FF3366','#33FFCC','#FF9900'],
  },
  {
    id: 'pastel',
    label: '🌸 Pastel',
    cssVars: { '--bg-color': '#fdf6f0', '--grid-bg': '#ede0d4', '--text-color': '#5a4a42', '--grid-border': '#d4c4b8' },
    blockColors: ['#FFB3B3','#B3FFB3','#B3CCFF','#FFE4B3','#B3FFFF','#F0B3FF','#FFB3D9','#C4B3FF','#B3F0D9','#FFD9B3'],
  },
];
```

#### `useTheme.ts` 인터페이스

```typescript
interface UseThemeReturn {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  getBlockColor: (index: number) => string;  // 테마별 블록 색상 반환
}
```

#### 내부 동작

- `useEffect`에서 `document.documentElement.style.setProperty(key, value)` 로 CSS 변수 일괄 적용
- `localStorage.setItem(THEME_STORAGE_KEY, themeId)` 저장, 초기화 시 복원
- 테마 변경 시 `transition: background-color 0.3s` 으로 부드러운 전환 (`body`에 적용)

#### 블록 색상 오버라이드 전략

- `PIECE_SHAPES`의 하드코딩 색상 대신, `generateRandomPiece()` 시 `useTheme`의 `getBlockColor(index)`를 사용
- `generateRandomPiece`에 `colorOverrides?: string[]` 옵션 파라미터 추가

#### UI (헤더 영역)

```
[BLOCK POP]   [🔇]  [🌑][☀️][⚡][🌸]
Score: 1200   Best: 3400
```

- 뮤트 버튼: 상단 우측, 토글 아이콘
- 테마 버튼: 뮤트 버튼 좌측, 4개 아이콘 버튼 (현재 선택 시 강조)

---

## 4. CSS 설계

### 추가 변수 (`:root` 기본값)

```css
:root {
  /* 기존 변수 유지 */
  --bg-color: #1a1a1a;
  --grid-bg: #2d2d2d;
  /* 신규 */
  --text-color: #ffffff;
  --grid-border: #3d3d3d;
}
```

### 뮤트 버튼

```css
.mute-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-color);
}
.mute-btn.muted { opacity: 0.4; }
```

### 테마 버튼

```css
.theme-btn-group { display: flex; gap: 4px; }
.theme-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text-color);
}
.theme-btn.active {
  border-color: var(--text-color);
  background: rgba(255,255,255,0.1);
}
```

### 부활 버튼

```css
.revive-btn {
  margin-top: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  background: #FF9900;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: black;
  font-weight: bold;
  animation: pulse-revive 1.5s infinite;
}
@keyframes pulse-revive {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,153,0,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255,153,0,0); }
}
```

---

## 5. 테스트 계획

| 테스트 케이스 | 기대 결과 |
|--------------|----------|
| 블록 배치 시 `place` 사운드 | 50ms 이내 재생 |
| 라인 클리어 시 `clear` 사운드 | 팝 애니메이션과 동기화 |
| 콤보 2 이상 시 `combo` 사운드 | `clear` 직후 재생 |
| 뮤트 토글 후 새로고침 | 뮤트 상태 유지 |
| 테마 전환 | 즉시 전체 UI 색상 전환 |
| 테마 선택 후 새로고침 | 테마 유지 |
| 최고점 30% 미만 게임오버 | 부활 버튼 미표시 |
| 최고점 30% 이상 게임오버 | 부활 버튼 표시 |
| 부활 실행 | 점수 30% 차감, 하단 4행 제거, 게임 재개 |
| 부활 후 게임오버 | 부활 버튼 미표시 (1회 제한) |
