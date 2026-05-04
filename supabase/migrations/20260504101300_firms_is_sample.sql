-- firms.is_sample: şablondan klonlanan firmalar (gerçek firma havuzunda gözükmesin)
alter table firms add column if not exists is_sample boolean not null default false;
create index if not exists idx_firms_is_sample on firms(is_sample) where is_sample = false;
