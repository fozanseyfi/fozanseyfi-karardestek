-- Solar Teklif ayri bir Supabase projesine geciyor.
-- handle_new_user trigger'inda solar-teklif platform satiri kaldirildi.
-- Sadece karar-destek uyeligi olusturulacak.
-- Mevcut orphan solar-teklif satirlari da temizlenir.
--
-- Composite PK: (user_id, organization_id, platform) -> ON CONFLICT'i da guncelliyoruz.

-- 1. Trigger function: sadece karar-destek INSERT'i
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
    -- Davet akisi: mevcut org'a ekle
    invited_role := coalesce(
      (new.raw_user_meta_data->>'invited_role')::user_role,
      'user'::user_role
    );

    insert into public.profiles (id, email, full_name, role, organization_id)
    values (new.id, new.email, display_name, invited_role, invited_org_id)
    on conflict (id) do nothing;

    insert into public.organization_members (user_id, organization_id, role, platform)
    values (new.id, invited_org_id, invited_role, 'karar-destek')
    on conflict (user_id, organization_id, platform) do nothing;
  else
    -- Self signup: yeni org yarat, kullanici admin olur
    insert into organizations (name)
    values (display_name || ' Paneli')
    returning id into new_org_id;

    insert into public.profiles (id, email, full_name, role, organization_id)
    values (new.id, new.email, display_name, 'admin'::user_role, new_org_id)
    on conflict (id) do nothing;

    insert into public.organization_members (user_id, organization_id, role, platform)
    values (new.id, new_org_id, 'admin'::user_role, 'karar-destek')
    on conflict (user_id, organization_id, platform) do nothing;

    update organizations set owner_id = new.id where id = new_org_id;
  end if;

  return new;
end;
$$;

-- 2. Mevcut orphan solar-teklif satirlarini temizle
-- Solar Teklif kendi Supabase'ine gectigi icin bu satirlar artik isimize yaramiyor
delete from public.organization_members
where platform = 'solar-teklif';
