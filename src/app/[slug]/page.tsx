import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getStudioData } from "@/lib/queries";
import { Studio } from "@/components/Studio";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStudioData(slug);
  if (!data) return { title: "Not found" };
  return {
    title: `${data.event.name} — Social Studio`,
    description: `Create and share branded graphics for ${data.event.name}.`,
  };
}

export default async function EventStudioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStudioData(slug);
  if (!data) notFound();

  const { event, clubs, backgrounds } = data;

  return (
    <div
      className="min-h-full"
      style={{ ["--color-brand"]: event.brandColor } as CSSProperties}
    >
      <header className="sticky top-0 z-20 border-b-2 border-brand bg-navy-deep/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-3.5 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-2xl leading-none tracking-wide text-ink"
            >
              {event.organizer}
            </Link>
            <span className="h-4 w-px bg-line-strong" />
            <span className="font-cond text-sm font-semibold uppercase tracking-[0.24em] text-ink-muted">
              Social Studio
            </span>
          </div>
          <span className="hidden rounded-full border border-line bg-panel px-3.5 py-1.5 font-cond text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted sm:inline">
            {event.name}
          </span>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-[1240px] px-4 pt-6 lg:px-6">
          <h1 className="font-display text-3xl uppercase tracking-wide text-ink sm:text-4xl">
            Make your <span className="text-brand">{event.shortName}</span> graphics
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-ink-muted">
            Pick a template, add your club, and download a branded post in seconds.
            Tag {event.hashtag} when you share.
          </p>
        </div>
        <Studio event={event} clubs={clubs} backgrounds={backgrounds} />
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-faint">
        Make it. Post it. Tag {event.hashtag}. · Powered by {event.organizer}
      </footer>
    </div>
  );
}
