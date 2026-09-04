'use strict';

const React = require('react');
const { createParkieThemeAttributes } = require('./index.cjs');

const h = React.createElement;
const cx = (...parts) => parts.filter(Boolean).join(' ');

const buttonVariantClass = {
  primary: '',
  secondary: 'pk-button--secondary',
  outline: 'pk-button--outline',
  subtle: 'pk-button--subtle',
  ghost: 'pk-button--ghost',
  danger: 'pk-button--danger',
};

const buttonSizeClass = {
  compact: 'pk-button--compact',
  default: '',
  large: 'pk-button--large',
};

const ParkieProvider = React.forwardRef(function ParkieProvider(
  { as: Component = 'div', className, colorMode, system, theme, ...props },
  ref,
) {
  return h(Component, {
    ...props,
    ...createParkieThemeAttributes({ colorMode, system, theme }),
    className: cx('pk-theme', className),
    ref,
  });
});

const ParkieButton = React.forwardRef(function ParkieButton(
  {
    as: Component = 'button',
    children,
    className,
    disabled,
    fullWidth = false,
    loading = false,
    size = 'default',
    type = 'button',
    variant = 'primary',
    ...props
  },
  ref,
) {
  const spinner = loading ? h('span', { 'aria-hidden': true, className: 'pk-button-spinner' }) : null;
  return h(Component, {
    ...props,
    'aria-busy': loading || props['aria-busy'] || undefined,
    className: cx(
      'pk-button',
      buttonVariantClass[variant],
      buttonSizeClass[size],
      fullWidth && 'pk-button--full',
      loading && 'is-loading',
      className,
    ),
    disabled,
    ref,
    type: Component === 'button' ? type : undefined,
  }, spinner, children);
});

const ParkieIconButton = React.forwardRef(function ParkieIconButton(
  { as: Component = 'button', className, danger = false, size = 'default', type = 'button', ...props },
  ref,
) {
  return h(Component, {
    ...props,
    className: cx(
      'pk-icon-button',
      size === 'compact' && 'pk-icon-button--compact',
      size === 'default' && 'pk-icon-button--default',
      size === 'large' && 'pk-icon-button--large',
      danger && 'pk-icon-button--danger',
      className,
    ),
    ref,
    type: Component === 'button' ? type : undefined,
  });
});

const ParkiePanel = React.forwardRef(function ParkiePanel(
  { as: Component = 'section', className, elevated = false, ...props },
  ref,
) {
  return h(Component, {
    ...props,
    className: cx('pk-panel', elevated && 'pk-panel--elevated', className),
    ref,
  });
});

const ParkieBadge = React.forwardRef(function ParkieBadge(
  { as: Component = 'span', className, tone = 'neutral', ...props },
  ref,
) {
  return h(Component, {
    ...props,
    className: cx('pk-badge', `pk-badge--${tone}`, className),
    ref,
  });
});

const ParkieSegmented = React.forwardRef(function ParkieSegmented(
  { className, disabled = false, items = [], onChange, size = 'compact', value, ...props },
  ref,
) {
  return h('div', {
    ...props,
    'aria-disabled': disabled || undefined,
    className: cx('pk-segmented', size === 'default' && 'pk-segmented--default', disabled && 'is-disabled', className),
    ref,
    role: 'radiogroup',
  }, items.map((item) => h('button', {
    'aria-checked': item.value === value,
    disabled: disabled || item.disabled,
    key: item.value,
    onClick: () => onChange?.(item.value, item),
    role: 'radio',
    type: 'button',
  }, item.label)));
});

const ParkieSwitch = React.forwardRef(function ParkieSwitch(
  { checked = false, className, onCheckedChange, type = 'button', ...props },
  ref,
) {
  return h('button', {
    ...props,
    'aria-checked': checked,
    className: cx('pk-switch', className),
    onClick: (event) => {
      props.onClick?.(event);
      if (!event.defaultPrevented) onCheckedChange?.(!checked, event);
    },
    ref,
    role: 'switch',
    type,
  });
});

const ParkieCheckbox = React.forwardRef(function ParkieCheckbox(
  { children, className, inputProps, ...props },
  ref,
) {
  return h('label', { className: cx('pk-choice-field', className) },
    h('input', { ...inputProps, ...props, ref, type: 'checkbox' }),
    h('span', null, children),
  );
});

const ParkieRadio = React.forwardRef(function ParkieRadio(
  { children, className, inputProps, ...props },
  ref,
) {
  return h('label', { className: cx('pk-choice-field', className) },
    h('input', { ...inputProps, ...props, ref, type: 'radio' }),
    h('span', null, children),
  );
});

module.exports = {
  ParkieBadge,
  ParkieButton,
  ParkieCheckbox,
  ParkieIconButton,
  ParkiePanel,
  ParkieProvider,
  ParkieRadio,
  ParkieSegmented,
  ParkieSwitch,
};
