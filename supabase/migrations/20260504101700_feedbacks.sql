-- Kullanıcı geri bildirimleri / iyileştirme önerileri
create table if not exists feedbacks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  user_email text,
  user_name text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_feedbacks_created on feedbacks(created_at desc);

alter table feedbacks enable row level security;

-- Kullanıcı: kendi feedbacklerini görür + ekler
create policy feedbacks_insert on feedbacks for insert to authenticated with check (user_id = auth.uid());
create policy feedbacks_select_own on feedbacks for select to authenticated using (user_id = auth.uid());
