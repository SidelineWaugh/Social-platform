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
