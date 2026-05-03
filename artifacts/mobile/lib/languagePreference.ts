import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AppLanguage,
  FALLBACK_APP_LANGUAGE,
  isSupportedAppLanguage,
} from "@/lib/languages";

export type { AppLanguage };

const KEY = "murcielago_preferred_language";

export async function getPreferredLanguage(): Promise<AppLanguage> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (isSupportedAppLanguage(v)) return v;
  } catch {
    // ignore
  }
  return FALLBACK_APP_LANGUAGE;
}

export async function setPreferredLanguage(lang: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, lang);
  } catch {
    // ignore
  }
}
