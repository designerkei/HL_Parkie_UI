// Components.d.ts — the complete catalog of the 5 component(s) in
// Components.bundle.js. READ THIS FILE BEFORE USING THE BUNDLE: component
// names are derived from Figma layer names (sanitized to PascalCase,
// deduplicated) and may differ from what the design calls them — the
// "figma layer" comment above each interface maps them back.
// After the bundle <script> loads, every component is a window global
// (e.g. window.AvatarRoundLargeNoPresence) and usable directly in JSX.
import * as React from 'react';

// figma layer: "Avatar/Round/Large/noPresence" (node 8120:263837)
export interface AvatarRoundLargeNoPresenceProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Avatar/Round/Medium/noPresence" (node 8120:20473)
export interface AvatarRoundMediumNoPresenceProps {
  className?: string;
  style?: React.CSSProperties;
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

// figma layer: ". / Master / WindowsNotification" (node 10304:816904)
export interface MasterWindowsNotificationProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Sender name/Actor + reason". */
  text1?: string;
  /** Text content; defaults to "Text preview/location". */
  text2?: string;
  /** Text content; defaults to "Microsoft Teams". */
  text3?: string;
  /** Text content; defaults to "". */
  text4?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

declare const AvatarRoundLargeNoPresence: React.FC<AvatarRoundLargeNoPresenceProps>;
declare const AvatarRoundMediumNoPresence: React.FC<AvatarRoundMediumNoPresenceProps>;
declare const MasterMacNotification: React.FC<MasterMacNotificationProps>;
declare const MasterTeamsNotification: React.FC<MasterTeamsNotificationProps>;
declare const MasterWindowsNotification: React.FC<MasterWindowsNotificationProps>;
declare global {
  interface Window {
    AvatarRoundLargeNoPresence: React.FC<AvatarRoundLargeNoPresenceProps>;
    AvatarRoundMediumNoPresence: React.FC<AvatarRoundMediumNoPresenceProps>;
    MasterMacNotification: React.FC<MasterMacNotificationProps>;
    MasterTeamsNotification: React.FC<MasterTeamsNotificationProps>;
    MasterWindowsNotification: React.FC<MasterWindowsNotificationProps>;
  }
}
