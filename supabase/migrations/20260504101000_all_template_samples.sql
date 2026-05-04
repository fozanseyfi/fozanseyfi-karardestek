-- Tüm şablonlar için sample_data — Firma A/B/C/D pattern'i ile dolu örnek karşılaştırma

update templates set sample_data = $$
{
  "firms": [
    {"name": "Firma A", "contact_name": "Yetkili A", "contact_email": "info@firma-a.com", "contact_phone": "+90 555 111 11 11", "notes": "Yerel firma, 8 yıl deneyim."},
    {"name": "Firma B", "contact_name": "Yetkili B", "contact_email": "info@firma-b.com", "contact_phone": "+90 555 222 22 22", "notes": "Yabancı sermayeli, sertifikalı."},
    {"name": "Firma C", "contact_name": "Yetkili C", "contact_email": "info@firma-c.com", "contact_phone": "+90 555 333 33 33", "notes": "Bölgesel uzman, ekonomik."},
    {"name": "Firma D", "contact_name": "Yetkili D", "contact_email": "info@firma-d.com", "contact_phone": "+90 555 444 44 44", "notes": "Yeni kurulan firma, agresif fiyat."}
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
    {"firm_index": 0, "metric_key": "technical", "score": 90, "notes": "Saha mühendisi tam zamanlı; ekipman kalitesi yüksek."},
    {"firm_index": 0, "metric_key": "references", "score": 85, "notes": "Karapınar 100 MWp ve Kayseri 50 MWp tamamlandı."},
    {"firm_index": 0, "metric_key": "payment_terms", "score": 70, "notes": "Peşinat %30 + 45 gün vade."},
    {"firm_index": 0, "metric_key": "delivery_time", "score": 80, "notes": "120 gün taahhüt; geçmişte gecikme yok."},
    {"firm_index": 1, "metric_key": "technical", "score": 80, "notes": "Yabancı know-how transferi var; yerel ekip orta."},
    {"firm_index": 1, "metric_key": "references", "score": 60, "notes": "Türkiye'de 2 proje (toplam 30 MWp)."},
    {"firm_index": 1, "metric_key": "payment_terms", "score": 60, "notes": "Peşinat %40, vade 30 gün."},
    {"firm_index": 1, "metric_key": "delivery_time", "score": 75, "notes": "150 gün; ekipman teslimi kritik."},
    {"firm_index": 2, "metric_key": "technical", "score": 75, "notes": "Yerli ekip güçlü, EPC sertifikası var."},
    {"firm_index": 2, "metric_key": "references", "score": 90, "notes": "Bölgede 8 proje. 2 müşteri direkt referans verdi."},
    {"firm_index": 2, "metric_key": "payment_terms", "score": 80, "notes": "Peşinat %20, vade 60 gün. Esnek."},
    {"firm_index": 2, "metric_key": "delivery_time", "score": 85, "notes": "110 gün taahhüt; bölgesel avantaj."},
    {"firm_index": 3, "metric_key": "technical", "score": 60, "notes": "Yeni firma, ekip deneyimsiz."},
    {"firm_index": 3, "metric_key": "references", "score": 50, "notes": "Sadece 1 küçük proje (5 MWp)."},
    {"firm_index": 3, "metric_key": "payment_terms", "score": 75, "notes": "Peşinat %25, vade 45 gün."},
    {"firm_index": 3, "metric_key": "delivery_time", "score": 60, "notes": "180 gün; iş gücü kapasitesi şüpheli."}
  ]
}
$$::jsonb where name = 'GES Mekanik Montaj';

update templates set sample_data = $$
{
  "firms": [
    {"name": "Firma A", "contact_name": "Yetkili A", "contact_email": "info@firma-a.com", "contact_phone": "+90 555 111 11 11", "notes": "Yerel firma, 8 yıl deneyim."},
    {"name": "Firma B", "contact_name": "Yetkili B", "contact_email": "info@firma-b.com", "contact_phone": "+90 555 222 22 22", "notes": "Yabancı sermayeli, sertifikalı."},
    {"name": "Firma C", "contact_name": "Yetkili C", "contact_email": "info@firma-c.com", "contact_phone": "+90 555 333 33 33", "notes": "Bölgesel uzman, ekonomik."}
  ],
  "metric_weights": {"scope": 20, "deviation": 25, "lowest": 15, "technical": 20, "quality": 15, "payment_terms": 5},
  "items": [
    {"name": "DC string kablosu", "category": "Elektrik", "unit": "m", "default_qty": 5000, "sample_target": 28, "sample_prices": [27, 30, 26]},
    {"name": "AC kablo (LV)", "category": "Elektrik", "unit": "m", "default_qty": 2000, "sample_target": 65, "sample_prices": [63, 70, 60]},
    {"name": "MV (orta gerilim) kablo", "category": "Elektrik", "unit": "m", "default_qty": 800, "sample_target": 280, "sample_prices": [275, 295, 270]},
    {"name": "Trafo merkezi montajı", "category": "Elektrik", "unit": "adet", "default_qty": 2, "sample_target": 450000, "sample_prices": [440000, 480000, 425000]},
    {"name": "Inverter montajı", "category": "Elektrik", "unit": "adet", "default_qty": 20, "sample_target": 12000, "sample_prices": [11500, 13000, 11000]},
    {"name": "İzleme (SCADA) sistemi", "category": "Elektrik", "unit": "set", "default_qty": 1, "sample_target": 180000, "sample_prices": [175000, 200000, 170000]},
    {"name": "Topraklama panosu", "category": "Elektrik", "unit": "adet", "default_qty": 4, "sample_target": 25000, "sample_prices": [24000, 27000, 23500]}
  ],
  "manual_scores": [
    {"firm_index": 0, "metric_key": "technical", "score": 85, "notes": "Elektrik mühendisleri yetkin; saha tecrübesi yüksek."},
    {"firm_index": 0, "metric_key": "quality", "score": 80, "notes": "ISO 9001 + IEC 61439 uyumlu."},
    {"firm_index": 0, "metric_key": "payment_terms", "score": 70, "notes": "Peşinat %30 + 45 gün vade."},
    {"firm_index": 1, "metric_key": "technical", "score": 95, "notes": "Yabancı sermayeli, AB normları."},
    {"firm_index": 1, "metric_key": "quality", "score": 95, "notes": "ISO 9001/14001/45001 + CE markası."},
    {"firm_index": 1, "metric_key": "payment_terms", "score": 55, "notes": "Sıkı vade %50 peşinat."},
    {"firm_index": 2, "metric_key": "technical", "score": 70, "notes": "Bölgesel uzman; yerel sertifikalar yeterli."},
    {"firm_index": 2, "metric_key": "quality", "score": 70, "notes": "Sadece ISO 9001."},
    {"firm_index": 2, "metric_key": "payment_terms", "score": 85, "notes": "Esnek; %15 peşinat + 60 gün vade."}
  ]
}
$$::jsonb where name = 'GES Elektrik İşleri';

update templates set sample_data = $$
{
  "firms": [
    {"name": "Firma A", "contact_name": "Yetkili A", "contact_email": "info@firma-a.com", "contact_phone": "+90 555 111 11 11", "notes": "Saha hazırlık uzmanı."},
    {"name": "Firma B", "contact_name": "Yetkili B", "contact_email": "info@firma-b.com", "contact_phone": "+90 555 222 22 22", "notes": "Büyük inşaat şirketi."},
    {"name": "Firma C", "contact_name": "Yetkili C", "contact_email": "info@firma-c.com", "contact_phone": "+90 555 333 33 33", "notes": "Bölgesel inşaat firması."}
  ],
  "metric_weights": {"scope": 30, "deviation": 25, "lowest": 20, "technical": 10, "references": 10, "delivery_time": 5},
  "items": [
    {"name": "Saha düzleme", "category": "İnşaat", "unit": "m2", "default_qty": 50000, "sample_target": 8, "sample_prices": [7.5, 8.5, 7]},
    {"name": "Çevre çiti", "category": "İnşaat", "unit": "m", "default_qty": 1500, "sample_target": 380, "sample_prices": [370, 400, 360]},
    {"name": "Servis yolu", "category": "İnşaat", "unit": "m", "default_qty": 800, "sample_target": 280, "sample_prices": [270, 300, 265]},
    {"name": "Drenaj kanalı", "category": "İnşaat", "unit": "m", "default_qty": 600, "sample_target": 220, "sample_prices": [215, 240, 210]},
    {"name": "Trafo binası temeli", "category": "İnşaat", "unit": "adet", "default_qty": 2, "sample_target": 85000, "sample_prices": [82000, 92000, 80000]}
  ],
  "manual_scores": [
    {"firm_index": 0, "metric_key": "technical", "score": 80, "notes": "Saha hazırlığı için özelleşmiş ekipman parkı."},
    {"firm_index": 0, "metric_key": "references", "score": 75, "notes": "5 GES projesi tamamlandı."},
    {"firm_index": 0, "metric_key": "delivery_time", "score": 85, "notes": "60 gün taahhüt."},
    {"firm_index": 1, "metric_key": "technical", "score": 90, "notes": "Büyük şirket, çok şube."},
    {"firm_index": 1, "metric_key": "references", "score": 95, "notes": "20+ büyük proje."},
    {"firm_index": 1, "metric_key": "delivery_time", "score": 75, "notes": "75 gün; çok proje yönettiği için."},
    {"firm_index": 2, "metric_key": "technical", "score": 70, "notes": "Lokal kapasiteler ölçülü."},
    {"firm_index": 2, "metric_key": "references", "score": 65, "notes": "Bölgede 4 proje."},
    {"firm_index": 2, "metric_key": "delivery_time", "score": 80, "notes": "65 gün; bölge avantajı."}
  ]
}
$$::jsonb where name = 'GES İnşaat İşleri';

update templates set sample_data = $$
{
  "firms": [
    {"name": "Firma A", "contact_name": "Yetkili A", "contact_email": "info@firma-a.com", "contact_phone": "+90 555 111 11 11", "notes": "Global RES yüklenicisi."},
    {"name": "Firma B", "contact_name": "Yetkili B", "contact_email": "info@firma-b.com", "contact_phone": "+90 555 222 22 22", "notes": "Bölgesel uzman onshore."},
    {"name": "Firma C", "contact_name": "Yetkili C", "contact_email": "info@firma-c.com", "contact_phone": "+90 555 333 33 33", "notes": "Lokal foundation+kule erection."}
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
    {"firm_index": 0, "metric_key": "technical", "score": 95, "notes": "Global ekipman ve mühendislik desteği."},
    {"firm_index": 0, "metric_key": "references", "score": 90, "notes": "Türkiye'de 1500 MW kurulum."},
    {"firm_index": 0, "metric_key": "financial", "score": 95, "notes": "Halka açık global firma."},
    {"firm_index": 0, "metric_key": "payment_terms", "score": 60, "notes": "Sıkı vade %30 peşinat + 30 gün."},
    {"firm_index": 1, "metric_key": "technical", "score": 90, "notes": "Onshore deneyimli bölgesel uzman."},
    {"firm_index": 1, "metric_key": "references", "score": 85, "notes": "600 MW portföy."},
    {"firm_index": 1, "metric_key": "financial", "score": 90, "notes": "Yüksek kredi notu."},
    {"firm_index": 1, "metric_key": "payment_terms", "score": 70, "notes": "Peşinat %25, vade 45 gün."},
    {"firm_index": 2, "metric_key": "technical", "score": 70, "notes": "Saha tecrübesi yeterli, mühendislik sınırlı."},
    {"firm_index": 2, "metric_key": "references", "score": 65, "notes": "300 MW kurulum, çoğu subcontractor."},
    {"firm_index": 2, "metric_key": "financial", "score": 60, "notes": "Orta ölçek, garantör gerekebilir."},
    {"firm_index": 2, "metric_key": "payment_terms", "score": 85, "notes": "Esnek, %15 peşinat + 60 gün vade."}
  ]
}
$$::jsonb where name = 'RES Kule & Foundation';

update templates set sample_data = $$
{
  "firms": [
    {"name": "Firma A", "contact_name": "Yetkili A", "contact_email": "info@firma-a.com", "contact_phone": "+90 555 111 11 11", "notes": "Elektrik altyapı yüklenicisi."},
    {"name": "Firma B", "contact_name": "Yetkili B", "contact_email": "info@firma-b.com", "contact_phone": "+90 555 222 22 22", "notes": "Türbin tedarikçisi entegre."},
    {"name": "Firma C", "contact_name": "Yetkili C", "contact_email": "info@firma-c.com", "contact_phone": "+90 555 333 33 33", "notes": "SCADA uzmanı."}
  ],
  "metric_weights": {"scope": 25, "deviation": 20, "lowest": 15, "technical": 20, "quality": 15, "delivery_time": 5},
  "items": [
    {"name": "Trafo bağlantı kablosu (MV)", "category": "Elektrik", "unit": "m", "default_qty": 3000, "sample_target": 350, "sample_prices": [340, 365, 345]},
    {"name": "Yer altı MV kablo", "category": "Elektrik", "unit": "m", "default_qty": 5000, "sample_target": 280, "sample_prices": [275, 295, 270]},
    {"name": "Pad-mount trafo", "category": "Elektrik", "unit": "adet", "default_qty": 6, "sample_target": 320000, "sample_prices": [310000, 340000, 315000]},
    {"name": "SCADA fiber omurga", "category": "Elektrik", "unit": "m", "default_qty": 4000, "sample_target": 85, "sample_prices": [82, 90, 80]},
    {"name": "Türbin bağlantı kabloları", "category": "Elektrik", "unit": "set", "default_qty": 8, "sample_target": 95000, "sample_prices": [92000, 100000, 90000]}
  ],
  "manual_scores": [
    {"firm_index": 0, "metric_key": "technical", "score": 80, "notes": "Elektrik altyapı uzmanı."},
    {"firm_index": 0, "metric_key": "quality", "score": 75, "notes": "ISO 9001."},
    {"firm_index": 0, "metric_key": "delivery_time", "score": 80, "notes": "90 gün."},
    {"firm_index": 1, "metric_key": "technical", "score": 95, "notes": "Türbin entegrasyonu fabrikadan tek noktadan."},
    {"firm_index": 1, "metric_key": "quality", "score": 90, "notes": "OEM destekli kalite."},
    {"firm_index": 1, "metric_key": "delivery_time", "score": 75, "notes": "100 gün."},
    {"firm_index": 2, "metric_key": "technical", "score": 85, "notes": "SCADA özelleşmiş ekip."},
    {"firm_index": 2, "metric_key": "quality", "score": 80, "notes": "IEC 61850 uyumlu."},
    {"firm_index": 2, "metric_key": "delivery_time", "score": 90, "notes": "75 gün; hızlı kurulum."}
  ]
}
$$::jsonb where name = 'RES Elektrik & SCADA';

update templates set sample_data = $$
{
  "firms": [
    {"name": "Firma A", "contact_name": "Yetkili A", "contact_email": "info@firma-a.com", "contact_phone": "+90 555 111 11 11", "notes": "Yerel tedarikçi."},
    {"name": "Firma B", "contact_name": "Yetkili B", "contact_email": "info@firma-b.com", "contact_phone": "+90 555 222 22 22", "notes": "İthalat şirketi."},
    {"name": "Firma C", "contact_name": "Yetkili C", "contact_email": "info@firma-c.com", "contact_phone": "+90 555 333 33 33", "notes": "Toptancı."}
  ],
  "metric_weights": {"scope": 30, "deviation": 25, "lowest": 25, "quality": 10, "delivery_time": 10},
  "items": [
    {"name": "Malzeme A", "category": "Malzeme", "unit": "adet", "default_qty": 100, "sample_target": 1500, "sample_prices": [1450, 1600, 1480]},
    {"name": "Malzeme B", "category": "Malzeme", "unit": "adet", "default_qty": 50, "sample_target": 3200, "sample_prices": [3100, 3400, 3050]},
    {"name": "Malzeme C", "category": "Malzeme", "unit": "m", "default_qty": 200, "sample_target": 85, "sample_prices": [82, 90, 80]}
  ],
  "manual_scores": [
    {"firm_index": 0, "metric_key": "quality", "score": 75, "notes": "Yerel üretim, kalite kontrol orta."},
    {"firm_index": 0, "metric_key": "delivery_time", "score": 90, "notes": "Stok bol, 2 hafta."},
    {"firm_index": 1, "metric_key": "quality", "score": 90, "notes": "İthal, AB sertifikalı."},
    {"firm_index": 1, "metric_key": "delivery_time", "score": 60, "notes": "İthalat 6 hafta."},
    {"firm_index": 2, "metric_key": "quality", "score": 70, "notes": "Çeşitli kaynaklardan; kalite değişken."},
    {"firm_index": 2, "metric_key": "delivery_time", "score": 85, "notes": "3 hafta."}
  ]
}
$$::jsonb where name = 'Genel Malzeme Karşılaştırma';
