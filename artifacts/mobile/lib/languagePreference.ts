import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppLanguage } from "@/components/LanguagePicker";

const KEY = "murcielago_preferred_language";

export async function getPreferredLanguage(): Promise<AppLanguage> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === "en" || v === "sv") return v;
  } catch {
    // ignore
  }
  return "sv";
}

export async function setPreferredLanguage(lang: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, lang);
  } catch {
    // ignore
  }
}
