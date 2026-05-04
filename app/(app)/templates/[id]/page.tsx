import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import {
  calcStats,
  type FirmInput,
  type ItemInput,
  type ManualScores,
  type MetricWeights,
  type PriceMatrix,
} from "@/lib/scoring";
import { METRICS, type MetricKey } from "@/lib/metrics";
import { formatCompactCurrency } from "@/lib/currency";
import { TotalKpiCard } from "@/components/comparison/total-kpi";
import { RankingTable } from "@/components/comparison/ranking-table";
import { DecisionCards } from "@/components/comparison/decision-cards";
import { ScoreChart } from "@/components/comparison/score-chart";
import { ScoreBreakdown } from "@/components/comparison/score-breakdown";
import { CloneTemplateButton } from "@/components/comparison/clone-template-button";

type SampleData = {
  firms: { name: string; contact_name?: string; contact_email?: string; contact_phone?: string; notes?: string }[];
  metric_weights: Record<string, number>;
  items: {
    name: string;
    category: string;
    unit: string | null;
    default_qty: number;
    sample_target?: number | null;
    sample_prices?: (number | null)[];
  }[];
  manual_scores?: { firm_index: number; metric_key: string; score: number; notes?: string }[];
};

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: tpl } = await supabase.from("templates").select("*").eq("id", id).single();
  if (!tpl) notFound();

  const sampleData = tpl.sample_data as SampleData | null;
  const hasSample = sampleData && sampleData.firms.length > 0 && sampleData.items.length > 0;

  // Sample varsa demo görünüm için stats hesapla
  let demoStats = null;
  let demoCurrency: "TRY" = "TRY";
  if (hasSample) {
    const firms: FirmInput[] = sampleData.firms.map((f, idx) => ({ id: `demo-f-${idx}`, name: f.name }));
    const items: ItemInput[] = sampleData.items.map((it, idx) => ({
      id: `demo-i-${idx}`,
      name: it.name,
      target: it.sample_target ?? null,
      qty: it.default_qty,
    }));
    const prices: PriceMatrix = {};
    for (let i = 0; i < sampleData.items.length; i++) {
      const itemId = `demo-i-${i}`;
      prices[itemId] = {};
      const samplePrices = sampleData.items[i].sample_prices ?? [];
      for (let j = 0; j < sampleData.firms.length; j++) {
        prices[itemId][`demo-f-${j}`] = samplePrices[j] ?? null;
      }
    }
    const manualScores: ManualScores = {};
    for (const ms of sampleData.manual_scores ?? []) {
      const fid = `demo-f-${ms.firm_index}`;
      if (!manualScores[fid]) manualScores[fid] = {};
      manualScores[fid][ms.metric_key as MetricKey] = ms.score;
    }
    const weights: MetricWeights = sampleData.metric_weights as MetricWeights;
    demoStats = calcStats(firms, items, prices, manualScores, weights);
  }

  const itemsCount = Array.isArray(tpl.items) ? tpl.items.length : 0;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/templates">
          <ChevronLeft className="mr-1 size-4" /> Şablonlar
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Badge
                  variant={
                    tpl.category === "GES" ? "default" : tpl.category === "RES" ? "secondary" : "outline"
                  }
                >
                  {tpl.category}
                </Badge>
                <Badge variant="outline">{tpl.type}</Badge>
                {hasSample && (
                  <Badge className="bg-amber-100 text-amber-800">
                    <Sparkles className="mr-1 size-3" /> Tam Örnek
                  </Badge>
                )}
              </div>
              <CardTitle>{tpl.name}</CardTitle>
              {tpl.description && <CardDescription className="mt-1">{tpl.description}</CardDescription>}
            </div>
            <CloneTemplateButton templateId={tpl.id} hasSample={!!hasSample} />
          </div>
        </CardHeader>
      </Card>

      {hasSample && demoStats ? (
        <>
          <div className="text-muted-foreground rounded-lg border bg-amber-50 p-3 text-sm text-amber-900">
            <strong>📌 Örnek Karşılaştırma:</strong> Aşağıdaki firmalar, fiyatlar ve skorlar bu şablonun ne tür kararlar
            verdireceğini göstermek için hazırlanmıştır. Üstteki <em>&quot;Bu Şablonu Kullan&quot;</em> butonu ile
            bu örneği kendi karşılaştırmana klonlayabilir, sonra firmaları/fiyatları kendi tekliflerinle değiştirebilirsin.
          </div>

          <Tabs defaultValue="dashboard">
            <TabsList>
              <TabsTrigger value="dashboard">Pano</TabsTrigger>
              <TabsTrigger value="ranking">Sıralama</TabsTrigger>
              <TabsTrigger value="breakdown">Skor Dökümü</TabsTrigger>
              <TabsTrigger value="firms">Firmalar</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <TotalKpiCard stats={demoStats} currency={demoCurrency} />
                <Card>
                  <CardHeader>
                    <CardTitle>Skor Dağılımı</CardTitle>
                    <CardDescription>
                      Aktif metrikler:{" "}
                      {(Object.keys(demoStats.appliedWeights) as MetricKey[])
                        .filter((k) => (demoStats.appliedWeights[k] ?? 0) > 0)
                        .map((k) => `${METRICS[k].label} %${demoStats.appliedWeights[k]}`)
                        .join(" · ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScoreChart firms={demoStats.firms} />
                  </CardContent>
                </Card>
              </div>
              <DecisionCards stats={demoStats} currency={demoCurrency} />
            </TabsContent>

            <TabsContent value="ranking">
              <RankingTable
                firms={demoStats.firms}
                currency={demoCurrency}
                recommendedFirmId={demoStats.recommendedFirmId}
              />
            </TabsContent>

            <TabsContent value="breakdown">
              <ScoreBreakdown stats={demoStats} />
            </TabsContent>

            <TabsContent value="firms">
              <Card>
                <CardContent className="space-y-4 p-4">
                  {sampleData.firms.map((f, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{f.name}</h4>
                        {f.contact_name && (
                          <span className="text-muted-foreground text-sm">· {f.contact_name}</span>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-xs">
                        {f.contact_email && <span>{f.contact_email}</span>}
                        {f.contact_phone && <span>{f.contact_phone}</span>}
                      </div>
                      {f.notes && <p className="mt-2 text-sm">{f.notes}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Kalem Listesi ({itemsCount})</CardTitle>
            <CardDescription>Bu şablon için sadece kalem yapısı tanımlı. Fiyat ve firma bilgisi ekleyerek karşılaştırma oluştur.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(tpl.items as { name: string; category: string; unit: string | null; default_qty: number }[])?.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 border-b py-2 last:border-0">
                  <div>
                    <span className="font-medium">{it.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{it.category}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {it.default_qty} {it.unit ?? ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!hasSample && (
        <div className="text-muted-foreground rounded-lg border p-3 text-sm">
          Bu şablon henüz örnek firma+fiyat verisiyle zenginleştirilmemiş. &quot;Bu Şablonu Kullan&quot; ile sadece kalem listesini yükleyip wizardda kendin doldurabilirsin.
        </div>
      )}
    </div>
  );
}

