-- Profiles RLS: kullanıcı ortak org'u paylaştığı diğer profilleri görebilsin
-- (admin/users sayfasının org_members + profiles join'ünün düzgün çalışması için)

create or replace function user_shares_org_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organization_members me
    inner join organization_members them on me.organization_id = them.organization_id
    where me.user_id = auth.uid()
      and them.user_id = target_user_id
  )
$$;

drop policy if exists profiles_select_org on profiles;
drop policy if exists profiles_select_all on profiles;
create policy profiles_select on profiles for select to authenticated
  using (
    id = auth.uid()
    or user_shares_org_with(id)
  );
