-- Create webhooks table for persistent webhook registrations
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,                    -- wh_<uuid> format
  url TEXT NOT NULL,                      -- HTTPS callback URL
  events TEXT[] NOT NULL DEFAULT '{}',    -- e.g. {'document.completed','document.failed'}
  secret TEXT,                            -- Optional signing secret
  api_key_hash TEXT NOT NULL,             -- FNV-1a hash of the API key (ownership)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for listing webhooks by owner
CREATE INDEX IF NOT EXISTS idx_webhooks_api_key_hash ON webhooks (api_key_hash);

-- Index for dispatching events (find webhooks matching an event type)
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING GIN (events);

-- Row-level security (service role bypasses RLS, so this just prevents anon access)
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
