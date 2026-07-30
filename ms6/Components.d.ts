// Components.d.ts — the complete catalog of the 13 component(s) in
// Components.bundle.js. READ THIS FILE BEFORE USING THE BUNDLE: component
// names are derived from Figma layer names (sanitized to PascalCase,
// deduplicated) and may differ from what the design calls them — the
// "figma layer" comment above each interface maps them back.
// After the bundle <script> loads, every component is a window global
// (e.g. window.Avatar7) and usable directly in JSX.
import * as React from 'react';

// figma layer: "Avatar" (node 9324:461249)
export interface Avatar7Props {
  className?: string;
  style?: React.CSSProperties;
  imageCount?: "-" | "1" | "2" | "3";
  initials?: boolean;
  presence?: boolean;
  shape?: "circle" | "rounded square" | "polygon";
  size?: "20px" | "24px" | "28px" | "32px" | "36px" | "40px" | "48px" | "56px" | "64px" | "72px" | "96px";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: ".Base" (node 9324:462721)
export interface Base19_Props {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Action". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
}

// figma layer: "Checkmark" (node 9324:462726)
export interface Checkmark3Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "32" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "Chevron" (node 9323:411937)
export interface Chevron8Props {
  className?: string;
  style?: React.CSSProperties;
  direction?: "down" | "up" | "left" | "right";
  size?: "12" | "16" | "20" | "24" | "28" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "csv" (node 8705:399685)
export interface Csv2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "16" | "20" | "24" | "32" | "36" | "40" | "48" | "96" | "256";
}

// figma layer: "Dismiss" (node 9323:410885)
export interface Dismiss3Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "32" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "Filter" (node 9324:460305)
export interface Filter2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28";
  theme?: "regular" | "filled";
}

// figma layer: "IconContainer" (node 8705:399622)
export interface IconContainer4Props {
  className?: string;
  style?: React.CSSProperties;
  multicolor?: boolean;
  size?: "12px" | "16px" | "20px" | "24px" | "32px";
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "ListItem" (node 9324:462432)
export interface ListItemProps {
  className?: string;
  style?: React.CSSProperties;
  avatar?: boolean;
  checked?: boolean;
  chevron?: boolean;
  iconBefore?: boolean;
  keyboardHint?: boolean;
  state?: "rest" | "hover" | "pressed" | "selected" | "focus" | "disabled";
  /** Text content; defaults to "Ctrl+$". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
}

// figma layer: "Presence" (node 8095:4006)
export interface Presence2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "smallest | 6px" | "smaller | 10px" | "small | 16px" | "medium | 20px" | "large | 24px" | "larger | 32px";
  state?: "available" | "away" | "busy" | "dnd" | "oof available" | "oof busy" | "off dnd" | "offline" | "oof" | "blocked";
  /** Text content; defaults to "". */
  text1?: string;
}

// figma layer: "ProgressIndicator" (node 8095:3602)
export interface ProgressIndicatorProps {
  className?: string;
  style?: React.CSSProperties;
  fill?: "purple" | "white";
}

// figma layer: "Search" (node 10289:557236)
export interface Search6Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "32" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "SearchBox" (node 13384:154912)
export interface SearchBoxProps {
  className?: string;
  style?: React.CSSProperties;
  restText?: string;
  style2?: "filled darker (default)" | "filled lighter" | "outline" | "transparent";
  size?: "sm" | "medium (default)" | "lg";
  state?: "rest" | "focus" | "hover";
  theme?: "light mode" | "dark mode";
  cursorAfter?: boolean;
  placeholderText?: boolean;
  cursorBefore?: boolean;
  placeholderText2?: string;
  dismissIcon?: boolean;
  endIconSmall?: React.ReactNode;
  endIconMedium?: React.ReactNode;
  endIconLarge?: React.ReactNode;
  enteredText?: boolean;
  enteredText2?: string;
  ndEndIcon2?: boolean;
  endIcon2Small?: React.ReactNode;
  endIcon2Large?: React.ReactNode;
  endIcon2Medium?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
}

declare const Avatar7: React.FC<Avatar7Props>;
declare const Base19_: React.FC<Base19_Props>;
declare const Checkmark3: React.FC<Checkmark3Props>;
declare const Chevron8: React.FC<Chevron8Props>;
declare const Csv2: React.FC<Csv2Props>;
declare const Dismiss3: React.FC<Dismiss3Props>;
declare const Filter2: React.FC<Filter2Props>;
declare const IconContainer4: React.FC<IconContainer4Props>;
declare const ListItem: React.FC<ListItemProps>;
declare const Presence2: React.FC<Presence2Props>;
declare const ProgressIndicator: React.FC<ProgressIndicatorProps>;
declare const Search6: React.FC<Search6Props>;
declare const SearchBox: React.FC<SearchBoxProps>;
declare global {
  interface Window {
    Avatar7: React.FC<Avatar7Props>;
    Base19_: React.FC<Base19_Props>;
    Checkmark3: React.FC<Checkmark3Props>;
    Chevron8: React.FC<Chevron8Props>;
    Csv2: React.FC<Csv2Props>;
    Dismiss3: React.FC<Dismiss3Props>;
    Filter2: React.FC<Filter2Props>;
    IconContainer4: React.FC<IconContainer4Props>;
    ListItem: React.FC<ListItemProps>;
    Presence2: React.FC<Presence2Props>;
    ProgressIndicator: React.FC<ProgressIndicatorProps>;
    Search6: React.FC<Search6Props>;
    SearchBox: React.FC<SearchBoxProps>;
  }
}
