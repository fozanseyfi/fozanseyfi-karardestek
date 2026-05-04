"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { parseExcelImport } from "@/lib/excel";
import { createClient } from "@/lib/supabase/client";
import {
  COMPARISON_TYPES,
  CURRENCIES,
  type ComparisonType,
  type Currency,
} from "@/lib/constants";

export function ExcelImportDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ComparisonType>("Taşeron");
  const [currency, setCurrency] = useState<Currency>("TRY");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Excel dosyası seçilmedi.");
      return;
    }
    if (!name.trim()) {
      toast.error("Karşılaştırma adı gerekli.");
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const { firms, items, errors } = parseExcelImport(buffer);
      if (errors.length > 0) {
        toast.error(errors.join(", "));
        return;
      }
      if (firms.length === 0 || items.length === 0) {
        toast.error("Firma veya kalem bulunamadı.");
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum yok");

      const { data: comp, error: e1 } = await supabase
        .from("comparisons")
        .insert({ name, type, status: "draft", owner_id: user.id, currency })
        .select()
        .single();
      if (e1) throw e1;

      const { data: insertedFirms, error: e2 } = await supabase
        .from("firms")
        .insert(firms.map((n) => ({ name: n, created_by: user.id })))
        .select();
      if (e2) throw e2;

      const { error: e3 } = await supabase
        .from("comparison_firms")
        .insert(insertedFirms.map((f) => ({ comparison_id: comp.id, firm_id: f.id })));
      if (e3) throw e3;

      const { data: insertedItems, error: e4 } = await supabase
        .from("comparison_items")
        .insert(
          items.map((it, idx) => ({
            comparison_id: comp.id,
            name: it.name,
            category: it.category,
            unit: it.unit,
            qty: it.qty,
            target_price: it.target_price,
            position: idx,
          }))
        )
        .select();
      if (e4) throw e4;

      const firmByHeader = new Map(firms.map((h, idx) => [h, insertedFirms[idx].id]));
      const bidRows: Array<{
        comparison_id: string;
        item_id: string;
        firm_id: string;
        price: number | null;
        updated_by: string;
      }> = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const itemId = insertedItems[i].id;
        for (const fh of firms) {
          const firmId = firmByHeader.get(fh)!;
          bidRows.push({
            comparison_id: comp.id,
            item_id: itemId,
            firm_id: firmId,
            price: it.prices[fh],
            updated_by: user.id,
          });
        }
      }
      if (bidRows.length > 0) {
        const { error: e5 } = await supabase.from("bid_prices").insert(bidRows);
        if (e5) throw e5;
      }

      toast.success("Excel'den karşılaştırma oluşturuldu.");
      setOpen(false);
      router.push(`/comparisons/${comp.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-1 size-4" /> Excel'den İçe Aktar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excel'den Karşılaştırma Oluştur</DialogTitle>
          <DialogDescription>
            Beklenen sütunlar: <strong>Kalem · Kategori · Birim · Miktar · Hedef · Firma1 · Firma2 …</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Başlık</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Karşılaştırma adı" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tür</Label>
              <Select value={type} onValueChange={(v) => setType(v as ComparisonType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPARISON_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Para Birimi</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Excel Dosyası (.xlsx)</Label>
            <Input ref={fileRef} type="file" accept=".xlsx,.xls" />
          </div>
          <Button onClick={onImport} className="w-full" disabled={loading}>
            {loading ? "İçe aktarılıyor..." : "İçe Aktar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
