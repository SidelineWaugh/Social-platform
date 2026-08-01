import type { TemplateId } from "./types";

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  emoji: string;
  blurb: string;
}

export const TEMPLATES: TemplateMeta[] = [
  { id: "were-in", label: "Confirmed", emoji: "✅", blurb: "Announce your spot" },
  { id: "champions", label: "Champions", emoji: "🏆", blurb: "Celebrate the win" },
  { id: "matchday", label: "Matchday", emoji: "⚽", blurb: "Hype the next game" },
  { id: "bracket", label: "Bracket", emoji: "🗂️", blurb: "Announce the field" },
  { id: "schedule", label: "Schedule", emoji: "📋", blurb: "Share group games" },
  { id: "result", label: "Result", emoji: "📊", blurb: "Post the final score" },
  { id: "countdown", label: "Countdown", emoji: "⏳", blurb: "Days to kickoff" },
  { id: "announcement", label: "Event", emoji: "📣", blurb: "Announce the event" },
];

export const TEMPLATE_MAP: Record<TemplateId, TemplateMeta> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
) as Record<TemplateId, TemplateMeta>;
