"use client";

import { Target, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompactCurrency, formatPercent } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/constants";
import type { ComparisonStats } from "@/lib/scoring";

export function TotalKpiCard({ stats, currency }: { stats: ComparisonStats; currency: Currency }) {
  const { totalTarget, firms } = stats;
  const ranked = firms.filter((f) => f.filledCount > 0);

  const offerCount = ranked.length;
  const offerAvg =
    offerCount > 0 ? ranked.reduce((s, f) => s + f.weightedTotal, 0) / offerCount : null;
  const avgDev =
    offerAvg !== null && totalTarget > 0 ? (offerAvg - totalTarget) / totalTarget : null;
  const avgTone =
    avgDev === null ? "neutral" : avgDev <= -0.05 ? "good" : avgDev >= 0.1 ? "bad" : "neutral";
  const AvgIcon =
    avgDev === null ? Minus : avgDev > 0 ? ArrowUp : avgDev < 0 ? ArrowDown : Minus;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Target className="text-primary size-4" />
          <span className="text-xs font-semibold tracking-wide uppercase">Toplam Bedel Karşılaştırması</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 border-b pb-3">
            <div>
              <div className="text-muted-foreground text-xs">Hedef Toplam (sizin bütçe)</div>
              <div className="text-2xl font-bold">{formatCompactCurrency(totalTarget, currency)}</div>
            </div>
            <div className="text-muted-foreground text-xs">{stats.itemCount} kalem</div>
          </div>

          {offerAvg !== null && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-muted-foreground text-[11px]">
                  Gelen Tekliflerin Ortalaması ({offerCount} teklif)
                </div>
                <div className="text-base font-semibold tabular-nums">
                  {formatCompactCurrency(offerAvg, currency)}
                </div>
              </div>
              {avgDev !== null && (
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-0.5 rounded px-2 py-1 text-xs font-medium",
                    avgTone === "good" && "bg-emerald-100 text-emerald-700",
                    avgTone === "bad" && "bg-rose-100 text-rose-700",
                    avgTone === "neutral" && "bg-white text-slate-600 ring-1 ring-slate-200"
                  )}
                  title={`Hedeften ${avgDev >= 0 ? "yüksek" : "düşük"}`}
                >
                  <AvgIcon className="size-3" />
                  {avgDev >= 0 ? "+" : "−"}
                  {formatPercent(Math.abs(avgDev), 1)}
                  <span className="text-muted-foreground/80 ml-1 text-[10px] font-normal">
                    {avgDev >= 0 ? "hedeften yüksek" : "hedeften düşük"}
                  </span>
                </span>
              )}
            </div>
          )}

          {ranked.length === 0 ? (
            <p className="text-muted-foreground text-sm">Henüz teklif girilmedi.</p>
          ) : (
            <ul className="space-y-2">
              {ranked.map((f) => {
                const dev = totalTarget > 0 ? (f.weightedTotal - totalTarget) / totalTarget : null;
                const tone =
                  dev === null
                    ? "neutral"
                    : dev <= -0.05
                      ? "good" // hedeften düşük
                      : dev >= 0.1
                        ? "bad" // hedeften %10+ yüksek
                        : "neutral";
                const Icon = dev === null ? Minus : dev > 0 ? ArrowUp : dev < 0 ? ArrowDown : Minus;
                return (
                  <li key={f.firmId} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate font-medium">{f.firmName}</span>
                      {f.isOutlier && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">
                          ANOMALİ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className="font-medium">{formatCompactCurrency(f.weightedTotal, currency)}</span>
                      {dev !== null && (
                        <span
                          className={cn(
                            "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs",
                            tone === "good" && "bg-emerald-100 text-emerald-700",
                            tone === "bad" && "bg-rose-100 text-rose-700",
                            tone === "neutral" && "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="size-3" />
                          {formatPercent(Math.abs(dev), 1)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
