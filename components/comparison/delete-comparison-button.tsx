"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function DeleteComparisonButton({
  comparisonId,
  comparisonName,
}: {
  comparisonId: string;
  comparisonName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function doDelete() {
    if (confirm !== comparisonName) {
      toast.error("Doğrulama metni eşleşmiyor.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("comparisons").delete().eq("id", comparisonId);
      if (error) throw error;
      toast.success("Karşılaştırma silindi.");
      router.push("/comparisons");
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
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
        <Trash2 className="mr-1 size-4" /> Sil
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Karşılaştırmayı Sil</DialogTitle>
          <DialogDescription>
            Bu işlem <strong>geri alınamaz</strong>. Tüm fiyatlar, revizeler, manuel skorlar silinir. Onaylamak için
            karşılaştırmanın adını yaz.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label className="text-sm">
            Karşılaştırma adı: <code className="bg-muted rounded px-1 text-xs">{comparisonName}</code>
          </Label>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={comparisonName} autoFocus />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={doDelete}
            disabled={busy || confirm !== comparisonName}
          >
            <Trash2 className="mr-1 size-4" />
            {busy ? "Siliniyor..." : "Kalıcı Olarak Sil"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
