"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  COMPARISON_TYPES,
  CURRENCIES,
  ITEM_CATEGORIES,
  type ItemCategory,
  type ComparisonType,
  type Currency,
} from "@/lib/constants";
import { ALL_METRICS, METRICS, PRESETS, type MetricKey } from "@/lib/metrics";
import { MetricWeightsEditor, type Weights } from "@/components/comparison/metric-weights-editor";
import { ManualScoreInput } from "@/components/comparison/manual-score-input";
import { formatCompactCurrency } from "@/lib/currency";

type LocalFirm = { tempId: string; name: string };
type LocalItem = {
  tempId: string;
  name: string;
  category: ItemCategory;
  unit: string;
  qty: number;
  target: number | null;
};

export default function NewComparisonPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground p-8">Yükleniyor...</div>}>
      <NewComparisonForm />
    </Suspense>
  );
}

function NewComparisonForm() {
  const router = useRouter();
  const params = useSearchParams();
  const templateId = params.get("template");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  // Step 1: bilgi + metrik
  const [name, setName] = useState("");
  const [type, setType] = useState<ComparisonType>("Taşeron");
  const [currency, setCurrency] = useState<Currency>("TRY");
  const [notes, setNotes] = useState("");
  const [weights, setWeights] = useState<Weights>(PRESETS["Taşeron"]);
  const [weightsTouched, setWeightsTouched] = useState(false);

  // Type değişince preset'i yükle (ama kullanıcı dokunduysa koru)
  useEffect(() => {
    if (!weightsTouched) setWeights(PRESETS[type]);
  }, [type, weightsTouched]);

  function setWeightsAndTouch(w: Weights) {
    setWeights(w);
    setWeightsTouched(true);
  }

  // Step 2: firms + items
  const [firms, setFirms] = useState<LocalFirm[]>([{ tempId: "f1", name: "" }]);
  const [items, setItems] = useState<LocalItem[]>([
    { tempId: "i1", name: "", category: "Diğer", unit: "", qty: 1, target: null },
  ]);

  // Şablon yükleme
  useEffect(() => {
    if (!templateId) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("templates").select("*").eq("id", templateId).single();
      if (!data) return;
      setType(data.type);
      const tplItems = Array.isArray(data.items) ? data.items : [];
      if (tplItems.length > 0) {
        setItems(
          tplItems.map((it: { name: string; category: string; unit: string | null; default_qty: number }, idx: number) => ({
            tempId: `i${idx}-${Date.now()}`,
            name: it.name,
            category: ((ITEM_CATEGORIES as readonly string[]).includes(it.category)
              ? it.category
              : "Diğer") as ItemCategory,
            unit: it.unit ?? "",
            qty: it.default_qty,
            target: null,
          }))
        );
      }
      if (data.name) setName(`${data.name} - ${new Date().toLocaleDateString("tr-TR")}`);
      toast.success("Şablon yüklendi.");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // Step 3: prices + manual scores
  const [prices, setPrices] = useState<Record<string, Record<string, string>>>({});
  // firmTempId -> metricKey -> 0-100 score
  const [manualScores, setManualScores] = useState<Record<string, Partial<Record<MetricKey, number>>>>({});

  function addFirm() {
    setFirms((p) => [...p, { tempId: `f${p.length}-${Date.now()}`, name: "" }]);
  }
  function addItem() {
    setItems((p) => [
      ...p,
      { tempId: `i${p.length}-${Date.now()}`, name: "", category: "Diğer", unit: "", qty: 1, target: null },
    ]);
  }
  function removeFirm(id: string) {
    setFirms((p) => p.filter((f) => f.tempId !== id));
  }
  function removeItem(id: string) {
    setItems((p) => p.filter((i) => i.tempId !== id));
  }

  const totalWeight = (Object.values(weights) as number[]).reduce((s, v) => s + (v ?? 0), 0);
  const totalTarget = items.reduce((sum, it) => sum + (it.target ?? 0) * it.qty, 0);

  const validStep1 =
    name.trim().length > 1 &&
    totalWeight === 100 &&
    Object.keys(weights).length > 0;
  const validStep2 =
    firms.length > 0 &&
    firms.every((f) => f.name.trim()) &&
    items.length > 0 &&
    items.every((i) => i.name.trim() && i.qty > 0);

  const activeManualMetrics = useMemo(
    () =>
      (Object.keys(weights) as MetricKey[]).filter(
        (k) => METRICS[k].kind === "manual" && (weights[k] ?? 0) > 0
      ),
    [weights]
  );

  async function save() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum yok");

      const { data: comp, error: e1 } = await supabase
        .from("comparisons")
        .insert({
          name: name.trim(),
          type,
          status: "draft",
          owner_id: user.id,
          currency,
          notes: notes || null,
        })
        .select()
        .single();
      if (e1) throw e1;

      // Metrikler
      const metricRows = (Object.keys(weights) as MetricKey[])
        .filter((k) => (weights[k] ?? 0) > 0)
        .map((k, idx) => ({
          comparison_id: comp.id,
          metric_key: k,
          weight: weights[k]!,
          position: idx,
        }));
      if (metricRows.length > 0) {
        const { error: em } = await supabase.from("comparison_metrics").insert(metricRows);
        if (em) throw em;
      }

      // Firmalar
      const { data: insertedFirms, error: e2 } = await supabase
        .from("firms")
        .insert(firms.map((f) => ({ name: f.name.trim(), created_by: user.id })))
        .select();
      if (e2) throw e2;

      // Comparison-firms
      const { error: e3 } = await supabase
        .from("comparison_firms")
        .insert(insertedFirms.map((f) => ({ comparison_id: comp.id, firm_id: f.id })));
      if (e3) throw e3;

      // Items
      const { data: insertedItems, error: e4 } = await supabase
        .from("comparison_items")
        .insert(
          items.map((it, idx) => ({
            comparison_id: comp.id,
            name: it.name.trim(),
            category: it.category,
            unit: it.unit || null,
            qty: it.qty,
            target_price: it.target,
            position: idx,
          }))
        )
        .select();
      if (e4) throw e4;

      // Bid prices (revision=1)
      const itemMap = new Map(items.map((it, idx) => [it.tempId, insertedItems[idx].id]));
      const firmMap = new Map(firms.map((f, idx) => [f.tempId, insertedFirms[idx].id]));
      const bidRows: Array<{
        comparison_id: string;
        item_id: string;
        firm_id: string;
        price: number | null;
        updated_by: string;
        revision: number;
      }> = [];
      for (const it of items) {
        for (const f of firms) {
          const raw = prices[it.tempId]?.[f.tempId];
          const price = raw === undefined || raw === "" ? null : Number(raw);
          bidRows.push({
            comparison_id: comp.id,
            item_id: itemMap.get(it.tempId)!,
            firm_id: firmMap.get(f.tempId)!,
            price,
            updated_by: user.id,
            revision: 1,
          });
        }
      }
      if (bidRows.length > 0) {
        const { error: e5 } = await supabase.from("bid_prices").insert(bidRows);
        if (e5) throw e5;
      }

      // Manuel skorlar
      const manualRows: Array<{
        comparison_id: string;
        firm_id: string;
        metric_key: string;
        score: number;
        notes: null;
        updated_by: string;
      }> = [];
      for (const f of firms) {
        const firmId = firmMap.get(f.tempId)!;
        const scoresForFirm = manualScores[f.tempId] ?? {};
        for (const k of activeManualMetrics) {
          const score = scoresForFirm[k];
          if (score !== undefined && score !== null) {
            manualRows.push({
              comparison_id: comp.id,
              firm_id: firmId,
              metric_key: k,
              score,
              notes: null,
              updated_by: user.id,
            });
          }
        }
      }
      if (manualRows.length > 0) {
        const { error: e6 } = await supabase.from("firm_manual_scores").insert(manualRows);
        if (e6) throw e6;
      }

      toast.success("Karşılaştırma oluşturuldu.");
      router.push(`/comparisons/${comp.id}`);
    } catch (err) {
      console.error("[wizard save]", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Hata oluştu";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Badge variant="secondary">Adım {step} / 3</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          {step === 1 ? "Bilgi & Skorlama Metrikleri" : step === 2 ? "Firmalar & Kalemler" : "Fiyat & Manuel Skorlar"}
        </h1>
      </div>

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Karşılaştırma Bilgileri</CardTitle>
              <CardDescription>Temel bilgiler. Bütçe yok — kalem hedeflerinden otomatik hesaplanır.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. GES Mekanik Montaj 50 MWp" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tür</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => {
                      setType(v as ComparisonType);
                      setWeightsTouched(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPARISON_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Para Birimi</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notlar</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skorlama Metrikleri</CardTitle>
              <CardDescription>
                Tür değişince ön ayar otomatik gelir. İhtiyaca göre slider'larla ağırlıkları düzenle. Toplam 100 olmalı.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetricWeightsEditor weights={weights} onChange={setWeightsAndTouch} />
            </CardContent>
          </Card>

          <div className="flex justify-end lg:col-span-2">
            <Button disabled={!validStep1} onClick={() => setStep(2)}>
              İleri <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Firmalar ({firms.length})</CardTitle>
                  <CardDescription>Karşılaştırmaya katılacak firmalar</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={addFirm}>
                  <Plus className="mr-1 size-4" /> Firma
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {firms.map((f) => (
                  <div key={f.tempId} className="flex gap-2">
                    <Input
                      value={f.name}
                      onChange={(e) =>
                        setFirms((p) => p.map((x) => (x.tempId === f.tempId ? { ...x, name: e.target.value } : x)))
                      }
                      placeholder="Firma adı"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFirm(f.tempId)}
                      disabled={firms.length <= 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Kalemler ({items.length})</CardTitle>
                  <CardDescription>
                    Toplam Hedef Bütçe:{" "}
                    <span className="text-foreground font-medium">
                      {formatCompactCurrency(totalTarget, currency)}
                    </span>
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="mr-1 size-4" /> Kalem
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((it) => (
                  <div key={it.tempId} className="grid grid-cols-12 gap-2">
                    <Input
                      className="col-span-12 md:col-span-5"
                      value={it.name}
                      onChange={(e) =>
                        setItems((p) => p.map((x) => (x.tempId === it.tempId ? { ...x, name: e.target.value } : x)))
                      }
                      placeholder="Kalem adı"
                    />
                    <Select
                      value={it.category}
                      onValueChange={(v) =>
                        setItems((p) =>
                          p.map((x) => (x.tempId === it.tempId ? { ...x, category: v as ItemCategory } : x))
                        )
                      }
                    >
                      <SelectTrigger className="col-span-6 md:col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="col-span-3 md:col-span-1"
                      value={it.unit}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x) => (x.tempId === it.tempId ? { ...x, unit: e.target.value } : x))
                        )
                      }
                      placeholder="Birim"
                    />
                    <Input
                      className="col-span-3 md:col-span-1"
                      type="number"
                      inputMode="decimal"
                      value={it.qty}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x) =>
                            x.tempId === it.tempId ? { ...x, qty: Number(e.target.value) } : x
                          )
                        )
                      }
                      placeholder="Miktar"
                    />
                    <Input
                      className="col-span-3 md:col-span-1"
                      type="number"
                      inputMode="decimal"
                      value={it.target ?? ""}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x) =>
                            x.tempId === it.tempId
                              ? { ...x, target: e.target.value === "" ? null : Number(e.target.value) }
                              : x
                          )
                        )
                      }
                      placeholder="Hedef"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="col-span-3 md:col-span-1"
                      onClick={() => removeItem(it.tempId)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-1 size-4" /> Geri
            </Button>
            <Button disabled={!validStep2} onClick={() => setStep(3)}>
              İleri <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Tabs defaultValue="prices">
          <TabsList>
            <TabsTrigger value="prices">Fiyat Matrisi</TabsTrigger>
            <TabsTrigger value="manual" disabled={activeManualMetrics.length === 0}>
              Manuel Skorlar {activeManualMetrics.length > 0 && `(${activeManualMetrics.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prices">
            <Card>
              <CardHeader>
                <CardTitle>Fiyat Matrisi</CardTitle>
                <CardDescription>
                  Boş hücre &quot;teklif yok&quot; sayılır. Toplam Hedef:{" "}
                  <span className="text-foreground font-medium">
                    {formatCompactCurrency(totalTarget, currency)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium">Kalem</th>
                      {firms.map((f) => (
                        <th key={f.tempId} className="p-2 text-right font-medium">
                          {f.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.tempId} className="border-b">
                        <td className="p-2">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {it.category} · {it.qty} {it.unit}
                          </div>
                        </td>
                        {firms.map((f) => (
                          <td key={f.tempId} className="p-1">
                            <Input
                              type="number"
                              inputMode="decimal"
                              className="text-right"
                              value={prices[it.tempId]?.[f.tempId] ?? ""}
                              onChange={(e) =>
                                setPrices((p) => ({
                                  ...p,
                                  [it.tempId]: { ...(p[it.tempId] ?? {}), [f.tempId]: e.target.value },
                                }))
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Manuel Skorlar</CardTitle>
                <CardDescription>
                  Her firma için aktif metrikleri 1-10 arasında puanla. Boş bırakılan = 0.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {firms.map((f) => (
                  <div key={f.tempId} className="space-y-3 rounded-lg border p-4">
                    <h4 className="font-semibold">{f.name}</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {activeManualMetrics.map((k) => (
                        <div key={k} className="space-y-1">
                          <Label className="text-sm">
                            {METRICS[k].label}{" "}
                            <span className="text-muted-foreground">({weights[k]}%)</span>
                          </Label>
                          <ManualScoreInput
                            value={manualScores[f.tempId]?.[k] ?? null}
                            onChange={(v) =>
                              setManualScores((p) => ({
                                ...p,
                                [f.tempId]: { ...(p[f.tempId] ?? {}), [k]: v },
                              }))
                            }
                            compact
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="mr-1 size-4" /> Geri
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-1 size-4" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </Tabs>
      )}
    </div>
  );
}
