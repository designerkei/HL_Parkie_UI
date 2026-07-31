# Parkie RMS Design System — Completion Audit

Date: 2026-08-01

Product: HL Robotics Parkie 주차로봇 관제 시스템

Scope: Parkie 33개 목적지 전체. `MS 참조`는 비교 자료로만 유지하며 Parkie 완성도 집계에서 제외한다.

## 1. 최종 설계 결정

RMS는 정보 구조, 컴포넌트 구조, 타입 위계, 화면 밀도와 KO/EN 문서 체계를 제공한다. Parkie는 HL Robotics 브랜드, Pretendard·Roboto Mono, 다크 토큰, 상호작용 상태, 주차로봇 도메인 아이콘과 운영 의미 체계를 제공한다.

제품 화면의 색은 다음 우선순위를 따른다.

1. 정상 운행·정상 연결·정상 배터리는 중립색이다.
2. Brand blue는 선택, 포커스, 주요 행동과 현재 경로에만 쓴다.
3. Green은 완료·복구·실제 충전처럼 긍정 의미가 명확한 경우에만 쓴다.
4. Muted cyan은 정보·재연결, Yellow는 주의, Red는 고장·중단·비상에 쓴다.
5. 색만으로 상태를 전달하지 않고 텍스트, 아이콘, 수치, 위치를 함께 제공한다.

## 2. 외부 기준 비교와 반영

| 기준 | 확인한 원칙 | Parkie 반영 |
| --- | --- | --- |
| [Apple Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/) / [Color](https://developer.apple.com/design/human-interface-guidelines/color) | 색 외 단서, 충분한 대비, 읽기 순서와 명확한 조작 결과 | 상태마다 텍스트·수치 병기, 12px 최소 캡션, 33개 화면 axe 검사, 다크 잉크 Primary |
| [Apple SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) | 일관된 그리드·무게·의미, 플랫폼에서 학습된 기호 재사용 | 24px 그리드, Parkie Original·Custom·Adopted 출처, 범용 기호는 Adopted |
| [Material 3 States](https://m3.material.io/foundations/interaction/states/state-layers) | Hover·Focus·Pressed와 선택 상태를 분리 | Default·Hover·Focus·Pressed·Selected/On·Disabled 6상태 매트릭스 |
| [Material Symbols](https://developers.google.com/fonts/docs/material_symbols) | 가변 아이콘 시스템의 일관된 크기·스타일 | 아이콘 24px 기준과 currentColor 토큰 소비 |
| [Meta accessibility co-design](https://about.fb.com/news/2024/07/building-accessibility-into-our-mixed-reality-products/) | 접근성을 사후 체크가 아닌 설계·검증 과정에 포함 | 문서 계약에 접근성 항목 고정, 자동검사·키보드·시각검사를 같은 릴리스 게이트로 운영 |
| [ISA High Performance HMI](https://www.isa.org/getmedia/06130a38-f7af-4b35-8c9c-2c34f25c1977/The-High-Performance-HMI-Overview-v2-01.pdf) | 정상 상태는 절제하고 비정상·조치 상태가 눈에 띄어야 함 | 운행·연결·정상 배터리 중립화, Yellow·Red를 예외와 조치 큐에 집중 |
| [Behance Enterprise Design System](https://www.behance.net/gallery/243340343/Enterprise-Design-System-SaaS-Platform-Case-Study), [Fleet Dashboard](https://www.behance.net/gallery/77060443/Automated-Fleet-Dashboard), [Mobile robots console](https://www.behance.net/gallery/130464827/Mobile-robots-console-fleet-management-UI-UX-design) | 강한 섹션 위계, 실제 제품 장면, 컴포넌트 근거를 함께 제시 | 장식형 Hero 제거, System Summary를 실제 토큰·컴포넌트·상세 링크 중심으로 구성 |
| [Pinterest dashboard case-study reference](https://in.pinterest.com/pin/dashboard-design-case-study-on-behance--384494886949943745/) | 빠른 스캔을 위한 카드 리듬과 명료한 인덱스 | 요약의 편집형 카드 리듬과 33개 목적지 인덱스에만 참고 |

Behance와 Pinterest는 표현·리듬 참고 자료다. 의미, 접근성, 운영 안전 규칙은 Apple·Google·Meta·W3C·ISA 같은 규범/플랫폼 자료보다 우선하지 않는다.

## 3. 감사한 33개 Parkie 목적지

- 시작하기 4개: Overview, System Summary, Principles, Change log
- Foundations 6개: Colors, Typography, Spacing, Radius, Elevation, Iconography
- Actions & Input 5개: Button, Segmented, Selection controls, Input, Site Select
- Status & Feedback 4개: Badge, Status Label, Alert, Alert Feed Item
- Navigation & Structure 6개: Top Bar, Tabs, Breadcrumb, Card, Table, Avatar
- Robot Operations 3개: Robot Status, Robot Card, Media & Emergency
- Overlays & Patterns 2개: Modal, Alert Center
- Templates 2개: Control App Shell, Control Dashboard
- Resources 1개: Brand assets

모든 목적지는 동일한 4개 문서 계약을 갖는다.

1. 사용 기준
2. 동작·구조
3. 접근성
4. 구현 규칙

## 4. 주차로봇 관제 시나리오

| 시간 목표 | 관제자가 답해야 하는 질문 | 화면 근거 |
| --- | --- | --- |
| 3초 | 데이터가 최신인가, P1이 있는가, 어떤 로봇이 멈췄는가 | 데이터 신선도, 조치 필요/오프라인 지표, P1 큐 |
| 30초 | 동작·통신·배터리 중 어느 축이 원인인가 | 7열 Fleet 표, 독립 상태축, 원인·영향·권장 조치 |
| 2분 | 안전하게 확인·복구 흐름을 시작할 수 있는가 | 로봇 상세, 충전 경로, 비상 확인 모달, 초점 복귀 |

이 시간은 현재 정보구조의 설계 목표이자 전문가 휴리스틱 프록시다. 실제 운영자 과업 시간은 별도 사용자 테스트에서 측정해야 한다.

## 5. 품질 게이트와 자동 증거

| 게이트 | 자동 증거 | 통과 기준 |
| --- | --- | --- |
| 정보 구조 | 33개 deep link, 현재 위치, history, KO/EN 검색 | 33/33 |
| 문서 깊이 | 목적지별 4개 고유 계약 | 33 × 4 |
| 접근성 | axe-core로 33개 전체 렌더 검사 | 위반 0 |
| DOM 무결성 | 33개 화면 duplicate ID 검사 | 중복 0 |
| 반응형 | 1440·900·390px document/main overflow | 페이지 overflow 0 |
| 타입 | Parkie HTML/CSS의 8–11px 리터럴 탐지 | 최소 12px |
| 아이콘 | 30개 출처, 조작 아이콘 6상태, 의미 아이콘 별도 축 | 30개 + 도메인 상태 22개 |
| 색 의미 | 선택·정보·운행·충전 토큰 비교 | 네 축 분리 |
| CCTV | Live·Stale·Reconnecting·Paused·Offline·Error | 6상태 + 4채널 반응형 |
| 키보드 | Tabs, role radio, combobox, Alert Center, 비상 모달 | roving focus, Escape, focus trap/return |
| 운영 밀도 | DOM에 100 robot rows, 200 alarm rows 합성 | 1초 이내 생성, 로컬 스크롤, 페이지 overflow 0 |
| 자산 | 런타임·CSS·아이콘·MS 번들·브랜드 SVG | 필수 자산 HTTP 200 |
| 토큰 | 모든 `var(--parkie-*)` 참조와 정의 비교 | 미정의 0 |
| 테마 | 소스·렌더 계약 | dark 고정, 토글 숨김 |
| 토큰 패리티 | 신규 토큰 root/dark 선언 수 + mutation | 2개 선언, 한쪽 삭제를 검출 |

명령:

```sh
npm run test:audit
npm run test:ui
npm test
```

## 6. 반복 검증 방식

검증은 횟수 채우기가 아니라 결함 소진 방식으로 수행한다.

1. 구조 루프: 33개 문서·랜드마크·제목·관계·중복 ID를 검사한다.
2. 의미 루프: Brand·interaction·operation·severity 축이 섞였는지 검사한다.
3. 제품 루프: 데이터 신선도, 로봇 상태축, CCTV 복구, P1 원인/영향/조치를 검사한다.
4. 스트레스 루프: 100 robots, 200 alarms, 4 CCTV와 좁은 문서 뷰를 검사한다.
5. 시각 루프: System Summary, Icon matrix, Dashboard, App Shell, Robot Status, Modal 캡처를 사람이 확인한다.
6. 최종 변경 이후 전체 스위트를 연속 3회 통과해야 릴리스한다. 변경이나 실패가 발생하면 카운트를 0으로 되돌린다.
7. 한쪽 테마의 신규 토큰을 제거한 가상 mutation이 테스트에서 실패로 검출되는지 확인한다.

## 7. 제거한 주요 결함

- Parkie 문서 일부만 검사하던 17개 범위를 전체 33개로 확장했다.
- Primary의 밝은 파란 배경 위 흰 글자를 6.42:1 다크 잉크로 교체했다.
- Hover/Pressed까지 파란 아이콘이던 규칙을 중립 피드백으로 바꾸고 Selected/On만 파란색으로 분리했다.
- 아이콘 매트릭스를 6개 상태가 줄바꿈되지 않는 실제 표 구조로 재설계했다.
- 정상 운행·연결·배터리를 Green에서 중립색으로 바꾸고 충전·주의·고장만 의미색으로 남겼다.
- CCTV에 누락됐던 Stale과 마지막 프레임 경과 시간을 추가했다.
- App Shell의 문자 기호를 Parkie/Adopted SVG로 교체했다.
- Dashboard에 데이터 신선도, 독립 상태축, 오프라인, P1/P2 원인·영향·권장 조치를 추가했다.
- Select·Modal·Alert Center·App Shell의 ARIA 관계, 입력 label, heading 계층, 중복 main을 수정했다.
- 비상 모달에 안전 기본 초점, Tab trap, Escape 종료와 트리거 초점 복귀를 추가했다.
- 12px 미만 Parkie 캡션을 RMS 타입 토큰으로 올렸다.

## 8. 릴리스 정책과 잔여 위험

- 최종 코드 변경 뒤 `npm test` 3회 연속 통과가 필요하다.
- 통과 커밋과 배포 커밋이 같아야 한다.
- GitHub Pages에서 해시, 주요 자산, 33개 경로와 대표 상호작용을 다시 확인한다.
- 자동검사는 실제 CCTV 지연, 로봇 명령 실패, 네트워크 손실, 스크린리더별 발음과 현장 조도까지 보증하지 않는다. 실제 장비 연동·운영자 과업·보조기술 수동검증은 제품 출시 전 별도 게이트다.
