"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { METRICS, type MetricKey } from "@/lib/metrics";
import type { ComparisonStats } from "@/lib/scoring";
import { cn } from "@/lib/utils";

/**
 * Her firmanın her metrikten aldığı katkı puanını gösteren tablo.
 * Sütunlar = aktif metrikler. Satırlar = firmalar (skoruna göre sıralı).
 */
export function ScoreBreakdown({ stats }: { stats: ComparisonStats }) {
  const activeMetrics = (Object.keys(stats.appliedWeights) as MetricKey[]).filter(
    (k) => (stats.appliedWeights[k] ?? 0) > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skor Dökümü</CardTitle>
        <CardDescription>
          Her metriğin toplam skora katkısı. Renk: katkı/maks katkı oranı.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background">Firma</TableHead>
              {activeMetrics.map((k) => (
                <TableHead key={k} className="text-right">
                  <div>{METRICS[k].label}</div>
                  <div className="text-muted-foreground text-xs font-normal">
                    %{stats.appliedWeights[k]}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">Toplam</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.firms.map((f) => (
              <TableRow key={f.firmId}>
                <TableCell className="sticky left-0 bg-background font-medium">{f.firmName}</TableCell>
                {activeMetrics.map((k) => {
                  const contrib = f.metricContributions[k] ?? 0;
                  const max = stats.appliedWeights[k] ?? 0;
                  const ratio = max > 0 ? contrib / max : 0;
                  const tone =
                    ratio >= 0.7
                      ? "bg-emerald-50 text-emerald-700"
                      : ratio >= 0.4
                        ? "bg-amber-50 text-amber-700"
                        : ratio > 0
                          ? "bg-rose-50 text-rose-700"
                          : "text-muted-foreground";
                  return (
                    <TableCell key={k} className={cn("text-right tabular-nums", tone)}>
                      <div className="font-medium">{contrib.toFixed(1)}</div>
                      <div className="text-[10px] opacity-70">/{max}</div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-right tabular-nums">
                  <span className="font-semibold">{f.totalScore.toFixed(1)}</span>
                  <span className="text-muted-foreground">/100</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
