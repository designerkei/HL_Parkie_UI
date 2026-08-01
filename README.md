# HL Robotics · UX/UI Design Guide System

여러 제품의 디자인 시스템을 한 사이트에서 서빙하는 정적 가이드입니다.
RMS 디자인 시스템의 정보 구조와 컴포넌트를 본체로 사용하고, 제품별 브랜드
테마를 그 위에 얹습니다.

| 제품 | 대상 | 테마 | 상태 |
|---|---|---|---|
| **Parkie UI** | 주차 로봇 관제 | 다크 고정 | 구현 완료 |
| **Goalie UI** | 순찰 로봇 관제 | 라이트 고정 | **뼈대만** — 디자인 전달 대기 |
| **CPMS UI** | PM 전용 프로젝트 관리 | 라이트 고정 | **뼈대만** — 디자인 전달 대기 |

상단바의 제품 탭으로 전환하고, 경로는 `#/<제품>/<페이지>` 형태입니다.
크롬(상단바·사이드바)은 `--guide-*` 제품 중립 토큰층을 쓰므로 제품이 늘어도
크롬을 다시 만들지 않습니다.

## 제품 레지스트리

제품은 코드가 아니라 **데이터**입니다. `index.html`의 첫 페인트 부트스트랩이
`window.__GUIDE_SYSTEMS`에 레지스트리를 발행하고, 라우터·테마·탭·매니페스트·내비가
모두 그것을 읽습니다. 정의가 하나뿐이라 첫 페인트 테마와 라우팅 테마가 어긋날 수 없습니다.

**탭 추가** — 레지스트리 1항목 + `tokens/<제품>-tokens.css` + `styles.css`에 `@import`
1줄 + `<제품>_META` / `<제품>_NAV`. 템플릿·라우팅·크롬은 손대지 않습니다.

**탭 제거** — 그 넷을 지웁니다.

디자인이 아직 없는 제품은 `skeleton: true`로 두면 공유 `ProductSkeleton` 컴포넌트가
전달 대기 화면과 인수 계약을 렌더합니다. 실제 디자인이 도착하면 그 제품만
`skeleton: false`로 바꾸고 전용 페이지 컴포넌트를 붙입니다.

각 토큰 파일은 자기 스코프 안에서 `--product-bg` · `--product-text` · `--product-font`를
발행합니다. CSS는 JS 레지스트리를 읽을 수 없으므로, 이 합의된 이름 하나로 문서 셸이
제품 이름을 몰라도 활성 제품을 칠합니다.

## 병합 원칙

- 뼈대와 콘텐츠: RMS
- 산세리프 폰트: Pretendard
- 모노스페이스 폰트: Roboto Mono
- 색상과 상태 표현: 제품별 팔레트. 제품마다 고정 테마
- 브랜드 자산: HL Robotics
- 테마: 제품마다 고정. 사용자 토글 없음

## 제품 토큰 격리

각 제품 토큰은 자기 스코프 안에만 존재하고 `:root` 기본값을 두지 않습니다.
래퍼가 없으면 다른 제품 테마를 상속하는 대신 **눈에 보이게 실패**합니다.

- Parkie — `:root[data-system="parkie"][data-color-mode="dark"]`, `[data-theme="dark"][data-system="parkie"]`
- Goalie — `[data-system="goalie"][data-color-mode="light"]`
- CPMS — `[data-system="cpms"][data-color-mode="light"]`

세 파일 모두 끝에 `forced-colors: active` 블록을 두어 Windows 고대비에서
포커스 표시와 경계가 시스템 색을 따르게 합니다. 이 오버라이드는 토큰 스코프
**밖**에 있어야 합니다 — 패리티 게이트가 스코프별 선언 수를 세기 때문입니다.

## 인수 절차 (Goalie · CPMS 공통)

디자인은 자료를 전달받는 대로 순차 반영합니다. 추측으로 채우지 않으며,
각 제품의 13개 페이지 중 `브랜드 자산`만 실내용(인수 계약)이고 나머지는 `soon`입니다.

1. **자료 전달** — 표기가 모호하거나 서로 어긋나면 확인 후 진행
2. **토큰 주입** — 해당 제품의 `tokens/<제품>-tokens.css` 스왑 레이어. 브랜드 램프는 현재 자리표시자
3. **스펙 작성과 대비 검증** — 본문 4.5:1, 비텍스트 3:1. 밝은 채움 위에는 어두운 잉크
4. **순서** — 색상 → 타이포·간격 → 컴포넌트 → 화면 패턴

파운데이션이 먼저 들어와야 컴포넌트 문서를 하드코딩 없이 쓸 수 있습니다.
전체 계약은 각 제품의 `브랜드 자산` 페이지에 있습니다.

CPMS는 PM 툴이므로 패턴 슬롯은 전달받은 화면(보드 · 백로그 · 이슈 상세 · 일정)에 맞춰
그때 이름을 정합니다.

## 주요 파일

- `index.html` — 라우팅, 제품 매니페스트, 크롬, Parkie 전체 문서
- `ProductSkeleton.dc.html` — 디자인 대기 제품이 공유하는 뼈대와 인수 계약
- `support.js` — Design Component 브라우저 런타임
- `styles.css` — 전역 진입점, `--guide-*` 크롬 토큰, 반응형, 크롬 고대비
- `tokens/*-tokens.css` — 제품별 토큰(스왑 레이어)
- `components/product-skeleton.css` — 공유 뼈대 스타일(`--guide-*` 기반)
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
