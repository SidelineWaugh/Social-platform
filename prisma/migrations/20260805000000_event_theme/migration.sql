-- Add a per-event Theme (the head-to-toe "chrome" look; see lib/themes.ts).
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'classic';
