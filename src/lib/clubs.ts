import type { ClubData } from "./types";

/**
 * Resolve a team name to its club's logo. Handles "Club Name + suffix" (e.g.
 * "South Orlando United ECRL" → the "South Orlando United" club) by matching
 * the longest club name that the team name starts with, then falling back to a
 * contained-substring match.
 */
export function findClubLogo(clubs: ClubData[], name: string): string | null {
  const n = name.trim().toLowerCase();
  if (!n) return null;

  // Exact club match is authoritative (even if that club has no logo).
  const exact = clubs.find((c) => c.name.trim().toLowerCase() === n);
  if (exact) return exact.logoUrl;

  let best: ClubData | null = null;
  let bestLen = 0;

  // "Club Name " is a prefix of the team name.
  for (const c of clubs) {
    const cn = c.name.trim().toLowerCase();
    if (cn && n.startsWith(cn + " ") && cn.length > bestLen) {
      best = c;
      bestLen = cn.length;
    }
  }
  if (best) return best.logoUrl;

  // Club name appears anywhere in the team name.
  for (const c of clubs) {
    const cn = c.name.trim().toLowerCase();
    if (cn && n.includes(cn) && cn.length > bestLen) {
      best = c;
      bestLen = cn.length;
    }
  }
  return best ? best.logoUrl : null;
}

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
