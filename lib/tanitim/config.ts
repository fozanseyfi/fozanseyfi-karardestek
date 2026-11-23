/**
 * Tanıtım sayfasının platforma özgü ayarları. Tanıtım bileşenleri (components/tanitim/tour-view.tsx,
 * components/auth/tour-promo.tsx) bütün platformlarda birebir aynıdır; yalnız bu dosya ve
 * manifest/görüntüler platforma göre değişir.
 */
export const TOUR = {
  /** Platformun ana rengi (vurgu, numaralar, kaydırma çubuğu) */
  accent: "#ca8a04",
  /** Gece modunda vurgu rengi */
  accentDark: "#facc15",
  /** Tarayıcı çerçevesindeki adres */
  domain: "karardestek.fozanseyfi.com",
  /** Giriş sayfasındaki tanıtım şeridinin açıklaması */
  promoText:
    "Projeden karşılaştırmaya, firma tekliflerinden 10 metrikli skora, revize turlarından PDF/Excel çıktısına kadar bütün adımlar gerçek ekranlar üzerinden anlatılıyor: hangi değer nereye yazılır, sonuç nerede okunur.",
  /** Giriş sayfasında gösterilen örnek ekranlar (bölüm id + adım sırası, 0'dan) */
  previews: [
    { id: "karsilastirma", step: 0, label: "Sıralama" },
    { id: "karsilastirma", step: 1, label: "Skor detayı" },
    { id: "revize", step: 0, label: "Revize turları" },
  ],
};
