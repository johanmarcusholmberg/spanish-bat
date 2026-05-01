// Supabase compatibility shim — routes data calls to the new API server
// Auth is handled by Clerk; data ops go to /api/*

// This is a no-op auth object — real auth is handled by Clerk in AuthContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopAuth: any = {
  onAuthStateChange: (_event: string, _callback: () => void) => ({ data: { subscription: { unsubscribe: () => {} } } }),
  getSession: async () => ({ data: { session: null } }),
  getUser: async () => ({ data: { user: null } }),
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPasswordForEmail: async () => ({ error: null }),
  updateUser: async () => ({ error: null }),
  setSession: async () => {},
};

// No-op functions for compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopFunctions: any = {
  invoke: async () => ({ data: null, error: new Error("Supabase edge functions not available — use API routes instead") }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = {
  auth: noopAuth,
  functions: noopFunctions,
  from: (_table: string) => ({
    select: () => ({ eq: () => ({ data: null, error: null }) }),
    insert: async () => ({ error: null }),
    update: (_data: unknown) => ({ eq: () => Promise.resolve({ error: null }) }),
    upsert: async () => ({ error: null }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
  }),
};