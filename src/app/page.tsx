import Link from "next/link";
import type { CSSProperties } from "react";
import { getPublishedEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getPublishedEvents();

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b-2 border-brand bg-navy-deep/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3.5 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl leading-none tracking-wide text-ink">
              Sideline
            </span>
            <span className="h-4 w-px bg-line-strong" />
            <span className="font-cond text-sm font-semibold uppercase tracking-[0.24em] text-ink-muted">
              Social Studio
            </span>
          </div>
          <Link
            href="/admin"
            className="font-cond text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted transition hover:text-ink"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-10 lg:px-6">
        <h1 className="font-display text-4xl uppercase tracking-wide text-ink sm:text-5xl">
          Event <span className="text-brand">Social Studios</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Pick an event to create branded, ready-to-post graphics. Each event has
          its own clubs, backgrounds, and branding.
        </p>

        {events.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-line bg-panel/50 p-10 text-center">
            <p className="text-ink-muted">No published events yet.</p>
            <Link
              href="/admin"
              className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 font-cond text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
            >
              Go to admin
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <Link
                key={e.id}
                href={`/${e.slug}`}
                style={{ ["--color-brand"]: e.brandColor } as CSSProperties}
                className="group relative overflow-hidden rounded-xl border border-line bg-panel p-6 transition hover:border-brand/70"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-brand" />
                <div className="font-cond text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  {e.season}
                </div>
                <div className="mt-2 font-display text-2xl uppercase leading-tight tracking-wide text-ink">
                  {e.name}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
                  <span>{e._count.clubs} clubs</span>
                  <span className="font-semibold text-ink transition group-hover:text-brand">
                    Open studio →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-faint">
        Built by Sideline · Social Studio
      </footer>
    </div>
  );
}
