# HL Robotics · UX/UI Design Guide System

두 로봇 관제 제품의 디자인 시스템을 한 사이트에서 서빙하는 정적 가이드입니다.
RMS 디자인 시스템의 정보 구조와 컴포넌트를 본체로 사용하고, 제품별 브랜드
테마를 그 위에 얹습니다.

| 제품 | 대상 | 테마 | 상태 |
|---|---|---|---|
| **Parkie UI** | 주차 로봇 관제 | 다크 고정 | 구현 완료 |
| **Goalie UI** | 순찰 로봇 관제 | 라이트 고정 | **뼈대만** — 디자인 전달 대기 |

상단바의 제품 탭으로 전환하고, 경로는 `#/parkie/...` · `#/goalie/...` 형태입니다.
크롬(상단바·사이드바)은 `--guide-*` 제품 중립 토큰층을 쓰므로 제품이 늘어도
크롬을 다시 만들지 않습니다.

## 병합 원칙

- 뼈대와 콘텐츠: RMS
- 산세리프 폰트: Pretendard
- 모노스페이스 폰트: Roboto Mono
- 색상과 상태 표현: 제품별 팔레트(Parkie 다크 / Goalie 라이트)
- 브랜드 자산: HL Robotics
- 테마: 제품마다 고정. 사용자 토글 없음

## 제품 토큰 격리

각 제품 토큰은 자기 스코프 안에만 존재하고 `:root` 기본값을 두지 않습니다.
래퍼가 없으면 다른 제품 테마를 상속하는 대신 **눈에 보이게 실패**합니다.

- Parkie — `:root[data-system="parkie"][data-color-mode="dark"]`, `[data-theme="dark"][data-system="parkie"]`
- Goalie — `[data-system="goalie"][data-color-mode="light"]`

두 파일 모두 끝에 `forced-colors: active` 블록을 두어 Windows 고대비에서
포커스 표시와 경계가 시스템 색을 따르게 합니다. 이 오버라이드는 토큰 스코프
**밖**에 있어야 합니다 — 패리티 게이트가 스코프별 선언 수를 세기 때문입니다.

## Goalie 인수 절차

Goalie 디자인은 자료를 전달받는 대로 순차 반영합니다. 추측으로 채우지 않으며,
현재 13개 페이지 중 `브랜드 자산`만 실내용(인수 계약)이고 나머지는 `soon`입니다.

1. **자료 전달** — 표기가 모호하거나 서로 어긋나면 확인 후 진행
2. **토큰 주입** — `tokens/goalie-tokens.css`의 스왑 레이어. 브랜드 램프는 현재 자리표시자
3. **스펙 작성과 대비 검증** — 본문 4.5:1, 비텍스트 3:1. 밝은 채움 위에는 어두운 잉크
4. **순서** — 색상 → 타이포·간격 → 컴포넌트 → 화면 패턴

파운데이션이 먼저 들어와야 컴포넌트 문서를 하드코딩 없이 쓸 수 있습니다.
전체 계약은 사이트의 `Goalie UI · 브랜드 자산` 페이지에 있습니다.

## 주요 파일

- `index.html` — 라우팅, 제품 매니페스트, 크롬, Parkie 전체 문서
- `GoaliePages.dc.html` — Goalie 페이지 뼈대와 인수 계약
- `support.js` — Design Component 브라우저 런타임
- `styles.css` — 전역 진입점, `--guide-*` 크롬 토큰, 반응형, 크롬 고대비
- `tokens/parkie-tokens.css` · `tokens/goalie-tokens.css` — 제품 토큰(스왑 레이어)
- `components/goalie.css` — Goalie `gl-*` 컴포넌트 어휘
- `brand/logo.svg` — HL Robotics 심볼
- `icons/` — Parkie 원본·로봇 전용 아이콘과 출처 정책
- `components/iconography.css` — 아이콘 상태 매트릭스와 도메인 상태 카탈로그
- `components/media-emergency.css` — 4채널 CCTV와 비상 제어 패널
- `components/system-summary.css` — 전체 요약 탭의 2열·1열 반응형 인덱스
- `ms/`, `ms2/`, `ms3/`, `ms4/`, `ms6/` — RMS의 MS 참조 컴포넌트
- `tests/` — 기능·치수·상태·반응형·고대비·시각 캡처 검증
- `PARKIE_MERGE_PLAN.md` — 병합 방향과 검증 기준
- `DESIGN_SYSTEM_AUDIT.md` — 감사 결과와 릴리스 기준

## 검증과 배포

```
npm test        # Playwright, 두 제품 전 경로
```

릴리스 기준은 `npm test` **3회 연속 통과**이며, **배포 커밋이 통과 커밋과
같아야** 합니다. 운영 사이트는 GitHub Pages의 `main` 브랜치 루트에서
배포됩니다.
