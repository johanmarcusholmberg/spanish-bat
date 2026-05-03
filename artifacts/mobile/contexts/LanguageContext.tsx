import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import {
  AppLanguage,
  AppLanguageOption,
  FALLBACK_APP_LANGUAGE,
  getEnabledAppLanguages,
  resolveAppLanguage,
} from "@/lib/languages";
import {
  getPreferredLanguage,
  setPreferredLanguage,
} from "@/lib/languagePreference";
import { translations } from "@/i18n/translations";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  availableLanguages: AppLanguageOption[];
  /** True until the persisted preference has been read from storage. */
  ready: boolean;
  /**
   * Lookup a translation by dotted key (e.g. `"login.title"`). Falls back to
   * the key itself if the path isn't found, and supports `{name}` style
   * interpolation via the optional `params` arg.
   */
  t: (key: string, params?: Record<string, string | number>) => string;
}

const noop = async () => {};

const defaultValue: LanguageContextValue = {
  language: FALLBACK_APP_LANGUAGE,
  setLanguage: noop,
  availableLanguages: getEnabledAppLanguages(),
  ready: false,
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextValue>(defaultValue);

function lookup(
  dict: unknown,
  path: string[],
): unknown {
  let cur: unknown = dict;
  for (const seg of path) {
    if (cur && typeof cur === "object" && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  return cur;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(FALLBACK_APP_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPreferredLanguage()
      .then((stored) => {
        if (cancelled) return;
        setLanguageState(resolveAppLanguage(stored));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    const safe = resolveAppLanguage(lang);
    setLanguageState(safe);
    await setPreferredLanguage(safe);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const entry = lookup(translations, key.split("."));
      if (entry && typeof entry === "object") {
        const map = entry as Partial<Record<AppLanguage, string>>;
        const value = map[language] ?? map[FALLBACK_APP_LANGUAGE];
        if (typeof value === "string") return interpolate(value, params);
      }
      return key;
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      availableLanguages: getEnabledAppLanguages(),
      ready,
      t,
    }),
    [language, setLanguage, ready, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

/** Convenience hook returning just the translation function. */
export function useT() {
  return useLanguage().t;
}
