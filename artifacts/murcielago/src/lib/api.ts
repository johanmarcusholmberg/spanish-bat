// API client for communicating with the backend

const BASE = "/api";

async function fetchApi(path: string, options?: RequestInit) {
  const resp = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body?.error || `API error ${resp.status}`);
  }
  return resp.json();
}

export const api = {
  profile: {
    get: () => fetchApi("/profile"),
    upsert: (data: Record<string, unknown>) => fetchApi("/profile", { method: "POST", body: JSON.stringify(data) }),
  },
  streaks: {
    get: () => fetchApi("/streaks"),
    upsert: (data: { currentStreak: number; longestStreak: number; lastActiveDate: string }) =>
      fetchApi("/streaks", { method: "POST", body: JSON.stringify(data) }),
    logActivity: (activityDate: string, count: number) =>
      fetchApi("/activity-log", { method: "POST", body: JSON.stringify({ activityDate, count }) }),
  },
  progress: {
    get: () => fetchApi("/progress"),
    upsert: (category: string, completed: number, total: number) =>
      fetchApi("/progress", { method: "POST", body: JSON.stringify({ category, completed, total }) }),
    trackLastActivity: (exerciseType: string, exercisePath: string, exerciseLabel: string) =>
      fetchApi("/last-activity", { method: "POST", body: JSON.stringify({ exerciseType, exercisePath, exerciseLabel }) }),
    getGrammarProgress: () => fetchApi("/grammar-progress"),
    upsertGrammarProgress: (lessonId: string, completed: boolean, bestScore: number, attempts: number) =>
      fetchApi("/grammar-progress", { method: "POST", body: JSON.stringify({ lessonId, completed, bestScore, attempts }) }),
  },
  vocabulary: {
    get: () => fetchApi("/vocabulary"),
    add: (data: Record<string, unknown>) => fetchApi("/vocabulary", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) => fetchApi(`/vocabulary/${id}`, { method: "DELETE" }),
    update: (id: string, updates: Record<string, unknown>) => fetchApi(`/vocabulary/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
  },
  flashcardSrs: {
    get: () => fetchApi("/flashcard-srs"),
    upsert: (data: Record<string, unknown>) => fetchApi("/flashcard-srs", { method: "POST", body: JSON.stringify(data) }),
  },
  contact: {
    send: (data: { subject: string; message: string; email: string }) =>
      fetchApi("/contact", { method: "POST", body: JSON.stringify(data) }),
  },
  echoMemory: {
    get: () =>
      fetchApi("/echo-memory") as Promise<{
        echoMemory: {
          userId: string;
          trackedCount: number;
          improvedCount: number;
          dueCount: number;
          weakCount: number;
          topFocusSubskill: string | null;
          topImprovedSubskill: string | null;
          updatedAt: string | null;
        } | null;
      }>,
    upsert: (data: {
      trackedCount?: number;
      improvedCount?: number;
      dueCount?: number;
      weakCount?: number;
      topFocusSubskill?: string | null;
      topImprovedSubskill?: string | null;
    }) =>
      fetchApi("/echo-memory", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  dailySessions: {
    get: () =>
      fetchApi("/daily-sessions") as Promise<{
        dailySession: { day: string; count: number } | null;
      }>,
    record: (data: { tzOffsetMinutes: number; localCount?: number }) =>
      fetchApi("/daily-sessions/record", {
        method: "POST",
        body: JSON.stringify(data),
      }) as Promise<{ dailySession: { day: string; count: number } }>,
  },
  subscription: {
    get: () => fetchApi("/subscription"),
    getPlans: () => fetchApi("/subscription/plans"),
    health: () => fetchApi("/subscription/health") as Promise<{
      model: "A" | "B";
      stripe: { configured: boolean; env: Record<string, boolean> };
      revenuecat: { webhookConfigured: boolean; env: Record<string, boolean> };
    }>,
  },
  stripe: {
    config: () => fetchApi("/stripe/config") as Promise<{
      enabled: boolean;
      publishableKey: string | null;
      prices: { monthly: string | null; yearly: string | null };
    }>,
    checkout: (interval: "monthly" | "yearly", email?: string) =>
      fetchApi("/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ interval, email }),
      }) as Promise<{ url: string; sessionId: string }>,
    portal: () =>
      fetchApi("/stripe/portal", { method: "POST" }) as Promise<{ url: string }>,
    getCheckoutSession: (sessionId: string) =>
      fetchApi(`/stripe/checkout/${sessionId}`) as Promise<{
        status: string | null;
        paymentStatus: string | null;
        subscriptionId: string | null;
      }>,
    listSubscriptions: () =>
      fetchApi("/stripe/subscription") as Promise<{
        subscriptions: Array<Record<string, unknown>>;
      }>,
  },
  practice: {
    generate: (input: {
      userLevel: string;
      targetSkill?: string;
      weakSpots?: string[];
      count?: number;
      interfaceLanguage?: "en" | "sv";
      previousMistakes?: string[];
      practiceMode?: string;
      avoidPrompts?: string[];
    }) =>
      fetchApi("/generate-practice-session", {
        method: "POST",
        body: JSON.stringify({
          ...input,
          tzOffsetMinutes: -new Date().getTimezoneOffset(),
        }),
      }) as Promise<{
        items: Array<{
          level: string;
          skill: string;
          subskill: string;
          prompt: string;
          expectedAnswer: string;
          acceptedAnswers?: string[];
          explanation?: string;
          difficulty: number;
          source: "ai";
          id?: string;
        }>;
        degraded?: boolean;
      }>,
  },
  practiceItems: {
    list: (level?: string) =>
      fetchApi(`/practice-items${level ? `?level=${encodeURIComponent(level)}` : ""}`) as Promise<{
        items: Array<{
          id: string;
          level: string;
          skill: string;
          subskill: string;
          prompt: string;
          expectedAnswer: string;
          acceptedAnswers: string[] | null;
          explanation: string | null;
          difficulty: number;
          source: string;
          languageOfPrompt: string;
          usageCount: number;
          successCount: number;
          reportCount: number;
        }>;
      }>,
    report: (id: string, reason: string, note?: string) =>
      fetchApi(`/practice-items/${id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason, note }),
      }),
    usage: (id: string, correct: boolean) =>
      fetchApi(`/practice-items/${id}/usage`, {
        method: "POST",
        body: JSON.stringify({ correct }),
      }),
  },
  admin: {
    getUsers: () => fetchApi("/admin/users"),
    getMessages: () => fetchApi("/admin/messages"),
    updateMessage: (id: string, data: { status?: string; adminNotes?: string }) =>
      fetchApi(`/admin/messages/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    getInsights: () => fetchApi("/admin/insights"),
    getSubscriptions: () => fetchApi("/admin/subscriptions"),
  },
};
