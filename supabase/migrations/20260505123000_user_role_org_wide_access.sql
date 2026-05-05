-- USER rolü: org genelindeki tüm kayıtları görür ve düzenleyebilir (admin gibi).
-- Sadece admin işlevleri (kullanıcı yönetimi, firma silme, gizleme) farklı.
-- VIEWER: salt okunur — tüm org içeriğini görür ama oluşturma/düzenleme/silme yapamaz.

-- ============= COMPARISONS =============
drop policy if exists comparisons_select on comparisons;
create policy comparisons_select on comparisons for select to authenticated
  using (
    organization_id = current_user_org_id()
    and not is_resource_hidden('comparison', id)
  );

drop policy if exists comparisons_insert on comparisons;
create policy comparisons_insert on comparisons for insert to authenticated
  with check (
    owner_id = auth.uid()
    and current_user_role() in ('admin', 'user')
  );

drop policy if exists comparisons_update on comparisons;
create policy comparisons_update on comparisons for update to authenticated
  using (
    organization_id = current_user_org_id()
    and current_user_role() in ('admin', 'user')
  );

drop policy if exists comparisons_delete on comparisons;
create policy comparisons_delete on comparisons for delete to authenticated
  using (
    organization_id = current_user_org_id()
    and (owner_id = auth.uid() or is_admin())
  );

-- can_view_comparison helper'ı güncelle (artık tüm org üyeleri görebilir)
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
      and not is_resource_hidden('comparison', c.id)
  )
$$;

-- ============= PROJECTS =============
drop policy if exists projects_select on projects;
create policy projects_select on projects for select to authenticated
  using (
    organization_id = current_user_org_id()
    and not is_resource_hidden('project', id)
  );

drop policy if exists projects_insert on projects;
create policy projects_insert on projects for insert to authenticated
  with check (
    owner_id = auth.uid()
    and current_user_role() in ('admin', 'user')
  );

drop policy if exists projects_update on projects;
create policy projects_update on projects for update to authenticated
  using (
    organization_id = current_user_org_id()
    and current_user_role() in ('admin', 'user')
  );

drop policy if exists projects_delete on projects;
create policy projects_delete on projects for delete to authenticated
  using (
    organization_id = current_user_org_id()
    and (owner_id = auth.uid() or is_admin())
  );

-- ============= FIRMS =============
-- SELECT zaten org genelindeki firmaları döndürüyor + hidden filter
drop policy if exists firms_insert on firms;
create policy firms_insert on firms for insert to authenticated
  with check (current_user_role() in ('admin', 'user'));

drop policy if exists firms_update on firms;
create policy firms_update on firms for update to authenticated
  using (
    organization_id = current_user_org_id()
    and current_user_role() in ('admin', 'user')
  );

drop policy if exists firms_delete on firms;
create policy firms_delete on firms for delete to authenticated
  using (
    organization_id = current_user_org_id()
    and is_admin()
  );

-- ============= USER LOCKED RESOURCES =============
-- Admin, user rolündeki kullanıcıyı belirli kaynaklarda salt-okunur yapabilir.
-- Default: user her şeyi düzenleyebilir. Lock entry'si varsa → o kaynak için sadece görüntüleyici.

create table if not exists user_locked_resources (
  user_id uuid not null references profiles(id) on delete cascade,
  resource_type text not null check (resource_type in ('comparison', 'project', 'firm')),
  resource_id uuid not null,
  locked_by uuid references profiles(id) on delete set null,
  organization_id uuid not null references organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, resource_type, resource_id)
);

create index if not exists idx_ulr_user on user_locked_resources(user_id);
create index if not exists idx_ulr_org on user_locked_resources(organization_id);

alter table user_locked_resources enable row level security;

drop trigger if exists ulr_set_org on user_locked_resources;
create trigger ulr_set_org before insert on user_locked_resources
  for each row execute function set_organization_id_from_user();

drop policy if exists ulr_select on user_locked_resources;
create policy ulr_select on user_locked_resources for select to authenticated
  using (
    organization_id = current_user_org_id()
    and (user_id = auth.uid() or is_admin())
  );

drop policy if exists ulr_insert on user_locked_resources;
create policy ulr_insert on user_locked_resources for insert to authenticated
  with check (
    is_admin()
    and exists (
      select 1 from organization_members
      where user_id = user_locked_resources.user_id
        and organization_id = current_user_org_id()
    )
  );

drop policy if exists ulr_delete on user_locked_resources;
create policy ulr_delete on user_locked_resources for delete to authenticated
  using (is_admin() and organization_id = current_user_org_id());

-- Helper
create or replace function is_resource_locked(rtype text, rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from user_locked_resources
    where user_id = auth.uid()
      and resource_type = rtype
      and resource_id = rid
  )
$$;

-- ============= LOCK-AWARE EDIT POLICIES =============
-- comparisons UPDATE: admin tüm, user kilitli olmayanları düzenler
drop policy if exists comparisons_update on comparisons;
create policy comparisons_update on comparisons for update to authenticated
  using (
    organization_id = current_user_org_id()
    and current_user_role() in ('admin', 'user')
    and (is_admin() or not is_resource_locked('comparison', id))
  );

-- projects UPDATE: aynı mantık
drop policy if exists projects_update on projects;
create policy projects_update on projects for update to authenticated
  using (
    organization_id = current_user_org_id()
    and current_user_role() in ('admin', 'user')
    and (is_admin() or not is_resource_locked('project', id))
  );

-- firms UPDATE: aynı mantık
drop policy if exists firms_update on firms;
create policy firms_update on firms for update to authenticated
  using (
    organization_id = current_user_org_id()
    and current_user_role() in ('admin', 'user')
    and (is_admin() or not is_resource_locked('firm', id))
  );

-- can_edit_comparison helper'ı kilit-farkındalı yap
create or replace function can_edit_comparison(c_id uuid)
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
        is_admin()
        or (
          (c.owner_id = auth.uid() or current_user_role() = 'user' or user_has_edit_share(c.id))
          and not is_resource_locked('comparison', c.id)
        )
      )
  )
$$;
