"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCompactCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/constants";

type Item = { id: string; name: string; category?: string; unit?: string | null; qty: number };
type Firm = { id: string; name: string };
type BidRow = { item_id: string; firm_id: string; price: number | null; revision: number };

/**
 * Tüm revizyonların yan yana karşılaştırılması:
 * Her firma için sütunlar: Rev1, Rev2, Δ, ...
 */
export function RevisionCompare({
  items,
  firms,
  bids,
  currency,
}: {
  items: Item[];
  firms: Firm[];
  bids: BidRow[];
  currency: Currency;
}) {
  const revisions = Array.from(new Set(bids.map((b) => b.revision))).sort((a, b) => a - b);

  if (revisions.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revize Karşılaştırması</CardTitle>
          <CardDescription>
            Bu karşılaştırmada henüz tek bir tur var. &quot;Revize Kaydet&quot; ile firmaların güncel fiyatlarını alıp 2.
            tur kaydet, sonra burada turlar yan yana ve % indirim/zam ile gösterilir.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // bids[item_id][firm_id][revision] = price
  const matrix: Record<string, Record<string, Record<number, number | null>>> = {};
  for (const b of bids) {
    if (!matrix[b.item_id]) matrix[b.item_id] = {};
    if (!matrix[b.item_id][b.firm_id]) matrix[b.item_id][b.firm_id] = {};
    matrix[b.item_id][b.firm_id][b.revision] = b.price;
  }

  // Her firma için her revizede toplam (ağırlıklı)
  const firmTotals: Record<string, Record<number, number>> = {};
  for (const f of firms) {
    firmTotals[f.id] = {};
    for (const r of revisions) {
      let sum = 0;
      for (const it of items) {
        const p = matrix[it.id]?.[f.id]?.[r];
        if (p !== null && p !== undefined) sum += p * it.qty;
      }
      firmTotals[f.id][r] = sum;
    }
  }

  return (
    <div className="space-y-4">
      {/* Firma toplamı revize değişim özeti */}
      <Card>
        <CardHeader>
          <CardTitle>Toplam Bedel — Revize Karşılaştırması</CardTitle>
          <CardDescription>Her firmanın toplam ağırlıklı teklifinin revizyonlar arası değişimi</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium">Firma</th>
                {revisions.map((r) => (
                  <th key={r} className="p-2 text-right font-medium">
                    Rev {r}
                  </th>
                ))}
                <th className="p-2 text-right font-medium">İlk → Son Δ</th>
              </tr>
            </thead>
            <tbody>
              {firms.map((f) => {
                const first = firmTotals[f.id][revisions[0]];
                const last = firmTotals[f.id][revisions[revisions.length - 1]];
                const overallDelta = first > 0 ? (last - first) / first : null;
                return (
                  <tr key={f.id} className="border-b">
                    <td className="p-2 font-medium">{f.name}</td>
                    {revisions.map((r) => (
                      <td key={r} className="p-2 text-right tabular-nums">
                        {formatCompactCurrency(firmTotals[f.id][r], currency)}
                      </td>
                    ))}
                    <td className="p-2 text-right">
                      <DeltaCell delta={overallDelta} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Kalem × revize × firma detayı */}
      {firms.map((f) => (
        <Card key={f.id}>
          <CardHeader>
            <CardTitle className="text-base">{f.name} — Kalem Bazında Revize</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-medium">Kalem</th>
                  {revisions.map((r) => (
                    <th key={r} className="p-2 text-right font-medium">
                      Rev {r}
                    </th>
                  ))}
                  <th className="p-2 text-right font-medium">Son Δ%</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const first = matrix[it.id]?.[f.id]?.[revisions[0]];
                  const last = matrix[it.id]?.[f.id]?.[revisions[revisions.length - 1]];
                  const delta =
                    first !== null && first !== undefined && first > 0 && last !== null && last !== undefined
                      ? (last - first) / first
                      : null;
                  return (
                    <tr key={it.id} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{it.name}</div>
                        {(it.category || it.unit) && (
                          <div className="text-muted-foreground text-xs">
                            {it.category}
                            {it.unit && ` · ${it.qty} ${it.unit}`}
                          </div>
                        )}
                      </td>
                      {revisions.map((r) => {
                        const p = matrix[it.id]?.[f.id]?.[r];
                        const prevR = revisions[revisions.indexOf(r) - 1];
                        const prevP = prevR !== undefined ? matrix[it.id]?.[f.id]?.[prevR] : undefined;
                        const cellDelta =
                          prevR !== undefined &&
                          prevP !== null &&
                          prevP !== undefined &&
                          prevP > 0 &&
                          p !== null &&
                          p !== undefined
                            ? (p - prevP) / prevP
                            : null;
                        return (
                          <td key={r} className="p-2 text-right tabular-nums">
                            <div>{p !== null && p !== undefined ? formatCompactCurrency(p, currency) : "—"}</div>
                            {cellDelta !== null && Math.abs(cellDelta) > 0.001 && (
                              <div className="mt-0.5">
                                <DeltaBadge delta={cellDelta} />
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 text-right">
                        <DeltaCell delta={delta} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground">—</span>;
  if (Math.abs(delta) < 0.001) {
    return (
      <Badge variant="outline" className="gap-1">
        <Minus className="size-3" /> 0%
      </Badge>
    );
  }
  return <DeltaBadge delta={delta} />;
}

function DeltaBadge({ delta }: { delta: number }) {
  const sign = delta < 0 ? "-" : "+";
  const pct = (Math.abs(delta) * 100).toFixed(1);
  const Icon = delta < 0 ? ArrowDown : ArrowUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
        delta < 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      )}
    >
      <Icon className="size-3" />
      {sign}
      {pct}%
    </span>
  );
}
