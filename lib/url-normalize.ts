/**
 * Pure helpers used by admin to normalize user-entered contact URLs.
 * Safe to import in both server and client code.
 */

/**
 * Normalizes a website URL: adds https:// if no protocol present.
 * Returns null for empty input.
 */
export function normalizeWebsiteUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Looks like a URL — add https://
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

/**
 * Extracts an Instagram handle from a URL or @handle / handle input.
 * Returns the handle WITHOUT a leading "@".
 */
export function normalizeInstagramHandle(
  input: string | null | undefined,
): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Try URL form: https://instagram.com/handle or instagram.com/handle/
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]+)/i,
  );
  if (urlMatch) return urlMatch[1];
  // Strip leading @ and any whitespace; allow only valid handle chars
  return trimmed.replace(/^@/, "").replace(/[^A-Za-z0-9._]/g, "");
}

/**
 * Normalizes a Facebook input: accepts a full URL, a path, or a page name.
 * Returns the canonical URL (or null).
 */
export function normalizeFacebookUrl(
  input: string | null | undefined,
): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // facebook.com/page or fb.com/page
  if (/^(?:www\.)?(?:facebook|fb)\.com\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  // Bare page name
  return `https://facebook.com/${trimmed.replace(/^\/+/, "")}`;
}
