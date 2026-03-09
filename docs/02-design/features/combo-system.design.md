# Combo System & Block Diversity Design Document

> Version: 1.0.0 | Created: 2026-03-09 | Status: Draft

## 1. Overview
Stage 1의 핵심인 콤보 시스템과 블록 다양화의 기술적 설계를 정의합니다. 연속적인 줄 제거 시 발생하는 콤보 보너스와, 플레이어의 점수에 따라 블록의 난이도가 동적으로 변하는 가중치 시스템을 포함합니다.

## 2. Architecture

### 2.1 State Management (App.tsx)
- `comboCount`: 현재 콤보 레벨 (줄을 지울 때마다 상승)
- `comboGrace`: 콤보 유예 카운트 (기본값 0, 줄 제거 시 3으로 충전)
  - 블록을 배치할 때 줄을 지우지 못하면 `comboGrace`가 1씩 감소
  - `comboGrace`가 0이 되면 `comboCount`도 0으로 초기화

### 2.2 Piece Generation Logic (utils.ts)
- `generateWeightedPiece(score: number)`: 점수에 따라 다른 가중치로 블록을 선택
  - Score < 500: Simple 블록 90%, Normal 10%
  - 500 <= Score < 1500: Simple 60%, Normal 30%, Hard 10%
  - Score >= 1500: Simple 40%, Normal 40%, Hard 20%

## 3. Data Model

### 3.2 Combo Calculation
- **Score per Action** = (Placed Cells * 10) + (Lines Cleared * 100 * (1 + comboCount * 0.5))
- **Combo Maintenance**:
  - `if (linesCleared > 0)`: `comboCount++`, `comboGrace = 3`
  - `else`: `comboGrace--`; `if (comboGrace <= 0)`: `comboCount = 0`
- 이 방식은 3번의 블록 배치 기회 안에만 다시 줄을 지우면 콤보 점수 배율을 유지할 수 있게 함.

## 5. Test Plan
| Test Case | Expected Result |
|-----------|-----------------|
| 줄 제거 후 콤보 발생 | comboCount 상승, comboGrace가 3으로 설정됨 |
| 줄 제거 없이 1회 배치 | comboCount 유지, comboGrace가 2로 감소 |
| 줄 제거 없이 3회 배치 | comboGrace가 0이 되며 comboCount가 0으로 초기화 |
| 유예 기간 중 줄 제거 | comboCount 추가 상승, comboGrace가 다시 3으로 리셋 |
