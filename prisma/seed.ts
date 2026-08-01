import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLUBS = [
  "Academia de Futbol Atlas FC Chicago",
  "Bolingbrook SC",
  "Carol Stream Panthers SC",
  "Chicago City Soccer Club",
  "Chicago MX FC",
  "Deportivo 59 FC",
  "Elkhart County United",
  "Evergreen United FC",
  "Gio's Lions SC",
  "Gremio Futbol Club Chicago",
  "Lyons Township SC",
  "Monarcas Futbol Club",
  "Orland Park Sting FC",
  "Tigres NWS",
  "Trebol F.C.",
  "United Elite",
  "Young Sportsmen's Soccer League",
  "Yuriria",
];

const BACKGROUNDS: { label: string; kind: string; value: string }[] = [
  { label: "None", kind: "gradient", value: "linear-gradient(160deg, #16203c 0%, #0c1120 100%)" },
  { label: "Venue", kind: "gradient", value: "radial-gradient(120% 80% at 50% 15%, #2f6b3a 0%, #1f4f2b 40%, #12331d 75%, #0c2216 100%)" },
  { label: "Aerial", kind: "gradient", value: "linear-gradient(180deg, #4a6a8c 0%, #33506f 45%, #1c3049 100%)" },
  { label: "Dusk", kind: "gradient", value: "linear-gradient(180deg, #3a2b57 0%, #6b3a5f 45%, #b5563f 78%, #d9803f 100%)" },
  { label: "Lakefront", kind: "gradient", value: "linear-gradient(180deg, #7fb2d6 0%, #4d84b4 45%, #274d74 100%)" },
];

async function main() {
  // Idempotent + non-destructive: only seed a fresh database. If the event
  // already exists we leave it (and any admin edits) untouched. Safe to run
  // on every deploy.
  const existing = await prisma.event.findUnique({ where: { slug: "chicago-cup" } });
  if (existing) {
    console.log(`Seed skipped — "${existing.name}" already exists.`);
    return;
  }

  const event = await prisma.event.create({
    data: {
      slug: "chicago-cup",
      name: "Chicago International Cup",
      shortName: "Chicago Cup",
      hashtag: "#ChicagoCup",
      season: "2026",
      startDate: new Date("2026-08-21T00:00:00Z"),
      venue: "Vernon Hills, IL",
      organizer: "Sideline",
      brandColor: "#e83a48",
      published: true,
      clubs: { create: CLUBS.map((name, i) => ({ name, sortOrder: i })) },
      backgrounds: {
        create: BACKGROUNDS.map((b, i) => ({
          label: b.label,
          kind: b.kind,
          value: b.value,
          sortOrder: i,
        })),
      },
    },
  });

  console.log(
    `Seeded "${event.name}" (/${event.slug}) with ${CLUBS.length} clubs and ${BACKGROUNDS.length} backgrounds.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
