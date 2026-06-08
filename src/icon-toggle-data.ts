/**
 * @monochrome-edge/ui - Shared IconToggle data
 *
 * Single source of truth for the IconToggle's states, transitions, the
 * document attribute each type reflects, and the SVG markup for the two
 * visual icons. Every framework adapter (React, Vue, jQuery, Web Component)
 * consumes this so the icons and behaviour can never drift between targets.
 *
 * The SVG icons are static, trusted markup (no user input) — adapters render
 * them as raw HTML (`dangerouslySetInnerHTML` / `innerHTML`).
 */

export type IconToggleType = "mode" | "theme" | "color" | "language";

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round"';
const svg = (body: string): string => `<svg ${SVG_ATTRS}>${body}</svg>`;

const SUN = svg(
  '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>' +
    '<line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>' +
    '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>' +
    '<line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>' +
    '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
);
const MOON = svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>');
const FLAME = svg(
  '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 ' +
    '.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
);
const SNOW = svg(
  '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>' +
    '<line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>' +
    '<line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>' +
    '<line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>',
);
const CIRCLE_MONO = svg('<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>');
const CIRCLE_COLOR = svg(
  '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
);
const GLOBE = svg(
  '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>' +
    '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
);
const GRID = svg(
  '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
);

interface ToggleSpec {
  default: string;
  /** state -> next state */
  transition: Record<string, string>;
  /** document attribute reflected on toggle, if any */
  attr?: string;
  /** [iconForFirstState, iconForSecondState] */
  icons: [string, string];
}

export const ICON_TOGGLE: Record<IconToggleType, ToggleSpec> = {
  mode: {
    default: "light",
    transition: { light: "dark", dark: "light" },
    attr: "data-theme",
    icons: [SUN, MOON],
  },
  theme: {
    default: "warm",
    transition: { warm: "cold", cold: "warm" },
    attr: "data-theme-variant",
    icons: [FLAME, SNOW],
  },
  color: {
    default: "monochrome",
    transition: { monochrome: "colored", colored: "monochrome" },
    icons: [CIRCLE_MONO, CIRCLE_COLOR],
  },
  language: {
    default: "ko",
    transition: { ko: "en", en: "ko" },
    icons: [GLOBE, GRID],
  },
};

export function iconToggleDefault(type: string): string {
  return ICON_TOGGLE[type as IconToggleType]?.default ?? "default";
}

export function iconToggleIcons(type: string): [string, string] {
  return (ICON_TOGGLE[type as IconToggleType] ?? ICON_TOGGLE.mode).icons;
}

export function nextIconToggleState(type: string, current: string): string {
  const spec = ICON_TOGGLE[type as IconToggleType];
  return spec?.transition[current] ?? current;
}

/** Reflect the toggled state onto the document (mode/theme only). */
export function applyIconToggleState(type: string, state: string): void {
  if (typeof document === "undefined") return;
  const attr = ICON_TOGGLE[type as IconToggleType]?.attr;
  if (attr) document.documentElement.setAttribute(attr, state);
}

/** Read the live state from the document, falling back to the default. */
export function readIconToggleState(type: string): string {
  const spec = ICON_TOGGLE[type as IconToggleType];
  if (typeof document !== "undefined" && spec?.attr) {
    return document.documentElement.getAttribute(spec.attr) ?? spec.default;
  }
  return spec?.default ?? "default";
}
