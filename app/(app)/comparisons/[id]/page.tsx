import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatCompactCurrency, formatPercent } from "@/lib/currency";
import type { Currency } from "@/lib/constants";
import { RankingTable } from "@/components/comparison/ranking-table";
import { DecisionCards } from "@/components/comparison/decision-cards";
import { ScoreChart } from "@/components/comparison/score-chart";
import { ExportButtons } from "@/components/comparison/export-buttons";
import { TotalKpiCard } from "@/components/comparison/total-kpi";
import { ScoreBreakdown } from "@/components/comparison/score-breakdown";
import { RevisionDialog } from "@/components/comparison/revision-dialog";
import { RevisionSelector } from "@/components/comparison/revision-selector";
import { EditMetricsDialog } from "@/components/comparison/edit-metrics-dialog";
import { EditManualScoresDialog } from "@/components/comparison/edit-manual-scores-dialog";
import { RevisionCompare } from "@/components/comparison/revision-compare";
import { StatusButton } from "@/components/comparison/status-button";
import { DecisionSelector } from "@/components/comparison/decision-selector";
import { ScoreBreakdownClient, FirmsTabClient, type FirmInfo, type ManualScoreRow } from "@/components/comparison/firms-tab";
import { ItemsTable } from "@/components/comparison/items-table";
import { DeleteComparisonButton } from "@/components/comparison/delete-comparison-button";

export default async function ComparisonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ revision?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const requestedRevision = sp.revision ? Number(sp.revision) : null;
  const supabase = await createClient();

  const { data: comparison } = await supabase.from("comparisons").select("*").eq("id", id).single();
  if (!comparison) notFound();

  const [
    { data: cFirms },
    { data: cItems },
    { data: allBids },
    { data: cMetrics },
    { data: manualRows },
  ] = await Promise.all([
    supabase
      .from("comparison_firms")
      .select("id, firm_id, notes, firms (id, name, contact_name, contact_email, contact_phone, notes)")
      .eq("comparison_id", id),
    supabase.from("comparison_items").select("*").eq("comparison_id", id).order("position"),
    supabase.from("bid_prices").select("item_id, firm_id, price, revision").eq("comparison_id", id),
    supabase
      .from("comparison_metrics")
      .select("metric_key, weight")
      .eq("comparison_id", id),
    supabase
      .from("firm_manual_scores")
      .select("firm_id, metric_key, score, notes")
      .eq("comparison_id", id),
  ]);

  type FirmRecord = {
    id: string;
    name: string;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    notes: string | null;
  };
  type CFirmRow = {
    firm_id: string;
    firms: FirmRecord | FirmRecord[] | null;
  };
  const firmInfos: FirmInfo[] = (cFirms ?? []).map((cf) => {
    const row = cf as unknown as CFirmRow;
    const f = Array.isArray(row.firms) ? row.firms[0] : row.firms;
    return {
      id: row.firm_id,
      name: f?.name ?? "—",
      contact_name: f?.contact_name ?? null,
      contact_email: f?.contact_email ?? null,
      contact_phone: f?.contact_phone ?? null,
      notes: f?.notes ?? null,
    };
  });
  const firms: FirmInput[] = firmInfos.map((f) => ({ id: f.id, name: f.name }));

  const items: ItemInput[] = (cItems ?? []).map((it) => ({
    id: it.id,
    name: it.name,
    target: it.target_price,
    qty: Number(it.qty),
  }));

  // Revisionları topla
  const revisions = Array.from(new Set((allBids ?? []).map((b) => b.revision))).sort((a, b) => a - b);
  const latestRevision = revisions.length > 0 ? Math.max(...revisions) : 1;
  const activeRevision =
    requestedRevision && revisions.includes(requestedRevision) ? requestedRevision : latestRevision;

  // Aktif revize için fiyat matrisi
  const prices: PriceMatrix = {};
  for (const bp of allBids ?? []) {
    if (bp.revision !== activeRevision) continue;
    if (!prices[bp.item_id]) prices[bp.item_id] = {};
    prices[bp.item_id][bp.firm_id] = bp.price;
  }

  // Metrik ağırlıkları
  const weights: MetricWeights = {};
  for (const m of cMetrics ?? []) {
    weights[m.metric_key as MetricKey] = Number(m.weight);
  }
  // Eğer hiç metrik yoksa (eski karşılaştırmalar) varsayılan 40/35/25
  if (Object.keys(weights).length === 0) {
    weights.scope = 40;
    weights.deviation = 35;
    weights.lowest = 25;
  }

  // Manuel skorlar
  const manualScores: ManualScores = {};
  for (const m of manualRows ?? []) {
    if (!manualScores[m.firm_id]) manualScores[m.firm_id] = {};
    manualScores[m.firm_id][m.metric_key as MetricKey] = Number(m.score);
  }

  const stats = calcStats(firms, items, prices, manualScores, weights);
  const currency = comparison.currency as Currency;
  const decided = comparison.decided_firm_id ? firms.find((f) => f.id === comparison.decided_firm_id) : null;

  // Proje bilgisi (varsa)
  let projectName: string | null = null;
  if (comparison.project_id) {
    const { data: proj } = await supabase
      .from("projects")
      .select("name")
      .eq("id", comparison.project_id)
      .single();
    projectName = proj?.name ?? null;
  }

  // Manuel skor edit için detaylı struct (notes ile)
  const manualScoresDetailed: Record<string, Partial<Record<MetricKey, { score: number; notes: string | null }>>> = {};
  for (const m of manualRows ?? []) {
    if (!manualScoresDetailed[m.firm_id]) manualScoresDetailed[m.firm_id] = {};
    manualScoresDetailed[m.firm_id][m.metric_key as MetricKey] = {
      score: Number(m.score),
      notes: m.notes ?? null,
    };
  }
  const manualMetricKeys = (Object.keys(weights) as MetricKey[]).filter(
    (k) => METRICS[k].kind === "manual" && (weights[k] ?? 0) > 0
  );

  const manualScoreRows: ManualScoreRow[] = (manualRows ?? []).map((m) => ({
    firm_id: m.firm_id,
    metric_key: m.metric_key as MetricKey,
    score: Number(m.score),
    notes: m.notes ?? null,
  }));

  const itemsForRevision = (cItems ?? []).map((it) => ({
    id: it.id,
    name: it.name,
    category: it.category,
    unit: it.unit,
    qty: Number(it.qty),
  }));

  const activeMetricKeys = (Object.keys(weights) as MetricKey[]).filter((k) => (weights[k] ?? 0) > 0);
  const onlyAutoMetrics = activeMetricKeys.every((k) => METRICS[k].kind === "auto");

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
              {projectName && (
                <>
                  <span>·</span>
                  <Link href={`/projects/${comparison.project_id}`} className="hover:underline">
                    📁 {projectName}
                  </Link>
                </>
              )}
              <span>·</span>
              <span>
                {firms.length} firma · {items.length} kalem
              </span>
              <span>·</span>
              <span>Hedef Toplam: {formatCompactCurrency(stats.totalTarget, currency)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusButton
              comparisonId={id}
              current={comparison.status as "draft" | "in_review" | "decided" | "archived"}
              hasDecidedFirm={comparison.decided_firm_id !== null}
            />
            {decided && <Badge className="bg-emerald-600 text-base">Karar: {decided.name}</Badge>}
            <EditMetricsDialog comparisonId={id} initialWeights={weights} />
            <EditManualScoresDialog
              comparisonId={id}
              firms={firms}
              metrics={manualMetricKeys}
              initialScores={manualScoresDetailed}
            />
            <RevisionSelector
              comparisonId={id}
              current={activeRevision}
              available={revisions.length > 0 ? revisions : [1]}
              latest={latestRevision}
            />
            {activeRevision === latestRevision && (
              <RevisionDialog
                comparisonId={id}
                currentRevision={latestRevision}
                firms={firms}
                items={itemsForRevision}
                prevPrices={prices}
                currency={currency}
              />
            )}
            <ExportButtons
              comparison={{
                name: comparison.name,
                type: comparison.type,
                currency,
                budget: comparison.budget !== null ? Number(comparison.budget) : null,
              }}
              firms={firms}
              items={itemsForRevision.map((it) => ({
                id: it.id,
                name: it.name,
                category: it.category,
                unit: it.unit,
                qty: it.qty,
                target_price: items.find((x) => x.id === it.id)?.target ?? null,
              }))}
              prices={prices}
              stats={stats}
              manualScores={manualScoreRows}
              weights={weights}
              allBids={(allBids ?? []).map((b) => ({
                item_id: b.item_id,
                firm_id: b.firm_id,
                price: b.price,
                revision: b.revision,
              }))}
              projectName={projectName}
            />
            <DeleteComparisonButton comparisonId={id} comparisonName={comparison.name} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Pano</TabsTrigger>
          <TabsTrigger value="ranking">Sıralama</TabsTrigger>
          <TabsTrigger value="breakdown">Skor Dökümü</TabsTrigger>
          <TabsTrigger value="firms">Firmalar</TabsTrigger>
          <TabsTrigger value="items">Kalemler</TabsTrigger>
          <TabsTrigger value="revisions">Revizeler</TabsTrigger>
          <TabsTrigger value="decision">Karar Özeti</TabsTrigger>
          <TabsTrigger value="help">Nasıl Çalışır</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <TabIntro
            tone="blue"
            title="Pano — Karşılaştırmanın Özeti"
            body="Önerilen firma, en düşük toplam, hedef sapma ve genel skor dağılımı. İlk bakışta hangi firmanın öne çıktığını anlamak için bu sekmeden başla."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <TotalKpiCard stats={stats} currency={currency} />
            <Card>
              <CardHeader>
                <CardTitle>Skor Dağılımı</CardTitle>
                <CardDescription>
                  Aktif metrikler:{" "}
                  {activeMetricKeys.map((k) => `${METRICS[k].label} %${weights[k]}`).join(" · ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreChart firms={stats.firms} />
              </CardContent>
            </Card>
          </div>
          <DecisionCards stats={stats} currency={currency} />
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <TabIntro
            tone="emerald"
            title="Sıralama — Skor Bazlı Liste"
            body="Tüm firmalar toplam skorlarına göre sıralı. Yeşil=güçlü aday (≥70), sarı=orta (50-69), kırmızı=riskli (<50). Anomali rozetli firmalar rakiplerinden çok kopuk teklif vermiş demektir."
          />
          <RankingTable firms={stats.firms} currency={currency} recommendedFirmId={stats.recommendedFirmId} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <TabIntro
            tone="violet"
            title="Skor Dökümü — Hangi Metrikten Ne Kadar Puan?"
            body="Her firmanın her metrikten aldığı puanın tablosu. Sütun başlığına tıklayarak sıralayabilir, firma adına tıklayarak manuel skor notlarını (ödeme şartı, sertifika vb.) açılır pencerede görebilirsin."
          />
          <ScoreBreakdownClient
            stats={stats}
            firmInfos={firmInfos}
            manualScores={manualScoreRows}
            weights={weights}
            currency={currency}
          />
          {!onlyAutoMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Manuel Skor Detayları</CardTitle>
                <CardDescription>
                  Her firmanın manuel metriklerden aldığı puan (0-100)
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium">Firma</th>
                      {activeMetricKeys
                        .filter((k) => METRICS[k].kind === "manual")
                        .map((k) => (
                          <th key={k} className="p-2 text-right font-medium">
                            {METRICS[k].label}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.firms.map((f) => (
                      <tr key={f.firmId} className="border-b">
                        <td className="p-2 font-medium">{f.firmName}</td>
                        {activeMetricKeys
                          .filter((k) => METRICS[k].kind === "manual")
                          .map((k) => (
                            <td key={k} className="p-2 text-right">
                              {f.metricScores[k] > 0 ? `${Math.round(f.metricScores[k] / 10)}/10` : "—"}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="firms" className="space-y-4">
          <TabIntro
            tone="emerald"
            title="Firmalar — Profil ve Manuel Skor Notları"
            body="Bu karşılaştırmadaki tüm firmalar. Bir firmanın üzerine tıkla — açılan pencerede iletişim bilgileri, skor özeti ve manuel skor notları (ödeme şartı, finansal bilgiler, referanslar vb.) görünür."
          />
          <FirmsTabClient
            stats={stats}
            firmInfos={firmInfos}
            manualScores={manualScoreRows}
            weights={weights}
            currency={currency}
          />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <TabIntro
            tone="slate"
            title="Kalemler — Kalem Bazında Fiyat Karşılaştırması"
            body="Birim/Toplam toggle ile birim fiyat veya kalem toplamı (birim × miktar) görünebilir. Yeşil hücre kalem bazında en düşük teklif. En altta tüm firma toplamları."
          />
          <ItemsTable
            items={itemsForRevision.map((it) => ({
              id: it.id,
              name: it.name,
              category: it.category,
              unit: it.unit,
              qty: it.qty,
              target_price: items.find((x) => x.id === it.id)?.target ?? null,
            }))}
            firms={firms}
            prices={prices}
            currency={currency}
            activeRevision={activeRevision}
          />
        </TabsContent>

        <TabsContent value="revisions" className="space-y-4">
          <TabIntro
            tone="amber"
            title="Revizeler — Tur Karşılaştırması"
            body="Firmalar tekliflerini revize ettikçe (Sağ üstteki 'Revize Kaydet' butonu ile) burada turlar yan yana karşılaştırılır. Yeşil ↓ indirim, kırmızı ↑ zam."
          />
          <RevisionCompare
            items={itemsForRevision}
            firms={firms}
            bids={(allBids ?? []).map((b) => ({
              item_id: b.item_id,
              firm_id: b.firm_id,
              price: b.price,
              revision: b.revision,
            }))}
            currency={currency}
          />
        </TabsContent>

        <TabsContent value="decision" className="space-y-4">
          <TabIntro
            tone="emerald"
            title="Karar Özeti — Yönetici Bilgisi"
            body="Karar verirken bakacağın anahtar göstergeler. Aşağıdan firma seçip 'Kararı Onayla' ile karşılaştırmayı kapat, durum 'Karar Verildi' olur."
          />
          <DecisionSelector
            comparisonId={id}
            firms={firms}
            currentDecidedFirmId={comparison.decided_firm_id}
          />
          <DecisionCards stats={stats} currency={currency} />
          <Card>
            <CardHeader>
              <CardTitle>Karar Özeti</CardTitle>
              <CardDescription>
                Bu karşılaştırmadaki aktif metrikler:{" "}
                {activeMetricKeys.map((k) => `${METRICS[k].label} %${weights[k]}`).join(" · ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
                <li>Hedef toplam: <span className="text-foreground font-medium">{formatCompactCurrency(stats.totalTarget, currency)}</span></li>
                <li>Medyan firma toplamı: {stats.median !== null ? formatCompactCurrency(stats.median, currency) : "—"}</li>
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
                  Anomali (outlier) firma sayısı:{" "}
                  <span className="text-foreground font-medium">
                    {stats.firms.filter((f) => f.isOutlier).length}
                  </span>
                </li>
                <li>
                  Tam kapsamlı firma sayısı:{" "}
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

        <TabsContent value="help" className="space-y-4">
          <TabIntro
            tone="blue"
            title="Nasıl Çalışır — Skor Algoritması"
            body="Bu sayfa skorların nasıl hesaplandığını açıklar. Kararlarını anlamlandırmak veya raporda referans göstermek için kullanışlı."
          />
          <Card>
            <CardHeader>
              <CardTitle>Skor Algoritması Nasıl Çalışır?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
              <p>
                Her firma 100 üzerinden bir <strong>skor</strong> alır. Skor, karşılaştırma türüne göre seçilen
                <strong> aktif metriklerin ağırlıklı toplamıdır</strong>.
              </p>
              <p className="text-foreground">Bu karşılaştırmadaki aktif metrikler:</p>
              <ul className="list-inside list-disc space-y-1">
                {activeMetricKeys.map((k) => (
                  <li key={k}>
                    <strong>{METRICS[k].label} (%{weights[k]}):</strong> {METRICS[k].description}
                    <span className="ml-1 text-xs">
                      [{METRICS[k].kind === "auto" ? "Otomatik" : "Manuel"}]
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                <strong>Anomali (outlier) tespiti:</strong> IQR (Interquartile Range) yöntemi ile rakiplerinden çok
                kopuk teklif verenler &quot;Anomali&quot; etiketiyle işaretlenir. Q1 - 1.5×IQR altı veya Q3 + 1.5×IQR
                üstü değerler outlier sayılır (en az 4 firma gerekli).
              </p>
              <p>
                <strong>Renk kodları:</strong> Yeşil ≥ 70 (Güçlü Aday), Sarı 50–69 (Orta), Kırmızı &lt; 50 (Riskli).
              </p>
              <p>
                <strong>Revize (turlar):</strong> Firmaların revize fiyatları &quot;Revize Kaydet&quot; butonu ile yeni
                bir tur olarak kaydedilir; geçmiş revizeler dropdown'dan görüntülenebilir.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabIntro({
  tone,
  title,
  body,
}: {
  tone: "blue" | "emerald" | "violet" | "slate" | "amber";
  title: string;
  body: string;
}) {
  const cls = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  }[tone];
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-0.5 text-sm opacity-90">{body}</p>
    </div>
  );
}
