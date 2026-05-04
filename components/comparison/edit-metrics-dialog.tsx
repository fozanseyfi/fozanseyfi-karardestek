"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { MetricWeightsEditor, type Weights } from "@/components/comparison/metric-weights-editor";
import type { MetricKey } from "@/lib/metrics";

export function EditMetricsDialog({
  comparisonId,
  initialWeights,
}: {
  comparisonId: string;
  initialWeights: Weights;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [weights, setWeights] = useState<Weights>(initialWeights);
  const [saving, setSaving] = useState(false);

  const total = (Object.values(weights) as number[]).reduce((s, v) => s + (v ?? 0), 0);

  async function save() {
    if (total !== 100) {
      toast.error("Toplam ağırlık 100 olmalı.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      // Eskiyi sil, yeniyi ekle (transactional değil ama OK)
      const { error: e1 } = await supabase
        .from("comparison_metrics")
        .delete()
        .eq("comparison_id", comparisonId);
      if (e1) throw e1;

      const newRows = (Object.keys(weights) as MetricKey[])
        .filter((k) => (weights[k] ?? 0) > 0)
        .map((k, idx) => ({
          comparison_id: comparisonId,
          metric_key: k,
          weight: weights[k]!,
          position: idx,
        }));
      if (newRows.length > 0) {
        const { error: e2 } = await supabase.from("comparison_metrics").insert(newRows);
        if (e2) throw e2;
      }
      toast.success("Metrikler güncellendi.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("[edit metrics]", err);
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

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setWeights(initialWeights);
      }}
    >
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Settings2 className="mr-1 size-4" /> Metrikleri Düzenle
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Skorlama Metriklerini Düzenle</DialogTitle>
          <DialogDescription>
            Mevcut skorları yeniden hesaplamak için ağırlıkları güncelle. Toplam 100 olmalı.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <MetricWeightsEditor weights={weights} onChange={setWeights} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            İptal
          </Button>
          <Button onClick={save} disabled={saving || total !== 100}>
            <Save className="mr-1 size-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
