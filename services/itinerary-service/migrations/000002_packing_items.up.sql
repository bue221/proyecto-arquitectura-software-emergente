ALTER TABLE itineraries
    ADD COLUMN IF NOT EXISTS packing_items JSONB NOT NULL DEFAULT '[]'::jsonb;
