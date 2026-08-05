/**
 * Event "Themes" — a head-to-toe designed look each event can own.
 *
 * Where a Brand Kit background (see brandBg.ts) themes only the *backdrop*, a
 * Theme restyles the whole *chrome* of a graphic: the typography, where the
 * wording sits, the frame, the top kicker, the footer rule, the chip shape,
 * the corner glow and the texture. It's the difference between "a different
 * colour behind the same layout" and "this event's posts have their own
 * signature."
 *
 * A theme is a small bag of tokens — no colours of its own. Every visible part
 * is still drawn from the event's brand + accent colours, so a theme recolours
 * per event automatically, costs nothing at render time, and exports crisp in
 * the downloaded PNG (all pure CSS/SVG + self-hosted fonts). GraphicCanvas
 * reads these tokens and renders the matching chrome; the background picker
 * stays independent, so an event keeps its full choice of backdrops on top of
 * its chosen theme.
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
  | "minimal"
  | "terrace"
  | "wire"
  | "editorial"
  | "chalk"
  | "pitch"
  | "anthem";

/** Logical font roles, mapped to concrete families in GraphicCanvas. */
export type FontKey =
  | "anton"
  | "bebas"
  | "oswald"
  | "saira"
  | "archivo"
  | "grotesk"
  | "mono"
  | "inter";

/** Fonts a theme drives — a heavy display face plus a labelling face. */
export interface ThemeType {
  /** Big-headline face. Kept to heavy display fonts so tuned sizes still fit. */
  display: "anton" | "bebas" | "oswald";
  /** Kicker / sub-line / chip / list face. */
  label: FontKey;
}

/** Where the hero wording sits vertically between the kicker and footer. */
export type AnchorToken = "top" | "center" | "bottom";
/** Corner-frame treatment drawn over the whole canvas. */
export type FrameToken = "none" | "inset" | "brackets" | "sidebar" | "rails";
/** Top kicker (event-name row) marker treatment. */
export type KickerToken = "bar" | "block" | "chevron" | "rule" | "tall";
/** Footer divider treatment above the hashtag / organizer line. */
export type FooterToken = "hairline" | "solid" | "double" | "ticker";
/** Chip / pill shape used by template bodies. */
export type ChipToken = "pill" | "square" | "cut" | "line";
/** Brand-glow placement behind the content. */
export type GlowToken = "corner" | "none" | "split" | "top";
/** A full-bleed decorative texture behind the content. */
export type OverlayToken = "none" | "pinstripe" | "grid";

export interface Theme {
  key: ThemeKey;
  label: string;
  blurb: string;
  type: ThemeType;
  anchor: AnchorToken;
  frame: FrameToken;
  kicker: KickerToken;
  footer: FooterToken;
  chip: ChipToken;
  glow: GlowToken;
  overlay: OverlayToken;
}

/** The original type pairing (Anton headline + Saira Condensed labels). */
const CLASSIC_TYPE: ThemeType = { display: "anton", label: "saira" };

export const THEMES: Theme[] = [
  {
    key: "classic",
    label: "Classic",
    blurb: "The original — Anton caps, clean bar, soft corner glow.",
    type: CLASSIC_TYPE,
    anchor: "center",
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
    type: CLASSIC_TYPE,
    anchor: "center",
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
    type: CLASSIC_TYPE,
    anchor: "center",
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
    type: CLASSIC_TYPE,
    anchor: "center",
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
    type: CLASSIC_TYPE,
    anchor: "center",
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
    type: CLASSIC_TYPE,
    anchor: "center",
    frame: "none",
    kicker: "rule",
    footer: "hairline",
    chip: "line",
    glow: "none",
    overlay: "none",
  },

  /* --------------------------- new for round 2 --------------------------- */

  {
    key: "terrace",
    label: "Terrace",
    blurb: "Ultras poster: tall Bebas caps dropped low, left accent stripe.",
    type: { display: "bebas", label: "archivo" },
    anchor: "bottom",
    frame: "sidebar",
    kicker: "tall",
    footer: "solid",
    chip: "square",
    glow: "none",
    overlay: "none",
  },
  {
    key: "wire",
    label: "Wire",
    blurb: "Broadcast data: monospaced labels, top & bottom accent rails.",
    type: { display: "anton", label: "mono" },
    anchor: "center",
    frame: "rails",
    kicker: "block",
    footer: "hairline",
    chip: "square",
    glow: "none",
    overlay: "none",
  },
  {
    key: "editorial",
    label: "Editorial",
    blurb: "Magazine cover: Grotesk labels, headline up top, underlined tags.",
    type: { display: "anton", label: "grotesk" },
    anchor: "top",
    frame: "none",
    kicker: "rule",
    footer: "hairline",
    chip: "line",
    glow: "top",
    overlay: "none",
  },
  {
    key: "chalk",
    label: "Chalk",
    blurb: "Vintage board: Oswald headline, inset frame, faint grid, low wording.",
    type: { display: "oswald", label: "archivo" },
    anchor: "bottom",
    frame: "inset",
    kicker: "rule",
    footer: "double",
    chip: "pill",
    glow: "none",
    overlay: "grid",
  },
  {
    key: "pitch",
    label: "Pitch",
    blurb: "Tactics board: corner brackets over a faint pitch grid, Grotesk tags.",
    type: { display: "anton", label: "grotesk" },
    anchor: "center",
    frame: "brackets",
    kicker: "chevron",
    footer: "solid",
    chip: "square",
    glow: "corner",
    overlay: "grid",
  },
  {
    key: "anthem",
    label: "Anthem",
    blurb: "Hype reel: Bebas caps, cut chips, ticker footer, twin glow.",
    type: { display: "bebas", label: "archivo" },
    anchor: "center",
    frame: "sidebar",
    kicker: "chevron",
    footer: "ticker",
    chip: "cut",
    glow: "split",
    overlay: "none",
  },
];

/** Logical font role → concrete self-hosted family (imported in layout.tsx). */
export const FONT_FAMILY: Record<FontKey, string> = {
  anton: '"Anton", "Arial Narrow", sans-serif',
  bebas: '"Bebas Neue", "Arial Narrow", sans-serif',
  oswald: '"Oswald", "Arial Narrow", sans-serif',
  saira: '"Saira Condensed", "Arial Narrow", sans-serif',
  archivo: '"Archivo", ui-sans-serif, system-ui, sans-serif',
  grotesk: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  mono: '"Spline Sans Mono", ui-monospace, monospace',
  inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
};

/**
 * Per display-face weight / leading / tracking, so the tuned headline sizes
 * read right whichever face a theme uses.
 */
export const DISPLAY_META: Record<
  ThemeType["display"],
  { weight: number; lead: number; space: string }
> = {
  anton: { weight: 400, lead: 0.86, space: "0.005em" },
  bebas: { weight: 400, lead: 0.84, space: "0.012em" },
  oswald: { weight: 700, lead: 0.92, space: "0.004em" },
};

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
