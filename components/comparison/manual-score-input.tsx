"use client";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { hundredToTen, scoreLabel, tenToHundred } from "@/lib/metrics";
import { cn } from "@/lib/utils";

/**
 * 1-10 numerical slider with qualitative label (Mükemmel/ÇokIyi/İyi/Orta/Zayıf).
 * Backing value stored 0-100; UI works on 1-10 scale.
 */
export function ManualScoreInput({
  value,
  onChange,
  notes,
  onNotesChange,
  compact = false,
}: {
  value: number | null;
  onChange: (v: number) => void;
  notes?: string;
  onNotesChange?: (v: string) => void;
  compact?: boolean;
}) {
  const tenVal = value === null ? 0 : hundredToTen(value);
  const labelText = tenVal > 0 ? scoreLabel(tenVal) : "—";
  const labelTone =
    tenVal >= 7
      ? "bg-emerald-100 text-emerald-700"
      : tenVal >= 5
        ? "bg-blue-100 text-blue-700"
        : tenVal >= 3
          ? "bg-amber-100 text-amber-700"
          : tenVal >= 1
            ? "bg-rose-100 text-rose-700"
            : "bg-muted text-muted-foreground";

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      <div className="flex items-center gap-3">
        <Slider
          value={[tenVal]}
          onValueChange={(v) => onChange(tenToHundred(v[0]))}
          min={0}
          max={10}
          step={1}
          className="flex-1"
        />
        <span className="w-10 text-right text-sm font-semibold tabular-nums">{tenVal}/10</span>
        <Badge className={cn("min-w-20 justify-center text-xs font-medium", labelTone)} variant="secondary">
          {labelText}
        </Badge>
      </div>
      {onNotesChange && !compact && (
        <Input
          value={notes ?? ""}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Açıklama / not (opsiyonel)"
          className="text-xs"
        />
      )}
    </div>
  );
}
