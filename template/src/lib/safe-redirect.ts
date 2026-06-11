/**
 * Open-redirect protection.
 *
 * Only allow redirect targets that are internal, relative paths:
 *  - must start with "/"
 *  - must not start with "//" or "/\" (protocol-relative URL tricks)
 *  - must not contain a scheme ("javascript:", "https:", etc.)
 *
 * Anything else falls back to the provided default.
 */
export function safeInternalPath(
  value: string | FormDataEntryValue | null,
  fallback: string,
): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes(":")) return fallback;
  return value;
}
