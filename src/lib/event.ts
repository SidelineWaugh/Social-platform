/**
 * Per-event configuration.
 *
 * This is the single file to change when reusing the Social Studio for a
 * different Sideline event. Swap the name / dates / hashtag / venue here and
 * update `clubs.ts` with the participating teams.
 */
export const EVENT = {
  name: "Chicago International Cup",
  shortName: "Chicago Cup",
  hashtag: "#ChicagoCup",
  /** Shown in the countdown template and as a default kickoff date. */
  startDate: "2026-08-21",
  season: "2026",
  venue: "Vernon Hills, IL",
  /** Sub-brand shown in the app header. */
  organizer: "Sideline",
} as const;
