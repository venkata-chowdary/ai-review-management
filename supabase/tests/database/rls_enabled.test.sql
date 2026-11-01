begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(1);

-- Fails when a new public table is added without RLS enabled and forced.
select is(
  (
    select count(*)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not (c.relrowsecurity and c.relforcerowsecurity)
  ),
  0::bigint,
  'every public table has row level security enabled and forced'
);

select * from finish();
rollback;
