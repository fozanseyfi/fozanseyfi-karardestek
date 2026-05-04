"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { METRICS, type MetricKey } from "@/lib/metrics";
import type { ComparisonStats } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type SortDir = "desc" | "asc";

export function ScoreBreakdown({
  stats,
  onFirmClick,
}: {
  stats: ComparisonStats;
  onFirmClick?: (firmId: string) => void;
}) {
  const activeMetrics = (Object.keys(stats.appliedWeights) as MetricKey[]).filter(
    (k) => (stats.appliedWeights[k] ?? 0) > 0
  );
  const [sortKey, setSortKey] = useState<MetricKey | "total">("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const arr = [...stats.firms];
    arr.sort((a, b) => {
      const av = sortKey === "total" ? a.totalScore : (a.metricScores[sortKey] ?? 0);
      const bv = sortKey === "total" ? b.totalScore : (b.metricScores[sortKey] ?? 0);
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return arr;
  }, [stats.firms, sortKey, sortDir]);

  function toggle(key: MetricKey | "total") {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skor Dökümü</CardTitle>
        <CardDescription>
          Her metriğin toplam skora katkısı. Sıralamak için sütun başlığına tıkla. Firma adına tıklayınca manuel skor
          notları popup&apos;ında görünür.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-background sticky left-0">Firma</TableHead>
              {activeMetrics.map((k) => (
                <TableHead key={k} className="text-right">
                  <SortHeader
                    label={METRICS[k].label}
                    sub={`%${stats.appliedWeights[k]}`}
                    active={sortKey === k}
                    dir={sortDir}
                    onClick={() => toggle(k)}
                  />
                </TableHead>
              ))}
              <TableHead className="text-right">
                <SortHeader
                  label="Toplam"
                  active={sortKey === "total"}
                  dir={sortDir}
                  onClick={() => toggle("total")}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((f) => (
              <TableRow key={f.firmId}>
                <TableCell className="bg-background sticky left-0 font-medium">
                  {onFirmClick ? (
                    <button
                      onClick={() => onFirmClick(f.firmId)}
                      className="hover:text-primary text-left underline-offset-4 hover:underline"
                    >
                      {f.firmName}
                    </button>
                  ) : (
                    f.firmName
                  )}
                </TableCell>
                {activeMetrics.map((k) => {
                  const raw = f.metricScores[k] ?? 0;
                  const ratio = raw / 100;
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
                      <span className="font-medium">{raw.toFixed(1)}</span>
                      <span className="text-xs opacity-70"> / 100</span>
                    </TableCell>
                  );
                })}
                <TableCell className="text-right tabular-nums">
                  <span className="text-2xl font-bold">{f.totalScore.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm"> / 100</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SortHeader({
  label,
  sub,
  active,
  dir,
  onClick,
}: {
  label: string;
  sub?: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="h-auto px-1 py-1 font-medium">
      <div className="flex items-center gap-1">
        <div className="flex flex-col items-end">
          <span>{label}</span>
          {sub && <span className="text-muted-foreground text-xs font-normal">{sub}</span>}
        </div>
        {active ? (
          dir === "desc" ? (
            <ArrowDown className="size-3" />
          ) : (
            <ArrowUp className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 opacity-30" />
        )}
      </div>
    </Button>
  );
}
