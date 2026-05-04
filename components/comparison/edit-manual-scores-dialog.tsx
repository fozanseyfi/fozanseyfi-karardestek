"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sliders, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { METRICS, type MetricKey } from "@/lib/metrics";
import { ManualScoreInput } from "@/components/comparison/manual-score-input";

type FirmRef = { id: string; name: string };
type InitialScores = Record<string, Partial<Record<MetricKey, { score: number; notes: string | null }>>>;

export function EditManualScoresDialog({
  comparisonId,
  firms,
  metrics,
  initialScores,
}: {
  comparisonId: string;
  firms: FirmRef[];
  metrics: MetricKey[]; // sadece manuel olanlar
  initialScores: InitialScores;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<InitialScores>(initialScores);
  const [saving, setSaving] = useState(false);

  function set(firmId: string, key: MetricKey, partial: { score?: number; notes?: string }) {
    setScores((p) => {
      const firmScores = p[firmId] ?? {};
      const existing = firmScores[key] ?? { score: 0, notes: null };
      return {
        ...p,
        [firmId]: {
          ...firmScores,
          [key]: {
            score: partial.score !== undefined ? partial.score : existing.score,
            notes: partial.notes !== undefined ? partial.notes : existing.notes,
          },
        },
      };
    });
  }

  async function save() {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum yok");

      // upsert: tüm aktif metrikler × firmalar
      const rows: Array<{
        comparison_id: string;
        firm_id: string;
        metric_key: string;
        score: number;
        notes: string | null;
        updated_by: string;
      }> = [];
      for (const f of firms) {
        for (const k of metrics) {
          const entry = scores[f.id]?.[k];
          if (entry !== undefined && entry.score !== null && entry.score !== undefined) {
            rows.push({
              comparison_id: comparisonId,
              firm_id: f.id,
              metric_key: k,
              score: entry.score,
              notes: entry.notes ?? null,
              updated_by: user.id,
            });
          }
        }
      }
      if (rows.length === 0) {
        toast.message("Değişiklik yok");
        setOpen(false);
        return;
      }
      const { error } = await supabase
        .from("firm_manual_scores")
        .upsert(rows, { onConflict: "comparison_id,firm_id,metric_key" });
      if (error) throw error;

      toast.success("Manuel skorlar güncellendi.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("[edit manual]", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Hata";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (metrics.length === 0) return null;
  if (firms.length === 0) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setScores(initialScores);
      }}
    >
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Sliders className="mr-1 size-4" /> Manuel Skorları Düzenle
      </Button>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manuel Skorları Düzenle</DialogTitle>
          <DialogDescription>
            Her firma için her metrik 1-10 puan + opsiyonel açıklama. Notlar firma profilinde de gözükür.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={firms[0].id}>
          <TabsList className="flex h-auto flex-wrap">
            {firms.map((f) => (
              <TabsTrigger key={f.id} value={f.id}>
                {f.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {firms.map((f) => (
            <TabsContent key={f.id} value={f.id} className="max-h-[55vh] space-y-4 overflow-y-auto pr-2">
              {metrics.map((k) => (
                <div key={k} className="space-y-2 rounded-lg border p-3">
                  <Label className="text-sm font-medium">{METRICS[k].label}</Label>
                  <p className="text-muted-foreground text-xs">{METRICS[k].description}</p>
                  <ManualScoreInput
                    value={scores[f.id]?.[k]?.score ?? null}
                    onChange={(v) => set(f.id, k, { score: v })}
                  />
                  <Textarea
                    rows={2}
                    placeholder={`${METRICS[k].label} hakkında not (örn. ödeme şartı: peşin %30, vade 60 gün; veya: ISO 9001 sahibi)`}
                    value={scores[f.id]?.[k]?.notes ?? ""}
                    onChange={(e) => set(f.id, k, { notes: e.target.value })}
                  />
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            İptal
          </Button>
          <Button onClick={save} disabled={saving}>
            <Save className="mr-1 size-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
