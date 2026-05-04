-- GES & RES & Genel şablon seed data

insert into templates (name, type, category, description, items, is_system) values
(
  'GES Mekanik Montaj',
  'Taşeron',
  'GES',
  'Güneş enerji santrali mekanik montaj işleri için tipik kalem listesi.',
  $$[
    {"name":"Mekanik kazık çakımı","category":"Mekanik","unit":"adet","default_qty":1000},
    {"name":"Panel taşıma","category":"Hizmet","unit":"adet","default_qty":2000},
    {"name":"Panel montajı (manuel)","category":"Mekanik","unit":"adet","default_qty":2000},
    {"name":"Tabla / strüktür montajı","category":"Mekanik","unit":"set","default_qty":500},
    {"name":"Topraklama","category":"Elektrik","unit":"m","default_qty":1500},
    {"name":"Mekanik test","category":"Hizmet","unit":"set","default_qty":1}
  ]$$::jsonb,
  true
),
(
  'GES Elektrik İşleri',
  'Taşeron',
  'GES',
  'Güneş enerji santrali elektrik kabloları, trafo, inverter işleri.',
  $$[
    {"name":"DC string kablosu (çekilmesi)","category":"Elektrik","unit":"m","default_qty":5000},
    {"name":"AC kablo (LV)","category":"Elektrik","unit":"m","default_qty":2000},
    {"name":"MV (orta gerilim) kablo","category":"Elektrik","unit":"m","default_qty":800},
    {"name":"Trafo merkezi montajı","category":"Elektrik","unit":"adet","default_qty":2},
    {"name":"Inverter montajı","category":"Elektrik","unit":"adet","default_qty":20},
    {"name":"İzleme (SCADA) sistemi","category":"Elektrik","unit":"set","default_qty":1},
    {"name":"Topraklama panosu","category":"Elektrik","unit":"adet","default_qty":4}
  ]$$::jsonb,
  true
),
(
  'GES İnşaat İşleri',
  'Taşeron',
  'GES',
  'Saha hazırlık, yol, çit, drenaj.',
  $$[
    {"name":"Saha düzleme","category":"İnşaat","unit":"m2","default_qty":50000},
    {"name":"Çevre çiti","category":"İnşaat","unit":"m","default_qty":1500},
    {"name":"Servis yolu","category":"İnşaat","unit":"m","default_qty":800},
    {"name":"Drenaj kanalı","category":"İnşaat","unit":"m","default_qty":600},
    {"name":"Trafo binası temeli","category":"İnşaat","unit":"adet","default_qty":2}
  ]$$::jsonb,
  true
),
(
  'RES Kule & Foundation',
  'Taşeron',
  'RES',
  'Rüzgar enerji santrali kule montajı ve temel işleri.',
  $$[
    {"name":"Foundation kazısı","category":"İnşaat","unit":"m3","default_qty":1200},
    {"name":"Foundation beton dökümü","category":"İnşaat","unit":"m3","default_qty":800},
    {"name":"Foundation donatı","category":"İnşaat","unit":"ton","default_qty":120},
    {"name":"Kule sekmen montajı","category":"Mekanik","unit":"adet","default_qty":4},
    {"name":"Vinç kiralama (1500t)","category":"İş Makinaları","unit":"gün","default_qty":30},
    {"name":"Yardımcı vinç (200t)","category":"İş Makinaları","unit":"gün","default_qty":45}
  ]$$::jsonb,
  true
),
(
  'RES Elektrik & SCADA',
  'Taşeron',
  'RES',
  'Rüzgar santrali kablolama, trafo merkezi, SCADA.',
  $$[
    {"name":"Trafo bağlantı kablosu (MV)","category":"Elektrik","unit":"m","default_qty":3000},
    {"name":"Yer altı MV kablo","category":"Elektrik","unit":"m","default_qty":5000},
    {"name":"Pad-mount trafo","category":"Elektrik","unit":"adet","default_qty":6},
    {"name":"SCADA fiber omurga","category":"Elektrik","unit":"m","default_qty":4000},
    {"name":"Türbin bağlantı kabloları","category":"Elektrik","unit":"set","default_qty":8}
  ]$$::jsonb,
  true
),
(
  'Genel Malzeme Karşılaştırma',
  'Malzeme',
  'Genel',
  'Geniş malzeme listesi için temel şablon.',
  $$[
    {"name":"Malzeme A","category":"Malzeme","unit":"adet","default_qty":100},
    {"name":"Malzeme B","category":"Malzeme","unit":"adet","default_qty":50},
    {"name":"Malzeme C","category":"Malzeme","unit":"m","default_qty":200}
  ]$$::jsonb,
  true
);

-- Firma fiyat geçmişi view: belirli bir firmanın geçmiş tüm tekliflerini özetler
create or replace view firm_price_history as
select
  bp.firm_id,
  ci.name as item_name,
  ci.category as item_category,
  ci.unit,
  bp.price,
  c.id as comparison_id,
  c.name as comparison_name,
  c.currency,
  c.created_at
from bid_prices bp
  inner join comparison_items ci on ci.id = bp.item_id
  inner join comparisons c on c.id = bp.comparison_id
where bp.price is not null;

grant select on firm_price_history to authenticated;
