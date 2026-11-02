-- Owners think in branches, not locations. Rename the table and its parts,
-- and replace the street address with the branch's Google Maps link, which
-- is what onboarding asks for (place_id is resolved from it later).

alter table public.locations rename to branches;
alter table public.branches rename column branch_name to name;

alter table public.branches drop column address;
alter table public.branches add column google_maps_url text
  check (google_maps_url is null or (google_maps_url ~ '^https://' and length(google_maps_url) <= 2048));

alter index public.locations_user_id_idx rename to branches_user_id_idx;
alter index public.locations_business_id_idx rename to branches_business_id_idx;
alter table public.branches rename constraint locations_pkey to branches_pkey;
alter table public.branches rename constraint locations_id_user_id_key to branches_id_user_id_key;
alter table public.branches rename constraint locations_user_id_place_id_key to branches_user_id_place_id_key;
alter table public.branches rename constraint locations_user_id_fkey to branches_user_id_fkey;
alter table public.branches rename constraint locations_business_id_user_id_fkey to branches_business_id_user_id_fkey;

alter policy "locations_select_own" on public.branches rename to "branches_select_own";
alter policy "locations_insert_own" on public.branches rename to "branches_insert_own";
alter policy "locations_update_own" on public.branches rename to "branches_update_own";
alter policy "locations_delete_own" on public.branches rename to "branches_delete_own";
