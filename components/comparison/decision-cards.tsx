"use client";

import { Award, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompactCurrency, formatPercent } from "@/lib/currency";
import type { Currency } from "@/lib/constants";
import type { ComparisonStats, FirmStats } from "@/lib/scoring";

export function DecisionCards({
  stats,
  currency,
}: {
  stats: ComparisonStats;
  currency: Currency;
}) {
  const recommended = stats.firms.find((f) => f.firmId === stats.recommendedFirmId);
  const lowest = stats.firms.find((f) => f.firmId === stats.lowestFirmId);
  const highDev = [...stats.firms]
    .filter((f) => f.absDev !== null)
    .sort((a, b) => (b.absDev ?? 0) - (a.absDev ?? 0))[0];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recommended && recommended.recommendation !== "incomplete" && (
        <DecisionCard
          tone="good"
          icon={Award}
          title="Önerilen Firma"
          firm={recommended}
          subtitle={`Skor ${recommended.score.toFixed(1)} · Kapsam ${formatPercent(recommended.scope, 0)}`}
          value={formatCompactCurrency(recommended.weightedTotal, currency)}
        />
      )}
      {lowest && (
        <DecisionCard
          tone="info"
          icon={TrendingDown}
          title="En Düşük Toplam"
          firm={lowest}
          subtitle="Toplam ağırlıklı bedel en düşük olan teklif"
          value={formatCompactCurrency(lowest.weightedTotal, currency)}
        />
      )}
      {highDev && highDev.absDev !== null && highDev.absDev > 0.1 && (
        <DecisionCard
          tone="warn"
          icon={AlertTriangle}
          title="Yüksek Sapma"
          firm={highDev}
          subtitle="Medyandan büyük sapmayla dikkat çekiyor"
          value={formatPercent(highDev.absDev, 1)}
        />
      )}
      <Card>
        <CardContent className="flex gap-3 p-5">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded">
            <Info className="size-5" />
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Toplam Kalem</div>
            <div className="text-2xl font-semibold">{stats.itemCount}</div>
            <div className="text-muted-foreground text-xs">{stats.firms.length} firma karşılaştırılıyor</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DecisionCard({
  tone,
  icon: Icon,
  title,
  firm,
  subtitle,
  value,
}: {
  tone: "good" | "info" | "warn";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  firm: FirmStats;
  subtitle: string;
  value: string;
}) {
  const toneClasses = {
    good: "bg-emerald-50 text-emerald-700 border-emerald-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
  }[tone];

  return (
    <Card className={`border ${toneClasses}`}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Icon className="size-4" />
          <span className="text-xs font-semibold tracking-wide uppercase">{title}</span>
        </div>
        <div>
          <div className="text-lg font-semibold">{firm.firmName}</div>
          <div className="text-xs opacity-80">{subtitle}</div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
