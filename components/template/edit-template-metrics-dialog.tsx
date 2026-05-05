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

type SampleData = {
  firms: unknown[];
  metric_weights: Record<string, number>;
  items: unknown[];
  manual_scores?: unknown[];
  revisions?: unknown[];
};

export function EditTemplateMetricsDialog({
  templateId,
  initialWeights,
}: {
  templateId: string;
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
      const { data: tpl, error: readErr } = await supabase
        .from("templates")
        .select("sample_data")
        .eq("id", templateId)
        .single();
      if (readErr) throw readErr;
      const current = (tpl?.sample_data as SampleData | null) ?? null;
      if (!current) {
        toast.error("Bu şablonda örnek veri olmadığı için metrik düzenlenemez.");
        return;
      }
      const cleanWeights: Record<string, number> = {};
      for (const k of Object.keys(weights)) {
        const v = weights[k as keyof Weights];
        if (typeof v === "number" && v > 0) cleanWeights[k] = v;
      }
      const nextSample: SampleData = { ...current, metric_weights: cleanWeights };
      const { error: updateErr } = await supabase
        .from("templates")
        .update({ sample_data: nextSample })
        .eq("id", templateId);
      if (updateErr) throw updateErr;
      toast.success("Şablon metrikleri güncellendi.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("[edit template metrics]", err);
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
          <DialogTitle>Şablon Metriklerini Düzenle</DialogTitle>
          <DialogDescription>
            Bu şablonun varsayılan ağırlıkları. Burada yapılan değişiklik şablonu klonlayan herkesin başlangıç ağırlıklarını
            etkiler. Toplam 100 olmalı.
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
