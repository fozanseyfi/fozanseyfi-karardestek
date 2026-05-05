-- MULTI-ORG ÜYELİK
-- Kullanıcı birden çok organizasyona üye olabilir.
-- profile.organization_id artık "aktif/seçili" org — kullanıcının şu an hangi panelde çalıştığı.
-- Topbar'da org switcher ile aktif org değiştirilir.

-- 1. organization_members tablosu
create table if not exists organization_members (
  user_id uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role user_role not null default 'user',
  joined_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

create index if not exists idx_om_user on organization_members(user_id);
create index if not exists idx_om_org on organization_members(organization_id);

alter table organization_members enable row level security;

-- 2. Mevcut profile.organization_id'lerden seed
insert into organization_members (user_id, organization_id, role)
select id, organization_id, role from profiles
where organization_id is not null
on conflict (user_id, organization_id) do nothing;

-- 3. SECURITY DEFINER helper — RLS recursion önlemek için
create or replace function user_belongs_to_org(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from organization_members
    where user_id = auth.uid() and organization_id = org_id
  )
$$;

-- 4. RLS: kendi üyeliklerini görür VE aynı org'daki diğer üyeleri görür
drop policy if exists om_select on organization_members;
create policy om_select on organization_members for select to authenticated
  using (
    user_id = auth.uid()
    or user_belongs_to_org(organization_id)
  );

-- INSERT/UPDATE/DELETE sadece service_role (action'lar üzerinden)
drop policy if exists om_insert on organization_members;
create policy om_insert on organization_members for insert to authenticated
  with check (false);

drop policy if exists om_update on organization_members;
create policy om_update on organization_members for update to authenticated
  using (false);

drop policy if exists om_delete on organization_members;
create policy om_delete on organization_members for delete to authenticated
  using (false);

-- 5. handle_new_user trigger güncelle: invite veya self signup'ta org_members satırı da ekle
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

    insert into public.organization_members (user_id, organization_id, role)
    values (new.id, invited_org_id, invited_role)
    on conflict (user_id, organization_id) do nothing;
  else
    -- Self signup: yeni organization yarat, kullanıcı admin olur
    insert into organizations (name) values (display_name || ' Paneli') returning id into new_org_id;

    insert into public.profiles (id, email, full_name, role, organization_id)
    values (new.id, new.email, display_name, 'admin'::user_role, new_org_id)
    on conflict (id) do nothing;

    insert into public.organization_members (user_id, organization_id, role)
    values (new.id, new_org_id, 'admin'::user_role)
    on conflict (user_id, organization_id) do nothing;

    update organizations set owner_id = new.id where id = new_org_id;
  end if;

  return new;
end;
$$;

-- 6. Aktif organizasyonu değiştirme RPC (atomic + üyelik kontrolü)
create or replace function switch_active_organization(target_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  member_role user_role;
begin
  -- Kullanıcı bu orgun üyesi mi?
  select role into member_role
  from organization_members
  where user_id = auth.uid() and organization_id = target_org_id;

  if member_role is null then
    raise exception 'Bu organizasyonun üyesi değilsiniz';
  end if;

  -- profile.organization_id ve role'ü org'daki rolüyle senkronize et
  update profiles
  set organization_id = target_org_id,
      role = member_role
  where id = auth.uid();
end;
$$;

grant execute on function switch_active_organization(uuid) to authenticated;
