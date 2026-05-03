/**
 * @workspace/learning-coach
 * -------------------------
 * Framework-agnostic learning-coach helpers shared by both the web and
 * mobile clients. Includes the soft "learning state" model, a pluggable
 * mistake-memory store (works with localStorage on web and AsyncStorage
 * on React Native), and the controlled seam for AI-augmented practice.
 *
 * No DOM / browser globals are referenced here — keep it that way so the
 * mobile bundler stays happy.
 */
export * from "./learningStates";
export * from "./mistakeMemory";
export * from "./aiPractice";
export * from "./kvStorage";
export * from "./sessionStorage";
export * from "./learningCache";
export * from "./notificationPreferences";
