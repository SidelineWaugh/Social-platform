import type { Club } from "./types";

/** Participating clubs. Reuse the studio for another event by editing this list. */
export const CLUBS: Club[] = [
  { id: "atlas", name: "Academia de Futbol Atlas FC Chicago" },
  { id: "bolingbrook", name: "Bolingbrook SC" },
  { id: "carol-stream", name: "Carol Stream Panthers SC" },
  { id: "chicago-city", name: "Chicago City Soccer Club" },
  { id: "chicago-mx", name: "Chicago MX FC" },
  { id: "deportivo-59", name: "Deportivo 59 FC" },
  { id: "elkhart", name: "Elkhart County United" },
  { id: "evergreen", name: "Evergreen United FC" },
  { id: "gios-lions", name: "Gio's Lions SC" },
  { id: "gremio", name: "Gremio Futbol Club Chicago" },
  { id: "lyons", name: "Lyons Township SC" },
  { id: "monarcas", name: "Monarcas Futbol Club" },
  { id: "orland-park", name: "Orland Park Sting FC" },
  { id: "tigres", name: "Tigres NWS" },
  { id: "trebol", name: "Trebol F.C." },
  { id: "united-elite", name: "United Elite" },
  { id: "young-sportsmen", name: "Young Sportsmen's Soccer League" },
  { id: "yuriria", name: "Yuriria" },
];

const STOP_WORDS = new Set([
  "fc",
  "sc",
  "cf",
  "de",
  "the",
  "club",
  "soccer",
  "futbol",
  "united",
  "academia",
  "league",
]);

/**
 * Derive up to two initials from a club name for the crest badge.
 * "Elkhart County United" -> "EC", "Chicago City Soccer Club" -> "CC".
 */
export function clubInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  const significant = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  const source = significant.length ? significant : words;

  if (source.length === 0) return "FC";
  if (source.length === 1) return source[0].slice(0, 2).toUpperCase();
  return (source[0][0] + source[1][0]).toUpperCase();
}
