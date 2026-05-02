let authTokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

let apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url;
}

async function fetchApi(
  path: string,
  options?: RequestInit
): Promise<unknown> {
  const token = authTokenGetter ? await authTokenGetter() : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!resp.ok) {
    let body: { error?: string } = {};
    try {
      body = await resp.json();
    } catch {
      // response body may be empty on error responses
    }
    throw new Error(body?.error ?? `API error ${resp.status}`);
  }

  if (resp.status === 204 || resp.headers.get("content-length") === "0") {
    return null;
  }

  const contentType = resp.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return resp.json();
}

export const api = {
  profile: {
    get: () => fetchApi("/profile") as Promise<{ profile: Record<string, unknown> | null; isAdmin: boolean }>,
    upsert: (data: Record<string, unknown>) =>
      fetchApi("/profile", { method: "POST", body: JSON.stringify(data) }),
    delete: () => fetchApi("/profile", { method: "DELETE" }),
  },
  streaks: {
    get: () => fetchApi("/streaks") as Promise<{ streak: Record<string, unknown> | null; activityLog: { activityDate: string; count: number }[] }>,
    upsert: (data: { currentStreak: number; longestStreak: number; lastActiveDate: string }) =>
      fetchApi("/streaks", { method: "POST", body: JSON.stringify(data) }),
    logActivity: (activityDate: string, count: number) =>
      fetchApi("/activity-log", { method: "POST", body: JSON.stringify({ activityDate, count }) }),
  },
  progress: {
    get: () => fetchApi("/progress") as Promise<{ progress: { category: string; completed: number; total: number }[]; lastActivity: Record<string, string> | null }>,
    upsert: (category: string, completed: number, total: number) =>
      fetchApi("/progress", { method: "POST", body: JSON.stringify({ category, completed, total }) }),
    trackLastActivity: (exerciseType: string, exercisePath: string, exerciseLabel: string) =>
      fetchApi("/last-activity", { method: "POST", body: JSON.stringify({ exerciseType, exercisePath, exerciseLabel }) }),
    getGrammarProgress: () =>
      fetchApi("/grammar-progress") as Promise<{ grammarProgress: { lessonId: string; completed: boolean; bestScore: number; attempts: number }[] }>,
    upsertGrammarProgress: (lessonId: string, completed: boolean, bestScore: number, attempts: number) =>
      fetchApi("/grammar-progress", { method: "POST", body: JSON.stringify({ lessonId, completed, bestScore, attempts }) }),
  },
  vocabulary: {
    get: () => fetchApi("/vocabulary") as Promise<{ words: Record<string, unknown>[] }>,
    add: (data: Record<string, unknown>) =>
      fetchApi("/vocabulary", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) => fetchApi(`/vocabulary/${id}`, { method: "DELETE" }),
    update: (id: string, updates: Record<string, unknown>) =>
      fetchApi(`/vocabulary/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
  },
  flashcardSrs: {
    get: () =>
      fetchApi("/flashcard-srs") as Promise<{ data: Record<string, unknown>[] }>,
    upsert: (data: Record<string, unknown>) =>
      fetchApi("/flashcard-srs", { method: "POST", body: JSON.stringify(data) }),
  },
  contact: {
    send: (data: { subject: string; message: string; email: string }) =>
      fetchApi("/contact", { method: "POST", body: JSON.stringify(data) }),
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
        body: JSON.stringify(input),
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
  subscription: {
    get: () => fetchApi("/subscription"),
    getPlans: () => fetchApi("/subscription/plans"),
  },
};
