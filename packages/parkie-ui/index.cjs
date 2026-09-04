'use strict';

const freeze = (value) => Object.freeze(value);

const parkiePackage = freeze({
  name: '@designerkei/parkie-ui',
  version: '0.1.0',
  system: 'parkie',
  defaultTheme: 'dark',
  defaultColorMode: 'dark',
});

const parkieUiRegistrySmoke = Object.freeze({
  name: parkiePackage.name,
  ready: true,
});

const parkieTokens = freeze({
  color: freeze({
    brand: freeze({
      50: '#EDFDFF',
      100: '#D1FAFF',
      200: '#A5F4FC',
      300: '#16DCF2',
      400: '#00C8FF',
      500: '#00AAFF',
      600: '#009BE9',
      700: '#007CBD',
      800: '#08638F',
      900: '#0D4F70',
      950: '#06222E',
    }),
    neutral: freeze({
      50: '#FAFAFA',
      100: '#F4F4F5',
      200: '#E4E4E7',
      300: '#D4D4D8',
      400: '#A1A1AA',
      500: '#71717A',
      600: '#5A5A61',
      700: '#4C4C4D',
      800: '#343436',
      900: '#242426',
      950: '#131315',
    }),
    success: '#0FDC4C',
    warning: '#F5DE2E',
    danger: '#DF0000',
    info: '#7CC7E8',
    emergency: '#FF1D1D',
    canvas: '#0F0F11',
    text: 'rgba(255,255,255,0.95)',
    textSecondary: 'rgba(255,255,255,0.60)',
  }),
  font: freeze({
    sans: '"Pretendard", "Noto Sans KR", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: '"Roboto Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
    size: freeze({
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '15px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '30px',
      '5xl': '38px',
      '6xl': '48px',
    }),
  }),
  radius: freeze({
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '999px',
    round: '50%',
  }),
  space: freeze({
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '32px',
    8: '40px',
    9: '48px',
    10: '64px',
    11: '80px',
    12: '96px',
  }),
});

const parkieCssVariables = freeze({
  '--parkie-bg': 'var(--parkie-color-common-canvas)',
  '--parkie-text': 'rgba(255,255,255,0.95)',
  '--parkie-text-secondary': 'rgba(255,255,255,0.60)',
  '--parkie-surface': 'var(--parkie-surface-elevation-00)',
  '--parkie-surface-2': 'var(--parkie-surface-elevation-01)',
  '--parkie-surface-3': 'var(--parkie-surface-elevation-02)',
  '--parkie-border': 'var(--parkie-alpha-white-09)',
  '--parkie-brand-primary': 'var(--parkie-color-brand-500)',
  '--parkie-brand-primary-hover': 'var(--parkie-color-brand-300)',
  '--parkie-brand-primary-active': 'var(--parkie-color-brand-600)',
  '--parkie-brand-on': 'var(--parkie-color-brand-950)',
  '--parkie-action-primary-bg': 'var(--parkie-color-brand-500)',
  '--parkie-action-primary-bg-hover': 'var(--parkie-color-brand-300)',
  '--parkie-action-primary-bg-pressed': 'var(--parkie-color-brand-600)',
  '--parkie-action-primary-fg': 'var(--parkie-brand-on)',
  '--parkie-action-danger-bg': '#DF0000',
  '--parkie-action-danger-bg-hover': 'var(--parkie-color-red-700)',
  '--parkie-action-danger-bg-pressed': 'var(--parkie-color-red-800)',
  '--parkie-action-danger-fg': '#FFFFFF',
});

function createParkieThemeAttributes(overrides = {}) {
  return {
    'data-system': overrides.system || parkiePackage.system,
    'data-color-mode': overrides.colorMode || parkiePackage.defaultColorMode,
    'data-theme': overrides.theme || parkiePackage.defaultTheme,
  };
}

function getParkieCssVariable(name) {
  return parkieCssVariables[name] || null;
}

function createParkieTokenStyleText(options = {}) {
  const selector = options.selector || ':root[data-system="parkie"][data-color-mode="dark"],\n[data-system="parkie"][data-color-mode="dark"]';
  const declarations = Object.entries(parkieCssVariables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${selector} {\n${declarations}\n}`;
}

module.exports = {
  createParkieThemeAttributes,
  createParkieTokenStyleText,
  getParkieCssVariable,
  parkieCssVariables,
  parkiePackage,
  parkieTokens,
  parkieUiRegistrySmoke,
};
