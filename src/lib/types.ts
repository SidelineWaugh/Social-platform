export type TemplateId =
  | "were-in"
  | "champions"
  | "matchday"
  | "schedule"
  | "result"
  | "countdown";

export type FormatId = "portrait" | "square" | "story";

export interface Club {
  id: string;
  name: string;
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
}
