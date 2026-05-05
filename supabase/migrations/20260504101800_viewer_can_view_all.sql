-- Viewer rolü: organization'daki tüm karşılaştırma/proje/firmaları READ-ONLY görebilir
-- Yine de yeni kayıt yaratamaz, düzenleyemez, silemez (mevcut RLS).

create or replace function is_viewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'viewer')
$$;

-- comparisons: viewer kendi org'undaki tümünü görür
drop policy if exists comparisons_select on comparisons;
create policy comparisons_select on comparisons for select to authenticated
  using (
    organization_id = current_user_org_id()
    and (owner_id = auth.uid() or is_admin() or is_viewer() or user_has_share(id))
  );

-- projects: viewer kendi org'undaki tümünü görür
drop policy if exists projects_select on projects;
create policy projects_select on projects for select to authenticated
  using (
    organization_id = current_user_org_id()
    and (owner_id = auth.uid() or is_admin() or is_viewer())
  );
-- firms: zaten org-scope SELECT (tüm authenticated görür)

-- comparison_firms / comparison_items / bid_prices viewer için
-- can_view_comparison helper'ı update et — viewer da org içindeki tümünü görür
create or replace function can_view_comparison(c_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from comparisons c
    where c.id = c_id
      and c.organization_id = current_user_org_id()
      and (
        c.owner_id = auth.uid()
        or is_admin()
        or is_viewer()
        or exists (select 1 from comparison_shares cs where cs.comparison_id = c.id and cs.shared_with = auth.uid())
      )
  )
$$;

-- can_edit_comparison değişmez — viewer edit edemez
