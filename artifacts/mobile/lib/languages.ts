export type AppLanguage = "sv" | "en";

export interface AppLanguageOption {
  code: AppLanguage;
  flag: string;
  short: string;
  long: string;
  enabled: boolean;
}

export const APP_LANGUAGES: AppLanguageOption[] = [
  { code: "sv", flag: "🇸🇪", short: "SV", long: "Svenska", enabled: true },
  { code: "en", flag: "🇬🇧", short: "EN", long: "English", enabled: true },
];

export const FALLBACK_APP_LANGUAGE: AppLanguage = "sv";

export const getEnabledAppLanguages = (): AppLanguageOption[] =>
  APP_LANGUAGES.filter((l) => l.enabled);

export const isSupportedAppLanguage = (
  v: string | null | undefined,
): v is AppLanguage =>
  !!v && APP_LANGUAGES.some((l) => l.enabled && l.code === v);

export const resolveAppLanguage = (
  v: string | null | undefined,
): AppLanguage =>
  isSupportedAppLanguage(v) ? v : FALLBACK_APP_LANGUAGE;
