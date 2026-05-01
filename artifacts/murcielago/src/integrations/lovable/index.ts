// Lovable auth replaced by Clerk — this is a no-op shim
export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: string, _opts?: unknown) => {
      console.warn("Lovable auth is no longer used. Authentication is handled by Clerk.");
    },
  },
};
