import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "./Card";
import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";
import { useEchoMemory } from "@/hooks/useEchoMemory";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

const INTRO_KEY = "echo_memory_intro_seen";

interface Props {
  lang?: "en" | "sv";
}

/**
 * Echo Memory — mobile preview card.
 * See the web version (artifacts/murcielago/src/components/EchoMemoryPreview.tsx)
 * for the polish rationale; this mirrors the same stat strip + smart CTA
 * + concrete-teaser pattern using the mobile design system.
 */
const EchoMemoryPreview: React.FC<Props> = ({ lang = "en" }) => {
  const colors = useColors();
  const memory = useEchoMemory();
  const { isPremium, loading } = useFeatureAccess();

  // One-time onboarding callout — see web EchoMemoryPreview for rationale.
  // Persisted in AsyncStorage; never reappears once dismissed.
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (loading || !memory.hasData) return;
    let cancelled = false;
    AsyncStorage.getItem(INTRO_KEY)
      .then((v) => {
        if (!cancelled && v !== "1") setShowIntro(true);
      })
      .catch(() => {
        /* ignore — better to skip the callout than to crash */
      });
    return () => {
      cancelled = true;
    };
  }, [loading, memory.hasData]);
  const dismissIntro = () => {
    setShowIntro(false);
    AsyncStorage.setItem(INTRO_KEY, "1").catch(() => {});
  };

  if (loading) return null;

  const tagline =
    lang === "sv"
      ? "Murciélingo kommer ihåg fraserna du behöver repetera."
      : "Murciélingo remembers the phrases you need to repeat.";

  const detail = (() => {
    if (!memory.hasData) {
      return lang === "sv"
        ? "Gör en kort övning så börjar Murci minnas vad du behöver eka tillbaka."
        : "Do a short practice and Murci will start remembering what you need to echo back.";
    }
    const lines: string[] = [];
    if (memory.dueCount > 0) {
      lines.push(
        lang === "sv"
          ? `${memory.dueCount} fraser är redo att repetera.`
          : `${memory.dueCount} phrases are ready to review.`,
      );
    } else if (memory.weakCount > 0) {
      lines.push(
        lang === "sv"
          ? `${memory.weakCount} fraser väntar på en till runda.`
          : `${memory.weakCount} phrases are waiting for another round.`,
      );
    }
    if (memory.topImproved) {
      lines.push(
        lang === "sv"
          ? `Du blir starkare på ${memory.topImproved.sv}.`
          : `You're getting stronger on ${memory.topImproved.en}.`,
      );
    } else if (memory.topFocus) {
      lines.push(
        lang === "sv"
          ? `Fokus just nu: ${memory.topFocus.sv}.`
          : `Current focus: ${memory.topFocus.en}.`,
      );
    }
    if (lines.length === 0) {
      lines.push(
        lang === "sv"
          ? "Inget ligger på kö just nu — fortsätt så fyller vi minnet."
          : "Nothing queued right now — keep practicing and the memory will fill in.",
      );
    }
    return lines.join(" ");
  })();

  // Smart primary action: never inert when there's data.
  const primary = (() => {
    if (!memory.hasData) {
      return {
        label: lang === "sv" ? "Starta en 2-min session" : "Start a 2-min session",
        onPress: () => router.push("/practice" as never),
      };
    }
    if (memory.dueCount > 0) {
      return {
        label:
          lang === "sv"
            ? `Repetera ${memory.dueCount} nu`
            : `Review ${memory.dueCount} now`,
        onPress: () =>
          router.push("/practice/session?mode=due_review" as never),
      };
    }
    if (memory.weakCount > 0 || memory.topFocus) {
      return {
        label: lang === "sv" ? "Öva fokusområden" : "Practice focus areas",
        onPress: () =>
          router.push("/practice/session?mode=weak_spots" as never),
      };
    }
    return {
      label: lang === "sv" ? "Snabb session" : "Quick session",
      onPress: () => router.push("/practice/session?mode=quick" as never),
    };
  })();

  const stats = memory.hasData
    ? [
        {
          label: lang === "sv" ? "Spårade" : "Tracked",
          value: memory.trackedCount,
          tone: "default" as const,
        },
        {
          label: lang === "sv" ? "Stärks" : "Improving",
          value: memory.improvedCount,
          tone: "good" as const,
        },
        {
          label: lang === "sv" ? "Att repetera" : "Due",
          value: memory.dueCount,
          tone: "warn" as const,
        },
      ]
    : [];

  const toneBg = (tone: "default" | "good" | "warn", value: number) => {
    if (tone === "good") return colors.secondary + "33";
    if (tone === "warn") return value > 0 ? "#fde68a" : colors.muted;
    return colors.muted;
  };
  const toneFg = (tone: "default" | "good" | "warn", value: number) => {
    if (tone === "good") return colors.foreground;
    if (tone === "warn") return value > 0 ? "#78350f" : colors.mutedForeground;
    return colors.foreground;
  };

  return (
    <Card style={{ marginBottom: 12 }} padding={16}>
      <View style={styles.row}>
        <View
          style={[styles.iconBox, { backgroundColor: colors.primary + "22" }]}
        >
          <Feather name="cpu" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Typography variant="h3">
              {lang === "sv" ? "Eko-minne" : "Echo Memory"}
            </Typography>
            {!isPremium && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.muted, borderColor: colors.border },
                ]}
              >
                <Typography
                  variant="caption"
                  muted
                  style={{ fontWeight: "700", fontSize: 9, letterSpacing: 0.6 }}
                >
                  {lang === "sv" ? "FÖRHANDS" : "PREVIEW"}
                </Typography>
              </View>
            )}
          </View>

          <Typography variant="caption" muted style={{ marginTop: 4 }}>
            {tagline}
          </Typography>

          {showIntro && (
            <View
              testID="echo-memory-intro"
              accessibilityRole="text"
              style={[
                styles.intro,
                {
                  backgroundColor: colors.primary + "1A",
                  borderColor: colors.primary + "55",
                },
              ]}
            >
              <Feather
                name="star"
                size={13}
                color={colors.primary}
                style={{ marginTop: 2 }}
              />
              <Typography
                variant="caption"
                style={{ flex: 1, fontSize: 12, lineHeight: 17 }}
              >
                {lang === "sv"
                  ? "Murci har precis börjat komma ihåg det här åt dig — det här är ditt Eko-minne. Ju mer du övar, desto mer kan jag anpassa."
                  : "Murci just started remembering this for you — this is your Echo Memory. The more you practice, the more I can tailor."}
              </Typography>
              <Pressable
                onPress={dismissIntro}
                accessibilityRole="button"
                accessibilityLabel={lang === "sv" ? "Stäng" : "Dismiss"}
                hitSlop={8}
                testID="echo-memory-intro-dismiss"
              >
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </Pressable>
            </View>
          )}

          {stats.length > 0 && (
            <View style={styles.statsRow}>
              {stats.map((s) => (
                <View
                  key={s.label}
                  style={[
                    styles.statPill,
                    { backgroundColor: toneBg(s.tone, s.value) },
                  ]}
                >
                  <Typography
                    variant="label"
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: toneFg(s.tone, s.value),
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    style={{
                      fontSize: 9,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      color: toneFg(s.tone, s.value),
                      opacity: 0.85,
                    }}
                  >
                    {s.label}
                  </Typography>
                </View>
              ))}
            </View>
          )}

          <Typography
            variant="body"
            style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}
          >
            {detail}
          </Typography>

          {!isPremium ? (
            <View style={{ marginTop: 10 }}>
              <Pressable
                onPress={() => {
                  if (showIntro) dismissIntro();
                  router.push("/paywall" as never);
                }}
                style={[styles.btnOutline, { borderColor: colors.border }]}
              >
                <Feather name="lock" size={13} color={colors.foreground} />
                <Typography
                  variant="label"
                  style={{ marginLeft: 6, fontSize: 13 }}
                >
                  {lang === "sv"
                    ? "Lås upp hela Eko-minnet"
                    : "Unlock full Echo Memory"}
                </Typography>
              </Pressable>
              <Typography
                variant="caption"
                muted
                style={{ marginTop: 6, fontSize: 11 }}
              >
                {memory.hasData
                  ? lang === "sv"
                    ? `Murci spårar redan ${memory.trackedCount} ord åt dig.`
                    : `Murci is already tracking ${memory.trackedCount} items for you.`
                  : lang === "sv"
                    ? "så Murci kan anpassa sessionerna åt dig."
                    : "so Murci can keep adapting your sessions."}
              </Typography>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                if (showIntro) dismissIntro();
                primary.onPress();
              }}
              style={[
                styles.btn,
                { backgroundColor: colors.primary, marginTop: 10 },
              ]}
            >
              <Typography variant="label" color="#fff">
                {primary.label}
              </Typography>
            </Pressable>
          )}
        </View>
      </View>
    </Card>
  );
};

export default EchoMemoryPreview;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  btn: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  intro: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnOutline: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    alignSelf: "flex-start",
  },
});
