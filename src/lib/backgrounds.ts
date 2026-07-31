export interface BackgroundPreset {
  id: string;
  label: string;
  /**
   * CSS `background` value used for both the swatch and the graphic canvas.
   * These are gradient stand-ins — drop real venue photos into /public and
   * swap `css` for `url(...)` to ship the production look.
   */
  css: string;
}

export const BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "none",
    label: "None",
    css: "linear-gradient(160deg, #16203c 0%, #0c1120 100%)",
  },
  {
    id: "venue",
    label: "Venue",
    css: "radial-gradient(120% 80% at 50% 15%, #2f6b3a 0%, #1f4f2b 40%, #12331d 75%, #0c2216 100%)",
  },
  {
    id: "aerial",
    label: "Aerial",
    css: "linear-gradient(180deg, #4a6a8c 0%, #33506f 45%, #1c3049 100%)",
  },
  {
    id: "dusk",
    label: "Dusk",
    css: "linear-gradient(180deg, #3a2b57 0%, #6b3a5f 45%, #b5563f 78%, #d9803f 100%)",
  },
  {
    id: "lakefront",
    label: "Lakefront",
    css: "linear-gradient(180deg, #7fb2d6 0%, #4d84b4 45%, #274d74 100%)",
  },
];

export const BACKGROUND_MAP: Record<string, BackgroundPreset> = Object.fromEntries(
  BACKGROUNDS.map((b) => [b.id, b]),
);
