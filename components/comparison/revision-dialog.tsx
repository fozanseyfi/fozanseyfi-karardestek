"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatCompactCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/constants";

type Firm = { id: string; name: string };
type Item = { id: string; name: string; category: string; unit: string | null; qty: number };

/** "Komple revize kaydet" — yeni revision_no ile bid_prices snapshot oluşturur */
export function RevisionDialog({
  comparisonId,
  currentRevision,
  firms,
  items,
  prevPrices,
  currency,
}: {
  comparisonId: string;
  currentRevision: number;
  firms: Firm[];
  items: Item[];
  prevPrices: Record<string, Record<string, number | null>>;
  currency: Currency;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Yeni fiyatlar — başlangıçta önceki revize ile prefilled
  const [newPrices, setNewPrices] = useState<Record<string, Record<string, string>>>(() => {
    const out: Record<string, Record<string, string>> = {};
    for (const it of items) {
      out[it.id] = {};
      for (const f of firms) {
        const p = prevPrices[it.id]?.[f.id];
        out[it.id][f.id] = p !== null && p !== undefined ? String(p) : "";
      }
    }
    return out;
  });

  async function save() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum yok");

      const newRev = currentRevision + 1;
      const rows: Array<{
        comparison_id: string;
        item_id: string;
        firm_id: string;
        price: number | null;
        updated_by: string;
        revision: number;
      }> = [];
      for (const it of items) {
        for (const f of firms) {
          const raw = newPrices[it.id]?.[f.id];
          const price = raw === undefined || raw === "" ? null : Number(raw);
          rows.push({
            comparison_id: comparisonId,
            item_id: it.id,
            firm_id: f.id,
            price,
            updated_by: user.id,
            revision: newRev,
          });
        }
      }
      const { error } = await supabase.from("bid_prices").insert(rows);
      if (error) throw error;

      toast.success(`Revize ${newRev} kaydedildi.`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("[revision save]", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Hata oluştu";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <GitMerge className="mr-1 size-4" /> Revize Kaydet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Revize {currentRevision + 1} Oluştur</DialogTitle>
          <DialogDescription>
            Mevcut fiyatlar başlangıç olarak yüklendi — değişen firmalar için yeni fiyatları gir, kaydet. Revize {currentRevision} kaybolmaz, geçmişte kalır.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="overflow-x-auto p-4">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-medium">Kalem</th>
                  {firms.map((f) => (
                    <th key={f.id} className="p-2 text-right font-medium">
                      {f.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {it.category} · {it.qty} {it.unit ?? ""}
                      </div>
                    </td>
                    {firms.map((f) => {
                      const prev = prevPrices[it.id]?.[f.id];
                      return (
                        <td key={f.id} className="p-1">
                          <Input
                            type="number"
                            inputMode="decimal"
                            className="text-right"
                            value={newPrices[it.id]?.[f.id] ?? ""}
                            onChange={(e) =>
                              setNewPrices((p) => ({
                                ...p,
                                [it.id]: { ...(p[it.id] ?? {}), [f.id]: e.target.value },
                              }))
                            }
                          />
                          <div className="text-muted-foreground mt-0.5 text-right text-[10px]">
                            önceki: {prev !== null && prev !== undefined ? formatCompactCurrency(prev, currency) : "—"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            İptal
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor..." : `Revize ${currentRevision + 1} Olarak Kaydet`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
