"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * 5 seçimli kalite skoru: Riskli (10) · Zayıf (30) · Orta (50) · İyi (75) · Çok İyi (100)
 * Backend'de 0-100 saklanır.
 */
const OPTIONS = [
  { value: 10, label: "Riskli", short: "Risk", tone: "rose" as const },
  { value: 30, label: "Zayıf", short: "Zayıf", tone: "orange" as const },
  { value: 50, label: "Orta", short: "Orta", tone: "amber" as const },
  { value: 75, label: "İyi", short: "İyi", tone: "blue" as const },
  { value: 100, label: "Çok İyi", short: "Çok İyi", tone: "emerald" as const },
];

const TONE_CLASSES = {
  rose: {
    selected: "bg-rose-600 text-white border-rose-600",
    hover: "hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700",
    base: "border-rose-200 text-rose-700",
  },
  orange: {
    selected: "bg-orange-500 text-white border-orange-500",
    hover: "hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700",
    base: "border-orange-200 text-orange-700",
  },
  amber: {
    selected: "bg-yellow-500 text-white border-yellow-500",
    hover: "hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700",
    base: "border-yellow-200 text-yellow-700",
  },
  blue: {
    selected: "bg-blue-600 text-white border-blue-600",
    hover: "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
    base: "border-blue-200 text-blue-700",
  },
  emerald: {
    selected: "bg-emerald-600 text-white border-emerald-600",
    hover: "hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700",
    base: "border-emerald-200 text-emerald-700",
  },
};

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
  // Closest option seç (manuel skor 0-100 değer alabilir; biz preset'lere bağla)
  const closestValue = value === null ? null : OPTIONS.reduce((p, o) => (Math.abs(o.value - value) < Math.abs(p.value - value) ? o : p)).value;

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div className="grid grid-cols-5 gap-1.5">
        {OPTIONS.map((opt) => {
          const tone = TONE_CLASSES[opt.tone];
          const selected = closestValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-md border-2 px-2 py-2 text-xs font-medium transition-all",
                selected ? tone.selected : `bg-background ${tone.base} ${tone.hover}`
              )}
            >
              <div className={cn("font-semibold", compact ? "text-xs" : "text-sm")}>{opt.short}</div>
            </button>
          );
        })}
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

/** Skor → label mapping (görünüm için) */
export function scoreToLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return "—";
  if (score >= 90) return "Çok İyi";
  if (score >= 65) return "İyi";
  if (score >= 40) return "Orta";
  if (score >= 20) return "Zayıf";
  return "Riskli";
}

export function scoreToTone(
  score: number | null | undefined
): "emerald" | "blue" | "amber" | "orange" | "rose" | "muted" {
  if (score === null || score === undefined) return "muted";
  if (score >= 90) return "emerald";
  if (score >= 65) return "blue";
  if (score >= 40) return "amber";
  if (score >= 20) return "orange";
  return "rose";
}
