import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TEMPLATES } from "@/lib/templates";
import { clubInitials } from "@/lib/clubs";
import {
  updateEventAction,
  deleteEventAction,
  addClubAction,
  bulkAddClubsAction,
  deleteClubAction,
  setClubLogoAction,
  addBackgroundAction,
  deleteBackgroundAction,
} from "../../../actions";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-line bg-input px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint outline-none transition focus:border-brand/70 focus:ring-2 focus:ring-brand/25";
const label = "label mb-1.5 block text-ink-faint!";

export default async function EventEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      clubs: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
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
            <span className={label}>Brand color</span>
            <input
              name="brandColor"
              type="color"
              defaultValue={event.brandColor}
              className="h-11 w-full rounded-lg border border-line bg-input px-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Logo URL (optional)</span>
            <input name="logoUrl" defaultValue={event.logoUrl ?? ""} placeholder="https://…" className={input} />
          </label>

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

      {/* ----------------------------- clubs ----------------------------- */}
      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-ink">
          Clubs <span className="text-ink-faint">({event.clubs.length})</span>
        </h2>

        <p className="-mt-2 mb-4 text-xs text-ink-muted">
          Upload a logo per club (PNG with transparency works best) — it shows in
          the graphic badge and the club picker. Max 700&nbsp;KB.
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

                <form action={setClubLogoAction} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="eventId" value={event.id} />
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    required
                    className="w-44 text-xs text-ink-muted file:mr-2 file:rounded file:border-0 file:bg-panel-2 file:px-2 file:py-1 file:text-ink"
                  />
                  <button
                    type="submit"
                    className="rounded bg-brand px-2.5 py-1 font-cond text-xs font-bold uppercase text-white transition hover:brightness-110"
                  >
                    {c.logoUrl ? "Replace" : "Upload"}
                  </button>
                </form>

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
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="text-xs text-ink-muted file:mr-2 file:rounded file:border-0 file:bg-panel-2 file:px-3 file:py-1.5 file:text-ink"
            />
            <button
              type="submit"
              className="self-start rounded-lg bg-brand px-4 py-2 font-cond text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              Add club
            </button>
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

      {/* -------------------------- backgrounds -------------------------- */}
      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-ink">
          Backgrounds <span className="text-ink-faint">({event.backgrounds.length})</span>
        </h2>

        {event.backgrounds.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {event.backgrounds.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-lg border border-line">
                <div
                  className="aspect-video"
                  style={
                    b.kind === "gradient"
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
