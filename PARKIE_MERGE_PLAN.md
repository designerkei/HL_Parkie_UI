# Parkie UI → RMS 적용 계획

## 1. 병합 방향

RMS를 큰 뼈대로 사용한다.

- RMS에서 유지: 정보 구조, 내비게이션, 타이포그래피 스케일, 간격과 모서리
  규정, 컴포넌트 상태, 관제 테이블, 대시보드, KO/EN 콘텐츠, MS 참조
- Parkie UI에서 적용: 폰트, 색상, 상태 표현, 포커스, 그림자, HL Robotics
  브랜드 자산

Parkie UI의 단순한 문서 구조에 RMS 일부를 옮기는 방식은 사용하지 않는다.
RMS의 풍부한 규정과 예시를 그대로 유지하면서 모든 시각 토큰을 Parkie UI로
교체한다.

## 2. 기준 파일

- RMS 본체: `../Parkie RMS UI/Parkie Design System.dc.html`
- RMS 런타임: `../Parkie RMS UI/support.js`
- RMS 토큰 구조: `../Parkie RMS UI/tokens/parkie-tokens.css`
- Parkie UI 시각 기준: 기존 `HL_Parkie_UI`의 `79a3ede` 버전
- 브랜드 자산: 사용자가 제공한 HL Robotics SVG 3종

## 3. 타이포그래피 적용 원칙

RMS의 타입 규정은 유지하고 폰트 패밀리만 Parkie UI로 교체한다.

| RMS 규정 | 유지 여부 | Parkie UI 적용 |
|---|---|---|
| Display 38/Bold | 유지 | Pretendard 700 |
| Headline 30/Bold | 유지 | Pretendard 700 |
| Title 24/Semibold | 유지 | Pretendard 600 |
| Subtitle 20/Semibold | 유지 | Pretendard 600 |
| Section 18/Semibold | 유지 | Pretendard 600 |
| Body Large 16/Regular | 유지 | Pretendard 400 |
| Body 14/Regular | 유지 | Pretendard 400 |
| Small 13/Regular | 유지 | Pretendard 400 |
| Caption 12/Medium | 유지 | Pretendard 500 |
| 숫자·코드·토큰 | 유지 | Roboto Mono |

폰트 크기, 굵기, 행간, 추적, 사용 목적은 RMS를 따른다.

## 4. 색상과 상태 적용 원칙

- 브랜드: `#00AAFF`, hover `#16DCF2`, active `#009BE9`
- 배경: `#0F0F11`
- 표면: `#161618`, `#1E1E21`, `#242426`
- 텍스트: 흰색 95/60/40/30% 계층
- 성공·운행: `#0FDC4C`
- 경고: `#FFD900`
- 오류·위험: `#DF0000`
- 정보·충전: `#00AAFF`

RMS 컴포넌트는 직접 색상을 참조하지 않고 `--parkie-*` 토큰을 통해 이 값을
사용한다.

## 5. 브랜드 적용

- `brand/logo.svg`: HL Robotics 심볼
- `brand/hl-robotics-wordmark-white.svg`: 다크 배경용 워드마크
- `brand/hl-robotics-wordmark-black.svg`: 라이트 배경용 워드마크
- `brand/hl-robotics-symbol.svg`: 원본 심볼 및 파비콘

RMS 상단바와 브랜드 가이드의 로고 경로는 `brand/logo.svg`를 유지해 스왑
구조를 보존한다.

## 6. 테마 정책

- 다크 테마 고정
- 다크 토큰을 `:root`와 `[data-theme="dark"]` 양쪽에 정의
- 테마 토글 UI 숨김
- 라이트 테마는 별도 승인 전까지 노출하지 않음

## 7. 배포 구조

- `index.html`: RMS Design Component 본체
- `support.js`: RMS 런타임
- `styles.css`: 토큰 import와 반응형 보완
- `tokens/`: Parkie UI 테마를 입힌 RMS 토큰
- `ms*`: RMS에서 사용하는 정적 MS 참조 번들

## 8. 완료 조건

- 운영 첫 화면이 RMS의 Overview 구조다.
- RMS의 Parkie/MS 참조 내비게이션이 유지된다.
- RMS 타이포그래피 9단계가 모두 존재하고 Pretendard를 참조한다.
- 숫자와 코드 예시는 Roboto Mono를 참조한다.
- RMS 버튼, 입력, 상태, 테이블, 카드, 탭, 모달, 브레드크럼과 대시보드
  섹션이 유지된다.
- 모든 `--parkie-*` 참조가 정의된다.
- 테마 토글은 노출되지 않고 루트 테마는 항상 dark다.
- HL Robotics 로고와 파비콘 자산이 정상 로드된다.
- RMS 런타임과 MS 번들 의존성이 모두 HTTP 200으로 제공된다.
- 정적 구문, 런타임 렌더, 내비게이션, KO/EN 전환, 반응형 검증을 통과한다.
- 커밋·푸시 후 GitHub Pages 운영 파일이 로컬과 일치한다.

## 9. 롤백 지점

- 기존 단순 HL 사이트: `79a3ede`
- 토큰만 적용된 중간 상태: `b95e816`
- 잘못된 방향의 이전 병합: `5de6598`

문제 발생 시 해당 커밋 이후 변경을 `git revert`해 복구한다.

## 10. 아이콘·CCTV 확장 계획

### 정보 구조

- `아이콘 · Iconography`는 Parkie의 `Foundations` 안에서 관리한다.
- `미디어·비상 제어 · Media & Emergency`는 아이콘 문서에 섞지 않고 RMS의
  `Robot Operations` 안에 독립 패널로 둔다.
- RMS의 문서 뼈대, 제목 계층, 내비게이션과 KO/EN 전환은 그대로 유지한다.

### 아이콘 출처와 상태

- `Parkie Original`: 사용자가 제공한 Monitoring·Battery SVG와 기존 Parkie의
  Robot·Charger·Connection 자산
- `Parkie Custom`: 차량 운반·주차 구역·경로·장애물·수동 제어·비상정지처럼
  주차 로봇에 특화된 자산
- `MS Adopted`: Home·Camera·Alert·Settings·Search·Filter·Refresh처럼 이미
  학습된 범용 기호
- MS 전체 카탈로그는 `MS 참조` 메뉴에 그대로 보존하고, 채택된 아이콘만
  Parkie 토큰으로 렌더링한다.
- 모든 조작 아이콘은 Enabled·Hover·Pressed/On·Disabled 4상태를 같은 행에
  나열한다.
- 배터리·통신·동작·임무·안전은 상호작용 색과 별개인 운영 상태군으로
  문서화한다.

### CCTV 패널

- 제공 레퍼런스의 1532×378 스테이지와 364×286 카메라 카드 비율을 기준으로
  4개 채널을 한 행에 배치한다.
- 각 카드에는 채널명, Live 상태, 카메라 ID, 마지막 프레임 시각,
  새로고침과 전체화면 제어를 제공한다.
- 스트림 상태는 Live·Reconnecting·Paused·Offline·Error를 아이콘과 텍스트로
  함께 표시한다.
- 1500px 이하에서는 2열, 980px 이하에서는 1열로 전환한다.
- 이 페이지에만 RMS 콘텐츠 프레임을 확장하고 다른 컴포넌트 문서의 960px
  기준 폭은 변경하지 않는다.

### 비상 제어

- 비상 FAB와 마이크 FAB를 카메라 카드와 별도 안전 영역에 둔다.
- 비상 FAB는 단일 클릭으로 즉시 실행하지 않고, 영향 범위를 표시하는
  확인 모달을 거친다.
- 기존 RMS Modal의 Danger·Neutral 액션 규칙과 `prefers-reduced-motion`
  정책을 재사용한다.

### 완료 조건

- Parkie 아이콘 29개가 출처와 4개 상호작용 상태를 모두 표시한다.
- 배터리·통신·동작·임무·안전 상태 아이콘 22개가 별도로 표시된다.
- 4개 CCTV 카드의 데스크톱 치수와 2열·1열 반응형이 자동 테스트를 통과한다.
- 새로고침, 확장 보기, 마이크, 비상 확인 흐름이 키보드 접근 가능한 버튼과
  명시적 접근성 이름을 가진다.
- 기존 RMS 회귀 테스트와 신규 기능·시각 캡처 테스트가 모두 통과한다.
