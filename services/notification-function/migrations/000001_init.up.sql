CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_records (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL,
    itinerary_id UUID NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_event_id ON notification_records (event_id);
CREATE INDEX IF NOT EXISTS idx_notification_itinerary ON notification_records (itinerary_id);
