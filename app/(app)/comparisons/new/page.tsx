"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, ChevronRight, ChevronLeft, Save, Check } from "lucide-react";
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
import { METRICS, PRESETS, type MetricKey } from "@/lib/metrics";
import { MetricWeightsEditor, type Weights } from "@/components/comparison/metric-weights-editor";
import { ManualScoreInput } from "@/components/comparison/manual-score-input";
import { FirmCombobox, type FirmOption } from "@/components/comparison/firm-combobox";
import { ProjectCombobox, type ProjectOption } from "@/components/comparison/project-combobox";
import { formatCompactCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type FirmRow = { rowKey: string; firm: FirmOption | null };
type LocalItem = {
  tempId: string;
  name: string;
  category: ItemCategory;
  unit: string;
  qty: number;
  target: number | null;
};

const INPUT_BIG = "h-11 text-base";

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

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);

  // Mevcut firma + proje listeleri
  const [allFirms, setAllFirms] = useState<FirmOption[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectOption[]>([]);

  // Step 1: bilgi
  const [name, setName] = useState("");
  const [type, setType] = useState<ComparisonType>("Taşeron");
  const [currency, setCurrency] = useState<Currency>("TRY");
  const [notes, setNotes] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [weights, setWeights] = useState<Weights>(PRESETS["Taşeron"]);
  const [weightsTouched, setWeightsTouched] = useState(false);

  useEffect(() => {
    if (!weightsTouched) setWeights(PRESETS[type]);
  }, [type, weightsTouched]);

  function setWeightsAndTouch(w: Weights) {
    setWeights(w);
    setWeightsTouched(true);
  }

  // Step 2: firms + items
  const [firmRows, setFirmRows] = useState<FirmRow[]>([{ rowKey: "r1", firm: null }]);
  const [items, setItems] = useState<LocalItem[]>([
    { tempId: "i1", name: "", category: "Diğer", unit: "", qty: 1, target: null },
  ]);

  // Mevcut firma/proje yükle
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: f }, { data: p }] = await Promise.all([
        supabase.from("firms").select("id, name").order("name"),
        supabase.from("projects").select("id, name").order("name"),
      ]);
      setAllFirms(f ?? []);
      setAllProjects(p ?? []);
    })();
  }, []);

  const [templateName, setTemplateName] = useState<string | null>(null);

  // Şablon yükleme — sample_data varsa firmaları otomatik DB'ye insert eder ve state'i doldurur
  useEffect(() => {
    if (!templateId) return;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: tpl } = await supabase.from("templates").select("*").eq("id", templateId).single();
      if (!tpl) return;

      type SampleData = {
        firms: { name: string; contact_name?: string; contact_email?: string; contact_phone?: string; notes?: string }[];
        metric_weights?: Record<string, number>;
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
      const sample = tpl.sample_data as SampleData | null;

      setType(tpl.type);
      setTemplateName(tpl.name);

      // Items
      const tplItems = sample?.items ?? (Array.isArray(tpl.items) ? tpl.items : []);
      const newItems = tplItems.map(
        (it: { name: string; category: string; unit: string | null; default_qty: number; sample_target?: number | null }, idx: number) => ({
          tempId: `i${idx}-${Date.now()}`,
          name: it.name,
          category: ((ITEM_CATEGORIES as readonly string[]).includes(it.category)
            ? it.category
            : "Diğer") as ItemCategory,
          unit: it.unit ?? "",
          qty: it.default_qty,
          target: it.sample_target ?? null,
        })
      );
      setItems(newItems);

      // Metrik ağırlıkları
      if (sample?.metric_weights) {
        setWeights(sample.metric_weights as Weights);
        setWeightsTouched(true);
      }

      // Sample firma + fiyat + manuel skor varsa firmaları DB'ye yarat
      if (sample?.firms && sample.firms.length > 0) {
        const { data: insertedFirms, error } = await supabase
          .from("firms")
          .insert(
            sample.firms.map((f) => ({
              name: f.name,
              contact_name: f.contact_name ?? null,
              contact_email: f.contact_email ?? null,
              contact_phone: f.contact_phone ?? null,
              notes: f.notes ?? null,
              created_by: user.id,
            }))
          )
          .select();
        if (!error && insertedFirms) {
          setAllFirms((p) => [...p, ...insertedFirms].sort((a, b) => a.name.localeCompare(b.name, "tr")));
          setFirmRows(
            insertedFirms.map((f, idx) => ({
              rowKey: `r-tpl-${idx}`,
              firm: { id: f.id, name: f.name },
            }))
          );

          // Fiyat matrisi
          const newPrices: Record<string, Record<string, string>> = {};
          for (let i = 0; i < tplItems.length; i++) {
            const tempId = newItems[i].tempId;
            newPrices[tempId] = {};
            const samplePrices = (tplItems[i] as { sample_prices?: (number | null)[] }).sample_prices ?? [];
            for (let j = 0; j < insertedFirms.length; j++) {
              const p = samplePrices[j];
              newPrices[tempId][insertedFirms[j].id] = p !== null && p !== undefined ? String(p) : "";
            }
          }
          setPrices(newPrices);

          // Manuel skor + not
          if (sample.manual_scores) {
            const newScores: Record<string, Partial<Record<MetricKey, number>>> = {};
            const newNotes: Record<string, Partial<Record<MetricKey, string>>> = {};
            for (const ms of sample.manual_scores) {
              const fid = insertedFirms[ms.firm_index]?.id;
              if (!fid) continue;
              if (!newScores[fid]) newScores[fid] = {};
              if (!newNotes[fid]) newNotes[fid] = {};
              newScores[fid][ms.metric_key as MetricKey] = ms.score;
              if (ms.notes) newNotes[fid][ms.metric_key as MetricKey] = ms.notes;
            }
            setManualScores(newScores);
            setManualNotes(newNotes);
          }
        }
      }

      toast.success(sample?.firms ? "Şablon ve örnek veriler yüklendi." : "Şablon yüklendi.");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // Step 3: prices + manual scores (firm.id'ye göre)
  const [prices, setPrices] = useState<Record<string, Record<string, string>>>({});
  const [manualScores, setManualScores] = useState<Record<string, Partial<Record<MetricKey, number>>>>({});
  const [manualNotes, setManualNotes] = useState<Record<string, Partial<Record<MetricKey, string>>>>({});

  function addFirmRow() {
    setFirmRows((p) => [...p, { rowKey: `r${p.length}-${Date.now()}`, firm: null }]);
  }
  function removeFirmRow(rowKey: string) {
    setFirmRows((p) => p.filter((r) => r.rowKey !== rowKey));
  }
  function setFirmForRow(rowKey: string, firm: FirmOption) {
    setFirmRows((p) => p.map((r) => (r.rowKey === rowKey ? { ...r, firm } : r)));
  }
  function addItem() {
    setItems((p) => [
      ...p,
      { tempId: `i${p.length}-${Date.now()}`, name: "", category: "Diğer", unit: "", qty: 1, target: null },
    ]);
  }
  function removeItem(id: string) {
    setItems((p) => p.filter((i) => i.tempId !== id));
  }

  const selectedFirms = useMemo(
    () => firmRows.map((r) => r.firm).filter((f): f is FirmOption => f !== null),
    [firmRows]
  );
  const selectedFirmIds = selectedFirms.map((f) => f.id);

  const totalWeight = (Object.values(weights) as number[]).reduce((s, v) => s + (v ?? 0), 0);
  const totalTarget = items.reduce((sum, it) => sum + (it.target ?? 0) * it.qty, 0);

  const validStep1 =
    name.trim().length > 1 &&
    totalWeight === 100 &&
    Object.keys(weights).length > 0 &&
    projectId !== null;
  const validStep2 =
    selectedFirms.length > 0 &&
    items.length > 0 &&
    items.every((i) => i.name.trim() && i.qty > 0);

  const activeManualMetrics = useMemo(
    () =>
      (Object.keys(weights) as MetricKey[]).filter(
        (k) => METRICS[k].kind === "manual" && (weights[k] ?? 0) > 0
      ),
    [weights]
  );

  async function save(asStatus: "draft" | "in_review", skipManual = false) {
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
          status: asStatus,
          owner_id: user.id,
          project_id: projectId,
          currency,
          notes: notes || null,
        })
        .select()
        .single();
      if (e1) throw e1;

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

      // Comparison-firms (firmalar zaten kayıtlı)
      const { error: e3 } = await supabase
        .from("comparison_firms")
        .insert(selectedFirms.map((f) => ({ comparison_id: comp.id, firm_id: f.id })));
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
      const bidRows: Array<{
        comparison_id: string;
        item_id: string;
        firm_id: string;
        price: number | null;
        updated_by: string;
        revision: number;
      }> = [];
      for (const it of items) {
        for (const f of selectedFirms) {
          const raw = prices[it.tempId]?.[f.id];
          const price = raw === undefined || raw === "" ? null : Number(raw);
          bidRows.push({
            comparison_id: comp.id,
            item_id: itemMap.get(it.tempId)!,
            firm_id: f.id,
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

      // Manuel skorlar (skipManual=true ise atla)
      if (!skipManual) {
        const manualRowsToInsert: Array<{
          comparison_id: string;
          firm_id: string;
          metric_key: string;
          score: number;
          notes: string | null;
          updated_by: string;
        }> = [];
        for (const f of selectedFirms) {
          const scoresForFirm = manualScores[f.id] ?? {};
          const notesForFirm = manualNotes[f.id] ?? {};
          for (const k of activeManualMetrics) {
            const score = scoresForFirm[k];
            const note = notesForFirm[k];
            if ((score !== undefined && score !== null) || (note && note.trim())) {
              manualRowsToInsert.push({
                comparison_id: comp.id,
                firm_id: f.id,
                metric_key: k,
                score: score ?? 0,
                notes: note?.trim() || null,
                updated_by: user.id,
              });
            }
          }
        }
        if (manualRowsToInsert.length > 0) {
          const { error: e6 } = await supabase.from("firm_manual_scores").insert(manualRowsToInsert);
          if (e6) throw e6;
        }
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
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Sticky top action bar */}
      {(() => {
        const hasManualPhase = activeManualMetrics.length > 0;
        const totalSteps = hasManualPhase ? 4 : 3;
        const isLastStep = step === totalSteps;
        const stepTitles: Record<number, string> = {
          1: "Bilgi & Skorlama Metrikleri",
          2: "Firmalar & Kalemler",
          3: "Fiyat Matrisi",
          4: "Manuel Skorlar (firma puanları)",
        };
        return (
          <div className="bg-background sticky top-14 z-30 -mx-4 border-b px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <Badge variant="secondary" className="shrink-0">
                  Adım {step} / {totalSteps}
                </Badge>
                <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
                  {stepTitles[step]}
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
                    <ChevronLeft className="mr-1 size-4" /> Geri
                  </Button>
                )}
                {!isLastStep ? (
                  <Button
                    disabled={(step === 1 && !validStep1) || (step === 2 && !validStep2)}
                    onClick={() => setStep((step + 1) as 2 | 3 | 4)}
                  >
                    İleri <ChevronRight className="ml-1 size-4" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => save("draft")} disabled={saving}>
                      Taslak Kaydet
                    </Button>
                    <Button onClick={() => save("in_review")} disabled={saving}>
                      <Save className="mr-1 size-4" />
                      {saving ? "Kaydediliyor..." : "Tamamla & Kaydet"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    step >= i + 1 ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        );
      })()}

      {templateName && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium uppercase">Şablon</span>
          <span>
            <strong>{templateName}</strong> şablonundan başlatıldı. Aşağıdaki firma, fiyat ve skorlar otomatik yüklendi
            — istediğin gibi düzenleyebilirsin.
          </span>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Karşılaştırma Bilgileri</CardTitle>
              <CardDescription>
                Bütçe alanı yok — kalem hedeflerini girince otomatik hesaplanır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Başlık *</Label>
                <Input
                  className={INPUT_BIG}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn. GES Mekanik Montaj 50 MWp"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Proje *</Label>
                <ProjectCombobox
                  options={allProjects}
                  selectedId={projectId}
                  onSelect={(p) => setProjectId(p?.id ?? null)}
                  onProjectCreated={(p) => setAllProjects((prev) => [...prev, p])}
                  allowNone={false}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Tür *</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => {
                      setType(v as ComparisonType);
                      setWeightsTouched(false);
                    }}
                  >
                    <SelectTrigger className={INPUT_BIG}>
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
                <div className="space-y-1.5">
                  <Label className="text-sm">Para Birimi</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger className={INPUT_BIG}>
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
              <div className="space-y-1.5">
                <Label className="text-sm">Notlar</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skorlama Metrikleri</CardTitle>
              <CardDescription>
                Tür değişince ön ayar gelir. &quot;+Metrik Ekle&quot; ile yeni metrik ekleyebilir, X ile çıkarabilirsin.
                Toplam ağırlık 100 olmalı.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetricWeightsEditor weights={weights} onChange={setWeightsAndTouch} />
            </CardContent>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Firmalar ({selectedFirms.length})</CardTitle>
                <CardDescription>
                  Yaz ara veya yeni ekle. Firmalar diğer karşılaştırmalarda da kullanılır.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={addFirmRow}>
                <Plus className="mr-1 size-4" /> Satır
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {firmRows.map((row) => (
                <div key={row.rowKey} className="flex gap-2">
                  <div className="flex-1">
                    <FirmCombobox
                      options={allFirms}
                      selectedId={row.firm?.id ?? null}
                      onSelect={(f) => setFirmForRow(row.rowKey, f)}
                      onFirmCreated={(f) => setAllFirms((p) => [...p, f].sort((a, b) => a.name.localeCompare(b.name, "tr")))}
                      excludeIds={selectedFirmIds.filter((id) => id !== row.firm?.id)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => removeFirmRow(row.rowKey)}
                    disabled={firmRows.length <= 1}
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
                  Toplam Hedef:{" "}
                  <span className="text-foreground font-medium">
                    {formatCompactCurrency(totalTarget, currency)}
                  </span>
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="mr-1 size-4" /> Kalem
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((it) => (
                <div key={it.tempId} className="space-y-2 rounded-lg border p-3">
                  <Input
                    className={INPUT_BIG}
                    value={it.name}
                    onChange={(e) =>
                      setItems((p) => p.map((x) => (x.tempId === it.tempId ? { ...x, name: e.target.value } : x)))
                    }
                    placeholder="Kalem adı (örn. Panel Montajı)"
                  />
                  <div className="grid grid-cols-12 gap-2">
                    <Select
                      value={it.category}
                      onValueChange={(v) =>
                        setItems((p) =>
                          p.map((x) => (x.tempId === it.tempId ? { ...x, category: v as ItemCategory } : x))
                        )
                      }
                    >
                      <SelectTrigger className={cn(INPUT_BIG, "col-span-12 md:col-span-4")}>
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
                      className={cn(INPUT_BIG, "col-span-4 md:col-span-2")}
                      value={it.unit}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x) => (x.tempId === it.tempId ? { ...x, unit: e.target.value } : x))
                        )
                      }
                      placeholder="Birim"
                    />
                    <Input
                      className={cn(INPUT_BIG, "col-span-4 md:col-span-2")}
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
                      className={cn(INPUT_BIG, "col-span-4 md:col-span-3")}
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
                      placeholder="Hedef fiyat"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="col-span-12 h-11 w-full md:col-span-1 md:w-11"
                      onClick={() => removeItem(it.tempId)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Fiyat Matrisi</CardTitle>
            <CardDescription>
              Her kalem için her firmanın birim fiyatını gir. Boş hücre &quot;teklif yok&quot; sayılır. Toplam Hedef:{" "}
              <span className="text-foreground font-medium">
                {formatCompactCurrency(totalTarget, currency)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-sm font-medium">Kalem</th>
                  {selectedFirms.map((f) => (
                    <th key={f.id} className="p-2 text-right text-sm font-medium">
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
                    {selectedFirms.map((f) => (
                      <td key={f.id} className="p-1.5">
                        <Input
                          type="number"
                          inputMode="decimal"
                          className={cn(INPUT_BIG, "text-right")}
                          value={prices[it.tempId]?.[f.id] ?? ""}
                          onChange={(e) =>
                            setPrices((p) => ({
                              ...p,
                              [it.tempId]: { ...(p[it.tempId] ?? {}), [f.id]: e.target.value },
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
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Manuel Skorlar — Firma Puanlama</CardTitle>
            <CardDescription>
              Adım 1&apos;de seçtiğin manuel metriklere göre her firmaya 1-10 puan + açıklama notu gir. Notlar sonradan
              firma profilinde gözükür ({activeManualMetrics.length} aktif metrik × {selectedFirms.length} firma).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedFirms.map((f) => (
              <div key={f.id} className="space-y-3 rounded-lg border p-4">
                <h4 className="text-base font-semibold">{f.name}</h4>
                <div className="space-y-4">
                  {activeManualMetrics.map((k) => (
                    <div key={k} className="space-y-1.5">
                      <Label className="text-sm">
                        {METRICS[k].label}{" "}
                        <span className="text-muted-foreground">({weights[k]}%)</span>
                      </Label>
                      <ManualScoreInput
                        value={manualScores[f.id]?.[k] ?? null}
                        onChange={(v) =>
                          setManualScores((p) => ({
                            ...p,
                            [f.id]: { ...(p[f.id] ?? {}), [k]: v },
                          }))
                        }
                        notes={manualNotes[f.id]?.[k] ?? ""}
                        onNotesChange={(v) =>
                          setManualNotes((p) => ({
                            ...p,
                            [f.id]: { ...(p[f.id] ?? {}), [k]: v },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary alttan da gelsin (uzun sayfalarda) */}
      {step === 1 && validStep1 && (
        <div className="flex items-center justify-end gap-2 rounded-lg border bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="size-4" /> Bilgiler tamam — yukarıdaki &quot;İleri&quot; ile devam et.
        </div>
      )}
    </div>
  );
}
