"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function CloneTemplateButton({ templateId, hasSample }: { templateId: string; hasSample: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function clone() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum yok");

      const { data: tpl } = await supabase.from("templates").select("*").eq("id", templateId).single();
      if (!tpl) throw new Error("Şablon bulunamadı");

      type SampleData = {
        firms: { name: string; contact_name?: string; contact_email?: string; contact_phone?: string; notes?: string }[];
        metric_weights: Record<string, number>;
        items: {
          name: string;
          category: string;
          unit: string | null;
          default_qty: number;
          sample_target?: number | null;
          sample_prices?: (number | null)[];
        }[];
        manual_scores?: { firm_index: number; metric_key: string; score: number; notes?: string }[];
      };

      const sampleData = tpl.sample_data as SampleData | null;

      // Yeni karşılaştırma oluştur
      const { data: comp, error: e1 } = await supabase
        .from("comparisons")
        .insert({
          name: `${tpl.name} (kopya - ${new Date().toLocaleDateString("tr-TR")})`,
          type: tpl.type,
          status: "draft",
          owner_id: user.id,
          currency: "TRY",
          notes: tpl.description ?? null,
        })
        .select()
        .single();
      if (e1) throw e1;

      // Metrikler
      let weights: Record<string, number> = {};
      if (sampleData?.metric_weights) {
        weights = sampleData.metric_weights;
      } else {
        weights = { scope: 40, deviation: 35, lowest: 25 };
      }
      const metricRows = Object.entries(weights)
        .filter(([, w]) => w > 0)
        .map(([k, w], idx) => ({
          comparison_id: comp.id,
          metric_key: k,
          weight: w,
          position: idx,
        }));
      if (metricRows.length > 0) {
        const { error: em } = await supabase.from("comparison_metrics").insert(metricRows);
        if (em) throw em;
      }

      // Firms — sample varsa onları, yoksa hiçbiri
      const firmIds: string[] = [];
      if (sampleData?.firms) {
        const { data: insertedFirms, error: ef } = await supabase
          .from("firms")
          .insert(
            sampleData.firms.map((f) => ({
              name: f.name,
              contact_name: f.contact_name ?? null,
              contact_email: f.contact_email ?? null,
              contact_phone: f.contact_phone ?? null,
              notes: f.notes ?? null,
              created_by: user.id,
            }))
          )
          .select();
        if (ef) throw ef;
        firmIds.push(...insertedFirms.map((f) => f.id));

        const { error: ecf } = await supabase
          .from("comparison_firms")
          .insert(insertedFirms.map((f) => ({ comparison_id: comp.id, firm_id: f.id })));
        if (ecf) throw ecf;
      }

      // Items — sample veya tpl.items'tan
      type TplItem = { name: string; category: string; unit: string | null; default_qty: number; sample_target?: number | null };
      const tplItems: TplItem[] =
        (sampleData?.items as TplItem[]) ?? (Array.isArray(tpl.items) ? (tpl.items as TplItem[]) : []);
      const itemRows = tplItems.map((it, idx) => ({
        comparison_id: comp.id,
        name: it.name,
        category: it.category,
        unit: it.unit ?? null,
        qty: it.default_qty,
        target_price: it.sample_target ?? null,
        position: idx,
      }));
      const { data: insertedItems, error: ei } = await supabase
        .from("comparison_items")
        .insert(itemRows)
        .select();
      if (ei) throw ei;

      // Bid prices — sample_prices varsa
      if (sampleData?.items && firmIds.length > 0) {
        const bidRows: Array<{
          comparison_id: string;
          item_id: string;
          firm_id: string;
          price: number | null;
          updated_by: string;
          revision: number;
        }> = [];
        for (let i = 0; i < sampleData.items.length; i++) {
          const itemId = insertedItems[i].id;
          const samplePrices = sampleData.items[i].sample_prices ?? [];
          for (let j = 0; j < firmIds.length; j++) {
            bidRows.push({
              comparison_id: comp.id,
              item_id: itemId,
              firm_id: firmIds[j],
              price: samplePrices[j] ?? null,
              updated_by: user.id,
              revision: 1,
            });
          }
        }
        if (bidRows.length > 0) {
          const { error: ebp } = await supabase.from("bid_prices").insert(bidRows);
          if (ebp) throw ebp;
        }
      }

      // Manuel skorlar
      if (sampleData?.manual_scores && firmIds.length > 0) {
        const manualRows = sampleData.manual_scores.map((ms) => ({
          comparison_id: comp.id,
          firm_id: firmIds[ms.firm_index],
          metric_key: ms.metric_key,
          score: ms.score,
          notes: ms.notes ?? null,
          updated_by: user.id,
        }));
        if (manualRows.length > 0) {
          const { error: ems } = await supabase.from("firm_manual_scores").insert(manualRows);
          if (ems) throw ems;
        }
      }

      toast.success("Şablon klonlandı, karşılaştırma oluşturuldu.");
      router.push(`/comparisons/${comp.id}`);
    } catch (err) {
      console.error("[clone template]", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Hata";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={clone} disabled={loading} size="lg">
      {hasSample ? <Sparkles className="mr-1 size-4" /> : <ArrowRight className="mr-1 size-4" />}
      {loading ? "Kopyalanıyor..." : hasSample ? "Bu Şablonu Kullan" : "Şablondan Karşılaştırma Aç"}
    </Button>
  );
}
