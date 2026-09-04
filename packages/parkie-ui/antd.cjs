'use strict';

const deepFreeze = (value) => {
  Object.freeze(value);
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  }
  return value;
};

const isPlainObject = (value) => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const mergeTheme = (base, overrides) => {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides || {})) {
    result[key] = isPlainObject(value) && isPlainObject(base[key])
      ? mergeTheme(base[key], value)
      : value;
  }
  return result;
};

const parkieAntdTheme = deepFreeze({
  token: {
    colorPrimary: '#00AAFF',
    colorInfo: '#7CC7E8',
    colorSuccess: '#0FDC4C',
    colorWarning: '#F5DE2E',
    colorError: '#DF0000',
    colorBgBase: '#0F0F11',
    colorBgContainer: '#242425',
    colorBorder: 'rgba(255,255,255,0.12)',
    colorText: 'rgba(255,255,255,0.95)',
    colorTextSecondary: 'rgba(255,255,255,0.60)',
    borderRadius: 8,
    fontFamily: '"Pretendard", "Noto Sans KR", system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  components: {
    Button: {
      colorPrimary: '#00AAFF',
      colorPrimaryHover: '#16DCF2',
      colorPrimaryActive: '#009BE9',
      primaryColor: '#06222E',
      borderRadius: 8,
      fontWeight: 600,
    },
    Input: {
      activeBg: '#343436',
      hoverBg: '#343436',
      colorBgContainer: '#343436',
      colorBorder: '#343436',
      activeBorderColor: '#343436',
      hoverBorderColor: '#343436',
      colorText: 'rgba(255,255,255,0.60)',
      fontSize: 13,
    },
    Radio: {
      controlHeight: 30,
      colorBorder: 'rgba(255,255,255,0.45)',
      colorPrimary: '#00AAFF',
      buttonSolidCheckedColor: '#06222E',
      colorText: 'rgba(255,255,255,0.60)',
      fontSize: 13,
    },
    Switch: {
      trackMinWidth: 34,
      colorPrimary: '#00AAFF',
      colorPrimaryHover: '#16DCF2',
    },
  },
});

function createParkieAntdTheme(overrides = {}) {
  return mergeTheme(parkieAntdTheme, overrides);
}

module.exports = {
  createParkieAntdTheme,
  parkieAntdTheme,
};
