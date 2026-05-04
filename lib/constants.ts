export const COMPARISON_TYPES = [
  "Taşeron",
  "Malzeme",
  "Hizmet",
  "İşçilik",
  "Ekipman",
  "Diğer",
] as const;
export type ComparisonType = (typeof COMPARISON_TYPES)[number];

export const ITEM_CATEGORIES = [
  "Mekanik",
  "Elektrik",
  "İnşaat",
  "İş Makinaları",
  "Malzeme",
  "Hizmet",
  "Harita",
  "Diğer",
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const CURRENCIES = ["TRY", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export const USER_ROLES = ["admin", "user", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const COMPARISON_STATUSES = [
  "draft",
  "in_review",
  "decided",
  "archived",
] as const;
export type ComparisonStatus = (typeof COMPARISON_STATUSES)[number];

export const SCORE_WEIGHTS = {
  scope: 40,
  targetDeviation: 35,
  lowestBid: 25,
} as const;

export const SCORE_THRESHOLDS = {
  good: 70,
  warning: 50,
} as const;
