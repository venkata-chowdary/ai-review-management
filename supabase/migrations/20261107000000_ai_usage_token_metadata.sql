-- All token counts live in token_metadata with plain names: input_tokens,
-- output_tokens, thinking_tokens, total_tokens, cached_tokens. The two plain
-- columns go away; counts already logged (from the columns, or from Gemini's own
-- usageMetadata names) are moved over first.

update public.ai_usage_events
set token_metadata = jsonb_build_object(
  'input_tokens', coalesce((token_metadata ->> 'promptTokenCount')::integer, input_tokens, 0),
  'output_tokens', coalesce((token_metadata ->> 'candidatesTokenCount')::integer, output_tokens, 0),
  'thinking_tokens', coalesce((token_metadata ->> 'thoughtsTokenCount')::integer, 0),
  'total_tokens', coalesce((token_metadata ->> 'totalTokenCount')::integer, coalesce(input_tokens, 0) + coalesce(output_tokens, 0)),
  'cached_tokens', coalesce((token_metadata ->> 'cachedContentTokenCount')::integer, 0)
)
where token_metadata is not null or input_tokens is not null or output_tokens is not null;

alter table public.ai_usage_events
  drop column input_tokens,
  drop column output_tokens;
