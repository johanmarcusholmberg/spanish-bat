import { describe, it, expect, beforeEach } from "vitest";
import {
  LANGUAGES,
  getEnabledLanguages,
  isSupportedLanguage,
  resolveLanguage,
  FALLBACK_LANGUAGE,
} from "@/i18n/languages";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) {
    return this.store.has(k) ? (this.store.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, String(v));
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}

(globalThis as any).window = { localStorage: new MemoryStorage() };

describe("language config", () => {
  it("ships at least English and Swedish", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("sv");
  });

  it("hides disabled languages from the enabled list", () => {
    const enabled = getEnabledLanguages();
    enabled.forEach((l) => expect(l.enabled).toBe(true));
  });

  it("recognises supported language codes", () => {
    expect(isSupportedLanguage("en")).toBe(true);
    expect(isSupportedLanguage("sv")).toBe(true);
    expect(isSupportedLanguage("zz")).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
  });

  it("falls back when an unknown code is requested", () => {
    expect(resolveLanguage("zz")).toBe(FALLBACK_LANGUAGE);
    expect(resolveLanguage(null)).toBe(FALLBACK_LANGUAGE);
    expect(resolveLanguage("en")).toBe("en");
  });
});

describe("language storage", () => {
  beforeEach(() => {
    (window as any).localStorage.clear();
  });

  it("returns null when nothing is stored", async () => {
    const { languageStorage } = await import("@/i18n/storage");
    expect(languageStorage.read()).toBeNull();
  });

  it("persists and restores a supported language", async () => {
    const { languageStorage } = await import("@/i18n/storage");
    languageStorage.write("en");
    expect(languageStorage.read()).toBe("en");
  });

  it("rejects an unsupported stored value on read", async () => {
    const { languageStorage } = await import("@/i18n/storage");
    (window as any).localStorage.setItem("publicLanguage", "zz");
    expect(languageStorage.read()).toBeNull();
  });
});
