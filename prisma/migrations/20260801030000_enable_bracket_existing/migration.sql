-- Enable the Bracket template on events created before it existed.
UPDATE "Event"
SET "enabledTemplates" = array_append("enabledTemplates", 'bracket')
WHERE NOT ('bracket' = ANY("enabledTemplates"));
