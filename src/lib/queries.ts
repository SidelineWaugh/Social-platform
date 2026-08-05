import { prisma } from "./db";
import type {
  EventBrand,
  ClubData,
  TeamData,
  BackgroundData,
  TemplateId,
} from "./types";
import { findClubLogo } from "./clubs";
import { resolveTheme } from "./themes";
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
    brandColor2: e.brandColor2,
    logoUrl: e.logoUrl,
    venue: e.venue,
    startDateIso: e.startDate ? e.startDate.toISOString().slice(0, 10) : null,
    theme: resolveTheme(e.theme).key,
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
  teams: TeamData[];
  backgrounds: BackgroundData[];
}

export async function getStudioData(slug: string): Promise<StudioData | null> {
  const e = await prisma.event.findUnique({
    where: { slug },
    include: {
      clubs: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      teams: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      backgrounds: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!e) return null;

  const clubs: ClubData[] = e.clubs.map((c) => ({
    id: c.id,
    name: c.name,
    logoUrl: c.logoUrl,
  }));

  const teams: TeamData[] = e.teams.map((t) => {
    // Explicit club association wins; otherwise resolve by name.
    const explicit = t.clubName
      ? clubs.find((c) => c.name.trim().toLowerCase() === t.clubName!.trim().toLowerCase())?.logoUrl
      : null;
    return {
      id: t.id,
      name: t.name,
      logoUrl: explicit ?? findClubLogo(clubs, t.name),
    };
  });

  return {
    event: toBrand(e),
    clubs,
    teams,
    backgrounds: e.backgrounds.map((b) => ({
      id: b.id,
      label: b.label,
      kind: b.kind === "image" ? "image" : b.kind === "brand" ? "brand" : "gradient",
      value: b.value,
    })),
  };
}
