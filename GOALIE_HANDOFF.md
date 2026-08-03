# Goalie UI — 인수인계

최종 갱신 2026-08-02. 다음 작업자가 이 문서만 읽고 이어갈 수 있게 정리한다.

## 0. 다른 PC에서 다시 시작하기

인터넷이 되는 곳에서 아래 순서로 그대로 복구된다. 저장소 밖 의존성은 **Chrome 하나뿐이다.**

```
git clone https://github.com/designerkei/HL_Parkie_UI.git
cd HL_Parkie_UI
npm ci                          # package-lock.json이 커밋돼 있다
npx playwright install chrome   # 아래 주의 참고
node tests/server.js &
npm test                        # 79개 통과하면 환경 복구 완료
```

- **Chrome이 있어야 한다.** `playwright.config.js`가 `channel: 'chrome'`이라 번들 chromium이
  아니라 실제 Google Chrome을 쓴다. 없으면 79개가 전부 실행조차 안 된다
- 검증된 기준선은 `node v22.23.1` · `npm 10.9.8`
- gitignore 대상: `node_modules/` · `test-results/` · `playwright-report/` · `.route-baseline/`.
  특히 **`.route-baseline/`는 따라오지 않으므로** §4의 before/after diff는 한 PC 안에서
  한 세션에 끝내야 한다. 다른 PC에서 뜬 before와는 비교할 수 없다
- 라이브 확인: <https://designerkei.github.io/HL_Parkie_UI/> (`.nojekyll`, `main` 루트를 그대로 서빙)
- 상세 계획 원본 `~/.claude/plans/adaptive-twirling-goose.md`는 저장소 밖이라 **동기화되지 않는다.**
  필요한 내용은 이 문서 안에 옮겨져 있으니 그 파일을 찾지 말 것

## 1. 지금 상태

| | |
|---|---|
| 브랜치 | `main` (배포 대상. Pages가 루트를 그대로 서빙 — 커밋 = 배포) |
| 마지막 검증 커밋 | `8077988` = 현재 `main` — `npm test` **82개 3회 연속 통과** (60.0s · 58.1s · 59.1s) |
| 미검증 커밋 | 없음 |
| origin 동기화 | `main` = `origin/main` — 푸시·배포까지 끝난 상태 |
| Goalie 페이지 | 15개, 전부 `impl: true`로 공개 |
| 미착수 백로그 | §3 그대로. Goalie 쪽은 하나도 손대지 않았다 |

**작성 시점의 HEAD를 그대로 적지 말 것.** 8월 2일에 이 문서가 `c3a4e0b` 하나만 미검증으로
적어둔 사이 커밋 3개가 더 쌓여 검증 대상에서 빠졌다. 해시가 아니라
`git log <마지막 검증>..HEAD` **범위**로 확인한다.

```
node tests/server.js &     # 이미 4173을 쓰고 있으면 그대로 재사용 (playwright reuseExistingServer)
npm test                   # 3회 연속 통과가 릴리스 기준
```

### 8월 3일에 있었던 일 — 롤백 1건

다른 PC에서 올라온 `6c833da` · `6435458`(아이콘 페이지 재작성)이 `main`을 망가뜨렸다.
`index.html`이 5,131 → 2,815줄로 잘려 **사이드바 목적지가 0개**가 됐고, 렌더되지 않은
`{{ preview.dataUrl }}`이 URL로 요청돼 404가 났다. `npm test`가 400초를 넘겨 끝나지 않았다.

`66a65ea`로 두 커밋을 revert했다. 이미 배포된 커밋이고 여러 작업자가 쓰는 저장소라
`reset --hard` + 강제 푸시 대신 revert를 썼다. **작업은 버리지 않았다** —
`wip/iconography-rewrite-2026-08-03`에 원격 보존돼 있다. §8 참고.

### 그 뒤 Parkie 아이콘 쪽에서 끝낸 것

| 커밋 | 내용 |
|---|---|
| `6604c3e` | 아이콘 도형 SVG 일괄 내려받기 (ZIP 38개). 자체 STORE ZIP 라이터, 의존성 0 |
| `27bdf4f` → `ce45979` | 상태별 낱개 152파일 → **상태 시트 SVG 한 장**으로 교체 |
| `b5f6f50` | `hover`·`focus`·`pressed` 토큰이 셋 다 0.95였던 것을 0.85 / 0.95 / 1 로 분리 |
| `c9595b8` | 요약 칩이 행 수(30)를 아이콘 수라고 말하던 것을 실제 도형 수(38)로 |
| `d427764` · `8077988` | 획 두께 1.8/1.9/2/2.2 네 종 → **2px 11개 + 1.8px 2개** |

- **획 척도는 테스트에 정책으로 고정돼 있다.** `1.8`과 `2` 외의 값이 들어오면
  `tests/design-system-audit.spec.js`가 실패한다. 넓히려면 테스트를 의도적으로 고쳐야 한다.
  예외 2개는 측정 근거가 있다 — ParkingBay는 2px에서 속공간이 가독 하한 4px²로 떨어지고,
  ManualControl은 틈이 아예 봉해진다 (24px 렌더에서 flood fill로 측정)
- **요약 칩은 이제 카탈로그에서 파생된다.** 문자열로 적어두면 또 어긋난다 (두 번 어긋났다)

## 2. 이미 확인된 사실 — 다시 조사하지 말 것

### 전달 자료는 딱 두 개다

컬러 스펙 시트, 순찰 로봇 관제 화면 1장, 그리고 버튼 SVG 익스포트.
페이지는 15개다. 근거가 있는 곳과 없는 곳이 갈린다.

| 근거 | 페이지 |
|---|---|
| 컬러 스펙 | colors — **값이 정확히 일치** (`--goalie-ref-*` 7개 전부) |
| 관제 화면 | button · status · input · navigation · patrol · video · templates · iconography |
| **근거 없음** | typography · spacing · principles |

### 토큰 전사는 신뢰할 수 있다

`--goalie-ref-cyan-500 #00B4ED` · `cyan-300 #31D3FF` · `cyan-400 #00C5FB` ·
`cyan-600 #0098C8` · `cyan-disabled #B3EEFE` · `red-500 #FF3E31` ·
`green-500 #4FDC5D` · `yellow-500 #FEDB25` — 모두 전달값과 일치.

### 문제가 아닌 것들 (확인 완료)

- **알럿 종 수** — 스펙이 info·danger 2종이고 구현도 2종. 일치한다.
  "System 4색이니 4종이어야 한다"는 오판이었다
- **알럿 이력 패널** — `rgba(0,0,0,0.7)` 어두운 패널 + 흰 텍스트로 정상 구현
- **한국어 줄바꿈** — `word-break: keep-all`이 15페이지 전부 적용됨
- 중복 id 0 · 제목 순서 건너뜀 0 · 320~1440px 오버플로 0 · 텍스트 대비 결함 0

## 3. 남은 작업 — 우선순위

### A. 설계 결정이 필요 (사용자 확인 후 착수)

**A-1. 빨강을 비상 전용으로 되돌리고 기본 액션을 시안으로**

전달 관제 화면에서 빨강 버튼은 `비상모드`다. 그런데 같은 `#FF3E31`이 일반 채움 버튼
색이기도 하다. 운영자가 "빨강 = 비상·정지"라는 단일 신호를 잃는다. Material·HIG·Toss 모두
error 색을 파괴적 액션에만 예약한다. **대비 문제보다 심각한 의미 체계 문제다.**
버튼 색 체계가 바뀌므로 사용자 승인이 필요하다.

**A-2. 포커스 상태 신설**

전달 SVG에 Default·Hover·Pressed·Disabled는 있으나 **포커스가 없다.** WCAG 2.2 요구이고
장갑·키보드 조작 환경에서는 필수다. 전달 근거가 없으므로 만들면 "근거 없이 채운 것"이 되고,
그 사실을 페이지에 표시해야 한다 (Parkie `motion`의 "(제안 · 확정 대기)" 방식).

**A-3. 로딩 상태 신설**

`주행 재개`는 로봇을 실제로 움직인다. 대기 표시가 없어 운영자가 두 번 누른다. 로봇 제어에서
중복 명령은 사고로 이어진다. A-2와 같은 근거 표시 필요.

### B. 결정 없이 진행 가능

**B-1. Pressed 채움 한 단계 어둡게** — `#E03327`에서 흰 라벨이 **4.49:1**,
4.5에서 0.01 부족. 한 단계만 어둡게 하면 AA 통과. 지금 어두운 잉크를 쓰면 3.61:1로 더 나쁘다.
관련 문구가 `GoaliePages.dc.html`의 `deviationBody`에 "아직 해결되지 않았다"로 명시돼 있으니
고치면 그 문구도 함께 갱신할 것.

**B-2. Disabled를 전용 토큰으로** — 현재 스펙은 `opacity: 0.3`. 라벨까지 흐려져 대비가
1.3:1 수준이 되고(비활성은 WCAG 면제지만 사용자는 "비활성"과 "없음"을 구분 못 한다),
흰 배경 외에서 색이 변한다. Material은 잉크 38% / 컨테이너 12% 같은 전용 토큰을 쓴다.

**B-3. 호버를 어둡게** — `Enabled 3.51 → Hover 2.93 → Pressed 4.49`로 **호버에서
가독성이 최저**다. 호버는 누르기 직전이라 가장 읽혀야 하는 순간이다. 채움 버튼은 호버에서
어두워지거나 상태 레이어를 덮는 것이 표준.

**B-4. 아웃라인·고스트 라벨 대비** — `#FF3E31` on 흰배경 3.51:1,
`#E03327` on `#F9D6D4` 3.34:1. 본문 기준 미달.

**B-5. 고스트 Pressed를 반투명 레이어로** — 지금은 `#F9D6D4` 불투명 채움이 생겨
고스트가 다른 컴포넌트처럼 보인다.

### C. 감사 도구 정비 (숫자를 쓰기 전에 반드시)

감사 스크립트는 **`tests/tools/goalie-audit.js`에 커밋돼 있다.** 파일 상단 주석에 아래 내용이
전부 적혀 있으니 먼저 읽을 것. 이 스크립트는 **거짓 양성을 두 번 냈고 하나는 아직 안 고쳐졌다.**
게이트로 편입하기 전에 아래를 처리해야 한다.

1. **알파 합성** — 최초 버전이 알파 0.9 초과 배경만 인정해 `rgba(0,0,0,0.7)` 패널을
   건너뛰고 흰 텍스트를 흰 배경에 대고 계산 → **1.05:1 오보**. 수정했다.
   `index.html`의 `colorProbe()` 안 `over()`가 올바른 계산을 갖고 있으니 그것을 쓸 것
2. **경계 검사 범위** — 수정 후에도 **114건**이 남았는데 대부분 거짓 양성이다.
   `--goalie-border`는 흰 배경 대비 1.18:1인 **장식 헤어라인**(카드·섹션 divider)이고,
   **WCAG 1.4.11은 컴포넌트·상태를 식별하는 경계에만 적용된다.** 전부 고치면 모든 카드에
   진한 테두리가 생겨 디자인이 나빠진다.
   → 검사를 **상태 전달 경계**(입력 테두리 · 포커스 · 선택 · 토글 트랙 · 상태 배지)로 한정하고,
   **정상 헤어라인을 넣었을 때 통과하는지 역방향 변이로 거짓 양성 0을 확인**한 뒤 쓸 것
3. `.gl-badge` 2.40:1은 `--evidence`/`--queued`로 **상태를 전달하는 배지**라 1.4.11 대상일
   가능성이 있다. 범위를 좁힌 뒤 재판정

## 4. 검증 절차 (`DESIGN_SYSTEM_AUDIT.md` 11·12절과 동일)

```
node tests/server.js &

npm test  ×3                                    계약 (릴리스 기준)
node tests/tools/route-baseline.js before       변경 전 기록
#   … 변경 …
node tests/tools/route-baseline.js after
node tests/tools/route-baseline.js --diff before after
```

`route-sweep.spec.js`는 따로 돌릴 필요가 없다. `testDir: './tests'`라서 `npm test`가
7개 스펙 79개를 전부 실행하고 route-sweep도 그 안에 있다.

배포 후 라이브에서 확인하고 **배포 커밋 = 통과 커밋**을 지킨다.

## 5. 게이트를 추가할 때의 규칙

**통과하는 테스트는 그 자체로 증거가 아니다.** 이 저장소에서 이 방법으로 무력한 단정 3건을
찾아냈다 — 포커스 링이 폭만 재서 규칙을 지워도 통과했고, 로빙 탭이 이름과 달리 `tabindex`를
보지 않았고, 플릿 검사가 `scrollWidth >= clientWidth`로 정의상 항상 참이었다.

새 게이트마다 **지키겠다는 대상을 파괴해 실패를 확인**한다. 확인하지 못한 단정은 아직
테스트가 아니다.

**변이 조준 주의** — 변이 다수가 첫 시도에 빗나갔다. `display:none`은 `toHaveCount`를
바꾸지 않고, `alt=""`는 유효한 장식 이미지이며, `hint-placeholder-count`는 에디터 힌트일 뿐
데이터가 아니다. **살아남으면 먼저 조준을 의심하고, 재조준 후에도 살아남을 때 게이트를
강화한다.**

## 6. 함께 알아야 할 것

- **병행 작업이 있다.** 이 저장소는 여러 작업자가 동시에 편집한다. 각 단계 전
  `git fetch` + `git status`로 확인하고 커밋을 미루지 말 것. 미완성 상태가 배포된 전례가 있다
- **커밋 = 배포.** 빌드 단계가 없고 Pages가 `main` 루트를 서빙한다. 공개돼도 되는 것만 커밋
- **커밋 신원** — `designerkei <239721783+designerkei@users.noreply.github.com>`.
  회사 이메일이 들어가지 않게 유지
- **제품 추가·제거**는 레지스트리 1항목 + 토큰 파일 + `@import` + META/NAV.
  자세한 것은 `PARKIE_MERGE_PLAN.md` 14절
- 새 PC에서의 환경 복구·저장소 밖 의존성은 §0 참고

## 7. 착수 순서 제안

```
   (완료) 3adc091..a275d71 검증 — 2026-08-02, npm test 3회 통과
1. B-1 Pressed 채움 + 문구 갱신           ← 짧고 안전, AA 하나 확보
2. C 감사 도구 정비 + 거짓 양성 0 확인      ← 이후 모든 판단의 전제
3. C로 재측정한 결함 목록 확정
4. A-1~A-3 사용자 승인 후 착수             ← 설계 결정
5. B-2~B-5 소진
```

각 단계를 `npm test` 3회 + 커밋 + 배포로 닫아, 중간에 끊겨도 공개 상태가 망가지지 않게 한다.

## 8. 보류 중인 브랜치 — `wip/iconography-rewrite-2026-08-03`

8월 3일에 revert한 아이콘 페이지 재작성이 그대로 들어 있다. **통째로 되살리면 안 된다** —
`main`을 망가뜨렸던 그 커밋이고, 그때 없던 상태 시트·획 통일·토큰 수정이 지금 `main`에 있다.

살릴 값어치가 있는 것만 추려두었다. `PARKIE_ICONS` 25항목을 `main` 및 `ms/icon-data.js`의
path와 대조한 결과:

| 분류 | 항목 |
|---|---|
| **새 도메인 도형 7종** | `park-in` · `park-out` · `slot-map` · `queue` · `maintenance` · `power` · `control-settings` |
| MS 복사본 | `location` · `settings` · `restart` · `lock` — `ms/icon-data.js`에 이미 있다 |
| main과 동일 | `monitoring` · `emergency-stop` · `robot-status` · `charge` |
| 기존 채택본과 경합 | `home` · `camera` · `alert` · `profile` · `play` · `pause` — MS 채택본을 다시 그린 것 |
| 미완성 | `stop` · `navigation` · `robot-parking` · `control` — path가 없다 |

**가져올 것은 새 도형 7종뿐이다.** 가져오려면 도형만 `icons/parkie-icon-data.js`의
`export default` 객체에 넣고(브랜치는 named export로 바꿔놨는데 그게 로드를 깨뜨린 원인 중
하나다), 페이지 행과 테스트를 함께 추가한다. 데이터 파일만 따로 가져오면 즉시 깨진다.

되살릴 계획이 없다고 판단되면 브랜치를 지워도 된다 — 위 표가 그 안에 뭐가 있었는지의 기록이다.
