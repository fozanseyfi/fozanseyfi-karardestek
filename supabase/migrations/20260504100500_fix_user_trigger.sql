-- Fix handle_new_user trigger: add search_path so public.user_role enum resolves
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email text := 'ozan.seyfi@kontrolmatik.com';
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when new.email = admin_email then 'admin'::user_role else 'user'::user_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
