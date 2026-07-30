# HL Parkie UI — RMS Merge Plan

## 1. 목표와 기준

- 대상: 현재 저장소의 정적 HTML/CSS/JS 디자인 시스템 사이트
- 디자인 기준: `../Parkie RMS UI`
- 토큰 원본: `../Parkie RMS UI/tokens/parkie-tokens.css`
- 컴포넌트 기준: `../Parkie RMS UI/Parkie Design System.dc.html`
- 브랜드: HL Robotics 유지

RMS의 Design Component 파일은 전용 런타임용이므로 대상 앱에 그대로 복사하지 않는다.
토큰은 원본 값을 사용하고, 컴포넌트는 현재 앱 구조에 맞춰 단계적으로 이식한다.

## 2. 변경 불변 조건

- 현재 정보 구조, 문서 콘텐츠, 내비게이션과 인터랙션은 유지한다.
- 라이트 테마 검증 전까지 앱은 다크 모드로 고정한다.
- 테마 토글 UI는 숨긴 상태로 유지한다.
- 각 Phase는 검증 후 별도 커밋과 원격 체크포인트를 남긴다.
- 승인되지 않은 제품명 변경이나 MS 참조 번들 이식은 하지 않는다.

## 3. 롤백 지점

- Phase 1 이전: `79a3ede`
- Phase 1 완료: `b95e816`

문제가 생기면 대상 Phase의 커밋을 `git revert`해 이전 체크포인트로 복구한다.

## 4. Phase

### Phase 0 — 기준점 확보 · 완료

- 작업 트리와 원격 `main` 동기화
- GitHub Pages 정상 배포 확인
- 롤백 커밋 기록

### Phase 1 — 다크 토큰 도입 및 앱 셸 스왑 · 완료

- RMS 다크 색상·상태·그림자 토큰 40개 도입
- 신규 토큰을 `:root`와 `[data-theme="dark"]` 양쪽에 정의
- 앱 셸 토큰을 `--parkie-*` 토큰에 연결
- HTML과 JS를 다크 모드로 고정
- 테마 토글 UI 숨김

Phase 1은 전체 제품 컴포넌트 변환이 아니라 토큰 기반과 앱 셸 변환까지를 범위로 한다.

### Phase 2 — 제품 토큰 브리지 및 HL Robotics 로고 · 완료

- 기존 깊이·브랜드·상태 토큰을 Parkie 토큰에 연결
- 컴포넌트의 기존 토큰 참조를 `--parkie-*` 참조로 전환
- 기존 컴포넌트 구조와 레이아웃은 변경하지 않음
- 제공된 HL Robotics 흑색/백색 워드마크와 심볼을 벡터 자산으로 등록
- 다크 앱 셸에는 백색 워드마크 사용
- 심볼은 파비콘 및 축약형 브랜드 자산으로 사용 가능하게 보관

#### 제품 토큰 매핑

| 기존 토큰 | Parkie 기준 |
|---|---|
| `--dp0` | `--parkie-bg` |
| `--dp1` | `--parkie-surface` |
| `--dp2` | `--parkie-surface-2` |
| `--dp4` | `--parkie-surface-3` |
| `--dp8` | `--parkie-surface-3`와 `--parkie-border` 사이 |
| `--dp16` | `--parkie-border` |
| `--dp24` | `--parkie-border`와 `--parkie-border-strong` 사이 |
| `--dp40` | `--parkie-border-strong` |
| `--inset` | `--parkie-bg`보다 낮은 inset 표면 |
| `--p100` | `--parkie-brand-text` |
| `--p200` | `--parkie-brand-primary` |
| `--p300` | `--parkie-brand-primary-active` |
| `--hover` | `--parkie-brand-primary-hover` |
| `--ok` | `--parkie-status-active` |
| `--warn` | `--parkie-warning` |
| `--warn2` | `--parkie-warning-text` |
| `--alert` | `--parkie-danger` |
| `--emergency` | `--parkie-status-error` |
| `--crit` | `--parkie-danger` |

### Phase 3 — 타이포그래피·간격·모서리 · 완료

- `--parkie-font-*`, `--parkie-space-*`, `--parkie-radius-*` 도입
- 폰트 로드와 한글 폴백 검증
- 줄바꿈, 카드 높이와 반응형 레이아웃 회귀 검증

### Phase 4 — 컴포넌트 시각 정렬 · 완료

- 버튼과 폼
- 알림과 상태 뱃지
- 카드와 관제 패널
- 내비게이션과 오버레이

RMS `.dc.html`은 시각·상태 레퍼런스로만 사용하고 현재 앱의 기능은 유지한다.

### Phase 5 — 브랜드 문구 정리 · 일부 완료/문구 승인 필요

- HL Robotics 로고 3종과 파비콘 적용 완료
- HL Mando Parking, HL Robotics, SMS/Parkie 명칭의 최종 표기
- 브랜드 로고 사용 위치와 최소 크기
- 버전 표기

### Phase 6 — 라이트 테마 · 선택

- RMS 라이트 토큰 적용
- 전체 컴포넌트와 대비 검증
- 저장 테마 복원 및 테마 토글 UI 재노출

## 5. Phase별 완료 조건

- 토큰 원본과 매핑이 계획서와 일치한다.
- CSS와 JavaScript 정적 검사가 통과한다.
- 정의되지 않은 CSS 변수가 없다.
- 데스크톱과 모바일에서 레이아웃이 깨지지 않는다.
- 내비게이션, 복사, 토글과 데모 인터랙션이 유지된다.
- 작업 범위 밖 파일과 콘텐츠가 변경되지 않는다.
- 커밋·푸시 후 GitHub Pages 배포가 성공하고 운영 파일이 로컬과 일치한다.
