-- Templates: zenginleştirilmiş örnek karşılaştırma verisi
-- sample_data: JSON yapısı:
-- {
--   "firms": [{"name", "contact_name", "contact_email", "contact_phone", "notes"}],
--   "metric_weights": { metric_key: weight, ... },
--   "items": [{name, category, unit, default_qty, sample_target, sample_prices: [p1, p2, p3, p4]}],
--   "manual_scores": [{ firm_index, metric_key, score (0-100), notes }]
-- }

alter table templates add column if not exists sample_data jsonb;

-- 1. GES Mekanik Montaj — 4 firma, 6 kalem, dolu fiyat ve manuel skor
update templates set sample_data = $$
{
  "firms": [
    {"name": "Sesa Mühendislik", "contact_name": "Ahmet Yıldız", "contact_email": "ahmet@sesa-tr.com", "contact_phone": "+90 532 111 22 33", "notes": "GES sektöründe 12 yıllık deneyim. ISO 9001."},
    {"name": "Soldera Solar", "contact_name": "Mehmet Korkmaz", "contact_email": "info@soldera.com.tr", "contact_phone": "+90 532 222 33 44", "notes": "Almanya merkezli, Türkiye ofisi 2018'de açıldı."},
    {"name": "Bekir Ökmen Mühendislik", "contact_name": "Bekir Ökmen", "contact_email": "info@bekirokmen.com", "contact_phone": "+90 532 333 44 55", "notes": "Ege bölgesi referansları yüksek."},
    {"name": "Efesun Yapı", "contact_name": "Selim Demir", "contact_email": "selim@efesun.com", "contact_phone": "+90 532 444 55 66", "notes": "Akdeniz sahası uzmanı."}
  ],
  "metric_weights": {"scope": 25, "deviation": 20, "lowest": 15, "technical": 15, "references": 10, "payment_terms": 10, "delivery_time": 5},
  "items": [
    {"name": "Mekanik kazık çakımı", "category": "Mekanik", "unit": "adet", "default_qty": 1000, "sample_target": 250, "sample_prices": [240, 265, 245, 280]},
    {"name": "Panel taşıma", "category": "Hizmet", "unit": "adet", "default_qty": 2000, "sample_target": 18, "sample_prices": [17, 19, 17, 21]},
    {"name": "Panel montajı (manuel)", "category": "Mekanik", "unit": "adet", "default_qty": 2000, "sample_target": 35, "sample_prices": [33, 36, 34, 40]},
    {"name": "Tabla / strüktür montajı", "category": "Mekanik", "unit": "set", "default_qty": 500, "sample_target": 1200, "sample_prices": [1150, 1280, 1200, 1350]},
    {"name": "Topraklama", "category": "Elektrik", "unit": "m", "default_qty": 1500, "sample_target": 45, "sample_prices": [42, 48, 44, 52]},
    {"name": "Mekanik test ve devreye alma", "category": "Hizmet", "unit": "set", "default_qty": 1, "sample_target": 75000, "sample_prices": [70000, 80000, 72000, 90000]}
  ],
  "manual_scores": [
    {"firm_index": 0, "metric_key": "technical", "score": 90, "notes": "Saha mühendisi tam zamanlı atanıyor; ekipman kalitesi yüksek."},
    {"firm_index": 0, "metric_key": "references", "score": 85, "notes": "Karapınar 100 MWp ve Kayseri 50 MWp tamamlandı; kontrol edildi."},
    {"firm_index": 0, "metric_key": "payment_terms", "score": 70, "notes": "Peşinat %30, kalan iş ilerlemesine göre. Vade 45 gün."},
    {"firm_index": 0, "metric_key": "delivery_time", "score": 80, "notes": "120 gün taahhüt; geçmiş projelerde gecikme yok."},
    {"firm_index": 1, "metric_key": "technical", "score": 80, "notes": "Almanya'dan know-how transferi var; yerel ekip orta seviye."},
    {"firm_index": 1, "metric_key": "references", "score": 60, "notes": "Türkiye'de 2 proje (toplam 30 MWp). Avrupa'da güçlü."},
    {"firm_index": 1, "metric_key": "payment_terms", "score": 60, "notes": "Peşinat %40. Vade 30 gün."},
    {"firm_index": 1, "metric_key": "delivery_time", "score": 75, "notes": "150 gün; Almanya'dan ekipman teslimi kritik path."},
    {"firm_index": 2, "metric_key": "technical", "score": 75, "notes": "Yerli ekip güçlü, EPC sertifikası var."},
    {"firm_index": 2, "metric_key": "references", "score": 90, "notes": "Ege bölgesinde 8 proje. 2 müşteri direkt referans verdi."},
    {"firm_index": 2, "metric_key": "payment_terms", "score": 80, "notes": "Peşinat %20. Vade 60 gün. Esnek."},
    {"firm_index": 2, "metric_key": "delivery_time", "score": 85, "notes": "110 gün taahhüt; bölgesel avantaj var."},
    {"firm_index": 3, "metric_key": "technical", "score": 60, "notes": "Yeni kurulan firma, ekip deneyimsiz görünüyor."},
    {"firm_index": 3, "metric_key": "references", "score": 50, "notes": "Sadece 1 küçük proje (5 MWp)."},
    {"firm_index": 3, "metric_key": "payment_terms", "score": 75, "notes": "Peşinat %25. Vade 45 gün."},
    {"firm_index": 3, "metric_key": "delivery_time", "score": 60, "notes": "180 gün; iş gücü kapasitesi şüpheli."}
  ]
}
$$::jsonb where name = 'GES Mekanik Montaj';

-- 2. RES Kule & Foundation — 3 firma, 6 kalem
update templates set sample_data = $$
{
  "firms": [
    {"name": "Vestas Türkiye", "contact_name": "Cem Avcı", "contact_email": "cem@vestas.com.tr", "contact_phone": "+90 532 111 22 33", "notes": "Global oyuncu, Türkiye operasyonu 2010'dan beri."},
    {"name": "GE Renewable Türkiye", "contact_name": "Burcu Kaya", "contact_email": "burcu@ge.com", "contact_phone": "+90 532 222 33 44", "notes": "Onshore deneyim; Trakya rüzgar santralleri portföyü."},
    {"name": "Elin İnşaat", "contact_name": "Elin Yıldız", "contact_email": "info@elin.com.tr", "contact_phone": "+90 532 333 44 55", "notes": "Sadece foundation+kule erection. Lokal."}
  ],
  "metric_weights": {"scope": 20, "deviation": 15, "technical": 25, "references": 15, "financial": 15, "payment_terms": 10},
  "items": [
    {"name": "Foundation kazısı", "category": "İnşaat", "unit": "m3", "default_qty": 1200, "sample_target": 850, "sample_prices": [820, 880, 870]},
    {"name": "Foundation beton dökümü", "category": "İnşaat", "unit": "m3", "default_qty": 800, "sample_target": 2200, "sample_prices": [2150, 2280, 2180]},
    {"name": "Foundation donatı", "category": "İnşaat", "unit": "ton", "default_qty": 120, "sample_target": 38000, "sample_prices": [37000, 39500, 37500]},
    {"name": "Kule sekmen montajı", "category": "Mekanik", "unit": "adet", "default_qty": 4, "sample_target": 250000, "sample_prices": [240000, 270000, 245000]},
    {"name": "Vinç kiralama (1500t)", "category": "İş Makinaları", "unit": "gün", "default_qty": 30, "sample_target": 85000, "sample_prices": [82000, 88000, 95000]},
    {"name": "Yardımcı vinç (200t)", "category": "İş Makinaları", "unit": "gün", "default_qty": 45, "sample_target": 18000, "sample_prices": [17500, 19000, 17800]}
  ],
  "manual_scores": [
    {"firm_index": 0, "metric_key": "technical", "score": 95, "notes": "Vestas global ekipman desteği; saha mühendislik kalitesi A++."},
    {"firm_index": 0, "metric_key": "references", "score": 90, "notes": "Turkiye'de 1500 MW kurulum referansı."},
    {"firm_index": 0, "metric_key": "financial", "score": 95, "notes": "Halka açık global firma, finansal güç maksimum."},
    {"firm_index": 0, "metric_key": "payment_terms", "score": 60, "notes": "Sıkı vade %30 peşinat + 30 gün vade."},
    {"firm_index": 1, "metric_key": "technical", "score": 90, "notes": "GE marka değer, türbin tedariki ile entegre."},
    {"firm_index": 1, "metric_key": "references", "score": 85, "notes": "Trakya 600 MW portföy."},
    {"firm_index": 1, "metric_key": "financial", "score": 90, "notes": "GE corporate kredi notu yüksek."},
    {"firm_index": 1, "metric_key": "payment_terms", "score": 70, "notes": "Peşinat %25, vade 45 gün."},
    {"firm_index": 2, "metric_key": "technical", "score": 70, "notes": "Saha tecrübesi yeterli ama mühendislik sınırlı."},
    {"firm_index": 2, "metric_key": "references", "score": 65, "notes": "300 MW kurulum, mostly subcontractor olarak."},
    {"firm_index": 2, "metric_key": "financial", "score": 60, "notes": "Orta ölçek; banka teminatı için garantör gerekebilir."},
    {"firm_index": 2, "metric_key": "payment_terms", "score": 85, "notes": "Esnek; %15 peşinat + 60 gün vade."}
  ]
}
$$::jsonb where name = 'RES Kule & Foundation';
