import type { FormatId } from "./types";

export interface FormatMeta {
  id: FormatId;
  label: string;
  sub: string;
  width: number;
  height: number;
}

export const FORMATS: FormatMeta[] = [
  { id: "portrait", label: "Post", sub: "4:5", width: 1080, height: 1350 },
  { id: "square", label: "Square", sub: "1:1", width: 1080, height: 1080 },
  { id: "story", label: "Story", sub: "9:16", width: 1080, height: 1920 },
];

export const FORMAT_MAP: Record<FormatId, FormatMeta> = Object.fromEntries(
  FORMATS.map((f) => [f.id, f]),
) as Record<FormatId, FormatMeta>;
