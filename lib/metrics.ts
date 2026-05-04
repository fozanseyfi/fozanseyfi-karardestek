import type { ComparisonType } from "./constants";

export type MetricKey =
  | "scope"
  | "deviation"
  | "lowest"
  | "technical"
  | "references"
  | "payment_terms"
  | "financial"
  | "delivery_time"
  | "quality"
  | "experience";

export type MetricKind = "auto" | "manual";

export type MetricDef = {
  key: MetricKey;
  label: string;
  description: string;
  kind: MetricKind;
};

export const METRICS: Record<MetricKey, MetricDef> = {
  scope: {
    key: "scope",
    label: "Kapsam",
    description: "Firmanın kaç kaleme teklif verdiği oranı.",
    kind: "auto",
  },
  deviation: {
    key: "deviation",
    label: "Hedef Sapma",
    description: "Firmanın toplam teklifinin medyandan sapma oranı (düşük sapma daha iyi).",
    kind: "auto",
  },
  lowest: {
    key: "lowest",
    label: "En Düşük Teklif",
    description: "Kalem bazında en düşük teklifi verme oranı.",
    kind: "auto",
  },
  technical: {
    key: "technical",
    label: "Teknik Yeterlilik",
    description: "Teknik kapasite, mühendislik kalitesi, ekipman donanımı.",
    kind: "manual",
  },
  references: {
    key: "references",
    label: "Referanslar",
    description: "Geçmişte tamamladığı benzer projeler ve müşteri memnuniyeti.",
    kind: "manual",
  },
  payment_terms: {
    key: "payment_terms",
    label: "Ödeme Şartları",
    description: "Vade, peşinat oranı, ödeme planı esnekliği.",
    kind: "manual",
  },
  financial: {
    key: "financial",
    label: "Finansal Güç",
    description: "Mali güç, kredi notu, banka teminatı kapasitesi.",
    kind: "manual",
  },
  delivery_time: {
    key: "delivery_time",
    label: "Teslimat Süresi",
    description: "Söz verdiği teslim süresinin uygunluğu ve güvenilirliği.",
    kind: "manual",
  },
  quality: {
    key: "quality",
    label: "Kalite & Sertifika",
    description: "ISO, sertifikalar, kalite kontrol süreçleri.",
    kind: "manual",
  },
  experience: {
    key: "experience",
    label: "Deneyim",
    description: "Sektör deneyimi, tamamlanan iş hacmi.",
    kind: "manual",
  },
};

export const ALL_METRICS: MetricDef[] = Object.values(METRICS);

export type MetricPreset = Partial<Record<MetricKey, number>>;

/** Karşılaştırma türüne göre önerilen metrikler ve ağırlıklar (toplam = 100) */
export const PRESETS: Record<ComparisonType, MetricPreset> = {
  Malzeme: {
    scope: 30,
    deviation: 25,
    lowest: 20,
    payment_terms: 10,
    delivery_time: 10,
    quality: 5,
  },
  Taşeron: {
    scope: 25,
    deviation: 20,
    technical: 20,
    references: 15,
    financial: 10,
    payment_terms: 10,
  },
  Hizmet: {
    scope: 20,
    deviation: 20,
    technical: 25,
    references: 20,
    payment_terms: 15,
  },
  İşçilik: {
    scope: 25,
    deviation: 30,
    technical: 20,
    references: 15,
    payment_terms: 10,
  },
  Ekipman: {
    scope: 25,
    deviation: 25,
    technical: 20,
    quality: 15,
    payment_terms: 15,
  },
  Diğer: {
    scope: 30,
    deviation: 25,
    lowest: 20,
    technical: 15,
    payment_terms: 10,
  },
};

/** 1-10 puanı nitel etikete dönüştür */
export function scoreLabel(value: number): string {
  if (value >= 9) return "Mükemmel";
  if (value >= 7) return "Çok İyi";
  if (value >= 5) return "İyi";
  if (value >= 3) return "Orta";
  if (value >= 1) return "Zayıf";
  return "—";
}

/** 1-10 → 0-100 dönüşümü */
export function tenToHundred(value: number): number {
  return Math.round(value * 10);
}

/** 0-100 → 1-10 dönüşümü */
export function hundredToTen(value: number): number {
  return Math.round(value / 10);
}
