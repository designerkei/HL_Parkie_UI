export interface ParkieAntdTheme {
  readonly token: Record<string, unknown>;
  readonly components: Record<string, Record<string, unknown>>;
}

export declare const parkieAntdTheme: ParkieAntdTheme;
export declare function createParkieAntdTheme(overrides?: Partial<ParkieAntdTheme>): ParkieAntdTheme;
