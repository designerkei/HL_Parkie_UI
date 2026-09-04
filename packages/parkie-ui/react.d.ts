import * as React from 'react';

export type ParkieButtonVariant = 'primary' | 'secondary' | 'outline' | 'subtle' | 'ghost' | 'danger';
export type ParkieControlSize = 'compact' | 'default' | 'large';
export type ParkieBadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export interface ParkieProviderProps extends React.HTMLAttributes<HTMLElement> {
  readonly as?: React.ElementType;
  readonly colorMode?: 'dark' | string;
  readonly system?: 'parkie' | string;
  readonly theme?: 'dark' | string;
}

export interface ParkieButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly as?: React.ElementType;
  readonly fullWidth?: boolean;
  readonly loading?: boolean;
  readonly size?: ParkieControlSize;
  readonly variant?: ParkieButtonVariant;
}

export interface ParkieIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly as?: React.ElementType;
  readonly danger?: boolean;
  readonly size?: ParkieControlSize;
}

export interface ParkiePanelProps extends React.HTMLAttributes<HTMLElement> {
  readonly as?: React.ElementType;
  readonly elevated?: boolean;
}

export interface ParkieBadgeProps extends React.HTMLAttributes<HTMLElement> {
  readonly as?: React.ElementType;
  readonly tone?: ParkieBadgeTone;
}

export interface ParkieSegmentedItem {
  readonly value: string;
  readonly label: React.ReactNode;
  readonly disabled?: boolean;
}

export interface ParkieSegmentedProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly disabled?: boolean;
  readonly items: readonly ParkieSegmentedItem[];
  readonly onChange?: (value: string, item: ParkieSegmentedItem) => void;
  readonly size?: 'compact' | 'default';
  readonly value?: string;
}

export interface ParkieSwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly checked?: boolean;
  readonly onCheckedChange?: (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ParkieChoiceProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export declare const ParkieProvider: React.ForwardRefExoticComponent<
  ParkieProviderProps & React.RefAttributes<HTMLElement>
>;
export declare const ParkieButton: React.ForwardRefExoticComponent<
  ParkieButtonProps & React.RefAttributes<HTMLButtonElement>
>;
export declare const ParkieIconButton: React.ForwardRefExoticComponent<
  ParkieIconButtonProps & React.RefAttributes<HTMLButtonElement>
>;
export declare const ParkiePanel: React.ForwardRefExoticComponent<
  ParkiePanelProps & React.RefAttributes<HTMLElement>
>;
export declare const ParkieBadge: React.ForwardRefExoticComponent<
  ParkieBadgeProps & React.RefAttributes<HTMLElement>
>;
export declare const ParkieSegmented: React.ForwardRefExoticComponent<
  ParkieSegmentedProps & React.RefAttributes<HTMLDivElement>
>;
export declare const ParkieSwitch: React.ForwardRefExoticComponent<
  ParkieSwitchProps & React.RefAttributes<HTMLButtonElement>
>;
export declare const ParkieCheckbox: React.ForwardRefExoticComponent<
  ParkieChoiceProps & React.RefAttributes<HTMLInputElement>
>;
export declare const ParkieRadio: React.ForwardRefExoticComponent<
  ParkieChoiceProps & React.RefAttributes<HTMLInputElement>
>;
