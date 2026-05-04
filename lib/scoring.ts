import { SCORE_THRESHOLDS, SCORE_WEIGHTS } from "./constants";

export type FirmInput = {
  id: string;
  name: string;
};

export type ItemInput = {
  id: string;
  name: string;
  target: number | null;
  qty: number;
};

export type PriceMatrix = Record<string, Record<string, number | null>>;

export type FirmStats = {
  firmId: string;
  firmName: string;
  filledCount: number;
  totalItems: number;
  scope: number;
  weightedTotal: number;
  absDev: number | null;
  lowCount: number;
  score: number;
  recommendation: "good" | "warning" | "danger" | "incomplete";
};

export type ComparisonStats = {
  firms: FirmStats[];
  median: number | null;
  recommendedFirmId: string | null;
  lowestFirmId: string | null;
  itemCount: number;
  totalScope: number;
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function calcStats(
  firms: FirmInput[],
  items: ItemInput[],
  prices: PriceMatrix
): ComparisonStats {
  const N = items.length;

  const firmsWithBasic = firms.map((f) => {
    let weightedTotal = 0;
    let filledCount = 0;
    for (const it of items) {
      const p = prices[it.id]?.[f.id];
      if (p !== null && p !== undefined && Number.isFinite(p)) {
        weightedTotal += p * it.qty;
        filledCount += 1;
      }
    }
    return { firm: f, weightedTotal, filledCount };
  });

  const med = median(
    firmsWithBasic.filter((x) => x.filledCount > 0).map((x) => x.weightedTotal)
  );

  const firmStats: FirmStats[] = firmsWithBasic.map(({ firm, weightedTotal, filledCount }) => {
    const scope = N > 0 ? filledCount / N : 0;

    let absDev: number | null = null;
    if (filledCount > 0 && med !== null && med > 0) {
      absDev = Math.abs(weightedTotal - med) / med;
    }

    let lowCount = 0;
    for (const it of items) {
      const cellPrices = firms
        .map((ff) => prices[it.id]?.[ff.id])
        .filter((p): p is number => p !== null && p !== undefined && Number.isFinite(p));
      if (cellPrices.length === 0) continue;
      const minPrice = Math.min(...cellPrices);
      const myPrice = prices[it.id]?.[firm.id];
      if (myPrice !== null && myPrice !== undefined && myPrice === minPrice) {
        lowCount += 1;
      }
    }

    const sScope = scope * SCORE_WEIGHTS.scope;
    const sDev = absDev !== null ? Math.max(0, SCORE_WEIGHTS.targetDeviation * (1 - absDev)) : 0;
    const sLow = N > 0 ? (lowCount / N) * SCORE_WEIGHTS.lowestBid : 0;
    const score = Math.round((sScope + sDev + sLow) * 10) / 10;

    let recommendation: FirmStats["recommendation"];
    if (filledCount === 0) recommendation = "incomplete";
    else if (score >= SCORE_THRESHOLDS.good) recommendation = "good";
    else if (score >= SCORE_THRESHOLDS.warning) recommendation = "warning";
    else recommendation = "danger";

    return {
      firmId: firm.id,
      firmName: firm.name,
      filledCount,
      totalItems: N,
      scope,
      weightedTotal,
      absDev,
      lowCount,
      score,
      recommendation,
    };
  });

  firmStats.sort((a, b) => b.score - a.score);

  const recommended = firmStats.find((f) => f.recommendation === "good") ?? firmStats[0] ?? null;
  const lowest = [...firmStats]
    .filter((f) => f.filledCount > 0)
    .sort((a, b) => a.weightedTotal - b.weightedTotal)[0] ?? null;

  return {
    firms: firmStats,
    median: med,
    recommendedFirmId: recommended?.firmId ?? null,
    lowestFirmId: lowest?.firmId ?? null,
    itemCount: N,
    totalScope: firmStats.length > 0 ? firmStats[0].scope : 0,
  };
}

export function scoreColor(score: number): "good" | "warning" | "danger" {
  if (score >= SCORE_THRESHOLDS.good) return "good";
  if (score >= SCORE_THRESHOLDS.warning) return "warning";
  return "danger";
}
