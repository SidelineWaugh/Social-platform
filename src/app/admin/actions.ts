"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";
import { TEMPLATES } from "@/lib/templates";
import { BRAND_STYLES } from "@/lib/brandBg";

const VALID_TEMPLATES = new Set(TEMPLATES.map((t) => t.id));

// Gradient backgrounds every new event starts with, so its studio works
// immediately. Admins can delete these or add image-URL backgrounds.
const DEFAULT_BACKGROUNDS: { label: string; kind: string; value: string }[] = [
  { label: "None", kind: "gradient", value: "linear-gradient(160deg, #16203c 0%, #0c1120 100%)" },
  { label: "Pitch", kind: "gradient", value: "radial-gradient(120% 80% at 50% 15%, #2f6b3a 0%, #1f4f2b 40%, #12331d 75%, #0c2216 100%)" },
  { label: "Dusk", kind: "gradient", value: "linear-gradient(180deg, #3a2b57 0%, #6b3a5f 45%, #b5563f 78%, #d9803f 100%)" },
  { label: "Skyline", kind: "gradient", value: "linear-gradient(180deg, #4a6a8c 0%, #33506f 45%, #1c3049 100%)" },
];

async function requireAdmin() {
  const store = await cookies();
  const ok = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? "";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

/* --------------------------------- csv ---------------------------------- */

/** Minimal CSV parser (handles quoted fields and commas/newlines within). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/**
 * Turn CSV text into teams. Detects a header row and columns named
 * team/name, club, age/division/level. Falls back to: build "Club Age",
 * or use the first column as the team name.
 */
function teamsFromCsv(text: string): { name: string; clubName: string | null }[] {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const known = ["team", "team name", "name", "club", "club name", "age", "age group", "division", "level"];
  const hasHeader = header.some((h) => known.includes(h));
  const idx = (names: string[]) => header.findIndex((h) => names.includes(h));
  const teamCol = hasHeader ? idx(["team", "team name", "name"]) : -1;
  const clubCol = hasHeader ? idx(["club", "club name"]) : -1;
  const ageCol = hasHeader ? idx(["age", "age group", "division", "level"]) : -1;

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const out: { name: string; clubName: string | null }[] = [];
  for (const r of dataRows) {
    const cell = (i: number) => (i >= 0 && i < r.length ? r[i].trim() : "");
    const club = cell(clubCol);
    const age = cell(ageCol);
    let name = teamCol >= 0 ? cell(teamCol) : "";
    if (!name) name = [club, age].filter(Boolean).join(" ");
    if (!name) name = (r[0] ?? "").trim();
    if (!name) continue;
    out.push({ name, clubName: club || null });
  }
  return out;
}

/**
 * Resolve a club logo from a form: an uploaded file becomes a data URL (stored
 * in Postgres so it always renders in the exported PNG), or a pasted URL is
 * used as-is. Returns undefined when neither was provided.
 */
async function logoFromForm(fd: FormData): Promise<string | null | undefined> {
  const file = fd.get("logo");
  if (file && typeof file === "object" && "arrayBuffer" in file) {
    const f = file as File;
    if (f.size > 0 && f.size <= MAX_LOGO_BYTES) {
      const buf = Buffer.from(await f.arrayBuffer());
      const type = f.type || "image/png";
      return `data:${type};base64,${buf.toString("base64")}`;
    }
  }
  const url = str(fd, "logoUrl");
  return url ? url : undefined;
}

/* --------------------------------- auth --------------------------------- */

export async function loginAction(formData: FormData) {
  const password = str(formData, "password");
  if (!verifyPassword(password)) {
    redirect("/admin/login?error=1");
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* -------------------------------- events -------------------------------- */

export async function createEventAction(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const slug = slugify(str(formData, "slug") || name);
  if (!name || !slug) redirect("/admin?error=name");

  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) redirect("/admin?error=slug");

  const event = await prisma.event.create({
    data: {
      slug,
      name,
      shortName: str(formData, "shortName") || name,
      hashtag: str(formData, "hashtag") || `#${slug.replace(/-/g, "")}`,
      season: str(formData, "season") || String(new Date().getFullYear()),
      organizer: str(formData, "organizer") || "Sideline",
      brandColor: str(formData, "brandColor") || "#e83a48",
      enabledTemplates: TEMPLATES.map((t) => t.id),
      backgrounds: {
        create: [
          ...DEFAULT_BACKGROUNDS.map((b, i) => ({ ...b, sortOrder: i })),
          ...BRAND_STYLES.map((s, i) => ({
            label: s.label,
            kind: "brand",
            value: s.key,
            sortOrder: DEFAULT_BACKGROUNDS.length + i,
          })),
        ],
      },
    },
  });
  redirect(`/admin/events/${event.id}`);
}

export async function updateEventAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;

  const startRaw = str(formData, "startDate");
  const templates = formData
    .getAll("template")
    .map(String)
    .filter((t) => VALID_TEMPLATES.has(t as (typeof TEMPLATES)[number]["id"]));

  await prisma.event.update({
    where: { id },
    data: {
      name: str(formData, "name"),
      shortName: str(formData, "shortName"),
      hashtag: str(formData, "hashtag"),
      season: str(formData, "season"),
      venue: str(formData, "venue") || null,
      organizer: str(formData, "organizer") || "Sideline",
      brandColor: str(formData, "brandColor") || "#e83a48",
      brandColor2: str(formData, "brandColor2") || null,
      startDate: startRaw ? new Date(startRaw + "T00:00:00Z") : null,
      enabledTemplates: templates.length ? templates : undefined,
      published: formData.get("published") === "on",
    },
  });
  revalidatePath("/");
  redirect(`/admin/events/${id}?saved=1`);
}

export async function setEventLogoAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  if (formData.get("clear") === "1") {
    await prisma.event.update({ where: { id }, data: { logoUrl: null } });
  } else {
    const logoUrl = await logoFromForm(formData);
    if (logoUrl) await prisma.event.update({ where: { id }, data: { logoUrl } });
  }
  revalidatePath(`/admin/events/${id}`);
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await prisma.event.delete({ where: { id } });
  redirect("/admin");
}

/* --------------------------------- clubs -------------------------------- */

export async function addClubAction(formData: FormData) {
  await requireAdmin();
  const eventId = str(formData, "eventId");
  const name = str(formData, "name");
  if (eventId && name) {
    const count = await prisma.club.count({ where: { eventId } });
    const logoUrl = await logoFromForm(formData);
    await prisma.club.create({
      data: { eventId, name, sortOrder: count, logoUrl: logoUrl ?? null },
    });
    revalidatePath(`/admin/events/${eventId}`);
  }
}

export async function setClubLogoAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const eventId = str(formData, "eventId");
  if (!id) return;

  if (formData.get("clear") === "1") {
    await prisma.club.update({ where: { id }, data: { logoUrl: null } });
  } else {
    const logoUrl = await logoFromForm(formData);
    if (logoUrl) await prisma.club.update({ where: { id }, data: { logoUrl } });
  }
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
}

export async function bulkAddClubsAction(formData: FormData) {
  await requireAdmin();
  const eventId = str(formData, "eventId");
  const names = str(formData, "names")
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);
  if (eventId && names.length) {
    const count = await prisma.club.count({ where: { eventId } });
    await prisma.club.createMany({
      data: names.map((name, i) => ({ eventId, name, sortOrder: count + i })),
    });
    revalidatePath(`/admin/events/${eventId}`);
  }
}

export async function deleteClubAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const eventId = str(formData, "eventId");
  if (id) await prisma.club.delete({ where: { id } });
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
}

/* --------------------------------- teams -------------------------------- */

export async function addTeamAction(formData: FormData) {
  await requireAdmin();
  const eventId = str(formData, "eventId");
  const name = str(formData, "name");
  const clubName = str(formData, "clubName") || null;
  if (eventId && name) {
    const count = await prisma.team.count({ where: { eventId } });
    await prisma.team.create({ data: { eventId, name, clubName, sortOrder: count } });
    revalidatePath(`/admin/events/${eventId}`);
  }
}

export async function bulkAddTeamsAction(formData: FormData) {
  await requireAdmin();
  const eventId = str(formData, "eventId");
  const names = str(formData, "names")
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);
  if (eventId && names.length) {
    const count = await prisma.team.count({ where: { eventId } });
    await prisma.team.createMany({
      data: names.map((name, i) => ({ eventId, name, sortOrder: count + i })),
    });
    revalidatePath(`/admin/events/${eventId}`);
  }
}

export async function importTeamsCsvAction(formData: FormData) {
  await requireAdmin();
  const eventId = str(formData, "eventId");
  const file = formData.get("csv");
  if (!eventId || !file || typeof file !== "object" || !("text" in file)) return;
  const text = await (file as File).text();
  const parsed = teamsFromCsv(text);
  if (parsed.length) {
    const count = await prisma.team.count({ where: { eventId } });
    await prisma.team.createMany({
      data: parsed.map((t, i) => ({
        eventId,
        name: t.name,
        clubName: t.clubName,
        sortOrder: count + i,
      })),
    });
    revalidatePath(`/admin/events/${eventId}`);
  }
}

export async function deleteTeamAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const eventId = str(formData, "eventId");
  if (id) await prisma.team.delete({ where: { id } });
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
}

export async function clearTeamsAction(formData: FormData) {
  await requireAdmin();
  const eventId = str(formData, "eventId");
  if (eventId) {
    await prisma.team.deleteMany({ where: { eventId } });
    revalidatePath(`/admin/events/${eventId}`);
  }
}

/* ------------------------------ backgrounds ----------------------------- */

export async function addBackgroundAction(formData: FormData) {
  await requireAdmin();
  const eventId = str(formData, "eventId");
  const label = str(formData, "label");
  const kind = str(formData, "kind") === "image" ? "image" : "gradient";
  const value = str(formData, "value");
  if (eventId && label && value) {
    const count = await prisma.background.count({ where: { eventId } });
    await prisma.background.create({
      data: { eventId, label, kind, value, sortOrder: count },
    });
    revalidatePath(`/admin/events/${eventId}`);
  }
}

export async function addBrandStylesAction(formData: FormData) {
  await requireAdmin();
  const eventId = str(formData, "eventId");
  if (!eventId) return;
  const existing = await prisma.background.findMany({
    where: { eventId, kind: "brand" },
    select: { value: true },
  });
  const have = new Set(existing.map((b) => b.value));
  const missing = BRAND_STYLES.filter((s) => !have.has(s.key));
  if (missing.length) {
    const count = await prisma.background.count({ where: { eventId } });
    await prisma.background.createMany({
      data: missing.map((s, i) => ({
        eventId,
        label: s.label,
        kind: "brand",
        value: s.key,
        sortOrder: count + i,
      })),
    });
  }
  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteBackgroundAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const eventId = str(formData, "eventId");
  if (id) await prisma.background.delete({ where: { id } });
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
}
