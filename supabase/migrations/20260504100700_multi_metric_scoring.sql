-- Multi-criteria decision scoring + revisions
-- Replaces simple 40/35/25 with configurable metrics + manual scores per firm

-- 1) bid_prices: revision counter (1 = ilk teklif, 2 = ilk revize, ...)
alter table bid_prices add column if not exists revision integer not null default 1;
create index if not exists idx_bp_latest on bid_prices(comparison_id, item_id, firm_id, revision desc);

-- 2) comparison_metrics: bu karşılaştırmada hangi metrik aktif + ağırlığı
create table if not exists comparison_metrics (
  id uuid primary key default uuid_generate_v4(),
  comparison_id uuid not null references comparisons(id) on delete cascade,
  metric_key text not null,
  weight numeric(5,2) not null check (weight >= 0 and weight <= 100),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (comparison_id, metric_key)
);

create index if not exists idx_cm_comparison on comparison_metrics(comparison_id);

alter table comparison_metrics enable row level security;

create policy cm_select on comparison_metrics for select to authenticated
  using (can_view_comparison(comparison_id));
create policy cm_modify on comparison_metrics for all to authenticated
  using (can_edit_comparison(comparison_id))
  with check (can_edit_comparison(comparison_id));

-- 3) firm_manual_scores: her firma × her manuel metrik için 0-100 puan + not
create table if not exists firm_manual_scores (
  id uuid primary key default uuid_generate_v4(),
  comparison_id uuid not null references comparisons(id) on delete cascade,
  firm_id uuid not null references firms(id) on delete cascade,
  metric_key text not null,
  score numeric(5,2) check (score >= 0 and score <= 100),
  notes text,
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (comparison_id, firm_id, metric_key)
);

create index if not exists idx_fms_comparison on firm_manual_scores(comparison_id);
create index if not exists idx_fms_firm on firm_manual_scores(firm_id);

alter table firm_manual_scores enable row level security;

create policy fms_select on firm_manual_scores for select to authenticated
  using (can_view_comparison(comparison_id));
create policy fms_modify on firm_manual_scores for all to authenticated
  using (can_edit_comparison(comparison_id))
  with check (can_edit_comparison(comparison_id));

create trigger fms_updated_at before update on firm_manual_scores
  for each row execute function set_updated_at();

-- 4) bid_prices_latest view: en son revizenin fiyat matrisi
create or replace view bid_prices_latest as
select distinct on (comparison_id, item_id, firm_id) *
from bid_prices
order by comparison_id, item_id, firm_id, revision desc;

grant select on bid_prices_latest to authenticated;
