"use client";

import { useState } from "react";
import { Calculator, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCompactCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/constants";

type Item = {
  id: string;
  name: string;
  category: string;
  unit: string | null;
  qty: number;
  target_price: number | null;
};

type Firm = { id: string; name: string };

export function ItemsTable({
  items,
  firms,
  prices,
  currency,
  activeRevision,
}: {
  items: Item[];
  firms: Firm[];
  prices: Record<string, Record<string, number | null>>;
  currency: Currency;
  activeRevision: number;
}) {
  const [mode, setMode] = useState<"unit" | "total">("unit");

  // Hesaplamalar
  const itemTotals: Record<string, Record<string, number>> = {};
  for (const it of items) {
    itemTotals[it.id] = {};
    for (const f of firms) {
      const p = prices[it.id]?.[f.id];
      itemTotals[it.id][f.id] = p !== null && p !== undefined ? p * it.qty : 0;
    }
  }

  const firmGrandTotals: Record<string, number> = {};
  for (const f of firms) {
    firmGrandTotals[f.id] = items.reduce((s, it) => s + (itemTotals[it.id][f.id] ?? 0), 0);
  }
  const targetGrandTotal = items.reduce((s, it) => s + (it.target_price ?? 0) * it.qty, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Kalemler ve Fiyatlar (Revize {activeRevision})</CardTitle>
          <CardDescription>
            {mode === "unit" ? "Birim fiyatlar gösteriliyor" : "Kalem toplamları gösteriliyor (birim × miktar)"} ·
            Yeşil hücre kalem bazında en düşük teklif
          </CardDescription>
        </div>
        <div className="flex shrink-0 rounded-md border">
          <Button
            variant={mode === "unit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("unit")}
            className="rounded-r-none"
          >
            <DollarSign className="mr-1 size-4" /> Birim
          </Button>
          <Button
            variant={mode === "total" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("total")}
            className="rounded-l-none"
          >
            <Calculator className="mr-1 size-4" /> Toplam
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left font-medium">Kalem</th>
              <th className="p-2 text-right font-medium">Hedef</th>
              {firms.map((f) => (
                <th key={f.id} className="p-2 text-right font-medium">
                  {f.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const cellPrices = firms.map((f) => prices[it.id]?.[f.id]).filter((p): p is number => p !== null && p !== undefined);
              const minUnit = cellPrices.length > 0 ? Math.min(...cellPrices) : null;
              return (
                <tr key={it.id} className="border-b">
                  <td className="p-2">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-muted-foreground text-xs">
                      <Badge variant="outline" className="mr-1 text-[10px]">{it.category}</Badge>
                      {it.qty} {it.unit ?? ""}
                    </div>
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {mode === "unit"
                      ? it.target_price !== null
                        ? formatCompactCurrency(it.target_price, currency)
                        : "—"
                      : formatCompactCurrency((it.target_price ?? 0) * it.qty, currency)}
                  </td>
                  {firms.map((f) => {
                    const p = prices[it.id]?.[f.id];
                    const total = itemTotals[it.id][f.id];
                    const isMin = p !== null && p !== undefined && p === minUnit;
                    return (
                      <td
                        key={f.id}
                        className={cn(
                          "p-2 text-right tabular-nums",
                          isMin && "bg-emerald-50 font-semibold text-emerald-800"
                        )}
                      >
                        {p !== null && p !== undefined ? (
                          mode === "unit" ? (
                            formatCompactCurrency(p, currency)
                          ) : (
                            <div>
                              <div className="font-medium">{formatCompactCurrency(total, currency)}</div>
                              <div className="text-muted-foreground text-[10px]">
                                {formatCompactCurrency(p, currency)} × {it.qty}
                              </div>
                            </div>
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Toplam satırı */}
            <tr className="bg-muted/40 border-t-2 font-semibold">
              <td className="p-2">TOPLAM</td>
              <td className="p-2 text-right tabular-nums">
                {formatCompactCurrency(targetGrandTotal, currency)}
              </td>
              {firms.map((f) => {
                const total = firmGrandTotals[f.id];
                const dev = targetGrandTotal > 0 ? ((total - targetGrandTotal) / targetGrandTotal) * 100 : null;
                return (
                  <td key={f.id} className="p-2 text-right tabular-nums">
                    <div>{formatCompactCurrency(total, currency)}</div>
                    {dev !== null && (
                      <div
                        className={cn(
                          "text-[10px] font-normal",
                          dev > 5 ? "text-rose-600" : dev < -2 ? "text-emerald-600" : "text-muted-foreground"
                        )}
                      >
                        {dev > 0 ? "+" : ""}
                        {dev.toFixed(1)}% hedef
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
