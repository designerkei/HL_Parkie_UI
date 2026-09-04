// Components.d.ts — the complete catalog of the 29 component(s) in
// Components.bundle.js. READ THIS FILE BEFORE USING THE BUNDLE: component
// names are derived from Figma layer names (sanitized to PascalCase,
// deduplicated) and may differ from what the design calls them — the
// "figma layer" comment above each interface maps them back.
// After the bundle <script> loads, every component is a window global
// (e.g. window.Alert3) and usable directly in JSX.
import * as React from 'react';

// figma layer: "Alert" (node 9325:608633)
export interface Alert3Props {
  className?: string;
  style?: React.CSSProperties;
  action?: boolean;
  dismissible?: boolean;
  intent?: "neutral" | "success" | "warning" | "danger";
}

// figma layer: "Alert" (node 10304:819814)
export interface Alert6Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "ArtBoardFooter" (node 10290:559133)
export interface ArtBoardFooter4Props {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "© Microsoft 2023". */
  text1?: string;
}

// figma layer: "Avatar" (node 9324:461249)
export interface Avatar5Props {
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
export interface Base16_Props {
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

// figma layer: ".Base" (node 9325:608666)
export interface Base17_Props {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Message goes here". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: ".Base3" (node 8095:3995)
export interface Base3Props {
  className?: string;
  style?: React.CSSProperties;
  peopleCount?: "2" | "3";
}

// figma layer: "Breadcrumb" (node 10304:819939)
export interface BreadcrumbProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Card" (node 10304:818479)
export interface CardProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Checkbox / 01-Default / Selected" (node 8095:1255)
export interface Checkbox01DefaultSelectedProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "". */
  text1?: string;
  /** Text content; defaults to "Selected". */
  text2?: string;
}

// figma layer: "Checkmark" (node 9324:462726)
export interface Checkmark2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "32" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "Checkmark Circle" (node 8120:28247)
export interface CheckmarkCircleProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "32" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "csv" (node 8705:399685)
export interface Csv2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "16" | "20" | "24" | "32" | "36" | "40" | "48" | "96" | "256";
}

// figma layer: "Cursor / Arrow" (node 8120:374724)
export interface CursorArrowProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Cursor/Circle/NotAllowed" (node 8120:373872)
export interface CursorCircleNotAllowedProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Cursor / Hand-Grab" (node 8120:373870)
export interface CursorHandGrabProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Cursor / Hand-Pointing" (node 8120:299279)
export interface CursorHandPointing2Props {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Cursors / HandPointer" (node 8120:373868)
export interface CursorsHandPointerProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Dialog" (node 10304:818675)
export interface DialogProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Error Circle" (node 8705:399936)
export interface ErrorCircle2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24";
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

// figma layer: "Info" (node 8095:4127)
export interface InfoProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28";
  theme?: "regular" | "filled";
}

// figma layer: "Keyboarding / getBorderFocusStyles" (node 8120:373874)
export interface KeyboardingGetBorderFocusStylesProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Logo / Color" (node 8095:244)
export interface LogoColorProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "LogoGroup / Medium" (node 8095:241)
export interface LogoGroupMediumProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Teams Design System". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Presence" (node 8095:4006)
export interface PresenceProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "smallest | 6px" | "smaller | 10px" | "small | 16px" | "medium | 20px" | "large | 24px" | "larger | 32px";
  state?: "available" | "away" | "busy" | "dnd" | "oof available" | "oof busy" | "off dnd" | "offline" | "oof" | "blocked";
  /** Text content; defaults to "". */
  text1?: string;
}

// figma layer: "Star" (node 8705:400154)
export interface Star3Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "States" (node 10304:821502)
export interface StatesProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "States". */
  text1?: string;
}

// figma layer: "Warning" (node 9325:608673)
export interface Warning2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28";
  theme?: "regular" | "filled";
}

declare const Alert3: React.FC<Alert3Props>;
declare const Alert6: React.FC<Alert6Props>;
declare const ArtBoardFooter4: React.FC<ArtBoardFooter4Props>;
declare const Avatar5: React.FC<Avatar5Props>;
declare const Base16_: React.FC<Base16_Props>;
declare const Base17_: React.FC<Base17_Props>;
declare const Base3: React.FC<Base3Props>;
declare const Breadcrumb: React.FC<BreadcrumbProps>;
declare const Card: React.FC<CardProps>;
declare const Checkbox01DefaultSelected: React.FC<Checkbox01DefaultSelectedProps>;
declare const Checkmark2: React.FC<Checkmark2Props>;
declare const CheckmarkCircle: React.FC<CheckmarkCircleProps>;
declare const Csv2: React.FC<Csv2Props>;
declare const CursorArrow: React.FC<CursorArrowProps>;
declare const CursorCircleNotAllowed: React.FC<CursorCircleNotAllowedProps>;
declare const CursorHandGrab: React.FC<CursorHandGrabProps>;
declare const CursorHandPointing2: React.FC<CursorHandPointing2Props>;
declare const CursorsHandPointer: React.FC<CursorsHandPointerProps>;
declare const Dialog: React.FC<DialogProps>;
declare const ErrorCircle2: React.FC<ErrorCircle2Props>;
declare const IconContainer4: React.FC<IconContainer4Props>;
declare const Info: React.FC<InfoProps>;
declare const KeyboardingGetBorderFocusStyles: React.FC<KeyboardingGetBorderFocusStylesProps>;
declare const LogoColor: React.FC<LogoColorProps>;
declare const LogoGroupMedium: React.FC<LogoGroupMediumProps>;
declare const Presence: React.FC<PresenceProps>;
declare const Star3: React.FC<Star3Props>;
declare const States: React.FC<StatesProps>;
declare const Warning2: React.FC<Warning2Props>;
declare global {
  interface Window {
    Alert3: React.FC<Alert3Props>;
    Alert6: React.FC<Alert6Props>;
    ArtBoardFooter4: React.FC<ArtBoardFooter4Props>;
    Avatar5: React.FC<Avatar5Props>;
    Base16_: React.FC<Base16_Props>;
    Base17_: React.FC<Base17_Props>;
    Base3: React.FC<Base3Props>;
    Breadcrumb: React.FC<BreadcrumbProps>;
    Card: React.FC<CardProps>;
    Checkbox01DefaultSelected: React.FC<Checkbox01DefaultSelectedProps>;
    Checkmark2: React.FC<Checkmark2Props>;
    CheckmarkCircle: React.FC<CheckmarkCircleProps>;
    Csv2: React.FC<Csv2Props>;
    CursorArrow: React.FC<CursorArrowProps>;
    CursorCircleNotAllowed: React.FC<CursorCircleNotAllowedProps>;
    CursorHandGrab: React.FC<CursorHandGrabProps>;
    CursorHandPointing2: React.FC<CursorHandPointing2Props>;
    CursorsHandPointer: React.FC<CursorsHandPointerProps>;
    Dialog: React.FC<DialogProps>;
    ErrorCircle2: React.FC<ErrorCircle2Props>;
    IconContainer4: React.FC<IconContainer4Props>;
    Info: React.FC<InfoProps>;
    KeyboardingGetBorderFocusStyles: React.FC<KeyboardingGetBorderFocusStylesProps>;
    LogoColor: React.FC<LogoColorProps>;
    LogoGroupMedium: React.FC<LogoGroupMediumProps>;
    Presence: React.FC<PresenceProps>;
    Star3: React.FC<Star3Props>;
    States: React.FC<StatesProps>;
    Warning2: React.FC<Warning2Props>;
  }
}
