"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { ScoreBreakdown } from "@/components/comparison/score-breakdown";
import { FirmDetailDialog } from "@/components/comparison/firm-detail-dialog";
import { formatCompactCurrency, formatPercent } from "@/lib/currency";
import type { Currency } from "@/lib/constants";
import type { ComparisonStats } from "@/lib/scoring";
import type { MetricKey } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export type FirmInfo = {
  id: string;
  name: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
};

export type ManualScoreRow = {
  firm_id: string;
  metric_key: MetricKey;
  score: number;
  notes: string | null;
};

/** Hem Skor Dökümü hem Firmalar tab'ında firma adı/kart tıklanınca dialog açar. */
export function ScoreBreakdownClient({
  stats,
  firmInfos,
  manualScores,
  weights,
  currency,
}: {
  stats: ComparisonStats;
  firmInfos: FirmInfo[];
  manualScores: ManualScoreRow[];
  weights: Partial<Record<MetricKey, number>>;
  currency: Currency;
}) {
  const [openFirmId, setOpenFirmId] = useState<string | null>(null);
  const openFirm = firmInfos.find((f) => f.id === openFirmId) ?? null;
  const openFirmStats = stats.firms.find((f) => f.firmId === openFirmId) ?? null;
  const openFirmScores = manualScores.filter((m) => m.firm_id === openFirmId);

  return (
    <>
      <ScoreBreakdown stats={stats} onFirmClick={setOpenFirmId} />
      <FirmDetailDialog
        open={openFirmId !== null}
        onOpenChange={(o) => !o && setOpenFirmId(null)}
        firm={openFirm}
        firmStats={openFirmStats}
        manualScores={openFirmScores}
        weights={weights}
        currency={currency}
      />
    </>
  );
}

export function FirmsTabClient({
  stats,
  firmInfos,
  manualScores,
  weights,
  currency,
}: {
  stats: ComparisonStats;
  firmInfos: FirmInfo[];
  manualScores: ManualScoreRow[];
  weights: Partial<Record<MetricKey, number>>;
  currency: Currency;
}) {
  const [openFirmId, setOpenFirmId] = useState<string | null>(null);
  const openFirm = firmInfos.find((f) => f.id === openFirmId) ?? null;
  const openFirmStats = stats.firms.find((f) => f.firmId === openFirmId) ?? null;
  const openFirmScores = manualScores.filter((m) => m.firm_id === openFirmId);

  return (
    <>
      <div className="space-y-3">
        {firmInfos.map((f) => {
          const fs = stats.firms.find((s) => s.firmId === f.id);
          const noteCount = manualScores.filter((m) => m.firm_id === f.id && m.notes).length;
          return (
            <Card
              key={f.id}
              className="hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => setOpenFirmId(f.id)}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{f.name}</h3>
                      {fs?.isOutlier && (
                        <Badge variant="destructive" className="text-xs">
                          ANOMALİ
                        </Badge>
                      )}
                      {noteCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {noteCount} not
                        </Badge>
                      )}
                    </div>
                    {f.contact_name && (
                      <div className="text-muted-foreground mt-0.5 text-sm">{f.contact_name}</div>
                    )}
                    <div className="text-muted-foreground mt-1 flex flex-wrap gap-3 text-xs">
                      {f.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" /> {f.contact_email}
                        </span>
                      )}
                      {f.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3" /> {f.contact_phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/firms/${f.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </div>

                {fs && (
                  <div className="grid grid-cols-3 gap-2 border-t pt-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Skor</div>
                      <div
                        className={cn(
                          "text-lg font-bold tabular-nums",
                          fs.recommendation === "good" && "text-emerald-700",
                          fs.recommendation === "warning" && "text-amber-700",
                          fs.recommendation === "danger" && "text-rose-700"
                        )}
                      >
                        {fs.totalScore.toFixed(1)} <span className="text-muted-foreground text-xs">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Toplam Bedel</div>
                      <div className="text-base font-semibold tabular-nums">
                        {formatCompactCurrency(fs.weightedTotal, currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Kapsam</div>
                      <div className="text-base font-semibold tabular-nums">{formatPercent(fs.scope, 0)}</div>
                    </div>
                  </div>
                )}

                {f.notes && <p className="text-muted-foreground line-clamp-2 text-sm">{f.notes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <FirmDetailDialog
        open={openFirmId !== null}
        onOpenChange={(o) => !o && setOpenFirmId(null)}
        firm={openFirm}
        firmStats={openFirmStats}
        manualScores={openFirmScores}
        weights={weights}
        currency={currency}
      />
    </>
  );
}
