-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "enabledTemplates" SET DEFAULT ARRAY['were-in', 'champions', 'matchday', 'bracket', 'schedule', 'result', 'countdown']::TEXT[];
