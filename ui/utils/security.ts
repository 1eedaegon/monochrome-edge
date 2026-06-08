/**
 * Security utilities for safe DOM rendering.
 *
 * These helpers exist because several components build markup with
 * `innerHTML` from data that can originate outside the application
 * (search results, autocomplete responses, document metadata, user
 * queries). Centralising the escaping logic keeps every call site
 * consistent and auditable.
 */

const HTML_ESCAPE_MAP: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

/**
 * Escape a string for safe interpolation into HTML text or attribute
 * contexts. Always use this before placing untrusted data into
 * `innerHTML`/template strings.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"'`]/g,
    (char) => HTML_ESCAPE_MAP[char] ?? char,
  );
}

/**
 * Escape a string so it can be embedded literally inside a `RegExp`.
 * Prevents both regex-injection and catastrophic-backtracking (ReDoS)
 * when a user-supplied query is turned into a pattern.
 */
export function escapeRegExp(value: string): string {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SAFE_URL_SCHEMES: ReadonlySet<string> = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
]);

/**
 * Validate a URL for use in `href`/`src`. Returns the original URL when
 * it uses a safe scheme (or is a relative/anchor link), otherwise
 * returns `"#"` so dangerous schemes like `javascript:` cannot execute.
 */
export function safeUrl(url: unknown): string {
  // Strip ASCII control characters (incl. NUL, tab, newline) that browsers
  // ignore inside scheme names — e.g. "java\tscript:" — before validating.
  const raw = String(url ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  if (raw === "") return "#";

  // Relative paths and same-page anchors are safe.
  if (
    /^[#/?]/.test(raw) ||
    (/^[\w.+-]+(\/|$)/.test(raw) && !/^[a-z][a-z0-9.+-]*:/i.test(raw))
  ) {
    return raw;
  }

  try {
    const parsed = new URL(raw, "https://_relative_base_/");
    return SAFE_URL_SCHEMES.has(parsed.protocol) ? raw : "#";
  } catch {
    return "#";
  }
}

/**
 * Highlight occurrences of `query` inside `text`, returning HTML where
 * the surrounding text is fully escaped and matches are wrapped in a
 * `<mark>` element. Safe to assign to `innerHTML`.
 */
export function highlightSafe(
  text: string,
  query: string,
  markClass = "search-highlight",
): string {
  const safeText = escapeHtml(text);
  const trimmed = String(query ?? "").trim();
  if (trimmed === "") return safeText;

  const pattern = new RegExp(`(${escapeRegExp(escapeHtml(trimmed))})`, "gi");
  return safeText.replace(pattern, `<mark class="${markClass}">$1</mark>`);
}
