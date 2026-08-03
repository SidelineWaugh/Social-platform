-- Add an optional accent/secondary brand color used by the Brand Kit backgrounds.
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "brandColor2" TEXT;
