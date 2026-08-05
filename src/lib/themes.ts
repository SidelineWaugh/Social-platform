/**
 * Event "Themes" — a head-to-toe designed look each event can own.
 *
 * Where a Brand Kit background (see brandBg.ts) themes only the *backdrop*, a
 * Theme restyles the whole *chrome* of a graphic: the frame, the top kicker,
 * the footer rule, the chip shape, the corner glow, and decorative accents.
 * It's the difference between "a different colour behind the same layout" and
 * "this event's posts have their own signature."
 *
 * A theme is a small bag of tokens — no colours of its own. Every visible part
 * is still drawn from the event's brand + accent colours, so a theme recolours
 * per event automatically, costs nothing at render time, and exports crisp in
 * the downloaded PNG (all pure CSS/SVG). GraphicCanvas reads these tokens and
 * renders the matching chrome; the background picker stays independent, so an
 * event keeps its full choice of backdrops on top of its chosen theme.
 *
 * "classic" reproduces the original layout exactly, so it is the safe default
 * and existing events are visually unchanged until an admin picks another.
 */

export type ThemeKey =
  | "classic"
  | "broadcast"
  | "crest"
  | "kit"
  | "stadium"
  | "minimal";

/** Corner-frame treatment drawn over the whole canvas. */
export type FrameToken = "none" | "inset" | "brackets";
/** Top kicker (event-name row) marker treatment. */
export type KickerToken = "bar" | "block" | "chevron" | "rule" | "tall";
/** Footer divider treatment above the hashtag / organizer line. */
export type FooterToken = "hairline" | "solid" | "double";
/** Chip / pill shape used by template bodies. */
export type ChipToken = "pill" | "square" | "cut" | "line";
/** Brand-glow placement behind the content. */
export type GlowToken = "corner" | "none" | "split" | "top";
/** A full-bleed decorative texture behind the content. */
export type OverlayToken = "none" | "pinstripe";

export interface Theme {
  key: ThemeKey;
  label: string;
  blurb: string;
  frame: FrameToken;
  kicker: KickerToken;
  footer: FooterToken;
  chip: ChipToken;
  glow: GlowToken;
  /** Full-bleed texture drawn faintly behind the content. */
  overlay: OverlayToken;
}

export const THEMES: Theme[] = [
  {
    key: "classic",
    label: "Classic",
    blurb: "The original — clean bar, hairline footer, soft corner glow.",
    frame: "none",
    kicker: "bar",
    footer: "hairline",
    chip: "pill",
    glow: "corner",
    overlay: "none",
  },
  {
    key: "broadcast",
    label: "Broadcast",
    blurb: "TV lower-third: name in a solid accent block, bold footer bar.",
    frame: "none",
    kicker: "block",
    footer: "solid",
    chip: "square",
    glow: "top",
    overlay: "none",
  },
  {
    key: "crest",
    label: "Crest",
    blurb: "Heritage badge: inset double frame and a centred header rule.",
    frame: "inset",
    kicker: "rule",
    footer: "double",
    chip: "pill",
    glow: "top",
    overlay: "none",
  },
  {
    key: "kit",
    label: "Kit",
    blurb: "Jersey-inspired: chevron marker, cut-corner chips, pinstripe texture.",
    frame: "none",
    kicker: "chevron",
    footer: "solid",
    chip: "cut",
    glow: "corner",
    overlay: "pinstripe",
  },
  {
    key: "stadium",
    label: "Stadium",
    blurb: "Big and bold: L-brackets at every corner, chunky marker.",
    frame: "brackets",
    kicker: "tall",
    footer: "solid",
    chip: "square",
    glow: "split",
    overlay: "none",
  },
  {
    key: "minimal",
    label: "Minimal",
    blurb: "Editorial restraint: no glow, no frame, underlined labels.",
    frame: "none",
    kicker: "rule",
    footer: "hairline",
    chip: "line",
    glow: "none",
    overlay: "none",
  },
];

export const THEME_KEYS = THEMES.map((t) => t.key) as ThemeKey[];

export const THEME_MAP: Record<ThemeKey, Theme> = Object.fromEntries(
  THEMES.map((t) => [t.key, t]),
) as Record<ThemeKey, Theme>;

export const DEFAULT_THEME: ThemeKey = "classic";

export function isTheme(v: string): v is ThemeKey {
  return (THEME_KEYS as readonly string[]).includes(v);
}

/** Resolve any stored string to a Theme, falling back to Classic. */
export function resolveTheme(v: string | null | undefined): Theme {
  return v && isTheme(v) ? THEME_MAP[v] : THEME_MAP[DEFAULT_THEME];
}
