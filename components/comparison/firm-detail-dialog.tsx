"use client";

import { Mail, Phone, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { METRICS, scoreLabel, hundredToTen, type MetricKey } from "@/lib/metrics";
import { formatCompactCurrency, formatPercent } from "@/lib/currency";
import type { Currency } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FirmStats } from "@/lib/scoring";

type FirmInfo = {
  id: string;
  name: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
};

type ManualScore = {
  metric_key: MetricKey;
  score: number;
  notes: string | null;
};

export function FirmDetailDialog({
  open,
  onOpenChange,
  firm,
  firmStats,
  manualScores,
  weights,
  currency,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  firm: FirmInfo | null;
  firmStats: FirmStats | null;
  manualScores: ManualScore[];
  weights: Partial<Record<MetricKey, number>>;
  currency: Currency;
}) {
  if (!firm) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {firm.name}
            {firmStats && firmStats.isOutlier && (
              <Badge variant="destructive" className="text-xs">ANOMALİ</Badge>
            )}
          </DialogTitle>
          <DialogDescription>Firma profili, manuel skorlar ve değerlendirme notları</DialogDescription>
        </DialogHeader>

        {/* İletişim */}
        <div className="rounded-lg border p-3 text-sm">
          {firm.contact_name && <div className="font-medium">{firm.contact_name}</div>}
          <div className="text-muted-foreground mt-1 flex flex-wrap gap-3">
            {firm.contact_email && (
              <a href={`mailto:${firm.contact_email}`} className="flex items-center gap-1 hover:underline">
                <Mail className="size-3" /> {firm.contact_email}
              </a>
            )}
            {firm.contact_phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3" /> {firm.contact_phone}
              </span>
            )}
          </div>
          {firm.notes && <p className="text-foreground mt-2 whitespace-pre-line">{firm.notes}</p>}
        </div>

        {/* Skor özeti */}
        {firmStats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded border p-2">
              <div className="text-muted-foreground text-xs">Toplam Skor</div>
              <div className="text-2xl font-bold">{firmStats.totalScore.toFixed(1)}</div>
            </div>
            <div className="rounded border p-2">
              <div className="text-muted-foreground text-xs">Toplam Bedel</div>
              <div className="text-lg font-semibold">{formatCompactCurrency(firmStats.weightedTotal, currency)}</div>
            </div>
            <div className="rounded border p-2">
              <div className="text-muted-foreground text-xs">Kapsam</div>
              <div className="text-lg font-semibold">{formatPercent(firmStats.scope, 0)}</div>
            </div>
          </div>
        )}

        {/* Manuel skor notları */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Manuel Skorlar & Notlar</h4>
          {manualScores.length === 0 ? (
            <div className="text-muted-foreground rounded border border-dashed p-4 text-center text-sm">
              <FileText className="mx-auto size-6 opacity-50" />
              <p className="mt-1">Bu firma için manuel skor/not henüz girilmemiş.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {manualScores.map((m) => {
                const tenVal = hundredToTen(m.score);
                const weight = weights[m.metric_key] ?? 0;
                return (
                  <li key={m.metric_key} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{METRICS[m.metric_key]?.label ?? m.metric_key}</div>
                        <div className="text-muted-foreground text-xs">
                          {METRICS[m.metric_key]?.description}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          %{weight}
                        </Badge>
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-sm font-semibold tabular-nums",
                            tenVal >= 7
                              ? "bg-emerald-100 text-emerald-700"
                              : tenVal >= 5
                                ? "bg-blue-100 text-blue-700"
                                : tenVal >= 3
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-rose-100 text-rose-700"
                          )}
                        >
                          {tenVal}/10 · {scoreLabel(tenVal)}
                        </span>
                      </div>
                    </div>
                    {m.notes && (
                      <p className="bg-muted/50 mt-2 rounded p-2 text-sm whitespace-pre-line">{m.notes}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
