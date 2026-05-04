-- Fix infinite RLS recursion between comparisons and comparison_shares.
-- Use SECURITY DEFINER helpers that bypass RLS.

create or replace function user_has_share(c_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from comparison_shares
    where comparison_id = c_id and shared_with = auth.uid()
  )
$$;

create or replace function user_has_edit_share(c_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from comparison_shares
    where comparison_id = c_id
      and shared_with = auth.uid()
      and permission = 'edit'
  )
$$;

create or replace function user_owns_comparison(c_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from comparisons
    where id = c_id and owner_id = auth.uid()
  )
$$;

-- comparisons: replace SELECT/UPDATE policies to use helpers (no direct sub-SELECT)
drop policy if exists comparisons_select on comparisons;
create policy comparisons_select on comparisons for select to authenticated
  using (owner_id = auth.uid() or is_admin() or user_has_share(id));

drop policy if exists comparisons_update on comparisons;
create policy comparisons_update on comparisons for update to authenticated
  using (owner_id = auth.uid() or is_admin() or user_has_edit_share(id));

-- comparison_shares: replace policies to avoid sub-SELECT on comparisons
drop policy if exists cs_select on comparison_shares;
create policy cs_select on comparison_shares for select to authenticated
  using (
    shared_with = auth.uid()
    or shared_by = auth.uid()
    or is_admin()
    or user_owns_comparison(comparison_id)
  );

drop policy if exists cs_insert on comparison_shares;
create policy cs_insert on comparison_shares for insert to authenticated
  with check (is_admin() or user_owns_comparison(comparison_id));

drop policy if exists cs_delete on comparison_shares;
create policy cs_delete on comparison_shares for delete to authenticated
  using (
    is_admin()
    or shared_by = auth.uid()
    or user_owns_comparison(comparison_id)
  );
