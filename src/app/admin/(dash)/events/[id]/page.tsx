import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TEMPLATES } from "@/lib/templates";
import { clubInitials } from "@/lib/clubs";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";
import { brandBackground } from "@/lib/brandBg";
import { THEMES, type Theme } from "@/lib/themes";
import {
  updateEventAction,
  setEventLogoAction,
  deleteEventAction,
  addClubAction,
  bulkAddClubsAction,
  deleteClubAction,
  setClubLogoAction,
  bulkAddTeamsAction,
  importTeamsCsvAction,
  deleteTeamAction,
  clearTeamsAction,
  addBackgroundAction,
  addBrandStylesAction,
  deleteBackgroundAction,
  extractBrandColorsAction,
} from "../../../actions";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-line bg-input px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint outline-none transition focus:border-brand/70 focus:ring-2 focus:ring-brand/25";
const label = "label mb-1.5 block text-ink-faint!";

export default async function EventEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; colors?: string }>;
}) {
  const { id } = await params;
  const { saved, colors } = await searchParams;

  const colorBanner: Record<string, { tone: string; msg: string }> = {
    "1": {
      tone: "border-green-500/30 bg-green-500/10 text-green-400",
      msg: "Brand colours read from the logo ✓ — check the swatches below and Save changes to keep them.",
    },
    nokey: {
      tone: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      msg: "Colour extraction isn't configured — add an ANTHROPIC_API_KEY variable in your host (Railway) to enable it.",
    },
    nologo: {
      tone: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      msg: "Upload an event logo first, then pull colours from it.",
    },
    fail: {
      tone: "border-brand/40 bg-brand/10 text-brand",
      msg: "Couldn't read colours from that logo — set them manually below.",
    },
  };
  const banner = colors ? colorBanner[colors] : undefined;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      clubs: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      teams: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      backgrounds: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!event) notFound();

  const startValue = event.startDate
    ? event.startDate.toISOString().slice(0, 10)
    : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-ink-muted hover:text-ink">
            ‹ All events
          </Link>
          <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-ink">
            {event.name}
          </h1>
        </div>
        {event.published && (
          <Link
            href={`/${event.slug}`}
            className="rounded-full border border-line px-4 py-1.5 font-cond text-xs font-bold uppercase tracking-[0.14em] text-ink-muted transition hover:text-ink"
          >
            Open studio →
          </Link>
        )}
      </div>

      {/* ---------------------------- details ---------------------------- */}
      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-ink">
          Details &amp; branding
        </h2>
        {saved && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
            Saved ✓
          </div>
        )}
        {banner && (
          <div className={`mb-4 rounded-lg border px-4 py-2 text-sm ${banner.tone}`}>
            {banner.msg}
          </div>
        )}
        <form action={updateEventAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={event.id} />
          <label className="block">
            <span className={label}>Event name</span>
            <input name="name" defaultValue={event.name} className={input} />
          </label>
          <label className="block">
            <span className={label}>Short name</span>
            <input name="shortName" defaultValue={event.shortName} className={input} />
          </label>
          <label className="block">
            <span className={label}>Season</span>
            <input name="season" defaultValue={event.season} className={input} />
          </label>
          <label className="block">
            <span className={label}>Hashtag</span>
            <input name="hashtag" defaultValue={event.hashtag} className={input} />
          </label>
          <label className="block">
            <span className={label}>Start date (for countdown)</span>
            <input type="date" name="startDate" defaultValue={startValue} className={input} />
          </label>
          <label className="block">
            <span className={label}>Venue</span>
            <input name="venue" defaultValue={event.venue ?? ""} className={input} />
          </label>
          <label className="block">
            <span className={label}>Organizer (footer)</span>
            <input name="organizer" defaultValue={event.organizer} className={input} />
          </label>
          <label className="block">
            <span className={label}>Brand color (primary)</span>
            <input
              name="brandColor"
              type="color"
              defaultValue={event.brandColor}
              className="h-11 w-full rounded-lg border border-line bg-input px-2"
            />
          </label>
          <label className="block">
            <span className={label}>Accent color (host brand)</span>
            <input
              name="brandColor2"
              type="color"
              defaultValue={event.brandColor2 ?? "#86e3b0"}
              className="h-11 w-full rounded-lg border border-line bg-input px-2"
            />
            <span className="mt-1 block text-[11px] text-ink-faint">
              Used by the Brand Kit backgrounds to match a host club&rsquo;s look.
            </span>
          </label>

          <div className="sm:col-span-2">
            <span className={label}>Theme</span>
            <p className="mb-2.5 text-[11px] text-ink-faint">
              A head-to-toe signature look for every graphic — frame, header,
              footer, chips and glow. Recolours from the brand colours above;
              backgrounds stay separately choosable in the studio.
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {THEMES.map((t) => (
                <label key={t.key} className="group cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={t.key}
                    defaultChecked={event.theme === t.key}
                    className="peer sr-only"
                  />
                  <div className="overflow-hidden rounded-lg border border-line transition group-hover:border-line-strong peer-checked:border-brand peer-checked:ring-2 peer-checked:ring-brand/30">
                    <ThemePreviewMini
                      theme={t}
                      primary={event.brandColor}
                      accent={event.brandColor2 ?? event.brandColor}
                    />
                    <div className="bg-input px-2.5 py-1.5">
                      <div className="font-cond text-sm font-bold uppercase tracking-wide text-ink">
                        {t.label}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                        {t.blurb}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className={label}>Enabled templates</span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-input px-3 py-2 text-sm text-ink has-[:checked]:border-brand/70 has-[:checked]:bg-brand/12"
                >
                  <input
                    type="checkbox"
                    name="template"
                    value={t.id}
                    defaultChecked={event.enabledTemplates.includes(t.id)}
                    className="accent-brand"
                  />
                  <span>{t.emoji} {t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              name="published"
              defaultChecked={event.published}
              className="h-4 w-4 accent-brand"
            />
            <span className="text-sm text-ink">Published (visible on the public site)</span>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-2.5 font-cond text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>

      {/* --------------------------- event logo -------------------------- */}
      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="mb-1 font-display text-xl uppercase tracking-wide text-ink">
          Event logo
        </h2>
        <p className="mb-4 text-xs text-ink-muted">
          Shown in a corner of every post and featured on the Event Announcement.
          A transparent PNG wordmark works best.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {event.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.logoUrl} alt="" className="h-14 max-w-[220px] object-contain" />
          ) : (
            <span className="text-sm text-ink-faint">No logo set</span>
          )}
          <ImageUploadForm
            action={setEventLogoAction}
            fieldName="logoUrl"
            hidden={{ id: event.id }}
            maxDim={512}
            mime="image/png"
            buttonLabel={event.logoUrl ? "Replace" : "Upload"}
          />
          {event.logoUrl && (
            <form action={setEventLogoAction}>
              <input type="hidden" name="id" value={event.id} />
              <input type="hidden" name="clear" value="1" />
              <button
                type="submit"
                className="text-xs text-ink-muted transition hover:text-brand"
              >
                Remove
              </button>
            </form>
          )}
        </div>
        {event.logoUrl?.startsWith("data:") && (
          <form action={extractBrandColorsAction} className="mt-4">
            <input type="hidden" name="id" value={event.id} />
            <button
              type="submit"
              className="rounded-lg border border-brand/50 px-4 py-2 font-cond text-sm font-bold uppercase tracking-wide text-brand transition hover:bg-brand hover:text-white"
            >
              🎨 Pull brand colours from this logo
            </button>
            <span className="ml-3 text-xs text-ink-faint">
              Uses Claude to read the primary + accent colours and fill them in above.
            </span>
          </form>
        )}
        <form action={setEventLogoAction} className="mt-3 flex max-w-md gap-2">
          <input type="hidden" name="id" value={event.id} />
          <input name="logoUrl" placeholder="…or paste an image URL" className={input} />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-line px-4 font-cond text-sm font-bold uppercase tracking-wide text-ink-muted transition hover:text-ink"
          >
            Set URL
          </button>
        </form>
      </section>

      {/* ----------------------------- clubs ----------------------------- */}
      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-ink">
          Clubs <span className="text-ink-faint">({event.clubs.length})</span>
        </h2>

        <p className="-mt-2 mb-4 text-xs text-ink-muted">
          Upload a logo per club (PNG with transparency works best) — it shows in
          the graphic badge and the club picker. Images are resized automatically,
          so any size is fine.
        </p>

        {event.clubs.length > 0 && (
          <div className="mb-5 flex flex-col gap-2">
            {event.clubs.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-input/50 p-2.5"
              >
                {c.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logoUrl} alt="" className="h-9 w-9 shrink-0 object-contain" />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand/50 font-cond text-[11px] font-bold text-ink">
                    {clubInitials(c.name)}
                  </span>
                )}
                <span className="min-w-[140px] flex-1 font-cond text-sm font-bold uppercase tracking-wide text-ink">
                  {c.name}
                </span>

                <ImageUploadForm
                  action={setClubLogoAction}
                  fieldName="logoUrl"
                  hidden={{ id: c.id, eventId: event.id }}
                  maxDim={256}
                  mime="image/png"
                  buttonLabel={c.logoUrl ? "Replace" : "Upload"}
                />

                {c.logoUrl && (
                  <form action={setClubLogoAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <input type="hidden" name="clear" value="1" />
                    <button
                      type="submit"
                      className="text-xs text-ink-muted transition hover:text-brand"
                    >
                      Clear
                    </button>
                  </form>
                )}

                <form action={deleteClubAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="eventId" value={event.id} />
                  <button
                    type="submit"
                    aria-label={`Remove ${c.name}`}
                    className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-ink-muted transition hover:bg-brand hover:text-white"
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <form action={addClubAction} className="flex flex-col gap-2">
            <input type="hidden" name="eventId" value={event.id} />
            <input name="name" placeholder="Add a club…" className={input} />
            <button
              type="submit"
              className="self-start rounded-lg bg-brand px-4 py-2 font-cond text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              Add club
            </button>
            <span className="text-xs text-ink-faint">Add a logo from the list above.</span>
          </form>
          <form action={bulkAddClubsAction} className="flex flex-col gap-2">
            <input type="hidden" name="eventId" value={event.id} />
            <textarea
              name="names"
              rows={3}
              placeholder="Paste many clubs, one per line…"
              className={input + " resize-y"}
            />
            <button
              type="submit"
              className="self-start rounded-lg border border-line px-4 py-2 font-cond text-sm font-bold uppercase tracking-wide text-ink-muted transition hover:text-ink"
            >
              Bulk add
            </button>
          </form>
        </div>
      </section>

      {/* ----------------------------- teams ----------------------------- */}
      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="mb-1 font-display text-xl uppercase tracking-wide text-ink">
          Teams <span className="text-ink-faint">({event.teams.length})</span>
        </h2>
        <p className="mb-4 text-xs text-ink-muted">
          Age/level teams (e.g. &ldquo;South Orlando United ECRL&rdquo;). When set,
          these become the dropdown for Your Club, Opponent, and Bracket — logos are
          matched to the Clubs above automatically.
        </p>

        {event.teams.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {event.teams.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-input py-1 pl-3 pr-1.5 text-sm text-ink"
              >
                {t.name}
                <form action={deleteTeamAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="eventId" value={event.id} />
                  <button
                    type="submit"
                    aria-label={`Remove ${t.name}`}
                    className="grid h-5 w-5 place-items-center rounded-full bg-white/5 text-ink-muted transition hover:bg-brand hover:text-white"
                  >
                    ×
                  </button>
                </form>
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <form
            action={importTeamsCsvAction}
            className="flex flex-col gap-2 rounded-lg border border-line bg-input/40 p-3"
          >
            <span className={label}>Import CSV</span>
            <input type="hidden" name="eventId" value={event.id} />
            <input
              type="file"
              name="csv"
              accept=".csv,text/csv"
              className="text-xs text-ink-muted file:mr-2 file:rounded file:border-0 file:bg-panel-2 file:px-3 file:py-1.5 file:text-ink"
            />
            <button
              type="submit"
              className="self-start rounded-lg bg-brand px-4 py-2 font-cond text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              Import CSV
            </button>
            <span className="text-xs text-ink-faint">
              Columns like Team, Club, Age are auto-detected; a single column of team
              names also works.
            </span>
          </form>

          <form action={bulkAddTeamsAction} className="flex flex-col gap-2">
            <span className={label}>Or paste teams (one per line)</span>
            <input type="hidden" name="eventId" value={event.id} />
            <textarea
              name="names"
              rows={3}
              placeholder={"South Orlando United ECRL\nSporting Jax U14\n…"}
              className={input + " resize-y"}
            />
            <button
              type="submit"
              className="self-start rounded-lg border border-line px-4 py-2 font-cond text-sm font-bold uppercase tracking-wide text-ink-muted transition hover:text-ink"
            >
              Bulk add
            </button>
          </form>
        </div>

        {event.teams.length > 0 && (
          <form action={clearTeamsAction} className="mt-4">
            <input type="hidden" name="eventId" value={event.id} />
            <button
              type="submit"
              className="text-xs text-ink-muted transition hover:text-brand"
            >
              Clear all teams
            </button>
          </form>
        )}
      </section>

      {/* -------------------------- backgrounds -------------------------- */}
      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="mb-1 font-display text-xl uppercase tracking-wide text-ink">
          Backgrounds <span className="text-ink-faint">({event.backgrounds.length})</span>
        </h2>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-brand/25 bg-brand/5 p-3">
          <div className="flex-1 text-xs text-ink-muted">
            <span className="font-cond font-bold uppercase tracking-wide text-ink">
              Brand Kit
            </span>{" "}
            — code-drawn backgrounds in this event&rsquo;s{" "}
            <span className="text-ink">primary + accent</span> colours, so every
            post feels like the host club posted it. No image cost; always crisp.
            Recolours automatically when you change the colours above.
          </div>
          <form action={addBrandStylesAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-brand px-4 py-2 font-cond text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              Add Brand Kit styles
            </button>
          </form>
        </div>

        {event.backgrounds.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {event.backgrounds.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-lg border border-line">
                <div
                  className="aspect-video"
                  style={
                    b.kind === "brand"
                      ? { background: brandBackground(b.value, event.brandColor, event.brandColor2) }
                      : b.kind === "gradient"
                        ? { background: b.value }
                        : {
                            backgroundImage: `url(${b.value})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                  }
                />
                <div className="flex items-center justify-between bg-input px-2.5 py-1.5">
                  <span className="text-xs text-ink">{b.label}</span>
                  <form action={deleteBackgroundAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <button
                      type="submit"
                      aria-label={`Remove ${b.label}`}
                      className="text-ink-muted transition hover:text-brand"
                    >
                      ×
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <form action={addBackgroundAction} className="grid gap-3 sm:grid-cols-4">
          <input type="hidden" name="eventId" value={event.id} />
          <label className="block">
            <span className={label}>Label</span>
            <input name="label" placeholder="Venue" className={input} />
          </label>
          <label className="block">
            <span className={label}>Type</span>
            <select name="kind" className={input} defaultValue="gradient">
              <option value="gradient">Gradient</option>
              <option value="image">Image URL</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Value (CSS gradient or image URL)</span>
            <input
              name="value"
              placeholder="linear-gradient(…) or https://…"
              className={input}
            />
          </label>
          <div className="sm:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2 font-cond text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              Add background
            </button>
          </div>
        </form>

        <div className="mt-5 border-t border-line pt-5">
          <span className={label}>Or upload a background photo (recommended)</span>
          <p className="mb-3 text-xs text-ink-muted">
            Uploaded photos are resized and always show in the graphic and the
            download. External image URLs can be blocked or fail to export.
          </p>
          <ImageUploadForm
            action={addBackgroundAction}
            fieldName="value"
            hidden={{ eventId: event.id, kind: "image" }}
            maxDim={1280}
            mime="image/jpeg"
            buttonLabel="Add photo"
          >
            <input name="label" placeholder="Label (e.g. Venue)" className={input + " w-44"} />
          </ImageUploadForm>
        </div>
      </section>

      {/* ---------------------------- danger ----------------------------- */}
      <section className="rounded-xl border border-brand/30 bg-brand/5 p-6">
        <h2 className="font-cond text-sm font-bold uppercase tracking-wide text-brand">
          Danger zone
        </h2>
        <form action={deleteEventAction} className="mt-3">
          <input type="hidden" name="id" value={event.id} />
          <button
            type="submit"
            className="rounded-lg border border-brand/50 px-4 py-2 font-cond text-sm font-bold uppercase tracking-wide text-brand transition hover:bg-brand hover:text-white"
          >
            Delete this event
          </button>
        </form>
      </section>
    </div>
  );
}

/* ------------------------- theme picker preview -------------------------- */

/** rgba() from a hex string + alpha, for the mini previews. */
function pvAlpha(hex: string, a: number): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return `rgba(232,58,72,${a})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * A small, faithful preview of a theme's chrome — the same marker / chip /
 * footer / frame signals GraphicCanvas draws, in the event's own colours, so
 * an admin can read each look at a glance without opening the studio.
 */
function ThemePreviewMini({
  theme,
  primary,
  accent,
}: {
  theme: Theme;
  primary: string;
  accent: string;
}) {
  const ghost = "rgba(255,255,255,0.5)";

  let marker: React.ReactNode;
  switch (theme.kicker) {
    case "block":
      marker = (
        <span
          style={{
            background: accent,
            color: "#0b1020",
            fontSize: 6,
            fontWeight: 800,
            padding: "2px 5px",
            borderRadius: 2,
            letterSpacing: "0.1em",
          }}
        >
          EVENT
        </span>
      );
      break;
    case "chevron":
      marker = (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span
            style={{ width: 7, height: 8, background: accent, clipPath: "polygon(0 0,100% 50%,0 100%)" }}
          />
          <span style={{ width: 34, height: 4, background: ghost, borderRadius: 1 }} />
        </span>
      );
      break;
    case "rule":
      marker = (
        <span
          style={{
            display: "inline-block",
            width: 42,
            height: 4,
            background: ghost,
            borderRadius: 1,
            paddingBottom: 4,
            borderBottom: `2px solid ${pvAlpha(accent, 0.85)}`,
          }}
        />
      );
      break;
    case "tall":
      marker = (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 4, height: 14, background: accent, borderRadius: 1 }} />
          <span style={{ width: 40, height: 5, background: ghost, borderRadius: 1 }} />
        </span>
      );
      break;
    case "bar":
    default:
      marker = (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 3, background: accent, borderRadius: 1 }} />
          <span style={{ width: 34, height: 4, background: ghost, borderRadius: 1 }} />
        </span>
      );
  }

  const chipShape: CSSProperties =
    theme.chip === "square"
      ? { borderRadius: 2 }
      : theme.chip === "cut"
        ? {
            borderRadius: 0,
            clipPath:
              "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
          }
        : theme.chip === "line"
          ? {
              borderRadius: 0,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${pvAlpha(accent, 0.85)}`,
              padding: "1px 1px",
            }
          : { borderRadius: 999 };

  const footerBorder =
    theme.footer === "solid"
      ? `2px solid ${accent}`
      : theme.footer === "double"
        ? `3px double ${pvAlpha(accent, 0.85)}`
        : "1px solid rgba(255,255,255,0.2)";

  return (
    <div
      style={{
        position: "relative",
        height: 96,
        padding: 11,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: brandBackground("deep", primary, accent),
        overflow: "hidden",
      }}
    >
      {theme.overlay === "pinstripe" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `repeating-linear-gradient(45deg, ${pvAlpha(accent, 0.09)} 0 2px, transparent 2px 12px)`,
          }}
        />
      )}

      <div style={{ position: "relative" }}>{marker}</div>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ width: "72%", height: 9, background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
        <span style={{ width: "48%", height: 9, background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
        <span
          style={{
            marginTop: 2,
            alignSelf: "flex-start",
            fontSize: 6,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "#f3f5fb",
            padding: "2px 6px",
            background: theme.chip === "line" ? "transparent" : pvAlpha(accent, 0.16),
            border: theme.chip === "line" ? "none" : `1px solid ${pvAlpha(accent, 0.55)}`,
            ...chipShape,
          }}
        >
          U14
        </span>
      </div>

      <div
        style={{
          position: "relative",
          borderTop: footerBorder,
          paddingTop: 5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ width: 34, height: 5, background: pvAlpha(accent, 0.9), borderRadius: 1 }} />
        <span style={{ width: 22, height: 5, background: ghost, borderRadius: 1 }} />
      </div>

      {theme.frame === "inset" && (
        <span
          style={{
            position: "absolute",
            inset: 5,
            border: `1px solid ${pvAlpha(accent, 0.6)}`,
            borderRadius: 3,
            pointerEvents: "none",
          }}
        />
      )}
      {theme.frame === "brackets" && <MiniBrackets accent={accent} />}
    </div>
  );
}

function MiniBrackets({ accent }: { accent: string }) {
  const len = 16;
  const th = 3;
  const off = 5;
  const bar = (s: CSSProperties, key: string) => (
    <span key={key} style={{ position: "absolute", background: accent, ...s }} />
  );
  return (
    <span style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {bar({ left: off, top: off, width: len, height: th }, "tl-h")}
      {bar({ left: off, top: off, width: th, height: len }, "tl-v")}
      {bar({ right: off, top: off, width: len, height: th }, "tr-h")}
      {bar({ right: off, top: off, width: th, height: len }, "tr-v")}
      {bar({ left: off, bottom: off, width: len, height: th }, "bl-h")}
      {bar({ left: off, bottom: off, width: th, height: len }, "bl-v")}
      {bar({ right: off, bottom: off, width: len, height: th }, "br-h")}
      {bar({ right: off, bottom: off, width: th, height: len }, "br-v")}
    </span>
  );
}
