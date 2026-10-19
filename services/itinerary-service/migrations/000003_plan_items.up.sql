ALTER TABLE itineraries
    ADD COLUMN IF NOT EXISTS plan_items JSONB NOT NULL DEFAULT '[]'::jsonb;
