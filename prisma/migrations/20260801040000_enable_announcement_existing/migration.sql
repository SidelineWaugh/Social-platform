-- Enable the Event Announcement template on events created before it existed.
UPDATE "Event"
SET "enabledTemplates" = array_append("enabledTemplates", 'announcement')
WHERE NOT ('announcement' = ANY("enabledTemplates"));
