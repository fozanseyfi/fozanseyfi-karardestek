"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  COMPARISON_TYPES,
  CURRENCIES,
  ITEM_CATEGORIES,
  type ItemCategory,
  type ComparisonType,
  type Currency,
} from "@/lib/constants";

type LocalFirm = { tempId: string; name: string };
type LocalItem = {
  tempId: string;
  name: string;
  category: ItemCategory;
  unit: string;
  qty: number;
  target: number | null;
};

export default function NewComparisonPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<ComparisonType>("Taşeron");
  const [budget, setBudget] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("TRY");
  const [notes, setNotes] = useState("");

  const [firms, setFirms] = useState<LocalFirm[]>([{ tempId: "f1", name: "" }]);
  const [items, setItems] = useState<LocalItem[]>([
    { tempId: "i1", name: "", category: "Diğer", unit: "", qty: 1, target: null },
  ]);
  const [prices, setPrices] = useState<Record<string, Record<string, string>>>({});

  function addFirm() {
    setFirms((p) => [...p, { tempId: `f${p.length + 1}-${Date.now()}`, name: "" }]);
  }
  function addItem() {
    setItems((p) => [
      ...p,
      { tempId: `i${p.length + 1}-${Date.now()}`, name: "", category: "Diğer", unit: "", qty: 1, target: null },
    ]);
  }
  function removeFirm(id: string) {
    setFirms((p) => p.filter((f) => f.tempId !== id));
  }
  function removeItem(id: string) {
    setItems((p) => p.filter((i) => i.tempId !== id));
  }

  const validStep1 =
    name.trim().length > 1 &&
    firms.length > 0 &&
    firms.every((f) => f.name.trim()) &&
    items.length > 0 &&
    items.every((i) => i.name.trim() && i.qty > 0);

  async function save() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum bulunamadı");

      const { data: comp, error: e1 } = await supabase
        .from("comparisons")
        .insert({
          name,
          type,
          status: "draft",
          owner_id: user.id,
          budget: budget ? Number(budget) : null,
          currency,
          notes: notes || null,
        })
        .select()
        .single();
      if (e1) throw e1;

      const firmRows = firms.map((f) => ({ name: f.name.trim(), created_by: user.id }));
      const { data: insertedFirms, error: e2 } = await supabase
        .from("firms")
        .insert(firmRows)
        .select();
      if (e2) throw e2;

      const cfRows = insertedFirms.map((f) => ({ comparison_id: comp.id, firm_id: f.id }));
      const { error: e3 } = await supabase.from("comparison_firms").insert(cfRows);
      if (e3) throw e3;

      const itemRows = items.map((it, idx) => ({
        comparison_id: comp.id,
        name: it.name.trim(),
        category: it.category,
        unit: it.unit || null,
        qty: it.qty,
        target_price: it.target,
        position: idx,
      }));
      const { data: insertedItems, error: e4 } = await supabase
        .from("comparison_items")
        .insert(itemRows)
        .select();
      if (e4) throw e4;

      const itemMap = new Map(items.map((it, idx) => [it.tempId, insertedItems[idx].id]));
      const firmMap = new Map(firms.map((f, idx) => [f.tempId, insertedFirms[idx].id]));

      const bidRows: Array<{
        comparison_id: string;
        item_id: string;
        firm_id: string;
        price: number | null;
        updated_by: string;
      }> = [];
      for (const it of items) {
        for (const f of firms) {
          const raw = prices[it.tempId]?.[f.tempId];
          const price = raw === undefined || raw === "" ? null : Number(raw);
          bidRows.push({
            comparison_id: comp.id,
            item_id: itemMap.get(it.tempId)!,
            firm_id: firmMap.get(f.tempId)!,
            price,
            updated_by: user.id,
          });
        }
      }
      if (bidRows.length > 0) {
        const { error: e5 } = await supabase.from("bid_prices").insert(bidRows);
        if (e5) throw e5;
      }

      toast.success("Karşılaştırma oluşturuldu.");
      router.push(`/comparisons/${comp.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Badge variant="secondary">Adım {step} / 2</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          {step === 1 ? "Temel Bilgiler · Firmalar · Kalemler" : "Fiyat Matrisi"}
        </h1>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Karşılaştırma Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Başlık</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. GES Mekanik Montaj 50 MWp" />
              </div>
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
              <div className="space-y-2">
                <Label>Bütçe (opsiyonel)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notlar</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Firmalar</CardTitle>
              <Button size="sm" variant="outline" onClick={addFirm}>
                <Plus className="mr-1 size-4" /> Firma Ekle
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {firms.map((f) => (
                <div key={f.tempId} className="flex gap-2">
                  <Input
                    value={f.name}
                    onChange={(e) =>
                      setFirms((p) => p.map((x) => (x.tempId === f.tempId ? { ...x, name: e.target.value } : x)))
                    }
                    placeholder="Firma adı"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFirm(f.tempId)}
                    disabled={firms.length <= 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Kalemler</CardTitle>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="mr-1 size-4" /> Kalem Ekle
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((it) => (
                <div key={it.tempId} className="grid grid-cols-12 gap-2">
                  <Input
                    className="col-span-12 md:col-span-4"
                    value={it.name}
                    onChange={(e) =>
                      setItems((p) => p.map((x) => (x.tempId === it.tempId ? { ...x, name: e.target.value } : x)))
                    }
                    placeholder="Kalem adı"
                  />
                  <Select
                    value={it.category}
                    onValueChange={(v) =>
                      setItems((p) =>
                        p.map((x) => (x.tempId === it.tempId ? { ...x, category: v as ItemCategory } : x))
                      )
                    }
                  >
                    <SelectTrigger className="col-span-6 md:col-span-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="col-span-3 md:col-span-1"
                    value={it.unit}
                    onChange={(e) =>
                      setItems((p) => p.map((x) => (x.tempId === it.tempId ? { ...x, unit: e.target.value } : x)))
                    }
                    placeholder="Birim"
                  />
                  <Input
                    className="col-span-3 md:col-span-2"
                    type="number"
                    inputMode="decimal"
                    value={it.qty}
                    onChange={(e) =>
                      setItems((p) =>
                        p.map((x) => (x.tempId === it.tempId ? { ...x, qty: Number(e.target.value) } : x))
                      )
                    }
                    placeholder="Miktar"
                  />
                  <Input
                    className="col-span-9 md:col-span-2"
                    type="number"
                    inputMode="decimal"
                    value={it.target ?? ""}
                    onChange={(e) =>
                      setItems((p) =>
                        p.map((x) =>
                          x.tempId === it.tempId
                            ? { ...x, target: e.target.value === "" ? null : Number(e.target.value) }
                            : x
                        )
                      )
                    }
                    placeholder="Hedef fiyat"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="col-span-3 md:col-span-1"
                    onClick={() => removeItem(it.tempId)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button disabled={!validStep1} onClick={() => setStep(2)}>
              Fiyat Matrisi <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Fiyat Matrisi</CardTitle>
            <CardDescription>
              Her kalem için her firmanın birim fiyatını girin. Boş bırakılan hücre &quot;teklif yok&quot; sayılır.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-medium">Kalem</th>
                  {firms.map((f) => (
                    <th key={f.tempId} className="p-2 text-right font-medium">
                      {f.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.tempId} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {it.category} · {it.qty} {it.unit}
                      </div>
                    </td>
                    {firms.map((f) => (
                      <td key={f.tempId} className="p-1">
                        <Input
                          type="number"
                          inputMode="decimal"
                          className="text-right"
                          value={prices[it.tempId]?.[f.tempId] ?? ""}
                          onChange={(e) =>
                            setPrices((p) => ({
                              ...p,
                              [it.tempId]: { ...(p[it.tempId] ?? {}), [f.tempId]: e.target.value },
                            }))
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
          <div className="flex items-center justify-between p-4 pt-0">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-1 size-4" /> Geri
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-1 size-4" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
