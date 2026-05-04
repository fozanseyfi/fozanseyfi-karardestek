"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  GitCompareArrows,
  Trophy,
  FileStack,
  Users,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
  tone: "blue" | "emerald" | "amber" | "violet" | "rose";
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "EPC Karar Destek'e Hoş Geldin",
    tone: "blue",
    body: (
      <>
        <p>
          Bu platform GES &amp; RES projelerinde <strong>taşeron, malzeme ve hizmet tekliflerini</strong> akıllı skor
          algoritmasıyla değerlendirir.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          5 adımlık kısa bir tur — istediğin zaman atlayabilirsin.
        </p>
      </>
    ),
  },
  {
    icon: FileStack,
    title: "Şablonlardan Hızlı Başla",
    tone: "amber",
    body: (
      <>
        <p>
          <strong>Şablonlar</strong> sekmesinde hazır <em>GES Mekanik / Elektrik / İnşaat / RES Kule / RES Elektrik</em>{" "}
          gibi karşılaştırma örnekleri var.
        </p>
        <p className="mt-2">
          Bir şablona tıklayıp &quot;Bu Şablonu Kullan&quot; ile firmaları, fiyatları, manuel skorları ve 3 revize tek
          tıkla yüklersin — sonra düzenleyip kendi karşılaştırmana çevirirsin.
        </p>
      </>
    ),
  },
  {
    icon: GitCompareArrows,
    title: "Çoklu Kriterli Skor Algoritması",
    tone: "violet",
    body: (
      <>
        <p>
          10 metrik var: 3 otomatik (<em>Kapsam</em>, <em>Hedef Sapma</em>, <em>En Düşük Teklif</em>) + 7 manuel (
          <em>Teknik, Referans, Finansal, Ödeme Şartı, vb.</em>).
        </p>
        <p className="mt-2">
          Karşılaştırma türüne göre <strong>preset</strong> ağırlıklar gelir. Her metrik 0-100 arası, toplam ağırlık
          100. Sonradan istediğin zaman değiştirebilirsin.
        </p>
      </>
    ),
  },
  {
    icon: Trophy,
    title: "Karar Ver, Revize Et, PDF İndir",
    tone: "emerald",
    body: (
      <>
        <p>
          Karşılaştırma detayında <strong>"Karar Özeti"</strong> sekmesinden firma seç ve onayla — durum
          &quot;Karar Verildi&quot; olur.
        </p>
        <p className="mt-2">
          Firmalar fiyat güncellerse <strong>"Revize Kaydet"</strong> butonu ile yeni tur — turlar yan yana % indirim/zam
          ile karşılaştırılır.
        </p>
        <p className="mt-2">
          <strong>PDF</strong> butonu 5 sayfalık tam rapor üretir (sıralama + skor dökümü + kalemler + revizeler + manuel
          notlar).
        </p>
      </>
    ),
  },
  {
    icon: Users,
    title: "Ekibini Davet Et",
    tone: "rose",
    body: (
      <>
        <p>
          Admin'sen <strong>Kullanıcılar</strong> sekmesinden ekip üyelerini davet edebilirsin (Yönetici / Kullanıcı /
          Görüntüleyici rolleri).
        </p>
        <p className="mt-2">
          Karşılaştırmalarını <strong>paylaş</strong> butonu ile diğer kullanıcılarla paylaşabilirsin — sadece görüntüleme
          veya düzenleme yetkisi vererek.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">Hazırsın — başla! 🚀</p>
      </>
    ),
  },
];

const TONE_CLASSES: Record<Step["tone"], string> = {
  blue: "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-emerald-600",
  amber: "from-amber-500 to-amber-600",
  violet: "from-violet-500 to-violet-600",
  rose: "from-rose-500 to-rose-600",
};

export function OnboardingDialog({ initialOpen }: { initialOpen: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  async function complete() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
    }
    setOpen(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) complete();
      }}
    >
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <button
          onClick={complete}
          className="text-muted-foreground hover:bg-muted absolute top-3 right-3 z-10 rounded p-1.5 transition-colors"
          aria-label="Kapat"
        >
          <X className="size-4" />
        </button>

        {/* Hero */}
        <div className={cn("bg-gradient-to-br p-6 text-white", TONE_CLASSES[current.tone])}>
          <div className="bg-white/20 flex size-12 items-center justify-center rounded-xl backdrop-blur-sm">
            <Icon className="size-6" />
          </div>
          <DialogTitle className="mt-4 text-xl font-semibold">{current.title}</DialogTitle>
          <DialogDescription className="text-white/80 sr-only">{current.title}</DialogDescription>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <div className="text-foreground space-y-2 leading-relaxed">{current.body}</div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 pt-2">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setStep(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === step ? "bg-primary w-8" : "bg-muted hover:bg-muted-foreground/30 w-1.5"
                )}
                aria-label={`Adım ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 flex items-center justify-between gap-2 border-t p-4">
          <Button variant="ghost" size="sm" onClick={complete} disabled={saving}>
            Atla
          </Button>
          <div className="text-muted-foreground text-xs">
            Adım {step + 1} / {STEPS.length}
          </div>
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} disabled={saving}>
                Geri
              </Button>
            )}
            {!isLast ? (
              <Button size="sm" onClick={() => setStep(step + 1)} disabled={saving}>
                İleri <ArrowRight className="ml-1 size-3" />
              </Button>
            ) : (
              <Button size="sm" onClick={complete} disabled={saving}>
                <Check className="mr-1 size-3" />
                {saving ? "..." : "Başla"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
