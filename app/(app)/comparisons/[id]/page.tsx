import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { calcStats, type FirmInput, type ItemInput, type PriceMatrix } from "@/lib/scoring";
import { formatCompactCurrency, formatPercent } from "@/lib/currency";
import type { Currency } from "@/lib/constants";
import { RankingTable } from "@/components/comparison/ranking-table";
import { DecisionCards } from "@/components/comparison/decision-cards";
import { ScoreChart } from "@/components/comparison/score-chart";
import { ExportButtons } from "@/components/comparison/export-buttons";

export default async function ComparisonDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: comparison } = await supabase
    .from("comparisons")
    .select("*")
    .eq("id", id)
    .single();

  if (!comparison) notFound();

  const [{ data: cFirms }, { data: cItems }, { data: cPrices }] = await Promise.all([
    supabase
      .from("comparison_firms")
      .select("id, firm_id, notes, firms (id, name)")
      .eq("comparison_id", id),
    supabase
      .from("comparison_items")
      .select("*")
      .eq("comparison_id", id)
      .order("position"),
    supabase.from("bid_prices").select("item_id, firm_id, price").eq("comparison_id", id),
  ]);

  type CFirmRow = { firm_id: string; firms: { id: string; name: string } | { id: string; name: string }[] | null };
  const firms: FirmInput[] = (cFirms ?? []).map((cf) => {
    const row = cf as unknown as CFirmRow;
    const f = Array.isArray(row.firms) ? row.firms[0] : row.firms;
    return { id: row.firm_id, name: f?.name ?? "—" };
  });

  const items: ItemInput[] = (cItems ?? []).map((it) => ({
    id: it.id,
    name: it.name,
    target: it.target_price,
    qty: Number(it.qty),
  }));

  const prices: PriceMatrix = {};
  for (const bp of cPrices ?? []) {
    if (!prices[bp.item_id]) prices[bp.item_id] = {};
    prices[bp.item_id][bp.firm_id] = bp.price;
  }

  const stats = calcStats(firms, items, prices);
  const currency = comparison.currency as Currency;

  const decided = comparison.decided_firm_id
    ? firms.find((f) => f.id === comparison.decided_firm_id)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/comparisons">
            <ChevronLeft className="mr-1 size-4" /> Karşılaştırmalar
          </Link>
        </Button>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{comparison.name}</h1>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{comparison.type}</Badge>
              <span>·</span>
              <span>{firms.length} firma · {items.length} kalem</span>
              {comparison.budget && (
                <>
                  <span>·</span>
                  <span>Bütçe {formatCompactCurrency(Number(comparison.budget), currency)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {decided && (
              <Badge className="bg-emerald-600 text-base">Karar: {decided.name}</Badge>
            )}
            <ExportButtons
              comparison={{
                name: comparison.name,
                type: comparison.type,
                currency,
                budget: comparison.budget !== null ? Number(comparison.budget) : null,
              }}
              firms={firms}
              items={(cItems ?? []).map((it) => ({
                id: it.id,
                name: it.name,
                category: it.category,
                unit: it.unit,
                qty: Number(it.qty),
                target_price: it.target_price,
              }))}
              prices={prices}
              stats={stats}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Pano</TabsTrigger>
          <TabsTrigger value="ranking">Sıralama</TabsTrigger>
          <TabsTrigger value="items">Kalemler</TabsTrigger>
          <TabsTrigger value="decision">Karar Özeti</TabsTrigger>
          <TabsTrigger value="help">Nasıl Çalışır</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DecisionCards stats={stats} currency={currency} />
          <Card>
            <CardHeader>
              <CardTitle>Skor Dağılımı</CardTitle>
              <CardDescription>40% kapsam + 35% sapma + 25% en düşük teklif</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreChart firms={stats.firms} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <RankingTable firms={stats.firms} currency={currency} recommendedFirmId={stats.recommendedFirmId} />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kalemler ve Fiyatlar</CardTitle>
              <CardDescription>Her kalem için firmaların teklif fiyatları</CardDescription>
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
                    const cellPrices = firms
                      .map((f) => prices[it.id]?.[f.id])
                      .filter((p): p is number => p !== null && p !== undefined);
                    const minPrice = cellPrices.length > 0 ? Math.min(...cellPrices) : null;
                    const itemRow = (cItems ?? []).find((x) => x.id === it.id);
                    return (
                      <tr key={it.id} className="border-b">
                        <td className="p-2">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {itemRow?.category} · {it.qty} {itemRow?.unit ?? ""}
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          {it.target !== null ? formatCompactCurrency(it.target, currency) : "—"}
                        </td>
                        {firms.map((f) => {
                          const p = prices[it.id]?.[f.id];
                          const isMin = p !== null && p !== undefined && p === minPrice;
                          return (
                            <td
                              key={f.id}
                              className={`p-2 text-right ${isMin ? "bg-emerald-50 font-semibold text-emerald-800" : ""}`}
                            >
                              {p !== null && p !== undefined ? formatCompactCurrency(p, currency) : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decision" className="space-y-4">
          <DecisionCards stats={stats} currency={currency} />
          <Card>
            <CardHeader>
              <CardTitle>Karar Özeti</CardTitle>
              <CardDescription>
                Skor ağırlıkları: %40 kapsam + %35 hedef sapma + %25 en düşük teklif sayısı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
                <li>Medyan toplam: {stats.median !== null ? formatCompactCurrency(stats.median, currency) : "—"}</li>
                <li>
                  Önerilen firma:{" "}
                  <span className="text-foreground font-medium">
                    {stats.recommendedFirmId ? firms.find((f) => f.id === stats.recommendedFirmId)?.name : "—"}
                  </span>
                </li>
                <li>
                  En düşük toplamlı firma:{" "}
                  <span className="text-foreground font-medium">
                    {stats.lowestFirmId ? firms.find((f) => f.id === stats.lowestFirmId)?.name : "—"}
                  </span>
                </li>
                <li>
                  Tam kapsamlı (her kaleme teklif veren) firma sayısı:{" "}
                  <span className="text-foreground font-medium">
                    {stats.firms.filter((f) => f.scope === 1).length}
                  </span>
                </li>
                <li>
                  Ortalama sapma:{" "}
                  <span className="text-foreground font-medium">
                    {(() => {
                      const devs = stats.firms.map((f) => f.absDev).filter((d): d is number => d !== null);
                      return devs.length > 0
                        ? formatPercent(devs.reduce((a, b) => a + b, 0) / devs.length, 1)
                        : "—";
                    })()}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Skor Algoritması Nasıl Çalışır?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
              <p>
                Her firma 100 üzerinden bir <strong>skor</strong> alır. Skor üç bileşenden oluşur:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong>Kapsam (40%):</strong> Firmanın kaç kaleme fiyat verdiği. Tam kapsam = 40 puan.
                </li>
                <li>
                  <strong>Hedef Sapma (35%):</strong> Firmanın toplam teklifinin medyandan ne kadar saptığı.
                  Sapma 0 = 35 puan; sapma %100 = 0 puan.
                </li>
                <li>
                  <strong>En Düşük Teklif (25%):</strong> Firmanın kalem bazında en düşük teklifi verdiği oran.
                  Tüm kalemlerde en düşük = 25 puan.
                </li>
              </ul>
              <p>
                <strong>Renk kodları:</strong> Yeşil ≥ 70 (Güçlü Aday), Sarı 50–69 (Orta), Kırmızı &lt; 50 (Riskli).
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
