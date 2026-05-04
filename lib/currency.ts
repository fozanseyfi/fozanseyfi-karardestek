import { CURRENCY_SYMBOLS, type Currency } from "./constants";

export function formatCurrency(value: number | null | undefined, currency: Currency = "TRY"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + " " + CURRENCY_SYMBOLS[currency];
}

export function formatCompactCurrency(value: number | null | undefined, currency: Currency = "TRY"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const abs = Math.abs(value);
  let formatted: string;
  if (abs >= 1_000_000) formatted = (value / 1_000_000).toFixed(2) + " M";
  else if (abs >= 1_000) formatted = (value / 1_000).toFixed(1) + " K";
  else formatted = value.toFixed(0);
  return formatted + " " + CURRENCY_SYMBOLS[currency];
}

export function formatPercent(value: number | null | undefined, fractionDigits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
