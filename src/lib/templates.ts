import type { TemplateId } from "./types";

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  emoji: string;
  blurb: string;
}

export const TEMPLATES: TemplateMeta[] = [
  { id: "were-in", label: "We're In", emoji: "✈️", blurb: "Announce your spot" },
  { id: "champions", label: "Champions", emoji: "🏆", blurb: "Celebrate the win" },
  { id: "matchday", label: "Matchday", emoji: "⚽", blurb: "Hype the next game" },
  { id: "schedule", label: "Schedule", emoji: "📋", blurb: "Share group games" },
  { id: "result", label: "Result", emoji: "📊", blurb: "Post the final score" },
  { id: "countdown", label: "Countdown", emoji: "⏳", blurb: "Days to kickoff" },
];

export const TEMPLATE_MAP: Record<TemplateId, TemplateMeta> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
) as Record<TemplateId, TemplateMeta>;
