export type TemplateId =
  | "were-in"
  | "champions"
  | "matchday"
  | "bracket"
  | "schedule"
  | "result"
  | "countdown"
  | "announcement"
  | "clubs";

export type FormatId = "portrait" | "square" | "story";

/** A per-event chrome look; see lib/themes.ts for the concrete definitions. */
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

export interface Club {
  id: string;
  name: string;
}

/** Per-event branding + metadata handed to the studio (from the DB). */
export interface EventBrand {
  slug: string;
  name: string;
  shortName: string;
  hashtag: string;
  season: string;
  organizer: string;
  brandColor: string;
  brandColor2: string | null;
  logoUrl: string | null;
  venue: string | null;
  startDateIso: string | null; // yyyy-mm-dd, for the countdown default
  theme: ThemeKey;
  enabledTemplates: TemplateId[];
}

export interface ClubData {
  id: string;
  name: string;
  logoUrl: string | null;
}

/** A selectable team (club + age/level). Logo resolved from the club. */
export interface TeamData {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface BackgroundData {
  id: string;
  label: string;
  kind: "gradient" | "image" | "brand";
  value: string; // CSS gradient string, image URL, or a Brand Kit style key
}

/** One game row used by the schedule template. */
export interface GameRow {
  opponent: string;
  detail: string; // e.g. "Fri 10:00 AM · Field 3"
}

/**
 * Everything needed to render a graphic. Fields that a given template does
 * not use are simply ignored by that template's renderer.
 */
export interface GraphicState {
  template: TemplateId;
  format: FormatId;

  clubName: string;
  /** Preset background id, or "upload" when a custom photo is provided. */
  backgroundId: string;
  /** Data URL of an uploaded photo (only when backgroundId === "upload"). */
  uploadedImage: string | null;

  ageGroup: string; // "U14 Boys Elite"

  // matchday / result
  opponent: string;
  kickoff: string; // "Fri · 10:00 AM"
  field: string; // "Field 3"
  ourScore: string;
  theirScore: string;

  // champions
  championTitle: string; // "Division Champions"

  // schedule
  games: GameRow[];

  // countdown
  targetDate: string; // yyyy-mm-dd
  countdownLabel: string; // "Days to kickoff"

  // bracket
  bracketName: string; // "U14 Boys Elite" / "Group A"
  bracketTeams: string[]; // one team per line

  // announcement (event-level)
  announceHeadline: string; // "Registration Open"
  announceSubtext: string; // optional tagline
  announceBigLogo: boolean; // hero the tournament logo, blown up

  // committed clubs (logo wall)
  clubsHeadline: string; // "Committed Clubs"
  clubsNote: string; // count line override; blank = auto "N Clubs Confirmed"
}
