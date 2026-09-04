// Components.d.ts — the complete catalog of the 27 component(s) in
// Components.bundle.js. READ THIS FILE BEFORE USING THE BUNDLE: component
// names are derived from Figma layer names (sanitized to PascalCase,
// deduplicated) and may differ from what the design calls them — the
// "figma layer" comment above each interface maps them back.
// After the bundle <script> loads, every component is a window global
// (e.g. window.Badge) and usable directly in JSX.
import * as React from 'react';

// figma layer: "Badge" (node 8120:36474)
export interface BadgeProps {
  className?: string;
  style?: React.CSSProperties;
  divider?: boolean;
  iconAfter?: boolean;
  iconBefore?: boolean;
  intent?: "informative" | "brand";
  size?: "sm" | "lg" | "larger";
  label?: boolean;
  shape?: "rounded rectangle" | "circle";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: ".Base1" (node 8120:28206)
export interface Base1Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "md" | "sm";
  /** Text content; defaults to "Placeholder text". */
  text1?: string;
  /** Text content; defaults to "Entered text". */
  text2?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: ".Base1" (node 9323:436208)
export interface Base17Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: ".Base" (node 8120:34662)
export interface Base2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "lg" | "larger";
  /** Text content; defaults to "Badge". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: ".Base2" (node 10288:550444)
export interface Base210Props {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Tooltip". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon4?: React.ReactNode;
}

// figma layer: ".Base2" (node 8120:147143)
export interface Base2_Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "md" | "sm";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: ".Base" (node 9325:626938)
export interface Base5Props {
  className?: string;
  style?: React.CSSProperties;
  status?: "unchecked" | "checked" | "indeterminate";
  state?: "rest" | "hover" | "pressed" | "focus" | "disabled";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: ".Base" (node 8095:4887)
export interface Base7Props {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Button". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
}

// figma layer: "Button" (node 8095:4406)
export interface ButtonProps {
  className?: string;
  style?: React.CSSProperties;
  appearance?: "default" | "primary" | "outline" | "subtle" | "inverted";
  iconPosition?: "-" | "before" | "after";
  loading?: boolean;
  size?: "sm" | "md";
  state?: "rest" | "hover" | "pressed" | "active" | "focus" | "disabled";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Checkbox" (node 10289:557420)
export interface CheckboxProps {
  className?: string;
  style?: React.CSSProperties;
  label?: boolean;
  state?: "rest" | "hover" | "pressed" | "focus" | "disabled";
  status?: "unchecked" | "checked" | "indeterminate";
  /** Text content; defaults to "Label". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Checkmark" (node 9324:461220)
export interface CheckmarkProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "32" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "Checkmark Circle" (node 8120:147169)
export interface CheckmarkCircle2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "16" | "20" | "24" | "48" | "12" | "32";
  theme?: "filled" | "regular";
}

// figma layer: "csv" (node 8095:858)
export interface CsvProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "16" | "20" | "24" | "32" | "40" | "48" | "96" | "256";
}

// figma layer: "Error Circle" (node 8120:147152)
export interface ErrorCircleProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24";
  theme?: "filled" | "regular";
}

// figma layer: "IconContainer" (node 8095:787)
export interface IconContainerProps {
  className?: string;
  style?: React.CSSProperties;
  multicolor?: boolean;
  size?: "12px" | "16px" | "20px" | "24px" | "32px";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Input" (node 8120:147087)
export interface InputProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "md";
  state?: "rest" | "focus" | "disabled";
  style2?: "fill lighter";
  error?: boolean;
  success?: boolean;
}

// figma layer: "Loader" (node 8095:2509)
export interface Loader2Props {
  className?: string;
  style?: React.CSSProperties;
  fill?: "default" | "on dark";
}

// figma layer: "Placeholder" (node 8095:821)
export interface PlaceholderProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "32" | "36" | "40" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "Subtract" (node 9323:410839)
export interface SubtractProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "01. Switch / ⚫️ A. On - Dark" (node 8120:146596)
export interface SwitchAOnDark01Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "01. Switch / ⚪️ B. Off - Light" (node 8120:146588)
export interface SwitchBOffLight01Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "01. Switch / ⚪️ C. On (disabled) - Light" (node 8120:146591)
export interface SwitchCOnDisabled01Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "01. Switch / ⚫️ C. On (disabled) - Dark" (node 8120:146600)
export interface SwitchCOnDisabled012Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "01. Switch / ⚪️ D. Off (disabled) - Light" (node 8120:146594)
export interface SwitchDOffDisabled01Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "01. Switch / ⚫️ D. Off (disabled) - Dark" (node 8120:146604)
export interface SwitchDOffDisabled012Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Toggle" (node 8120:146570)
export interface ToggleProps {
  className?: string;
  style?: React.CSSProperties;
  state?: "on" | "off" | "on (disabled)" | "off (disabled)" | "off - dark";
  theme?: "light" | "dark";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Tooltip" (node 10288:550391)
export interface TooltipProps {
  className?: string;
  style?: React.CSSProperties;
  beak?: boolean;
  beakPosition?: "top center" | "top left" | "top right" | "bottom left" | "bottom center" | "bottom right" | "left top" | "left center" | "left bottom" | "right top" | "right center" | "right bottom" | "-";
  theme?: "light mode" | "dark mode";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

declare const Badge: React.FC<BadgeProps>;
declare const Base1: React.FC<Base1Props>;
declare const Base17: React.FC<Base17Props>;
declare const Base2: React.FC<Base2Props>;
declare const Base210: React.FC<Base210Props>;
declare const Base2_: React.FC<Base2_Props>;
declare const Base5: React.FC<Base5Props>;
declare const Base7: React.FC<Base7Props>;
declare const Button: React.FC<ButtonProps>;
declare const Checkbox: React.FC<CheckboxProps>;
declare const Checkmark: React.FC<CheckmarkProps>;
declare const CheckmarkCircle2: React.FC<CheckmarkCircle2Props>;
declare const Csv: React.FC<CsvProps>;
declare const ErrorCircle: React.FC<ErrorCircleProps>;
declare const IconContainer: React.FC<IconContainerProps>;
declare const Input: React.FC<InputProps>;
declare const Loader2: React.FC<Loader2Props>;
declare const Placeholder: React.FC<PlaceholderProps>;
declare const Subtract: React.FC<SubtractProps>;
declare const SwitchAOnDark01: React.FC<SwitchAOnDark01Props>;
declare const SwitchBOffLight01: React.FC<SwitchBOffLight01Props>;
declare const SwitchCOnDisabled01: React.FC<SwitchCOnDisabled01Props>;
declare const SwitchCOnDisabled012: React.FC<SwitchCOnDisabled012Props>;
declare const SwitchDOffDisabled01: React.FC<SwitchDOffDisabled01Props>;
declare const SwitchDOffDisabled012: React.FC<SwitchDOffDisabled012Props>;
declare const Toggle: React.FC<ToggleProps>;
declare const Tooltip: React.FC<TooltipProps>;
declare global {
  interface Window {
    Badge: React.FC<BadgeProps>;
    Base1: React.FC<Base1Props>;
    Base17: React.FC<Base17Props>;
    Base2: React.FC<Base2Props>;
    Base210: React.FC<Base210Props>;
    Base2_: React.FC<Base2_Props>;
    Base5: React.FC<Base5Props>;
    Base7: React.FC<Base7Props>;
    Button: React.FC<ButtonProps>;
    Checkbox: React.FC<CheckboxProps>;
    Checkmark: React.FC<CheckmarkProps>;
    CheckmarkCircle2: React.FC<CheckmarkCircle2Props>;
    Csv: React.FC<CsvProps>;
    ErrorCircle: React.FC<ErrorCircleProps>;
    IconContainer: React.FC<IconContainerProps>;
    Input: React.FC<InputProps>;
    Loader2: React.FC<Loader2Props>;
    Placeholder: React.FC<PlaceholderProps>;
    Subtract: React.FC<SubtractProps>;
    SwitchAOnDark01: React.FC<SwitchAOnDark01Props>;
    SwitchBOffLight01: React.FC<SwitchBOffLight01Props>;
    SwitchCOnDisabled01: React.FC<SwitchCOnDisabled01Props>;
    SwitchCOnDisabled012: React.FC<SwitchCOnDisabled012Props>;
    SwitchDOffDisabled01: React.FC<SwitchDOffDisabled01Props>;
    SwitchDOffDisabled012: React.FC<SwitchDOffDisabled012Props>;
    Toggle: React.FC<ToggleProps>;
    Tooltip: React.FC<TooltipProps>;
  }
}
