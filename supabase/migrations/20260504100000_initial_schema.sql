-- EPC Karar Destek — initial schema
-- 9 tables: profiles, projects, firms, comparisons, comparison_firms,
--          comparison_items, bid_prices, comparison_shares, templates, notifications

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ENUMS
create type user_role as enum ('admin', 'user', 'viewer');
create type comparison_status as enum ('draft', 'in_review', 'decided', 'archived');
create type comparison_type as enum ('Taşeron', 'Malzeme', 'Hizmet', 'İşçilik', 'Ekipman', 'Diğer');
create type item_category as enum ('Mekanik', 'Elektrik', 'İnşaat', 'İş Makinaları', 'Malzeme', 'Hizmet', 'Harita', 'Diğer');
create type currency_code as enum ('TRY', 'USD', 'EUR');
create type share_permission as enum ('view', 'edit');
create type notification_type as enum ('share', 'decision', 'invite', 'system');
create type template_category as enum ('GES', 'RES', 'Genel');

-- PROFILES (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role user_role not null default 'user',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PROJECTS
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  owner_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FIRMS (shared firm pool)
create table firms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- COMPARISONS
create table comparisons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type comparison_type not null,
  status comparison_status not null default 'draft',
  project_id uuid references projects(id) on delete set null,
  owner_id uuid not null references profiles(id) on delete cascade,
  budget numeric(18, 2),
  currency currency_code not null default 'TRY',
  decision_date date,
  decided_firm_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- COMPARISON_FIRMS (which firms are in this comparison)
create table comparison_firms (
  id uuid primary key default uuid_generate_v4(),
  comparison_id uuid not null references comparisons(id) on delete cascade,
  firm_id uuid not null references firms(id) on delete restrict,
  bid_pdf_url text,
  notes text,
  created_at timestamptz not null default now(),
  unique (comparison_id, firm_id)
);

alter table comparisons
  add constraint comparisons_decided_firm_fk
  foreign key (decided_firm_id) references firms(id) on delete set null;

-- COMPARISON_ITEMS (line items)
create table comparison_items (
  id uuid primary key default uuid_generate_v4(),
  comparison_id uuid not null references comparisons(id) on delete cascade,
  name text not null,
  category item_category not null default 'Diğer',
  unit text,
  qty numeric(18, 4) not null default 1,
  target_price numeric(18, 2),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- BID_PRICES (item × firm price matrix)
create table bid_prices (
  id uuid primary key default uuid_generate_v4(),
  comparison_id uuid not null references comparisons(id) on delete cascade,
  item_id uuid not null references comparison_items(id) on delete cascade,
  firm_id uuid not null references firms(id) on delete cascade,
  price numeric(18, 2),
  updated_by uuid not null references profiles(id),
  updated_at timestamptz not null default now(),
  unique (item_id, firm_id)
);

-- COMPARISON_SHARES
create table comparison_shares (
  id uuid primary key default uuid_generate_v4(),
  comparison_id uuid not null references comparisons(id) on delete cascade,
  shared_with uuid not null references profiles(id) on delete cascade,
  permission share_permission not null default 'view',
  shared_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comparison_id, shared_with)
);

-- TEMPLATES (GES, RES, Genel)
create table templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type comparison_type not null,
  category template_category not null default 'Genel',
  description text,
  items jsonb not null default '[]'::jsonb,
  is_system boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- TRIGGER: updated_at
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger projects_updated_at before update on projects for each row execute function set_updated_at();
create trigger firms_updated_at before update on firms for each row execute function set_updated_at();
create trigger comparisons_updated_at before update on comparisons for each row execute function set_updated_at();
create trigger bid_prices_updated_at before update on bid_prices for each row execute function set_updated_at();

-- TRIGGER: auto-create profile on auth.users insert + admin seed
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
declare
  admin_email text := 'ozan.seyfi@kontrolmatik.com';
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when new.email = admin_email then 'admin'::user_role else 'user'::user_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
