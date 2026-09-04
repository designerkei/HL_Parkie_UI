export interface ParkieUiRegistrySmoke {
  readonly name: '@designerkei/parkie-ui';
  readonly ready: true;
}

export interface ParkieThemeAttributesOptions {
  readonly system?: 'parkie' | string;
  readonly colorMode?: 'dark' | string;
  readonly theme?: 'dark' | string;
}

export interface ParkiePackage {
  readonly name: '@designerkei/parkie-ui';
  readonly version: string;
  readonly system: 'parkie';
  readonly defaultTheme: 'dark';
  readonly defaultColorMode: 'dark';
}

export declare const parkiePackage: ParkiePackage;
export declare const parkieUiRegistrySmoke: ParkieUiRegistrySmoke;
export declare const parkieTokens: Readonly<Record<string, unknown>>;
export declare const parkieCssVariables: Readonly<Record<string, string>>;
export declare function createParkieThemeAttributes(
  overrides?: ParkieThemeAttributesOptions,
): {
  readonly 'data-system': string;
  readonly 'data-color-mode': string;
  readonly 'data-theme': string;
};
export declare function getParkieCssVariable(name: string): string | null;
export declare function createParkieTokenStyleText(options?: {
  readonly selector?: string;
}): string;
