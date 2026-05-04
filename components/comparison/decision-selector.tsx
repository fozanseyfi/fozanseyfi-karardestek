"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Firm = { id: string; name: string };

export function DecisionSelector({
  comparisonId,
  firms,
  currentDecidedFirmId,
}: {
  comparisonId: string;
  firms: Firm[];
  currentDecidedFirmId: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(currentDecidedFirmId);
  const [saving, setSaving] = useState(false);

  async function decide() {
    if (!selected) {
      toast.error("Önce bir firma seç.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("comparisons")
        .update({ decided_firm_id: selected, status: "decided", decision_date: new Date().toISOString().slice(0, 10) })
        .eq("id", comparisonId);
      if (error) throw error;
      toast.success("Karar kaydedildi.");
      router.refresh();
    } catch (err) {
      console.error(err);
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

  async function clearDecision() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("comparisons")
        .update({ decided_firm_id: null, decision_date: null, status: "in_review" })
        .eq("id", comparisonId);
      if (error) throw error;
      toast.success("Karar geri alındı.");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Hata");
    } finally {
      setSaving(false);
    }
  }

  const decidedFirm = firms.find((f) => f.id === currentDecidedFirmId);

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-emerald-600" /> Karar Ver
        </CardTitle>
        <CardDescription>
          {decidedFirm
            ? `Bu karşılaştırma için karar verildi: ${decidedFirm.name}`
            : "Hangi firmaya karar verdin? Seç ve onayla — durum 'Karar Verildi' olarak güncellenir."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {decidedFirm ? (
          <div className="flex items-center justify-between gap-3">
            <Badge className="bg-emerald-600 px-3 py-1.5 text-sm">
              <Check className="mr-1 size-4" />
              {decidedFirm.name}
            </Badge>
            <Button variant="outline" size="sm" onClick={clearDecision} disabled={saving}>
              Kararı Geri Al
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label className="text-sm">Karar verilen firma</Label>
              <Select value={selected ?? undefined} onValueChange={setSelected}>
                <SelectTrigger className="h-11 text-base">
                  <SelectValue placeholder="Firma seç..." />
                </SelectTrigger>
                <SelectContent>
                  {firms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={decide} disabled={!selected || saving} className="h-11">
                <Trophy className="mr-1 size-4" />
                {saving ? "Kaydediliyor..." : "Kararı Onayla"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
