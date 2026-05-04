"use client";

import { useState } from "react";
import { Check, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ALL_METRICS, type MetricKey, METRICS } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export type Weights = Partial<Record<MetricKey, number>>;

type Phase = "select" | "weight";

export function MetricWeightsEditor({
  weights,
  onChange,
}: {
  weights: Weights;
  onChange: (next: Weights) => void;
}) {
  const activeKeys = (Object.keys(weights) as MetricKey[]).filter((k) => (weights[k] ?? 0) >= 0);
  const total = activeKeys.reduce((sum, k) => sum + (weights[k] ?? 0), 0);
  const [phase, setPhase] = useState<Phase>(activeKeys.length === 0 ? "select" : "weight");

  function toggle(key: MetricKey, checked: boolean) {
    const next = { ...weights };
    if (checked) {
      next[key] = next[key] ?? 10;
    } else {
      delete next[key];
    }
    onChange(next);
  }

  function setWeight(key: MetricKey, value: number) {
    onChange({ ...weights, [key]: Math.max(0, Math.min(100, Math.round(value))) });
  }

  function remove(key: MetricKey) {
    const next = { ...weights };
    delete next[key];
    onChange(next);
  }

  function normalizeTo100() {
    if (total === 0) return;
    const factor = 100 / total;
    const next: Weights = {};
    for (const k of activeKeys) {
      next[k] = Math.round((weights[k] ?? 0) * factor);
    }
    let normalizedTotal = activeKeys.reduce((s, k) => s + (next[k] ?? 0), 0);
    if (activeKeys.length > 0 && normalizedTotal !== 100) {
      const diff = 100 - normalizedTotal;
      next[activeKeys[0]] = (next[activeKeys[0]] ?? 0) + diff;
    }
    onChange(next);
  }

  const autoMetrics = ALL_METRICS.filter((m) => m.kind === "auto");
  const manualMetrics = ALL_METRICS.filter((m) => m.kind === "manual");

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setPhase("select")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
            phase === "select" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          )}
        >
          <span className="bg-background/20 flex size-5 items-center justify-center rounded-full text-xs font-bold">
            1
          </span>
          Metrik Seç ({activeKeys.length})
        </button>
        <ChevronRight className="text-muted-foreground size-4" />
        <button
          type="button"
          onClick={() => activeKeys.length > 0 && setPhase("weight")}
          disabled={activeKeys.length === 0}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
            phase === "weight" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            activeKeys.length === 0 && "cursor-not-allowed opacity-40"
          )}
        >
          <span className="bg-background/20 flex size-5 items-center justify-center rounded-full text-xs font-bold">
            2
          </span>
          Ağırlık Ayarla
        </button>
        <div className="ml-auto">
          <Badge
            variant={total === 100 ? "default" : phase === "weight" ? "destructive" : "outline"}
            className={total === 100 ? "bg-emerald-600" : ""}
          >
            {total}/100
          </Badge>
        </div>
      </div>

      {/* PHASE 1: SELECT */}
      {phase === "select" && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Bu karşılaştırmada hangi kriterlerle karar vereceksin? Sadece fiyat odaklıysa &quot;Hedef Sapma&quot; veya
            &quot;En Düşük Teklif&quot; tek başına yeterli; çok kriterli karar için kalite, referans gibi metrikler ekle.
          </p>

          <div className="space-y-3">
            <div>
              <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase">Otomatik Metrikler</h4>
              <p className="text-muted-foreground mb-2 text-xs">Sistem fiyatlardan hesaplar, kullanıcı veri girmez.</p>
              <div className="grid gap-2 md:grid-cols-2">
                {autoMetrics.map((m) => (
                  <MetricChoice
                    key={m.key}
                    metric={m}
                    selected={m.key in weights}
                    onToggle={(checked) => toggle(m.key, checked)}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase">Manuel Metrikler</h4>
              <p className="text-muted-foreground mb-2 text-xs">Her firma için 1-10 puan ve not girersin.</p>
              <div className="grid gap-2 md:grid-cols-2">
                {manualMetrics.map((m) => (
                  <MetricChoice
                    key={m.key}
                    metric={m}
                    selected={m.key in weights}
                    onToggle={(checked) => toggle(m.key, checked)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setPhase("weight")}
              disabled={activeKeys.length === 0}
            >
              Ağırlıkları Ayarla <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* PHASE 2: WEIGHTS */}
      {phase === "weight" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Button size="sm" variant="ghost" onClick={() => setPhase("select")}>
              <ChevronLeft className="mr-1 size-4" /> Metrik Seçimine Dön
            </Button>
            {total !== 100 && (
              <Button size="sm" variant="outline" onClick={normalizeTo100}>
                100&apos;e Normalize Et
              </Button>
            )}
          </div>

          {activeKeys.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Önce metrik seç.
            </p>
          ) : (
            <div className="space-y-3">
              {activeKeys.map((key) => {
                const def = METRICS[key];
                const value = weights[key] ?? 0;
                return (
                  <div key={key} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">{def.label}</Label>
                        <Badge variant="outline" className="text-xs">
                          {def.kind === "auto" ? "Otomatik" : "Manuel"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{value}%</span>
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => remove(key)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(v) => setWeight(key, v[0])}
                      max={100}
                      min={0}
                      step={1}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricChoice({
  metric,
  selected,
  onToggle,
}: {
  metric: { key: MetricKey; label: string; description: string };
  selected: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!selected)}
      className={cn(
        "flex items-start gap-2 rounded-lg border p-3 text-left transition-all",
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
        )}
      >
        {selected && <Check className="size-3" />}
      </div>
      <div>
        <div className="text-sm font-medium">{metric.label}</div>
        <div className="text-muted-foreground text-xs">{metric.description}</div>
      </div>
    </button>
  );
}
