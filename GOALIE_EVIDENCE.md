# Goalie UI · Evidence and decision register

Last reviewed: 2026-08-01  
Figma file: [`RMS_Final`](https://www.figma.com/design/HBianLgipphAmvLGRKfCk4/RMS_Final)  
File key: `HBianLgipphAmvLGRKfCk4`

This register is the implementation source map for Goalie UI. A Figma value is
evidence, not automatically a production decision. Differences caused by
accessibility, platform behavior or conflicting source labels are recorded here
instead of being silently normalized.

## Evidence precedence

1. Figma Code Connect mapping, if an exact project component exists.
2. Figma component documentation and annotations.
3. Actual properties returned for the selected Figma node.
4. Visible Figma labels and descriptions.
5. Screenshot inference.

Actual node properties win over a visibly incorrect label. Product and safety
decisions that cannot be resolved from Figma stay open; they must not be guessed.

## Node coverage

| Node | Evidence | System layer | Planned documentation/implementation |
|---|---|---|---|
| `230:2058` | Color and elevation | Foundation | Color, semantic tokens, contrast, elevation |
| `2051:3017` | Type scale | Foundation | Typography and bilingual specimens |
| `230:2891` | Header and side navigation | Structure | Application shell |
| `230:2007` | Alert trigger, banner and history | Feedback | Alerts and notifications |
| `250:2931` | Scrollbar thumbs | Primitive | Scroll and overflow |
| `735:7167` | Confirmation/information modals | Feedback | Modal family |
| `329:4327` | Switch and action controls | Primitive | Selection and action controls |
| `351:2435` | Danger button matrix | Primitive | Button danger intent |
| `351:2306` | Primary button matrix | Primitive | Button primary intent |
| `351:1032` | Battery examples | Domain status | Battery and charging |
| `810:5614` | Video auxiliary controls | Primitive bundle | Time, speed and playback controls |
| `1884:13681` | Patrol component bundle | Domain bundle | Course, mission, waypoint and time controls |
| `2226:13757` | Patrol create/edit panel states | Pattern | Patrol editor |
| `2150:5571` | Duration input candidates | Primitive decision | Duration control and validation |
| `351:2119` | Robot information panel | Domain component | Robot panel and operation actions |
| `1318:5125` | Compact Goalie telemetry header | Domain component | Robot header strip |
| `465:3008` | Quick toolbar | Structure | Media toolbar |
| `557:5447` | Quick toolbar states | Structure | Toolbar interaction states |
| `465:4485` | Expanded split selector | Structure | Camera layout selector |
| `465:3546` | Split layout icon matrix | Primitive | Layout choices and states |
| `465:4621` | Toolbar icon state matrix | Primitive | Split, microphone, change, fullscreen |
| `557:3515` | Edge collapse/expand handle | Primitive | Panel handle |
| `3411:24015` | Normal/emergency map markers | Domain component | Map marker |
| `3536:25686` | Microphone control and feedback | Domain control | Audio control |
| `3536:26447` | Emergency trigger | Safety control | Emergency action |
| `4021:36373` | Home without a registered Goalie | Template | Home empty state |
| `4027:36957` | Home with a registered/returning Goalie | Template | Home operation state |
| `3874:33505` | Video management | Pattern/template | Video search and player |
| `3874:44703` | Patrol management editor | Pattern/template | Patrol management |
| `2933:9118` | Emergency operation panel | Safety template | Emergency and recovery |
| `3536:24567` | Speaking operation panel | Audio template | Speaking mode |
| `2937:6167` | Five paused-operation variants | Operation template | Pause and resume |

## Confirmed source values

### Color · `230:2058`

```text
Primary: #31D3FF, #00C5FB, #00B4ED
Button: enabled #00B4ED, disabled #B3EEFE,
        hover #31D3FF, pressed #0098C8
Status: information #00B4ED, danger #FF3E31,
        success #4FDC5D, warning #FEDB25
Background: #FFFFFF, #F2F5F9, actual third fill #EEF7FA
Neutral: #000000, #1C2126, #282E35, #3C444E, #535C66,
         #626D77, #707D89, #84909B, #9BA4AD, #B7BDC3,
         #D8DBDF, #EFEFF0, #FFFFFF
Elevation: default 0 0 2 rgba(0,0,0,.25)
           active 1 1 4 rgba(0,0,0,.25)
           floating 2 2 8 rgba(0,0,0,.25)
```

### Button and switch · `351:2306` · `351:2435` · `329:4329`

```text
Button axes: tone primary|danger, variant contained|outlined|text|icon,
             size small 120×40|medium 160×48,
             state enabled|disabled|hover|pressed (+ browser focus)
Primary actual: enabled #00C5FB, hover #3CD5FF, pressed #0CA8DA,
                disabled #B3EEFE,
                subtle hover #E0F9FF, subtle pressed #CCEAF4
Danger actual: enabled #FF3E31, hover #FF6358, pressed #E03327,
               subtle hover #FFECEB, subtle pressed #F9D6D4,
               disabled 30% opacity
Switch: 60×24, knob 20×20 inside exported 28×28 shadow asset,
        manual #00B4ED, manual disabled #BFECFA,
        automatic #D8DBDF
```

Exact exported assets are pinned under `assets/goalie/`. Primary and danger
plus assets share identical bytes at each size; the switch knob exports also
share identical bytes between enabled modes and between disabled modes.

### Typography · `2051:3017`

```text
Head L   36 / Bold     / 140% / -2%
Head M   24 / Medium   / 140% / -2%
Head S   18 / SemiBold / rendered 120%, description 140% / -2%
Head XS  16 / Medium   / 120% / -2%
Body L   18 / Regular  / rendered 140%, description says Medium/120% / -2%
Body M   16 / Regular  / 120% / -2%
Body S   15 / Regular  / 120% / -2%
Button L 20 / SemiBold / 120% / -2%
Button M rendered 18, one description says 17 / SemiBold / 120% / -2%
Button S 17 / Medium   / 120% / -2%
Label    18 / Regular  / 120% / -2%
Caption  13 / Regular  / 120% / -2%
Family: Pretendard
```

## Recorded source defects and resolutions

| Source issue | Evidence | Current implementation decision |
|---|---|---|
| Black text swatch is labelled `#00C5FB` | Actual fill is black | Preserve black as `#000000`; record label defect |
| Third background swatch says `#E7F3F6` | Actual fill is `#EEF7FA` | Actual fill wins pending Figma correction |
| Palette enabled is `#00B4ED`; button component actual is `#00C5FB` | `230:2058` versus `351:2306` | Product brand semantic remains `#00B4ED`; Button component uses its actual `#00C5FB` |
| Palette pressed is `#0098C8`; button actual is `#0CA8DA` | `230:2058` versus `351:2306` | General pressed semantic remains `#0098C8`; Button component uses `#0CA8DA` |
| Head S description says 140%, rendered node is 120% | Same typography node | Rendered node wins for current token |
| Body L description says Medium/120%, rendered node is Regular/140% | Same typography node | Rendered node wins for current token |
| Button M description contains 17px; rendered specimens are 18px | Same typography node | Rendered 18px wins for current token |
| Battery and spinner were presented with the same `351:1032` link | Conversation/source mismatch | Treat `351:1032` as battery until another node is supplied |
| Several exported component screenshots have black surroundings | Transparent component canvas | Do not implement a dark Goalie theme from the screenshot background |

## Contrast decisions

| Fill | White text | `#1C2126` text | Decision |
|---|---:|---:|---|
| `#31D3FF` | 1.77:1 | 9.18:1 | dark production ink |
| `#00C5FB` | 2.02:1 | 8.02:1 | dark production ink |
| `#00B4ED` | 2.40:1 | 6.76:1 | dark production ink |
| `#0098C8` | 3.32:1 | 4.88:1 | dark ink remains default |
| `#FF3E31` | 3.51:1 | 4.62:1 | dark production ink |

The exact Figma fill remains a reference token. Accessible foreground choices
are component decisions in `tokens/goalie-tokens.css`.

## Independent product state axes

```text
connection: offline | connecting | online
driveMode: manual | automatic
operation: idle | queued | patrolling | paused | returning
safety: normal | emergency
audio: disconnected | connected | speaking | muted
battery: normal | warning | critical | charging
selection: none | robot | course | waypoint
cameraLayout: single | quad | primaryQuad | six
```

Priority: `safety > connection > operation > audio > battery > selection`.

## Open product decisions

- [x] Use component actual `#00C5FB` for Button; keep `#00B4ED` as product brand semantic.
- [x] Use component actual `#0CA8DA` for Button pressed; keep `#0098C8` for general pressed/focus.
- [x] Use actual background fill `#EEF7FA`; retain the visible `#E7F3F6` label as a source defect.
- [x] Use dark ink on bright Cyan and danger fills to meet production contrast requirements.
- [ ] Decide whether emergency activation confirms, executes immediately, or uses hold-to-confirm.
- [ ] Define emergency release permissions and authentication.
- [ ] Define audio behavior when emergency is activated.
- [ ] Approve the product's minimum supported operating resolution.
- [ ] Select the final patrol duration input and domain limits.
- [ ] Define waypoint reorder, duplicate mission and dirty-editor policies.
- [ ] Define the semantic meaning of colored video timeline segments.
- [ ] Supply evidence for Statistics and Settings before those templates are authored.

## Evidence completion rule

Every new Figma node must be added here before implementation. It must map to an
existing token/component/state where possible. A new component is created only
when the evidence cannot be expressed by an existing contract without changing
its meaning.
