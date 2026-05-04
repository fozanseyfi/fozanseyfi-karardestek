"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileEdit, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Status = "draft" | "in_review" | "decided" | "archived";

const LABEL: Record<Status, string> = {
  draft: "Taslak",
  in_review: "Tamamlandı",
  decided: "Karar Verildi",
  archived: "Arşiv",
};

const TONE: Record<Status, string> = {
  draft: "bg-amber-100 text-amber-800 border-amber-200",
  in_review: "bg-blue-100 text-blue-800 border-blue-200",
  decided: "bg-emerald-100 text-emerald-800 border-emerald-200",
  archived: "bg-muted text-muted-foreground border-border",
};

export function StatusButton({
  comparisonId,
  current,
  hasDecidedFirm,
}: {
  comparisonId: string;
  current: Status;
  hasDecidedFirm: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function setStatus(newStatus: Status) {
    if (newStatus === "decided" && !hasDecidedFirm) {
      toast.error("Önce 'Karar Verildi' olabilmesi için bir firma seçilmelidir (Karar Özeti sekmesinden).");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("comparisons").update({ status: newStatus }).eq("id", comparisonId);
      if (error) throw error;
      toast.success(`Durum: ${LABEL[newStatus]}`);
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={TONE[current]} disabled={saving}>
          {LABEL[current]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Durum Değiştir</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setStatus("draft")} disabled={current === "draft"}>
          <FileEdit className="mr-2 size-4" /> Taslak
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("in_review")} disabled={current === "in_review"}>
          <CheckCircle2 className="mr-2 size-4" /> Tamamlandı
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("decided")} disabled={current === "decided"}>
          <Badge className="mr-2 bg-emerald-600 px-1 py-0 text-[10px]">✓</Badge> Karar Verildi
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setStatus("archived")} disabled={current === "archived"}>
          <Archive className="mr-2 size-4" /> Arşivle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return <Badge className={TONE[status]}>{LABEL[status]}</Badge>;
}
