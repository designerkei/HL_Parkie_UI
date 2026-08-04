# HL Robotics · UX/UI Design Guide System

여러 제품의 디자인 시스템을 한 사이트에서 서빙하는 정적 가이드입니다.
RMS 디자인 시스템의 정보 구조와 컴포넌트를 본체로 사용하고, 제품별 브랜드
테마를 그 위에 얹습니다.

| 제품 | 대상 | 테마 | 상태 |
|---|---|---|---|
| **Parkie UI** | 주차 로봇 관제 | 다크 고정 | 구현 완료 |
| **Goalie UI** | 순찰 로봇 관제 | 라이트 고정 | **근거 기반 디자인 시스템 구축 완료** |
| **CPMS UI** | PM 전용 프로젝트 관리 | 라이트 고정 | **1차 운영형 디자인 시스템** |

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

## Goalie 근거 기반 디자인 시스템

Goalie는 RMS_Final의 32개 고정 Figma 노드와 제공된 화면 자산을 기준으로
15개 authored route를 공개합니다. 추측 규칙은 넣지 않고 reference·semantic·component
계층과 operation·audio·safety·selection 상태축을 분리했습니다.

- 파운데이션: 전체 요약, 원칙, 색상, 타이포그래피, 간격과 형태, 로봇 신호
- 컴포넌트: 버튼·스위치, 선택·시간, 상태·피드백, 내비게이션
- 패턴과 템플릿: 순찰 코스, 영상관리, 운영 화면
- 리소스: 브랜드 자산·교체 순서·출시 게이트

비상모드 확정 방식과 실제 송출 상한처럼 제품·안전 승인이 필요한 항목은
컴포넌트가 임의로 결정하지 않고 승인 경계로 문서화합니다.

## CPMS 근거 기반 디자인 시스템

CPMS는 단일 라이브러리로 정리하지 않습니다. 읽기 전용 소스 스냅샷
`aws-cpms@32ff10f`와 합성 데이터 데모 `main@f321694`를 고정하고 다음
세 계층을 구분합니다.

- Astryx Neutral 0.1.7 — 앱 Theme 경계, SideNav, App Store 컴포넌트
- CPMS Custom — Workspace, Portfolio, Dashboard, Workload, Gantt 등 업무 화면
- OP/FM Legacy — `workspace--legacy-op-ui` / `cpms-legacy` 명시적 경계

`Current`와 `Recommended` 규칙을 분리하고, HL Sky Blue는 액센트,
Deep Blue/Navy는 대비가 필요한 주요 액션으로 사용합니다. 1차 릴리스는
근거·원칙·파운데이션·쉘·제어·데이터·상태·권한·접근성·운영의 13개
authored route를 제공합니다.

## 주요 파일

- `index.html` — 라우팅, 제품 매니페스트, 크롬, Parkie 전체 문서
- `ProductSkeleton.dc.html` — 디자인 대기 제품이 공유하는 뼈대와 인수 계약
- `CPMSPages.dc.html` — CPMS 13개 근거 기반 문서와 합성 specimen
- `GoaliePages.dc.html` — Goalie 15개 Figma 근거 기반 문서와 운영 specimen
- `support.js` — Design Component 브라우저 런타임
- `styles.css` — 전역 진입점, `--guide-*` 크롬 토큰, 반응형, 크롬 고대비
- `tokens/*-tokens.css` — 제품별 토큰(스왑 레이어)
- `components/product-skeleton.css` — 공유 뼈대 스타일(`--guide-*` 기반)
- `components/cpms-documentation.css` — CPMS 문서·specimen 전용 스코프
- `components/goalie.css`, `components/goalie-documentation.css` — Goalie component·pattern·문서 스코프
- `brand/logo.svg` — HL Robotics 심볼
- `icons/` — Parkie 원본·로봇 전용 아이콘과 출처 정책
- `components/iconography.css` — 아이콘 상태 매트릭스와 도메인 상태 카탈로그
- `components/media-emergency.css` — 4채널 CCTV와 비상 제어 패널
- `components/system-summary.css` — 전체 요약 탭의 2열·1열 반응형 인덱스
- `ms/`, `ms2/`, `ms3/`, `ms4/`, `ms6/` — RMS의 MS 참조 컴포넌트
- `tests/` — 기능·치수·상태·반응형·고대비·시각 캡처 검증
- `HANDOFF.md` — **다른 PC에서 이어받을 때 먼저 읽을 것.** 현재 상태, 열려 있는 작업,
  그리고 이 저장소에서 이미 밟은 함정들
- `GOALIE_HANDOFF.md` — Goalie 상세 인수인계
- `PARKIE_MERGE_PLAN.md` — 병합 방향과 검증 기준
- `DESIGN_SYSTEM_AUDIT.md` — 감사 결과와 릴리스 기준

## 검증과 배포

```
node tests/server.js &                       # 개발 서버
npm test                                     # Playwright, 세 제품 전 경로
node tests/tools/route-baseline.js before    # 리팩터 전후 행동 대조용
```

릴리스 기준은 `npm test` **3회 연속 통과**이며, **배포 커밋이 통과 커밋과
같아야** 합니다. 전체 절차와 변이 검증 규율은 `DESIGN_SYSTEM_AUDIT.md` 11·12절에
있습니다. 운영 사이트는 GitHub Pages의 `main` 브랜치 루트에서
배포됩니다.
