import Constants from "expo-constants";

type StoreMetadata = {
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  supportEmail?: string;
  supportUrl?: string;
};

const FALLBACK_PRIVACY_URL = "https://murcielingo.app/privacy";
const FALLBACK_TERMS_URL = "https://murcielingo.app/terms";
const FALLBACK_SUPPORT_URL = "https://murcielingo.app/support";
const FALLBACK_SUPPORT_EMAIL = "support@murcielingo.app";

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.startsWith("TODO") || value.includes("TODO_");
}

function readMetadata(): StoreMetadata {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const meta = (extra._storeMetadataTodos ?? {}) as StoreMetadata;
  return {
    privacyPolicyUrl: isPlaceholder(meta.privacyPolicyUrl)
      ? FALLBACK_PRIVACY_URL
      : meta.privacyPolicyUrl,
    termsOfServiceUrl: isPlaceholder(meta.termsOfServiceUrl)
      ? FALLBACK_TERMS_URL
      : meta.termsOfServiceUrl,
    supportEmail: isPlaceholder(meta.supportEmail)
      ? FALLBACK_SUPPORT_EMAIL
      : meta.supportEmail,
    supportUrl: isPlaceholder(meta.supportUrl)
      ? FALLBACK_SUPPORT_URL
      : meta.supportUrl,
  };
}

export const legalLinks = readMetadata();
