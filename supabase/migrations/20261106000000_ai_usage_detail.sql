-- One row per Gemini attempt (and per template fallback), not one per request.
-- token_metadata keeps Gemini's usageMetadata exactly as returned, so thinking,
-- cached and per-modality counts can be recalculated later. Cost is stored at
-- write time so a later price change does not rewrite history; null means the
-- cost is unknown (a timeout may still have been billed).

alter table public.ai_usage_events
  add column operation text not null default 'review_suggestions'
    check (operation in ('review_suggestions')),
  add column request_id uuid,
  add column attempt smallint not null default 1,
  add column outcome text not null default 'ok'
    check (outcome in ('ok', 'rejected', 'error', 'fallback')),
  add column error_message text check (char_length(error_message) <= 200),
  add column token_metadata jsonb,
  add column latency_ms integer,
  add column estimated_cost_usd numeric(12, 8);

-- Nulls are distinct, so rows from before this migration (no request_id) are fine.
alter table public.ai_usage_events
  add constraint ai_usage_events_request_attempt_key unique (request_id, attempt);

create index ai_usage_events_user_id_created_at_idx on public.ai_usage_events (user_id, created_at);
