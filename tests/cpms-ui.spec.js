const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const CPMS_PAGES = [
  'overview', 'systemsummary', 'principles', 'colors', 'typography', 'layout',
  'shell', 'controls', 'data-display', 'states', 'permissions', 'accessibility',
  'governance',
];

const route = (pageId) => `/#/cpms/${pageId}`;

test('CPMS is an authored product and every declared route is canonical', async ({ page }) => {
  test.setTimeout(240_000);

  for (const pageId of CPMS_PAGES) {
    await page.goto('about:blank');
    await page.goto(route(pageId));
    await expect(page).toHaveURL(new RegExp(`#\/cpms\/${pageId}$`));
    await expect(page.locator('[data-guide-root]')).toHaveAttribute('data-active-system', 'cpms');
    await expect(page.locator(`[data-guide-sidebar] [data-nav-id="${pageId}"]`))
      .toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-cpms-pages]')).toHaveAttribute('data-cpms-page', pageId);
    await expect(page.locator('.ps-root'), `${pageId} must not fall back to ProductSkeleton`).toHaveCount(0);
    await expect(page.locator('[data-cpms-pages] .cpms-doc__truthbar')).toBeVisible();
    await expect(page.locator('[data-guide-root] h1')).not.toHaveText('');
    await expect(page.locator('[data-cpms-pages] h2').first()).toBeVisible();

    await page.reload();
    await expect(page.locator('[data-cpms-pages]')).toHaveAttribute('data-cpms-page', pageId);
  }

  const registry = await page.evaluate(() => window.__GUIDE_SYSTEMS.cpms);
  expect(registry.skeleton).toBe(false);
  expect(registry.tokens).toBe('tokens/cpms-tokens.css');
});

test('CPMS pages preserve the evidence hierarchy and maturity model', async ({ page }) => {
  await page.goto(route('systemsummary'));
  const sources = page.locator('.cpms-source-list > li');
  await expect(sources).toHaveCount(4);
  await expect(sources.nth(0)).toContainText('aws-cpms@32ff10f');
  await expect(sources.nth(1)).toContainText('main@f321694');
  await expect(page.locator('[data-cpms-pages]')).toContainText('tree 8b65ed36');
  await expect(page.locator('[data-cpms-pages]')).toContainText('reverted Astryx theme');

  await page.goto(route('governance'));
  const statuses = page.locator('.cpms-status-grid > article');
  await expect(statuses).toHaveCount(7);
  for (const kind of ['production', 'astryx', 'custom', 'legacy', 'target', 'historical', 'demo']) {
    await expect(page.locator(`.cpms-status-grid .cpms-badge--${kind}`)).toHaveCount(1);
  }
});

test('CPMS source primitives, semantic aliases and consumer references stay truthful', async () => {
  const tokenPath = path.join(process.cwd(), 'tokens', 'cpms-tokens.css');
  const componentPath = path.join(process.cwd(), 'components', 'cpms-documentation.css');
  const pagePath = path.join(process.cwd(), 'CPMSPages.dc.html');
  const tokens = fs.readFileSync(tokenPath, 'utf8');
  const component = fs.readFileSync(componentPath, 'utf8');
  const pages = fs.readFileSync(pagePath, 'utf8');

  expect(tokens).toContain('--cpms-source-sky: #00B4ED;');
  expect(tokens).toContain('--cpms-source-sky-deep: #007AA5;');
  expect(tokens).toContain('--cpms-source-navy: #002B68;');
  expect(tokens).toContain('--cpms-source-ink: #1A1A1A;');
  expect(tokens).toContain('--cpms-action-primary: var(--cpms-source-navy);');
  expect(tokens).toContain('--cpms-brand-accent: var(--cpms-source-sky);');
  expect(tokens).not.toMatch(/PLACEHOLDER|awaiting handover/i);
  expect(component, 'specimens must not hardcode palette values').not.toMatch(/#[0-9a-f]{3,8}\b/i);

  const declared = new Set([...tokens.matchAll(/(--cpms-[\w-]+)\s*:/g)].map((match) => match[1]));
  expect(declared.size).toBeGreaterThanOrEqual(180);
  const consumers = `${component}\n${pages}`;
  const referenced = new Set([...consumers.matchAll(/var\((--cpms-[\w-]+)/g)].map((match) => match[1]));
  expect([...referenced].filter((token) => !declared.has(token)).sort()).toEqual([]);
});

test('recommended CPMS text, action, status and focus pairs clear contrast', async ({ page }) => {
  await page.goto(route('colors'));
  const result = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px';
    document.querySelector('[data-product-root]').appendChild(probe);
    const read = (token) => {
      probe.style.color = '';
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color;
    };
    const parse = (source) => {
      const match = String(source).match(/rgba?\(([^)]+)\)/i);
      if (!match) throw new Error(`Unsupported computed color: ${source}`);
      const values = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return values.slice(0, 3);
    };
    const luminance = ([r, g, b]) => {
      const channel = (value) => {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const ratio = (foreground, background) => {
      const a = luminance(parse(read(foreground)));
      const b = luminance(parse(read(background)));
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const pairs = [
      ['--cpms-text', '--cpms-surface'],
      ['--cpms-text-secondary', '--cpms-surface'],
      ['--cpms-brand-accent-strong', '--cpms-surface'],
      ['--cpms-action-on-primary', '--cpms-action-primary'],
      ['--cpms-success', '--cpms-surface'],
      ['--cpms-warning', '--cpms-surface'],
      ['--cpms-danger', '--cpms-surface'],
      ['--cpms-info', '--cpms-surface'],
    ].map(([foreground, background]) => ({ foreground, background, ratio: ratio(foreground, background) }));
    const focus = ratio('--cpms-focus-color', '--cpms-surface');
    const currentRisk = ratio('--cpms-source-on-dark', '--cpms-source-sky');
    probe.remove();
    return { pairs, focus, currentRisk };
  });

  for (const pair of result.pairs) {
    expect(pair.ratio, `${pair.foreground} on ${pair.background}`).toBeGreaterThanOrEqual(4.5);
  }
  expect(result.focus, 'focus indicator must clear non-text contrast').toBeGreaterThanOrEqual(3);
  expect(result.currentRisk, 'the documented white-on-Sky source combination must remain classified as a risk')
    .toBeLessThan(4.5);
});

test('all CPMS authored body copy switches cleanly to English', async ({ page }) => {
  const koreanCount = (value) => (value.match(/[\uac00-\ud7a3]/g) || []).length;
  await page.goto(route('overview'));
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  for (const pageId of CPMS_PAGES) {
    await page.goto(route(pageId));
    await expect(page.locator('[data-cpms-pages]')).toHaveAttribute('lang', 'en');
    /* The glyph specimen is excluded on purpose: it demonstrates the typeface's
       Hangul coverage, so translating it away would delete the thing it exists
       to show. Everything else is copy and must switch. */
    const body = await page.locator('[data-cpms-pages]').evaluate((node) => {
      const clone = node.cloneNode(true);
      for (const specimen of clone.querySelectorAll('[data-glyph-specimen]')) specimen.remove();
      return clone.innerText;
    });
    expect(koreanCount(body), `${pageId} contains untranslated Korean copy`).toBe(0);
  }
});

test('every CPMS route has an accessible structure', async ({ page }) => {
  test.setTimeout(300_000);
  for (const pageId of CPMS_PAGES) {
    await page.goto(route(pageId));
    const results = await new AxeBuilder({ page }).include('[data-cpms-pages]').analyze();
    expect(results.violations, `${pageId} axe violations`).toEqual([]);
  }
});

test('CPMS routes reflow without document overflow at review widths', async ({ page }) => {
  test.setTimeout(300_000);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const pageId of CPMS_PAGES) {
      await page.goto(route(pageId));
      const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        product: document.querySelector('[data-product-root]').scrollWidth
          - document.querySelector('[data-product-root]').clientWidth,
      }));
      expect(overflow.document, `${pageId}@${width} document overflow`).toBeLessThanOrEqual(1);
      expect(overflow.product, `${pageId}@${width} product overflow`).toBeLessThanOrEqual(1);
    }
  }
});

/* The typography page used to describe sizes without ever naming the typeface,
   so a reader could finish it without learning the product is set in Pretendard.
   The value lives in tokens/cpms-tokens.css; this component has no mount hook to
   read it off the live variable, so the page transcribes it and this test keeps
   the transcription honest. */
test('the typography page names the typeface and matches the token file', async ({ page }) => {
  const tokens = fs.readFileSync(path.join(process.cwd(), 'tokens', 'cpms-tokens.css'), 'utf8');
  const declared = (name) => {
    const match = tokens.match(new RegExp(`--cpms-font-${name}:\\s*([^;]+);`));
    expect(match, `--cpms-font-${name} must be declared`).not.toBeNull();
    return match[1].trim();
  };

  await page.goto('/#/cpms/typography');
  await expect(page.locator('.cpms-face__display')).toHaveText('Pretendard');

  /* Rendered in the face it documents, not merely named. */
  const specimenFont = await page.locator('.cpms-face__specimen')
    .evaluate((node) => getComputedStyle(node).fontFamily.split(',')[0].replace(/"/g, '').trim());
  expect(specimenFont, 'the specimen must render in Pretendard').toBe('Pretendard');

  const shown = await page.locator('[data-font-stack]').allTextContents();
  const shownTokens = await page.locator('[data-font-token]').allTextContents();
  expect(shownTokens.map((t) => t.trim())).toEqual(['--cpms-font-sans', '--cpms-font-mono']);
  expect(shown[0].trim(), 'the sans stack must match the token file').toBe(declared('sans'));
  expect(shown[1].trim(), 'the mono stack must match the token file').toBe(declared('mono'));

  /* Four weights, because the scale leans on them for hierarchy. */
  const weights = await page.locator('.cpms-face__weights > span')
    .evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).fontWeight));
  expect(weights).toEqual(['400', '500', '600', '700']);

  /* Size alone does not say how the text sits. Every row carries size, weight,
     line height and letter spacing — and the line height must be a real leading
     token, not the 1.35 the rows used to hard-code. */
  const leadings = new Set(
    (tokens.match(/--cpms-leading-[a-z]+:\s*([\d.]+);/g) || [])
      .map((line) => line.split(':')[1].replace(';', '').trim()),
  );
  const metas = await page.locator('[data-type-meta]').allTextContents();
  expect(metas.length, 'every scale step needs metrics').toBe(7);
  for (const meta of metas) {
    const parts = meta.split('·').map((part) => part.trim());
    expect(parts.length, `"${meta}" must list size, weight, leading and tracking`).toBe(4);
    expect(parts[0]).toMatch(/^\d+px$/);
    expect(leadings.has(parts[2]), `line height ${parts[2]} must be a declared leading token`).toBe(true);
  }
});
