/**
 * Capitalize the first letter of a string for display purposes.
 * Handles empty strings and preserves the rest of the casing.
 */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
