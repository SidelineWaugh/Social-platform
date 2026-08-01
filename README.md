# Sideline Social Studio

A **multi-event** platform for creating branded, shareable social graphics.
Each event (a tournament, league, or one-off) is its own tenant with its own
clubs, backgrounds, and branding, served at its own URL. Clubs pick a template,
add their details, and download a ready-to-post graphic — every share doubles as
free marketing for the event.

Built for Sideline's events and designed to be resold to smaller events.

## How it works

- **Public landing** (`/`) — lists all published event studios.
- **Event studio** (`/[slug]`, e.g. `/chicago-cup`) — the generator, themed to
  that event's brand color, with its own clubs and backgrounds. Six templates:
  We're In · Champions · Matchday · Schedule · Result · Countdown. Exports
  1080-wide PNGs (Post 4:5, Square 1:1, Story 9:16) entirely in the browser.
- **Admin** (`/admin`) — password-gated dashboard to create and manage events:
  branding, dates, enabled templates, clubs (single or bulk), backgrounds
  (gradient presets or image URLs), and publish/unpublish.

## Stack — everything runs on Railway

- **Next.js 16** (App Router, Server Actions) + **React 19** + **TypeScript**
- **Prisma 6 + PostgreSQL** (one Railway Postgres database)
- **Tailwind CSS v4**; per-event theming via a `--color-brand` CSS variable
- Self-hosted fonts via `@fontsource` (no external Google Fonts request)
- `html-to-image` for client-side PNG export
- Admin auth: shared password (`ADMIN_PASSWORD`) → HMAC-signed session cookie

## Environment variables

| Variable         | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `DATABASE_URL`   | Postgres connection string                          |
| `ADMIN_PASSWORD` | Password for the `/admin` dashboard                 |
| `SESSION_SECRET` | Long random string used to sign the session cookie  |

See `.env.example`.

## Local development

Requires Node 20+ and a local Postgres.

```bash
npm install
cp .env.example .env         # then set DATABASE_URL / ADMIN_PASSWORD / SESSION_SECRET
npx prisma migrate dev       # create the schema
npm run db:seed              # seed the Chicago International Cup event
npm run dev                  # http://localhost:3000
```

- `/` — event list · `/chicago-cup` — studio · `/admin` — dashboard.

## Deploy to Render (easiest — one blueprint)

`render.yaml` provisions the web app **and** a Postgres database together and
wires `DATABASE_URL` automatically — no manual variable step.

1. Push this repo to GitHub (done).
2. Render Dashboard → **New → Blueprint** → pick this repo → **Apply**.
3. When prompted, enter an **`ADMIN_PASSWORD`** (for `/admin`). `SESSION_SECRET`
   is generated for you; `DATABASE_URL` is auto-wired from the database.
4. First boot runs `prisma migrate deploy` and seeds the Chicago Cup event, then
   starts the server. The seed is non-destructive (only seeds an empty DB).

> Free tier note: Render's free web service sleeps after inactivity (cold start
> on first hit) and the free Postgres expires ~30 days after creation. Bump both
> to a paid instance for production.

## Deploy to Railway

1. **New Project → Deploy from GitHub repo** (this repo).
2. **Add a Postgres database** to the project (Railway → *New* → *Database* → *PostgreSQL*).
3. On the app service, set variables:
   - `DATABASE_URL = ${{Postgres.DATABASE_URL}}`
   - `ADMIN_PASSWORD = <your password>`
   - `SESSION_SECRET = <long random string>`
4. Deploy. `railway.json` runs `prisma migrate deploy` on each release before
   starting the server, so the schema stays in sync automatically.
5. Seed the first event once (from your machine, against the Railway DB):
   ```bash
   railway run npm run db:seed
   ```
   …or just create events in `/admin`.

The build (`prisma generate && next build`) and start
(`prisma migrate deploy && next start`) are already wired for Railway's Nixpacks
builder.

## Data model (`prisma/schema.prisma`)

- **Event** — tenant: slug, name, branding (`brandColor`, `logoUrl`), season,
  `startDate`, `hashtag`, `enabledTemplates`, `published`.
- **Club** — belongs to an Event (the studio's club picker).
- **Background** — belongs to an Event: `gradient` (CSS) or `image` (URL).

Templates and export formats are defined in code (`src/lib/templates.ts`,
`src/lib/formats.ts`); everything else is per-event data.

## Project layout

```
prisma/           schema, migrations, seed
src/
  app/
    page.tsx              landing (event list)
    [slug]/page.tsx       public event studio
    admin/                login, dashboard, event editor, server actions
  components/     Studio (state + preview), Controls, GraphicCanvas (renderer)
  lib/            db, auth, queries, templates, formats, types
```
