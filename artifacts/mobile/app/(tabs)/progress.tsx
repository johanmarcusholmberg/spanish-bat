/**
 * "Progress" tab — re-uses the existing /stats screen so we don't fork
 * the implementation. Keeps the root /stats route working for callers
 * that link to it directly (notifications, deep links, profile menu).
 */
export { default } from "../stats";
