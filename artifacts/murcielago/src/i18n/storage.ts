import { LanguageCode, isSupportedLanguage } from "./languages";

const STORAGE_KEY = "publicLanguage";

export interface LanguageStorage {
  read(): LanguageCode | null;
  write(code: LanguageCode): void;
}

const webStorage: LanguageStorage = {
  read() {
    try {
      if (typeof window === "undefined") return null;
      const v = window.localStorage.getItem(STORAGE_KEY);
      return isSupportedLanguage(v) ? v : null;
    } catch {
      return null;
    }
  },
  write(code) {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  },
};

export const languageStorage: LanguageStorage = webStorage;
