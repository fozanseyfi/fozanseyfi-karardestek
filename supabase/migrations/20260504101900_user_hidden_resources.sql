-- Negatif izin listesi: admin belirli kaynakları belirli kullanıcılardan gizleyebilir
-- Default: viewer org'daki her şeyi görür. Admin "bu kaynağı bu kullanıcıdan gizle" diye işaretler.

create table if not exists user_hidden_resources (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  resource_type text not null check (resource_type in ('comparison', 'project', 'firm')),
  resource_id uuid not null,
  hidden_by uuid references profiles(id) on delete set null,
  organization_id uuid not null references organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, resource_type, resource_id)
);

create index if not exists idx_uhr_user on user_hidden_resources(user_id);
create index if not exists idx_uhr_org on user_hidden_resources(organization_id);

alter table user_hidden_resources enable row level security;

-- Org kapsamında otomatik organization_id set
drop trigger if exists uhr_set_org on user_hidden_resources;
create trigger uhr_set_org before insert on user_hidden_resources
  for each row execute function set_organization_id_from_user();

-- RLS
drop policy if exists uhr_select on user_hidden_resources;
create policy uhr_select on user_hidden_resources for select to authenticated
  using (
    organization_id = current_user_org_id()
    and (user_id = auth.uid() or is_admin())
  );

drop policy if exists uhr_insert on user_hidden_resources;
create policy uhr_insert on user_hidden_resources for insert to authenticated
  with check (
    is_admin()
    and exists (
      select 1 from profiles
      where id = user_id and organization_id = current_user_org_id()
    )
  );

drop policy if exists uhr_delete on user_hidden_resources;
create policy uhr_delete on user_hidden_resources for delete to authenticated
  using (
    is_admin()
    and organization_id = current_user_org_id()
  );

-- Helper: bu kaynak şu an authenticated kullanıcı için gizli mi?
create or replace function is_resource_hidden(rtype text, rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from user_hidden_resources
    where user_id = auth.uid()
      and resource_type = rtype
      and resource_id = rid
  )
$$;

-- Tablo SELECT policies'i hidden filter ile güncelle
drop policy if exists comparisons_select on comparisons;
create policy comparisons_select on comparisons for select to authenticated
  using (
    organization_id = current_user_org_id()
    and (owner_id = auth.uid() or is_admin() or is_viewer() or user_has_share(id))
    and not is_resource_hidden('comparison', id)
  );

drop policy if exists projects_select on projects;
create policy projects_select on projects for select to authenticated
  using (
    organization_id = current_user_org_id()
    and (owner_id = auth.uid() or is_admin() or is_viewer())
    and not is_resource_hidden('project', id)
  );

drop policy if exists firms_select on firms;
create policy firms_select on firms for select to authenticated
  using (
    organization_id = current_user_org_id()
    and not is_resource_hidden('firm', id)
  );

-- can_view_comparison helper'ı hidden filter ile güncelle
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
      and (
        c.owner_id = auth.uid()
        or is_admin()
        or is_viewer()
        or exists (select 1 from comparison_shares cs where cs.comparison_id = c.id and cs.shared_with = auth.uid())
      )
  )
$$;
