import { prisma } from "./db";
import type {
  EventBrand,
  ClubData,
  BackgroundData,
  TemplateId,
} from "./types";
import type { Event as PrismaEvent } from "@prisma/client";

export function toBrand(e: PrismaEvent): EventBrand {
  return {
    slug: e.slug,
    name: e.name,
    shortName: e.shortName,
    hashtag: e.hashtag,
    season: e.season,
    organizer: e.organizer,
    brandColor: e.brandColor,
    logoUrl: e.logoUrl,
    startDateIso: e.startDate ? e.startDate.toISOString().slice(0, 10) : null,
    enabledTemplates: e.enabledTemplates as TemplateId[],
  };
}

export async function getPublishedEvents() {
  return prisma.event.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { clubs: true } } },
  });
}

export interface StudioData {
  event: EventBrand;
  clubs: ClubData[];
  backgrounds: BackgroundData[];
}

export async function getStudioData(slug: string): Promise<StudioData | null> {
  const e = await prisma.event.findUnique({
    where: { slug },
    include: {
      clubs: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      backgrounds: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!e) return null;

  return {
    event: toBrand(e),
    clubs: e.clubs.map((c) => ({ id: c.id, name: c.name, logoUrl: c.logoUrl })),
    backgrounds: e.backgrounds.map((b) => ({
      id: b.id,
      label: b.label,
      kind: b.kind === "image" ? "image" : "gradient",
      value: b.value,
    })),
  };
}
