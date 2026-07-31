# Sideline Social Studio

A branded **social-graphic generator** for tournaments and events. Clubs (or
attendees) pick a template, drop in their details, and download a
ready-to-post graphic — every share doubles as free marketing for the event.

Built for Sideline's events and designed to be re-skinned per event. Modeled
on the Chicago International Cup studio.

## What it does

Six templates, each rendered as a live, downloadable graphic:

| Template   | Use                                   |
| ---------- | ------------------------------------- |
| We're In   | Announce the club is competing        |
| Champions  | Celebrate a division / bracket win    |
| Matchday   | Hype the next game (vs / time / field)|
| Schedule   | Share the group-stage fixtures        |
| Result     | Post the final score (auto W/D/L)     |
| Countdown  | Days-to-kickoff, computed from a date |

Plus: club picker (list + manual entry), preset **and** custom-photo
backgrounds, and three export formats — Post (4:5), Square (1:1), Story (9:16).
Graphics export as **1080-wide PNGs** entirely in the browser (no server).

## Tech

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** design tokens (dark navy / Chicago-red system)
- Self-hosted fonts via `@fontsource` (Anton / Saira Condensed / Inter) — no
  external Google Fonts request at build or runtime
- `html-to-image` for client-side PNG export

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Deploys to Vercel with zero config.

## Reuse for another event

The studio is data-driven — reskinning it for a different Sideline event does
not require touching component code:

- **`src/lib/event.ts`** — event name, hashtag, season, dates, organizer.
- **`src/lib/clubs.ts`** — the list of participating clubs.
- **`src/lib/backgrounds.ts`** — background presets. These currently ship as
  gradient stand-ins; drop real venue photos into `public/` and point each
  preset's `css` at `url(/backgrounds/...)` for the production look.
- **`src/app/globals.css`** — brand colors (`--color-brand`, surfaces) if the
  event needs a different palette.

## Project layout

```
src/
  app/            layout, page shell, global styles
  components/     Studio (state + preview), Controls, GraphicCanvas (renderer)
  lib/            event config, clubs, templates, backgrounds, formats, types
```
