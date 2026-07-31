import Link from "next/link";
import { prisma } from "@/lib/db";
import { createEventAction } from "../actions";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-line bg-input px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint outline-none transition focus:border-brand/70 focus:ring-2 focus:ring-brand/25";
const label = "label mb-1.5 block text-ink-faint!";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { clubs: true, backgrounds: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
          Events
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage each event&rsquo;s studio, clubs, backgrounds, and branding.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {events.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-panel/50 p-6 text-center text-sm text-ink-muted">
              No events yet — create your first one below.
            </p>
          )}
          {events.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-xl border border-line bg-panel p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-9 w-9 rounded-md"
                  style={{ background: e.brandColor }}
                />
                <div>
                  <div className="font-cond text-lg font-bold uppercase tracking-wide text-ink">
                    {e.name}
                  </div>
                  <div className="text-xs text-ink-muted">
                    /{e.slug} · {e._count.clubs} clubs · {e._count.backgrounds}{" "}
                    backgrounds
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider " +
                    (e.published
                      ? "bg-green-500/15 text-green-400"
                      : "bg-white/10 text-ink-muted")
                  }
                >
                  {e.published ? "Live" : "Draft"}
                </span>
                {e.published && (
                  <Link
                    href={`/${e.slug}`}
                    className="font-cond text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted transition hover:text-ink"
                  >
                    Open
                  </Link>
                )}
                <Link
                  href={`/admin/events/${e.id}`}
                  className="rounded-full bg-brand px-4 py-1.5 font-cond text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="font-display text-xl uppercase tracking-wide text-ink">
          New event
        </h2>
        {error === "slug" && (
          <p className="mt-2 text-sm text-brand">That slug is already taken.</p>
        )}
        {error === "name" && (
          <p className="mt-2 text-sm text-brand">A name is required.</p>
        )}
        <form action={createEventAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Event name</span>
            <input name="name" required placeholder="Chicago International Cup" className={input} />
          </label>
          <label className="block">
            <span className={label}>URL slug (optional)</span>
            <input name="slug" placeholder="chicago-cup" className={input} />
          </label>
          <label className="block">
            <span className={label}>Short name</span>
            <input name="shortName" placeholder="Chicago Cup" className={input} />
          </label>
          <label className="block">
            <span className={label}>Season</span>
            <input name="season" placeholder="2026" className={input} />
          </label>
          <label className="block">
            <span className={label}>Hashtag</span>
            <input name="hashtag" placeholder="#ChicagoCup" className={input} />
          </label>
          <label className="block">
            <span className={label}>Brand color</span>
            <input
              name="brandColor"
              type="color"
              defaultValue="#e83a48"
              className="h-11 w-full rounded-lg border border-line bg-input px-2"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-2.5 font-cond text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
            >
              Create event
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
