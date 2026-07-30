# Parkie UI · RMS Design System

RMS 디자인 시스템의 정보 구조, 타이포그래피 규정, 컴포넌트와 관제
대시보드를 본체로 사용하고 Parkie UI의 브랜드 테마를 적용한 정적 사이트입니다.

## 병합 원칙

- 뼈대와 콘텐츠: RMS
- 산세리프 폰트: Pretendard
- 모노스페이스 폰트: Roboto Mono
- 색상과 상태 표현: Parkie UI 다크 팔레트
- 브랜드 자산: HL Robotics
- 기본 테마: 다크 고정

## 주요 파일

- `index.html` — RMS Design Component 본체와 전체 문서 구조
- `support.js` — Design Component 브라우저 런타임
- `styles.css` — 전역 진입점과 반응형 보완
- `tokens/parkie-tokens.css` — Parkie UI 테마가 적용된 RMS 토큰
- `brand/logo.svg` — RMS 본체가 사용하는 HL Robotics 심볼
- `ms/`, `ms2/`, `ms3/`, `ms4/`, `ms6/` — RMS의 MS 참조 컴포넌트
- `PARKIE_MERGE_PLAN.md` — 병합 방향과 검증 기준

운영 사이트는 GitHub Pages의 `main` 브랜치 루트에서 배포됩니다.
