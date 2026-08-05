/* The component pages download their specimens as SVG.
 *
 * What is worth asserting here is not "a zip appeared" but the two things that go
 * wrong silently. First, unresolved paint: a var() or a currentColor that survives
 * into the file opens as black artwork in a design tool rather than as an error, so
 * the exporter looks like it worked. Second, states collapsing into each other: a
 * pseudo-element that fails to serialise takes the switch knob, the checkbox tick
 * and the radio dot with it, and every specimen in that group still exports at the
 * right size with the right plate — just identical to its neighbours. Both of those
 * were real failures during the build, and neither shows up as an exception.
 *
 * Counts come from the DOM rather than a list here, so adding a specimen to a page
 * cannot leave a stale expectation behind.
 */
const { test, expect } = require('@playwright/test');

/* Reads the archive without going back through the writer that produced it, so a
   malformed header fails here instead of round-tripping cleanly. Entries are
   stored, never deflated, which is what makes a reader this small correct. */
function readStoredZip(buffer) {
  const entries = new Map();
  let at = 0;
  while (at + 4 <= buffer.length && buffer.readUInt32LE(at) === 0x04034b50) {
    const method = buffer.readUInt16LE(at + 8);
    const size = buffer.readUInt32LE(at + 18);
    const nameLength = buffer.readUInt16LE(at + 26);
    const extraLength = buffer.readUInt16LE(at + 28);
    const name = buffer.subarray(at + 30, at + 30 + nameLength).toString('utf8');
    const start = at + 30 + nameLength + extraLength;
    if (method !== 0) throw new Error(`${name} is not stored`);
    entries.set(name, buffer.subarray(start, start + size).toString('utf8'));
    at = start + size;
  }
  if (!entries.size) throw new Error('no local file headers found');
  return entries;
}

/* Every page the manifest declares, with the archive name it must produce. The
   slug is deliberately not the route id: filenames stay stable and readable while
   route ids stay short. */
const PAGES = [
  { route: 'button', slug: 'button' },
  { route: 'segmented', slug: 'segmented' },
  { route: 'selection', slug: 'selection' },
  { route: 'select', slug: 'site-select' },
  { route: 'badge', slug: 'badge' },
  { route: 'statuslabel', slug: 'status-label' },
  { route: 'alert', slug: 'alert' },
  { route: 'alertfeed', slug: 'alert-feed-item' },
  { route: 'topbar', slug: 'top-bar' },
  { route: 'robotcard', slug: 'robot-card' },
  { route: 'media', slug: 'media-emergency' },
];

async function open(page, route) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/index.html#/parkie/${route}`);
  await expect(page.locator('[data-specimen-download]')).toBeVisible();
  return errors;
}

async function download(page) {
  const started = page.waitForEvent('download');
  await page.locator('[data-specimen-download]').click();
  const file = await started;
  const stream = await file.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return { name: file.suggestedFilename(), entries: readStoredZip(Buffer.concat(chunks)) };
}

for (const { route, slug } of PAGES) {
  test(`the ${route} page downloads its specimens as tool-ready SVG`, async ({ page }) => {
    const errors = await open(page, route);

    /* The label states a number and the page holds the specimens; if those two
       disagree the reader is told they are getting files that are not there. */
    const declared = await page.locator('[data-spec]').count();
    expect(declared, 'the page must render at least one specimen').toBeGreaterThan(0);
    const label = await page.locator('[data-specimen-download]').innerText();
    expect(label, `the label must state the specimen count, got "${label}"`)
      .toContain(String(declared));

    const { name, entries } = await download(page);
    expect(name).toBe(`parkie-${slug}.zip`);

    const svgs = [...entries.keys()].filter((key) => key.startsWith('svg/'));
    expect(svgs, 'one file per specimen on the page').toHaveLength(declared);
    expect(entries.has('sheet.svg'), 'the state sheet must be included').toBe(true);
    expect(entries.has('README.txt'), 'the archive must explain itself').toBe(true);

    for (const [file, text] of entries) {
      if (!file.endsWith('.svg')) continue;

      /* A design tool renders an unresolved token as black rather than refusing
         the file, so the export looks successful and the artwork is wrong. */
      expect(text, `${file} must not carry currentColor`).not.toContain('currentColor');
      expect(text, `${file} must not carry an unresolved var()`).not.toContain('var(');
      expect(text, `${file} must not carry color-mix()`).not.toContain('color-mix(');
      /* SVG 1.1 paint attributes have no alpha channel; the opacity travels in a
         sibling attribute. Illustrator rejects the combined form outright. */
      expect(text, `${file} must split alpha out of its paint`)
        .not.toMatch(/(?:fill|stroke)="(?:rgba?|color)\(/);

      expect(text.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), `${file} must be standalone`)
        .toBe(true);
      expect(text, `${file} must declare a viewBox`).toContain('viewBox="');
    }

    /* SVG is XML, and the tools these files exist for parse it strictly. Browsers do
       not: every one of these rendered correctly in preview while 84 of 89 were
       malformed, because a computed font-family carries quotes that closed the
       attribute holding it. Nothing short of a real XML parse sees that. */
    const malformed = await page.evaluate((files) => files.filter(([, text]) => {
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      return doc.querySelector('parsererror') !== null;
    }).map(([name]) => name), [...entries].filter(([name]) => name.endsWith('.svg')));
    expect(malformed, 'every exported SVG must be well-formed XML').toEqual([]);

    expect(errors, 'the export must not throw').toEqual([]);
  });
}

/* The failure this is here for: when a pseudo-element stops serialising, the
   switch knob, the checkbox tick and the radio dot all disappear at once, and
   every affected specimen still exports at the right size with the right plate.
   Only comparing the drawing between states catches it. */
test('selection specimens differ between states rather than sharing one drawing', async ({ page }) => {
  await open(page, 'selection');

  /* The ink the marks are drawn in, read from the page rather than written down
     here. Counting shapes is not enough on its own: a checked box that lost its
     tick still draws a plate and a border, which is two shapes against the empty
     box's one, and an earlier version of this test passed with the tick deleted. */
  const inkColour = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--parkie-brand-on)';
    document.body.appendChild(probe);
    const [r, g, b] = getComputedStyle(probe).color.match(/\d+/g).map(Number);
    probe.remove();
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  });

  const { entries } = await download(page);

  const shapes = (text) => text.replace(/<svg[^>]*>|<\/svg>|\s+/g, '')
    .replace(/<rect width="[\d.]+" height="[\d.]+"[^>]*\/>/, '');

  const groups = {
    switch: ['svg/switch-on.svg', 'svg/switch-off.svg'],
    checkbox: ['svg/checkbox-unchecked.svg', 'svg/checkbox-checked.svg'],
    radio: ['svg/radio-selected.svg', 'svg/radio-unselected.svg'],
  };

  for (const [group, files] of Object.entries(groups)) {
    const drawings = files.map((file) => {
      const text = entries.get(file);
      expect(text, `${file} must be in the archive`).toBeTruthy();
      return shapes(text);
    });
    expect(new Set(drawings).size, `${group} states must not export the same drawing`)
      .toBe(files.length);
  }

  const shapeCount = (text) => (text.match(/<(?:rect|path|circle|line)\b/g) || []).length;
  const paints = (text) => new Set((text.match(/(?:fill|stroke)="#[0-9A-F]{6}"/g) || []));

  /* The tick is a pseudo-element, and its absence is invisible to a shape count. */
  const checked = entries.get('svg/checkbox-checked.svg');
  const unchecked = entries.get('svg/checkbox-unchecked.svg');
  expect(checked, `the checked box must draw its tick in ${inkColour}`).toContain(inkColour);
  expect(unchecked, 'the empty box must not').not.toContain(inkColour);

  /* Track and knob are both pseudo-elements, and both are painted in the same brand
     hex — the track only differs by an opacity — so counting colours does not notice
     either one going missing. Their geometry does: the track is a pill, wider than it
     is tall, and the knob is round, width equal to height. The artboard plate carries
     no x, so requiring one keeps it out of the count. */
  const innerRects = (text) => [
    ...text.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g),
  ].map((m) => ({ w: Number(m[3]), h: Number(m[4]) }));

  for (const state of ['on', 'off', 'disabled']) {
    const rects = innerRects(entries.get(`svg/switch-${state}.svg`));
    expect(rects.some((r) => r.w > r.h), `switch-${state} must draw its track`).toBe(true);
    expect(rects.some((r) => r.w === r.h), `switch-${state} must draw its knob`).toBe(true);
    expect(paints(entries.get(`svg/switch-${state}.svg`)).size,
      `switch-${state} must paint more than one thing`).toBeGreaterThanOrEqual(2);
  }

  const selected = entries.get('svg/radio-selected.svg');
  const unselected = entries.get('svg/radio-unselected.svg');
  expect(shapeCount(selected), 'the selected radio must draw its dot')
    .toBeGreaterThan(shapeCount(unselected));
});

/* The bundle walks the hash router because a specimen exists only while its page is
   mounted. Two things there are worth holding: that it does not quietly ship fewer
   folders than it advertises — a component missing from the archive reads as "that
   one has no specimens" — and that it puts the reader back where they were. */
test('the downloads page bundles every documented component and restores the route', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/index.html#/parkie/iconography');
  await expect(page.locator('h1')).toBeVisible();
  await page.goto('/index.html#/parkie/downloads');

  const button = page.locator('[data-specimen-bundle]');
  await expect(button).toBeVisible();

  const listed = await page.locator('.pk-layer-table tbody tr').count();
  expect(listed, 'the page must list what the archive will contain').toBe(PAGES.length);

  const started = page.waitForEvent('download', { timeout: 150_000 });
  await button.click();
  const file = await started;
  const stream = await file.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const entries = readStoredZip(Buffer.concat(chunks));

  expect(file.suggestedFilename()).toBe('parkie-components.zip');

  /* One numbered folder per component, in the order the sidebar lists them. */
  const folders = [...new Set([...entries.keys()]
    .filter((key) => key.includes('/'))
    .map((key) => key.split('/')[0]))];
  expect(folders, 'every documented component must have a folder').toHaveLength(PAGES.length);
  PAGES.forEach(({ slug }, index) => {
    expect(folders[index]).toBe(`${String(index + 1).padStart(2, '0')}-${slug}`);
    expect(entries.has(`${folders[index]}/sheet.svg`), `${slug} must carry its sheet`).toBe(true);
  });

  const readme = entries.get('README.txt');
  expect(readme, 'the archive must explain itself').toBeTruthy();
  expect(readme, 'a component that could not be collected must be named, not just absent')
    .not.toContain('Not collected');

  for (const [name, text] of entries) {
    if (!name.endsWith('.svg')) continue;
    expect(text, `${name} must not carry unresolved paint`).not.toContain('var(');
    expect(text, `${name} must not carry currentColor`).not.toContain('currentColor');
  }

  await expect(page).toHaveURL(/#\/parkie\/downloads$/);
  await expect(button, 'the button must be usable again once the walk finishes').toBeEnabled();
  expect(errors, 'walking the router must not throw').toEqual([]);
});

/* The focus specimen is the one place the export has to carry an alpha, because the
   ring is 62% cyan. If splitColor cannot read the colour Chrome serialises for
   color-mix(), the ring resolves to #000000 and vanishes into the dark artboard
   without any error at all. */
test('the exported focus ring keeps its colour and its alpha', async ({ page }) => {
  await open(page, 'button');
  const { entries } = await download(page);

  const focus = entries.get('svg/states-focus-visible.svg');
  expect(focus, 'the focus specimen must be in the archive').toBeTruthy();
  expect(focus, 'the ring must be stroked, not filled').toMatch(/stroke="#[0-9A-F]{6}"/);
  expect(focus, 'a ring drawn in #000000 means the colour was not understood')
    .not.toContain('stroke="#000000"');

  const rest = entries.get('svg/states-rest.svg');
  expect(focus.length, 'the focus specimen must draw more than rest').toBeGreaterThan(rest.length);
});
