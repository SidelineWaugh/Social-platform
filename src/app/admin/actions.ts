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
      backgrounds: {
        create: DEFAULT_BACKGROUNDS.map((b, i) => ({ ...b, sortOrder: i })),
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
      logoUrl: str(formData, "logoUrl") || null,
      startDate: startRaw ? new Date(startRaw + "T00:00:00Z") : null,
      enabledTemplates: templates.length ? templates : undefined,
      published: formData.get("published") === "on",
    },
  });
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/");
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
    await prisma.club.create({ data: { eventId, name, sortOrder: count } });
    revalidatePath(`/admin/events/${eventId}`);
  }
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

export async function deleteBackgroundAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const eventId = str(formData, "eventId");
  if (id) await prisma.background.delete({ where: { id } });
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
}
