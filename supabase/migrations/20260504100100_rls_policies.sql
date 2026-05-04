-- Row Level Security policies for all tables

alter table profiles enable row level security;
alter table projects enable row level security;
alter table firms enable row level security;
alter table comparisons enable row level security;
alter table comparison_firms enable row level security;
alter table comparison_items enable row level security;
alter table bid_prices enable row level security;
alter table comparison_shares enable row level security;
alter table templates enable row level security;
alter table notifications enable row level security;

-- Helper: check current user role
create or replace function current_user_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- PROFILES: everyone can see all profiles (needed for sharing UI)
create policy profiles_select_all on profiles for select to authenticated using (true);
create policy profiles_update_own on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_update on profiles for update to authenticated
  using (is_admin()) with check (is_admin());
create policy profiles_admin_delete on profiles for delete to authenticated using (is_admin());

-- PROJECTS: owner or admin can manage
create policy projects_select on projects for select to authenticated
  using (owner_id = auth.uid() or is_admin());
create policy projects_insert on projects for insert to authenticated
  with check (owner_id = auth.uid() and current_user_role() <> 'viewer');
create policy projects_update on projects for update to authenticated
  using (owner_id = auth.uid() or is_admin());
create policy projects_delete on projects for delete to authenticated
  using (owner_id = auth.uid() or is_admin());

-- FIRMS: shared pool - all authenticated can read; user/admin can create/update; admin delete
create policy firms_select on firms for select to authenticated using (true);
create policy firms_insert on firms for insert to authenticated
  with check (current_user_role() in ('admin', 'user'));
create policy firms_update on firms for update to authenticated
  using (created_by = auth.uid() or is_admin());
create policy firms_delete on firms for delete to authenticated using (is_admin());

-- COMPARISONS: owner, shared, or admin
create policy comparisons_select on comparisons for select to authenticated
  using (
    owner_id = auth.uid()
    or is_admin()
    or exists (select 1 from comparison_shares cs where cs.comparison_id = comparisons.id and cs.shared_with = auth.uid())
  );
create policy comparisons_insert on comparisons for insert to authenticated
  with check (owner_id = auth.uid() and current_user_role() in ('admin', 'user'));
create policy comparisons_update on comparisons for update to authenticated
  using (
    owner_id = auth.uid()
    or is_admin()
    or exists (select 1 from comparison_shares cs where cs.comparison_id = comparisons.id and cs.shared_with = auth.uid() and cs.permission = 'edit')
  );
create policy comparisons_delete on comparisons for delete to authenticated
  using (owner_id = auth.uid() or is_admin());

-- Helper for child tables: can current user access this comparison?
create or replace function can_view_comparison(c_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from comparisons c
    where c.id = c_id
      and (
        c.owner_id = auth.uid()
        or is_admin()
        or exists (select 1 from comparison_shares cs where cs.comparison_id = c.id and cs.shared_with = auth.uid())
      )
  )
$$;

create or replace function can_edit_comparison(c_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from comparisons c
    where c.id = c_id
      and (
        c.owner_id = auth.uid()
        or is_admin()
        or exists (select 1 from comparison_shares cs where cs.comparison_id = c.id and cs.shared_with = auth.uid() and cs.permission = 'edit')
      )
  )
$$;

-- COMPARISON_FIRMS / COMPARISON_ITEMS / BID_PRICES — inherit from parent
create policy cf_select on comparison_firms for select to authenticated using (can_view_comparison(comparison_id));
create policy cf_modify on comparison_firms for all to authenticated
  using (can_edit_comparison(comparison_id)) with check (can_edit_comparison(comparison_id));

create policy ci_select on comparison_items for select to authenticated using (can_view_comparison(comparison_id));
create policy ci_modify on comparison_items for all to authenticated
  using (can_edit_comparison(comparison_id)) with check (can_edit_comparison(comparison_id));

create policy bp_select on bid_prices for select to authenticated using (can_view_comparison(comparison_id));
create policy bp_modify on bid_prices for all to authenticated
  using (can_edit_comparison(comparison_id)) with check (can_edit_comparison(comparison_id));

-- COMPARISON_SHARES: owner of comparison can manage; recipients can see
create policy cs_select on comparison_shares for select to authenticated
  using (
    shared_with = auth.uid()
    or shared_by = auth.uid()
    or is_admin()
    or exists (select 1 from comparisons c where c.id = comparison_shares.comparison_id and c.owner_id = auth.uid())
  );
create policy cs_insert on comparison_shares for insert to authenticated
  with check (
    is_admin()
    or exists (select 1 from comparisons c where c.id = comparison_id and c.owner_id = auth.uid())
  );
create policy cs_delete on comparison_shares for delete to authenticated
  using (
    is_admin()
    or shared_by = auth.uid()
    or exists (select 1 from comparisons c where c.id = comparison_id and c.owner_id = auth.uid())
  );

-- TEMPLATES
create policy templates_select on templates for select to authenticated using (true);
create policy templates_insert on templates for insert to authenticated
  with check (current_user_role() in ('admin', 'user') and created_by = auth.uid());
create policy templates_update on templates for update to authenticated
  using (is_admin() or (created_by = auth.uid() and is_system = false));
create policy templates_delete on templates for delete to authenticated
  using (is_admin() or (created_by = auth.uid() and is_system = false));

-- NOTIFICATIONS
create policy notifications_select on notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update on notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_admin_insert on notifications for insert to authenticated with check (is_admin());
