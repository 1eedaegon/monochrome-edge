/**
 * Security utilities for the framework adapters.
 *
 * Custom elements and the jQuery plugin build markup from element
 * attributes (`title`, `label`, `error`, `href`, …). Those values are
 * author- or data-supplied and must be escaped/validated before being
 * interpolated into `innerHTML` or an `href`.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

/** Escape a value for safe interpolation into HTML text/attribute context. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"'`]/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

const SAFE_URL_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Return a safe `href`. Relative paths and same-page anchors pass
 * through; absolute URLs must use an allow-listed scheme, otherwise
 * `"#"` is returned so `javascript:`/`data:` cannot execute.
 */
export function safeUrl(url: unknown): string {
  const raw = String(url ?? "").trim();
  if (raw === "") return "#";
  if (/^[#/?]/.test(raw)) return raw;
  if (!/^[a-z][a-z0-9.+-]*:/i.test(raw)) return raw; // scheme-less relative path

  try {
    const parsed = new URL(raw);
    return SAFE_URL_SCHEMES.has(parsed.protocol) ? raw : "#";
  } catch {
    return "#";
  }
}
