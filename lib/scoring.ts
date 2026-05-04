import { type MetricKey, METRICS } from "./metrics";

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

/** firm_id -> metric_key -> 0-100 score */
export type ManualScores = Record<string, Partial<Record<MetricKey, number>>>;

/** metric_key -> weight (0-100) */
export type MetricWeights = Partial<Record<MetricKey, number>>;

export type FirmStats = {
  firmId: string;
  firmName: string;
  filledCount: number;
  totalItems: number;
  scope: number; // 0-1
  weightedTotal: number;
  absDev: number | null; // 0-1
  lowCount: number;
  metricScores: Record<MetricKey, number>; // 0-100 each (auto + manual)
  metricContributions: Record<MetricKey, number>; // contribution to total score
  totalScore: number; // 0-100
  recommendation: "good" | "warning" | "danger" | "incomplete";
  isOutlier: boolean;
};

export type ComparisonStats = {
  firms: FirmStats[];
  median: number | null;
  totalTarget: number;
  recommendedFirmId: string | null;
  lowestFirmId: string | null;
  itemCount: number;
  appliedWeights: MetricWeights;
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Q1, Q3 quartiles for IQR outlier detection */
function quartiles(values: number[]): { q1: number; q3: number } | null {
  if (values.length < 4) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  return { q1, q3 };
}

export function calcStats(
  firms: FirmInput[],
  items: ItemInput[],
  prices: PriceMatrix,
  manualScores: ManualScores,
  weights: MetricWeights
): ComparisonStats {
  const N = items.length;
  const totalTarget = items.reduce((sum, it) => sum + (it.target ?? 0) * it.qty, 0);

  // Auto metric raw values (0-100 scale)
  const firmsBasic = firms.map((f) => {
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

  const med = median(firmsBasic.filter((x) => x.filledCount > 0).map((x) => x.weightedTotal));

  // Outlier detection on weighted totals (IQR method)
  const totalsForOutlier = firmsBasic.filter((x) => x.filledCount > 0).map((x) => x.weightedTotal);
  const q = quartiles(totalsForOutlier);
  const outlierBounds = q
    ? { lo: q.q1 - 1.5 * (q.q3 - q.q1), hi: q.q3 + 1.5 * (q.q3 - q.q1) }
    : null;

  const firmStats: FirmStats[] = firmsBasic.map(({ firm, weightedTotal, filledCount }) => {
    const scope = N > 0 ? filledCount / N : 0;

    // Sapma: kullanıcının HEDEF FİYATInDAN sapma. Hedef yoksa medyandan fallback.
    let absDev: number | null = null;
    if (filledCount > 0) {
      if (totalTarget > 0) {
        absDev = Math.abs(weightedTotal - totalTarget) / totalTarget;
      } else if (med !== null && med > 0) {
        absDev = Math.abs(weightedTotal - med) / med;
      }
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

    // Auto metrics → 0-100
    const autoScores = {
      scope: scope * 100,
      deviation: absDev !== null ? Math.max(0, (1 - absDev) * 100) : 0,
      lowest: N > 0 ? (lowCount / N) * 100 : 0,
    };

    // Manual metrics → 0-100 (already 0-100 from DB, but we may store as 1-10 input → tenToHundred)
    const manuals = manualScores[firm.id] ?? {};
    const manualEntries: Record<string, number> = {
      technical: manuals.technical ?? 0,
      references: manuals.references ?? 0,
      payment_terms: manuals.payment_terms ?? 0,
      financial: manuals.financial ?? 0,
      delivery_time: manuals.delivery_time ?? 0,
      quality: manuals.quality ?? 0,
      experience: manuals.experience ?? 0,
    };

    const allScores: Record<MetricKey, number> = {
      scope: autoScores.scope,
      deviation: autoScores.deviation,
      lowest: autoScores.lowest,
      technical: manualEntries.technical,
      references: manualEntries.references,
      payment_terms: manualEntries.payment_terms,
      financial: manualEntries.financial,
      delivery_time: manualEntries.delivery_time,
      quality: manualEntries.quality,
      experience: manualEntries.experience,
    };

    // Weighted contribution: each metric contributes (score/100) * weight to total
    const contribs: Record<MetricKey, number> = {
      scope: 0, deviation: 0, lowest: 0,
      technical: 0, references: 0, payment_terms: 0,
      financial: 0, delivery_time: 0, quality: 0, experience: 0,
    };
    let total = 0;
    let totalWeight = 0;
    for (const key of Object.keys(METRICS) as MetricKey[]) {
      const w = weights[key] ?? 0;
      if (w <= 0) continue;
      totalWeight += w;
      const contrib = (allScores[key] / 100) * w;
      contribs[key] = contrib;
      total += contrib;
    }
    // Normalize if weights don't sum to 100 (shouldn't happen but safe)
    const normalized = totalWeight > 0 ? (total / totalWeight) * 100 : 0;
    const totalScore = Math.round(normalized * 10) / 10;

    let recommendation: FirmStats["recommendation"];
    if (filledCount === 0) recommendation = "incomplete";
    else if (totalScore >= 70) recommendation = "good";
    else if (totalScore >= 50) recommendation = "warning";
    else recommendation = "danger";

    const isOutlier =
      outlierBounds !== null &&
      filledCount > 0 &&
      (weightedTotal < outlierBounds.lo || weightedTotal > outlierBounds.hi);

    return {
      firmId: firm.id,
      firmName: firm.name,
      filledCount,
      totalItems: N,
      scope,
      weightedTotal,
      absDev,
      lowCount,
      metricScores: allScores,
      metricContributions: contribs,
      totalScore,
      recommendation,
      isOutlier,
    };
  });

  firmStats.sort((a, b) => b.totalScore - a.totalScore);

  const recommended = firmStats.find((f) => f.recommendation === "good") ?? firmStats[0] ?? null;
  const lowest =
    [...firmStats]
      .filter((f) => f.filledCount > 0)
      .sort((a, b) => a.weightedTotal - b.weightedTotal)[0] ?? null;

  return {
    firms: firmStats,
    median: med,
    totalTarget,
    recommendedFirmId: recommended?.firmId ?? null,
    lowestFirmId: lowest?.firmId ?? null,
    itemCount: N,
    appliedWeights: weights,
  };
}

export function scoreColor(score: number): "good" | "warning" | "danger" {
  if (score >= 70) return "good";
  if (score >= 50) return "warning";
  return "danger";
}
