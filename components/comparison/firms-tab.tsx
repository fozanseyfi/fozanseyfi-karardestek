"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { formatCompactCurrency, formatPercent } from "@/lib/currency";
import { ScoreBreakdown } from "@/components/comparison/score-breakdown";
import { FirmDetailDialog } from "@/components/comparison/firm-detail-dialog";
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
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="p-3 text-left font-medium">Firma</th>
                <th className="p-3 text-left font-medium">İletişim</th>
                <th className="p-3 text-right font-medium">Skor</th>
                <th className="p-3 text-right font-medium">Toplam Bedel</th>
                <th className="p-3 text-right font-medium">Kapsam</th>
                <th className="p-3 text-center font-medium">Not</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {firmInfos.map((f) => {
                const fs = stats.firms.find((s) => s.firmId === f.id);
                const noteCount = manualScores.filter((m) => m.firm_id === f.id && m.notes).length;
                return (
                  <tr
                    key={f.id}
                    className="hover:bg-muted/30 cursor-pointer border-b transition-colors"
                    onClick={() => setOpenFirmId(f.id)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{f.name}</span>
                        {fs?.isOutlier && (
                          <Badge variant="destructive" className="text-[10px]">
                            ANOMALİ
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-xs">
                      {f.contact_name && <div>{f.contact_name}</div>}
                      <div className="text-muted-foreground flex flex-col gap-0.5">
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
                    </td>
                    <td className="p-3 text-right">
                      {fs ? (
                        <span
                          className={cn(
                            "text-lg font-bold tabular-nums",
                            fs.recommendation === "good" && "text-emerald-700",
                            fs.recommendation === "warning" && "text-yellow-700",
                            fs.recommendation === "danger" && "text-rose-700"
                          )}
                        >
                          {fs.totalScore.toFixed(1)}
                          <span className="text-muted-foreground text-xs"> / 100</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {fs ? formatCompactCurrency(fs.weightedTotal, currency) : "—"}
                    </td>
                    <td className="p-3 text-right tabular-nums">{fs ? formatPercent(fs.scope, 0) : "—"}</td>
                    <td className="p-3 text-center">
                      {noteCount > 0 ? (
                        <Badge variant="outline">{noteCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/firms/${f.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

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
