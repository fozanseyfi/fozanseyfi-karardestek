"use client";

import { Plus, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ALL_METRICS, type MetricKey, METRICS } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export type Weights = Partial<Record<MetricKey, number>>;

export function MetricWeightsEditor({
  weights,
  onChange,
}: {
  weights: Weights;
  onChange: (next: Weights) => void;
}) {
  const activeKeys = (Object.keys(weights) as MetricKey[]).filter((k) => (weights[k] ?? 0) >= 0);
  const inactiveKeys = (Object.keys(METRICS) as MetricKey[]).filter((k) => !(k in weights));
  const total = activeKeys.reduce((sum, k) => sum + (weights[k] ?? 0), 0);

  function set(key: MetricKey, value: number) {
    onChange({ ...weights, [key]: Math.max(0, Math.min(100, Math.round(value))) });
  }

  function add(key: MetricKey) {
    onChange({ ...weights, [key]: 10 });
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
    // Düzeltme: rounding sonrası toplam 99 veya 101 olabilir; ilk metriğe ekle/çıkar
    let normalizedTotal = activeKeys.reduce((s, k) => s + (next[k] ?? 0), 0);
    if (activeKeys.length > 0 && normalizedTotal !== 100) {
      const diff = 100 - normalizedTotal;
      next[activeKeys[0]] = (next[activeKeys[0]] ?? 0) + diff;
    }
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={total === 100 ? "default" : "destructive"}
            className={total === 100 ? "bg-emerald-600" : ""}
          >
            Toplam: {total}/100
          </Badge>
          {total !== 100 && (
            <Button size="sm" variant="outline" onClick={normalizeTo100}>
              100'e Normalize Et
            </Button>
          )}
        </div>
        {inactiveKeys.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 size-4" /> Metrik Ekle
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {inactiveKeys.map((k) => (
                <DropdownMenuItem key={k} onClick={() => add(k)}>
                  <span className={cn(METRICS[k].kind === "auto" && "font-medium")}>
                    {METRICS[k].label}
                  </span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {METRICS[k].kind === "auto" ? "(otomatik)" : "(manuel)"}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => remove(key)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground mb-2 text-xs">{def.description}</p>
              <Slider
                value={[value]}
                onValueChange={(v) => set(key, v[0])}
                max={60}
                min={0}
                step={1}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
