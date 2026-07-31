import { Studio } from "@/components/Studio";
import { EVENT } from "@/lib/event";

export default function Home() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b-2 border-brand bg-navy-deep/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-3.5 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl leading-none tracking-wide text-ink">
              {EVENT.organizer}
            </span>
            <span className="h-4 w-px bg-line-strong" />
            <span className="font-cond text-sm font-semibold uppercase tracking-[0.24em] text-ink-muted">
              Social Studio
            </span>
          </div>
          <span className="hidden rounded-full border border-line bg-panel px-3.5 py-1.5 font-cond text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted sm:inline">
            {EVENT.name}
          </span>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-[1240px] px-4 pt-6 lg:px-6">
          <h1 className="font-display text-3xl uppercase tracking-wide text-ink sm:text-4xl">
            Make your <span className="text-brand">{EVENT.shortName}</span> graphics
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-ink-muted">
            Pick a template, add your club, and download a branded post in seconds.
            Tag {EVENT.hashtag} when you share.
          </p>
        </div>
        <Studio />
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-faint">
        Make it. Post it. Tag {EVENT.hashtag}. · Built by {EVENT.organizer}
      </footer>
    </div>
  );
}
