/*
 * Giriş sayfasının BU PLATFORMA ÖZGÜ kısmı. Sayfanın geri kalanı
 * components/auth/login-kit.tsx'te — o dosya bütün platformlarda birebir aynıdır.
 */
import type { LoginPlatform } from "@/components/auth/login-kit";
import { PlatformLogo } from "@/components/common/platform-logos";
import manifest from "@/lib/tanitim/manifest.json";
import { TOUR } from "@/lib/tanitim/config";

interface TourModule {
  id: string;
  title: string;
  steps: { img: string; title: string }[];
}
const MODULES = (manifest.modules as TourModule[]).filter(
  (m) => m.steps.length > 0,
);

function shot(moduleId: string, step: number) {
  const m = MODULES.find((x) => x.id === moduleId) ?? MODULES[0];
  const s = m?.steps[Math.min(step, (m?.steps.length ?? 1) - 1)];
  return { id: m?.id ?? moduleId, img: s?.img ?? "", title: s?.title ?? "" };
}

// Tanıtım ekranları henüz çekilmedi; manifest dolunca görsel ve şerit kendiliğinden görünür.
const hero = MODULES.length > 0 ? shot("karsilastirma", 0) : null;

export const LOGIN_PLATFORM: LoginPlatform = {
  id: "karar",
  name: "KararDestek",
  fullName: "Satınalma Karar Destek Platformu",
  mark: <PlatformLogo id="karardestek" size={32} />,
  // Tanıtım sarısının koyu tonu — beyaz yazı okunaklı kalsın
  accent: "#a16207",
  accentDark: "#ca8a04",
  intro: {
    eyebrow: "Platform hakkında",
    title:
      "KararDestek, tedarikçi tekliflerini karşılaştırmak için bir satınalma karar destek platformudur.",
    text: "Firma teklifleri aynı tabloya girilir; fiyatın yanında teslimat süresi, vade, teknik yeterlilik ve referanslar gibi ölçütler ağırlıklarıyla puanlanır, revize turları izlenir ve karar gerekçesi raporlanır. Ücretsizdir; bireysel olarak geliştirilmiş ve sektörle paylaşılmıştır.",
    points: [
      {
        title: "Karşılaştırma",
        text: "Firma teklifleri tek tabloda, para birimi farkı dahil",
      },
      { title: "Ağırlıklı skor", text: "10 metrik, ağırlıklar ve skor detayı" },
      {
        title: "Revize turları",
        text: "Pazarlık turlarında fiyat ve sıralama değişimi",
      },
      { title: "Rapor", text: "Karar gerekçesiyle PDF ve Excel çıktısı" },
    ],
  },
  ...(hero
    ? {
        hero: {
          img: hero.img,
          caption: `Gerçek ekran: ${hero.title}`,
          href: `/tanitim#${hero.id}`,
        },
      }
    : {}),
  privacy: [
    "Her hesap yalnız kendi kayıtlarını görür",
    "Veritabanında satır seviyesinde erişim kuralı",
    "Üçüncü taraf izleme ya da reklam yok",
    "Erişimi yalnız sizin davet ettikleriniz alır",
  ],
  tour: {
    text: TOUR.promoText,
    modules: MODULES.map((m) => ({ id: m.id, title: m.title })),
    total: MODULES.reduce((n, m) => n + m.steps.length, 0),
    previews:
      MODULES.length > 0
        ? TOUR.previews.map((p) => ({ ...shot(p.id, p.step), label: p.label }))
        : [],
  },
  links: { register: "/signup" },
};
