# Parkie RMS Design System Audit

Date: 2026-08-01
Scope: System Summary, all Foundation tabs, Status & Feedback, and Navigation & Structure (17 destinations)

## Decision

RMS remains the information and component architecture. Parkie supplies the visual language, typography, brand, interaction states, robot-domain iconography and operating guidance. Microsoft material remains a clearly separated reference source and is not presented as Parkie-original work.

The audit is defect-driven rather than pass-count-driven. Any product or test change resets the clean-pass count. Release requires three consecutive clean full-suite runs after the final change.

## Audited destinations

- System Summary
- Foundations: Colors, Typography, Spacing, Radius, Elevation, Iconography
- Status & Feedback: Badge, Status Label, Alert, Alert Feed Item
- Navigation & Structure: Top Bar, Tabs, Breadcrumb, Card, Table, Avatar

Each destination now exposes the same minimum documentation contract:

1. When to use
2. Behavior and structure
3. Accessibility
4. Implementation rules

## Quality gates

| Gate | Automated evidence | Release requirement |
| --- | --- | --- |
| Information architecture | 17 unique deep links, current-page state, browser history, bilingual search | All pass |
| Documentation depth | One four-part component-specific contract per destination | 17/17 |
| Accessibility | axe-core scan of the complete rendered application | Zero reported violations in all 17 closed states and the open combobox state |
| Responsive behavior | 1440, 900 and 390px; document and main-region overflow checks | No page-level horizontal overflow |
| Keyboard behavior | Tabs, role radios and site combobox | Arrow/Home/End/Escape/Enter behavior and roving focus pass |
| Semantics | Headings, landmarks, list rows, breadcrumbs, tables, avatars | Complete names, relationships and current states |
| Theme contract | CSS source inspection and rendered state | Dark fixed; hidden theme control; new tokens duplicated in `:root` and dark scope |
| Existing product recipes | Original UI and screenshot regression suite | No regression |

Run the audit directly with:

```sh
npm run test:audit
```

Run the complete release suite with:

```sh
npm test
```

## Defects removed

- Repaired the System Summary selection-control destination that previously prevented initial rendering.
- Raised tertiary text contrast at the token source in both required scopes.
- Added focusability and a programmatic title to the scrollable main region.
- Added valid image semantics to icon-state specimens.
- Added an accessible name to the site combobox.
- Corrected role-segment, danger-state, alert CTA and avatar contrast recipes.
- Replaced invalid list-item roles and repaired skipped heading levels and duplicate landmark names.
- Added URL deep links, browser history, current-page state and working bilingual navigation search.
- Expanded the System Summary index from 10 mixed destinations to all 17 audited destinations.
- Added complete keyboard and ARIA relationships to Tabs, role radios and the site combobox.
- Added breadcrumb current-location semantics, table caption/scoped headers, card article headings and avatar names.
- Contained the full Top Bar specimen at laptop and narrow widths without leaking overflow to the page.

## Standards used

Normative and platform guidance:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Microsoft Fluent 2](https://fluent2.microsoft.design/)
- [Meta: Building Accessibility Into Our Mixed Reality Products](https://about.fb.com/news/2024/07/building-accessibility-into-our-mixed-reality-products/)

Behance and Pinterest references were used only to evaluate visual pacing and presentation. They did not override platform or accessibility requirements.

## Release gate

- Product or test changes reset the clean-run counter.
- Release requires three consecutive clean full-suite runs after the final change.
- Mutation check: changing the root danger-hover foreground token while leaving the dark scope intact was detected by the token contract test (expected 2 declarations, received 1). The mutation was immediately reverted before clean-run certification.
- Production must serve the same commit that passed the final checks.

## Residual-risk policy

Automated accessibility checks do not replace assistive-technology testing. The release gate therefore combines DOM semantics, keyboard interaction, contrast analysis, responsive screenshots and regression tests. Any later component, token or information-architecture change must rerun the full suite and restart the clean-pass count.
