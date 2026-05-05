export type LanguageCode = "sv" | "en";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag?: string;
  enabled: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "sv", label: "Swedish", nativeLabel: "Svenska", flag: "🇸🇪", enabled: true },
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", enabled: true },
];

export const FALLBACK_LANGUAGE: LanguageCode = "sv";

export const getEnabledLanguages = (): LanguageOption[] =>
  LANGUAGES.filter((l) => l.enabled);

export const isSupportedLanguage = (code: string | null | undefined): code is LanguageCode =>
  !!code && LANGUAGES.some((l) => l.enabled && l.code === code);

export const resolveLanguage = (code: string | null | undefined): LanguageCode =>
  isSupportedLanguage(code) ? code : FALLBACK_LANGUAGE;

export const getLanguageOption = (code: LanguageCode): LanguageOption =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
