/* Goalie accessibility audit, as a gate.
 *
 * tests/tools/goalie-audit.js is the same measurement with a readable report;
 * its header carries the reasoning, including the two classes of false positive
 * that had to be fixed before any of this was worth asserting. Read it before
 * changing anything here.
 *
 * The border check deliberately covers only edges that identify a component or
 * a state. It used to cover every border and returned roughly 290 findings that
 * were almost all --goalie-border card dividers, which WCAG 1.4.11 does not
 * reach. Narrowing a check is how a gate quietly stops gating, so this file
 * asserts the narrowing itself: decoration must be excluded in bulk, and the
 * things that do carry state must still be measured.
 *
 * The open findings are pinned rather than reduced to a number. A count alone
 * lets one defect be fixed while another appears and the total stays put.
 */
const { test, expect } = require('@playwright/test');
const { PAGES, auditPage } = require('./tools/goalie-audit');

/* Everything the audit currently reports, by kind. These are open items, not
   approvals — the point is that the set cannot grow without this failing, and
   cannot shrink without someone updating it and saying why. */
const OPEN = [
  'button|gl-switch|track',
  'iconography|gl-switch|track',
  'iconography|sc-interp|text',
  'input|BUTTON|borderTop',
  'input|gl-number-stepper|borderLeft',
  'input|gl-number-stepper|borderTop',
  'input|gl-select-trigger|borderLeft',
  'input|gl-select-trigger|borderTop',
  'input|gl-time-trigger|borderLeft',
  'input|gl-time-trigger|borderTop',
  'patrol|BUTTON|borderTop',
  'patrol|gl-select-trigger|borderLeft',
  'patrol|gl-select-trigger|borderTop',
  'patrol|gl-time-trigger|borderLeft',
  'patrol|gl-time-trigger|borderTop',
  'status|gl-alert-history__list|focus ring',
  'templates|BUTTON|borderLeft',
  'templates|BUTTON|borderTop',
  'templates|gl-switch|track',
];

test('Goalie pages report no accessibility defect beyond the pinned set', async ({ page }) => {
  test.setTimeout(600_000);

  const found = [];
  let decorativeSkipped = 0;
  const structural = [];

  for (const id of PAGES) {
    const r = await auditPage(page, id);
    decorativeSkipped += r.decorativeSkipped;

    for (const f of r.textFails) found.push(`${id}|${f.cls}|text`);
    for (const f of r.edgeFails) found.push(`${id}|${f.cls}|${f.what}`);
    for (const f of r.focusFails) found.push(`${id}|${f.cls}|${f.what}`);

    /* These are clean today and cheap to keep clean, so they get no allowance. */
    if (r.smallTargets.length) structural.push(`${id}: small targets ${JSON.stringify(r.smallTargets)}`);
    if (r.skips.length) structural.push(`${id}: heading skips ${r.skips.join(', ')}`);
    if (r.dupIds.length) structural.push(`${id}: duplicate ids ${r.dupIds.join(', ')}`);
    if (r.overflow > 1) structural.push(`${id}: horizontal overflow ${r.overflow}px`);
  }

  expect(structural, 'targets, heading order, ids and overflow must stay clean').toEqual([]);

  const unique = [...new Set(found)].sort();
  const appeared = unique.filter((k) => !OPEN.includes(k));
  const disappeared = OPEN.filter((k) => !unique.includes(k));

  expect(appeared, 'a new accessibility defect appeared').toEqual([]);
  expect(
    disappeared,
    'these were fixed — remove them from OPEN and say so in the commit',
  ).toEqual([]);

  /* The narrowing is the load-bearing part of this audit, so it is asserted
     rather than trusted. If decoration stopped being excluded the count would
     collapse toward zero and the border check would be back to reporting card
     dividers; if the state edges stopped being measured, OPEN would empty out
     and the check above would catch it. */
  expect(
    decorativeSkipped,
    'decorative hairlines must be excluded, not measured',
  ).toBeGreaterThan(300);
});
