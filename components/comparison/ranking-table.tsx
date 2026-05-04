"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCompactCurrency, formatPercent } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/constants";
import type { FirmStats } from "@/lib/scoring";

export function RankingTable({
  firms,
  currency,
  recommendedFirmId,
}: {
  firms: FirmStats[];
  currency: Currency;
  recommendedFirmId: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead className="text-right">Kapsam</TableHead>
            <TableHead className="text-right">Sapma</TableHead>
            <TableHead className="text-right">Toplam</TableHead>
            <TableHead className="text-right">Skor</TableHead>
            <TableHead>Durum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firms.map((f, idx) => (
            <TableRow key={f.firmId} className={cn(f.firmId === recommendedFirmId && "bg-emerald-50")}>
              <TableCell className="font-medium">{idx + 1}</TableCell>
              <TableCell>
                <div className="font-medium">{f.firmName}</div>
                <div className="text-muted-foreground text-xs">
                  {f.filledCount} / {f.totalItems} kalem
                </div>
              </TableCell>
              <TableCell className="text-right">{formatPercent(f.scope, 0)}</TableCell>
              <TableCell className="text-right">
                {f.absDev !== null ? formatPercent(f.absDev, 1) : "—"}
              </TableCell>
              <TableCell className="text-right">{formatCompactCurrency(f.weightedTotal, currency)}</TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-sm font-semibold",
                    f.recommendation === "good" && "bg-emerald-100 text-emerald-800",
                    f.recommendation === "warning" && "bg-amber-100 text-amber-800",
                    f.recommendation === "danger" && "bg-rose-100 text-rose-800",
                    f.recommendation === "incomplete" && "bg-muted text-muted-foreground"
                  )}
                >
                  {f.score.toFixed(1)}
                </span>
              </TableCell>
              <TableCell>
                <RecommendationBadge value={f.recommendation} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RecommendationBadge({ value }: { value: FirmStats["recommendation"] }) {
  if (value === "good") return <Badge className="bg-emerald-600">Güçlü Aday</Badge>;
  if (value === "warning") return <Badge className="bg-amber-600">Orta</Badge>;
  if (value === "danger") return <Badge variant="destructive">Riskli</Badge>;
  return <Badge variant="outline">Eksik</Badge>;
}
