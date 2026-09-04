// Components.d.ts — the complete catalog of the 28 component(s) in
// Components.bundle.js. READ THIS FILE BEFORE USING THE BUNDLE: component
// names are derived from Figma layer names (sanitized to PascalCase,
// deduplicated) and may differ from what the design calls them — the
// "figma layer" comment above each interface maps them back.
// After the bundle <script> loads, every component is a window global
// (e.g. window.ArtBoardFooter4) and usable directly in JSX.
import * as React from 'react';

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

// figma layer: "Avatar/Hexagon/Large/noPresence" (node 8120:263843)
export interface AvatarHexagonLargeNoPresenceProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Avatar/Hexagon/Medium/noPresence" (node 8120:374448)
export interface AvatarHexagonMediumNoPresenceProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Avatar/Round/Large/noPresence" (node 8120:263837)
export interface AvatarRoundLargeNoPresenceProps {
  className?: string;
  style?: React.CSSProperties;
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

// figma layer: ".Base3" (node 8095:3995)
export interface Base3Props {
  className?: string;
  style?: React.CSSProperties;
  peopleCount?: "2" | "3";
}

// figma layer: ".Base" (node 8120:299226)
export interface Base3_Props {
  className?: string;
  style?: React.CSSProperties;
  checked?: boolean;
  state?: "rest" | "hover" | "pressed" | "focus" | "disabled";
}

// figma layer: "Checkmark" (node 9324:462726)
export interface Checkmark2Props {
  className?: string;
  style?: React.CSSProperties;
  size?: "12" | "16" | "20" | "24" | "28" | "32" | "48";
  theme?: "regular" | "filled";
}

// figma layer: "Chevron" (node 9323:411937)
export interface Chevron5Props {
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

// figma layer: "Divider" (node 8120:20466)
export interface DividerProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Dropdown" (node 10304:820839)
export interface DropdownProps {
  className?: string;
  style?: React.CSSProperties;
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

// figma layer: "InputField / 01-Default / InFocusIndicator-Rounded" (node 8120:20060)
export interface InputField01DefaultInFocusIndicatorRoundProps {
  className?: string;
  style?: React.CSSProperties;
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

// figma layer: ". / Master / MacNotification" (node 10304:816916)
export interface MasterMacNotificationProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Sender name/Actor + reason". */
  text1?: string;
  /** Text content; defaults to "Text preview/location". */
  text2?: string;
  /** Text content; defaults to "Quick reply...". */
  text3?: string;
  /** Text content; defaults to "Close". */
  text4?: string;
}

// figma layer: ". / Master / TeamsNotification" (node 10304:816883)
export interface MasterTeamsNotificationProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Sender name". */
  text1?: string;
  /** Text content; defaults to "Text preview". */
  text2?: string;
  /** Text content; defaults to "". */
  text3?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Menu" (node 9324:462351)
export interface MenuProps {
  className?: string;
  style?: React.CSSProperties;
  listItems?: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
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

// figma layer: "Radio" (node 10304:820813)
export interface RadioProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "RadioButton" (node 10289:557349)
export interface RadioButtonProps {
  className?: string;
  style?: React.CSSProperties;
  checked?: boolean;
  label?: boolean;
  state?: "rest" | "hover" | "pressed" | "focus" | "disabled";
  /** Text content; defaults to "Label". */
  text1?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "SectionHeader" (node 8120:20468)
export interface SectionHeaderProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Section header". */
  text1?: string;
}

// figma layer: "States" (node 10304:821502)
export interface StatesProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "States". */
  text1?: string;
}

// figma layer: "Toast" (node 10304:819169)
export interface ToastProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Types" (node 10304:821588)
export interface TypesProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Types". */
  text1?: string;
}

declare const ArtBoardFooter4: React.FC<ArtBoardFooter4Props>;
declare const Avatar5: React.FC<Avatar5Props>;
declare const AvatarHexagonLargeNoPresence: React.FC<AvatarHexagonLargeNoPresenceProps>;
declare const AvatarHexagonMediumNoPresence: React.FC<AvatarHexagonMediumNoPresenceProps>;
declare const AvatarRoundLargeNoPresence: React.FC<AvatarRoundLargeNoPresenceProps>;
declare const Base16_: React.FC<Base16_Props>;
declare const Base3: React.FC<Base3Props>;
declare const Base3_: React.FC<Base3_Props>;
declare const Checkmark2: React.FC<Checkmark2Props>;
declare const Chevron5: React.FC<Chevron5Props>;
declare const Csv2: React.FC<Csv2Props>;
declare const Divider: React.FC<DividerProps>;
declare const Dropdown: React.FC<DropdownProps>;
declare const IconContainer4: React.FC<IconContainer4Props>;
declare const InputField01DefaultInFocusIndicatorRound: React.FC<InputField01DefaultInFocusIndicatorRoundProps>;
declare const ListItem: React.FC<ListItemProps>;
declare const LogoColor: React.FC<LogoColorProps>;
declare const LogoGroupMedium: React.FC<LogoGroupMediumProps>;
declare const MasterMacNotification: React.FC<MasterMacNotificationProps>;
declare const MasterTeamsNotification: React.FC<MasterTeamsNotificationProps>;
declare const Menu: React.FC<MenuProps>;
declare const Presence: React.FC<PresenceProps>;
declare const Radio: React.FC<RadioProps>;
declare const RadioButton: React.FC<RadioButtonProps>;
declare const SectionHeader: React.FC<SectionHeaderProps>;
declare const States: React.FC<StatesProps>;
declare const Toast: React.FC<ToastProps>;
declare const Types: React.FC<TypesProps>;
declare global {
  interface Window {
    ArtBoardFooter4: React.FC<ArtBoardFooter4Props>;
    Avatar5: React.FC<Avatar5Props>;
    AvatarHexagonLargeNoPresence: React.FC<AvatarHexagonLargeNoPresenceProps>;
    AvatarHexagonMediumNoPresence: React.FC<AvatarHexagonMediumNoPresenceProps>;
    AvatarRoundLargeNoPresence: React.FC<AvatarRoundLargeNoPresenceProps>;
    Base16_: React.FC<Base16_Props>;
    Base3: React.FC<Base3Props>;
    Base3_: React.FC<Base3_Props>;
    Checkmark2: React.FC<Checkmark2Props>;
    Chevron5: React.FC<Chevron5Props>;
    Csv2: React.FC<Csv2Props>;
    Divider: React.FC<DividerProps>;
    Dropdown: React.FC<DropdownProps>;
    IconContainer4: React.FC<IconContainer4Props>;
    InputField01DefaultInFocusIndicatorRound: React.FC<InputField01DefaultInFocusIndicatorRoundProps>;
    ListItem: React.FC<ListItemProps>;
    LogoColor: React.FC<LogoColorProps>;
    LogoGroupMedium: React.FC<LogoGroupMediumProps>;
    MasterMacNotification: React.FC<MasterMacNotificationProps>;
    MasterTeamsNotification: React.FC<MasterTeamsNotificationProps>;
    Menu: React.FC<MenuProps>;
    Presence: React.FC<PresenceProps>;
    Radio: React.FC<RadioProps>;
    RadioButton: React.FC<RadioButtonProps>;
    SectionHeader: React.FC<SectionHeaderProps>;
    States: React.FC<StatesProps>;
    Toast: React.FC<ToastProps>;
    Types: React.FC<TypesProps>;
  }
}
