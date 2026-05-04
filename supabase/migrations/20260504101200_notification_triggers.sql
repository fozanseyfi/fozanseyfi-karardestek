-- Bildirim sistemi: paylaşım eklendiğinde + karar verildiğinde otomatik notifications insert

-- Paylaşıldı bildirimi
create or replace function notify_on_share()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  comp_name text;
  sharer_name text;
begin
  select name into comp_name from comparisons where id = new.comparison_id;
  select coalesce(full_name, email) into sharer_name from profiles where id = new.shared_by;

  insert into notifications (user_id, type, title, body, link)
  values (
    new.shared_with,
    'share',
    'Karşılaştırma sizinle paylaşıldı',
    coalesce(sharer_name, 'Bir kullanıcı') || ' "' || coalesce(comp_name, 'karşılaştırma') || '" karşılaştırmasını sizinle paylaştı.',
    '/comparisons/' || new.comparison_id
  );
  return new;
end;
$$;

drop trigger if exists on_share_inserted on comparison_shares;
create trigger on_share_inserted
  after insert on comparison_shares
  for each row execute function notify_on_share();

-- Karar verildi bildirimi (karşılaştırmanın owner'ına)
create or replace function notify_on_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  decided_firm_name text;
begin
  if new.status = 'decided' and (old.status is null or old.status <> 'decided') then
    if new.decided_firm_id is not null then
      select name into decided_firm_name from firms where id = new.decided_firm_id;
    end if;

    -- Owner'a bildirim
    insert into notifications (user_id, type, title, body, link)
    values (
      new.owner_id,
      'decision',
      'Karar verildi: ' || new.name,
      case
        when decided_firm_name is not null then 'Karar: ' || decided_firm_name
        else 'Karşılaştırma kararı kaydedildi.'
      end,
      '/comparisons/' || new.id
    );

    -- Paylaşılan kullanıcılara da bildirim
    insert into notifications (user_id, type, title, body, link)
    select
      cs.shared_with,
      'decision',
      'Karar verildi: ' || new.name,
      case
        when decided_firm_name is not null then 'Karar: ' || decided_firm_name
        else 'Karşılaştırma kararı kaydedildi.'
      end,
      '/comparisons/' || new.id
    from comparison_shares cs
    where cs.comparison_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_comparison_decided on comparisons;
create trigger on_comparison_decided
  after update on comparisons
  for each row execute function notify_on_decision();
