-- MULTI-TENANT MIMARI
-- Her kullanıcı bir "organization"a (şirket/panel) aittir.
-- Kayıt olan otomatik kendi organization'ının admin'i olur.
-- Admin başkalarını davet ettiğinde, davet edilen kullanıcı admin'in organization'ına eklenir.
-- Tüm tablolar (firms, projects, comparisons, notifications) organization_id ile scope edilir.

-- 1. organizations tablosu
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_updated_at before update on organizations
  for each row execute function set_updated_at();

alter table organizations enable row level security;

-- 2. profiles.organization_id (önce nullable)
alter table profiles add column if not exists organization_id uuid references organizations(id) on delete cascade;

-- 3. Mevcut admin için default organization yarat ve tüm profile'ları ona bağla
do $$
declare
  admin_id uuid;
  default_org_id uuid;
begin
  -- Mevcut admin kullanıcıyı bul
  select id into admin_id from profiles where role = 'admin' order by created_at limit 1;

  if admin_id is not null then
    insert into organizations (name, owner_id) values ('Varsayılan Şirket', admin_id) returning id into default_org_id;
  else
    insert into organizations (name) values ('Varsayılan Şirket') returning id into default_org_id;
  end if;

  -- Tüm mevcut profile'ları default org'a bağla
  update profiles set organization_id = default_org_id where organization_id is null;
end $$;

alter table profiles alter column organization_id set not null;
create index if not exists idx_profiles_org on profiles(organization_id);

-- 4. firms / projects / comparisons / notifications'a organization_id ekle
alter table firms add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table projects add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table comparisons add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table notifications add column if not exists organization_id uuid references organizations(id) on delete cascade;

-- Mevcut kayıtları default org'a bağla
update firms set organization_id = (select id from organizations limit 1) where organization_id is null;
update projects set organization_id = (select id from organizations limit 1) where organization_id is null;
update comparisons set organization_id = (select id from organizations limit 1) where organization_id is null;
update notifications set organization_id = (select id from organizations limit 1) where organization_id is null;

alter table firms alter column organization_id set not null;
alter table projects alter column organization_id set not null;
alter table comparisons alter column organization_id set not null;
alter table notifications alter column organization_id set not null;

create index if not exists idx_firms_org on firms(organization_id);
create index if not exists idx_projects_org on projects(organization_id);
create index if not exists idx_comparisons_org on comparisons(organization_id);
create index if not exists idx_notifications_org on notifications(organization_id);

-- 5. Helper: current user'ın organization'ı
create or replace function current_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from profiles where id = auth.uid()
$$;

-- 6. BEFORE INSERT trigger: organization_id otomatik set
create or replace function set_organization_id_from_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.organization_id is null then
    new.organization_id := current_user_org_id();
  end if;
  return new;
end;
$$;

drop trigger if exists firms_set_org on firms;
create trigger firms_set_org before insert on firms for each row execute function set_organization_id_from_user();

drop trigger if exists projects_set_org on projects;
create trigger projects_set_org before insert on projects for each row execute function set_organization_id_from_user();

drop trigger if exists comparisons_set_org on comparisons;
create trigger comparisons_set_org before insert on comparisons for each row execute function set_organization_id_from_user();

drop trigger if exists notifications_set_org on notifications;
create trigger notifications_set_org before insert on notifications for each row execute function set_organization_id_from_user();

-- 7. handle_new_user trigger güncelle: signup → kendi org, davet → mevcut org
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invited_org_id uuid;
  invited_role user_role;
  new_org_id uuid;
  display_name text;
begin
  display_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  invited_org_id := (new.raw_user_meta_data->>'invited_org_id')::uuid;

  if invited_org_id is not null then
    -- Davet edilen kullanıcı: mevcut org'a ekle
    invited_role := coalesce((new.raw_user_meta_data->>'invited_role')::user_role, 'user'::user_role);
    insert into public.profiles (id, email, full_name, role, organization_id)
    values (new.id, new.email, display_name, invited_role, invited_org_id)
    on conflict (id) do nothing;
  else
    -- Self signup: yeni organization yarat, kullanıcı admin olur
    insert into organizations (name) values (display_name || ' Paneli') returning id into new_org_id;

    insert into public.profiles (id, email, full_name, role, organization_id)
    values (new.id, new.email, display_name, 'admin'::user_role, new_org_id)
    on conflict (id) do nothing;

    update organizations set owner_id = new.id where id = new_org_id;
  end if;

  return new;
end;
$$;

-- 8. RLS — organizations
drop policy if exists organizations_select on organizations;
create policy organizations_select on organizations for select to authenticated
  using (id = current_user_org_id());

drop policy if exists organizations_update on organizations;
create policy organizations_update on organizations for update to authenticated
  using (id = current_user_org_id() and is_admin());

-- 9. RLS güncelle: tüm tablolar org-scope

-- profiles: kendi org'undakileri görür
drop policy if exists profiles_select_all on profiles;
create policy profiles_select_org on profiles for select to authenticated
  using (organization_id = current_user_org_id());

-- firms
drop policy if exists firms_select on firms;
create policy firms_select on firms for select to authenticated
  using (organization_id = current_user_org_id());

drop policy if exists firms_insert on firms;
create policy firms_insert on firms for insert to authenticated
  with check (current_user_role() in ('admin', 'user'));

drop policy if exists firms_update on firms;
create policy firms_update on firms for update to authenticated
  using (organization_id = current_user_org_id() and (created_by = auth.uid() or is_admin()));

drop policy if exists firms_delete on firms;
create policy firms_delete on firms for delete to authenticated
  using (organization_id = current_user_org_id() and is_admin());

-- projects
drop policy if exists projects_select on projects;
create policy projects_select on projects for select to authenticated
  using (organization_id = current_user_org_id() and (owner_id = auth.uid() or is_admin()));

drop policy if exists projects_insert on projects;
create policy projects_insert on projects for insert to authenticated
  with check (owner_id = auth.uid() and current_user_role() <> 'viewer');

drop policy if exists projects_update on projects;
create policy projects_update on projects for update to authenticated
  using (organization_id = current_user_org_id() and (owner_id = auth.uid() or is_admin()));

drop policy if exists projects_delete on projects;
create policy projects_delete on projects for delete to authenticated
  using (organization_id = current_user_org_id() and (owner_id = auth.uid() or is_admin()));

-- comparisons
drop policy if exists comparisons_select on comparisons;
create policy comparisons_select on comparisons for select to authenticated
  using (
    organization_id = current_user_org_id()
    and (owner_id = auth.uid() or is_admin() or user_has_share(id))
  );

drop policy if exists comparisons_insert on comparisons;
create policy comparisons_insert on comparisons for insert to authenticated
  with check (owner_id = auth.uid() and current_user_role() in ('admin', 'user'));

drop policy if exists comparisons_update on comparisons;
create policy comparisons_update on comparisons for update to authenticated
  using (
    organization_id = current_user_org_id()
    and (owner_id = auth.uid() or is_admin() or user_has_edit_share(id))
  );

drop policy if exists comparisons_delete on comparisons;
create policy comparisons_delete on comparisons for delete to authenticated
  using (organization_id = current_user_org_id() and (owner_id = auth.uid() or is_admin()));

-- notifications
drop policy if exists notifications_select on notifications;
create policy notifications_select on notifications for select to authenticated
  using (user_id = auth.uid());

-- templates: system templates herkese görünür, user templates org-scope
alter table templates add column if not exists organization_id uuid references organizations(id) on delete cascade;

drop policy if exists templates_select on templates;
create policy templates_select on templates for select to authenticated
  using (is_system = true or organization_id = current_user_org_id());

drop policy if exists templates_insert on templates;
create policy templates_insert on templates for insert to authenticated
  with check (current_user_role() in ('admin', 'user') and created_by = auth.uid());

drop policy if exists templates_update on templates;
create policy templates_update on templates for update to authenticated
  using (
    is_admin() and (organization_id = current_user_org_id() or organization_id is null)
    or (created_by = auth.uid() and is_system = false)
  );

drop policy if exists templates_delete on templates;
create policy templates_delete on templates for delete to authenticated
  using (
    is_admin() and (organization_id = current_user_org_id() or organization_id is null)
    or (created_by = auth.uid() and is_system = false)
  );
