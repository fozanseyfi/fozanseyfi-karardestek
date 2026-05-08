"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Building2,
  User,
  Sparkles,
  Lock,
  KeyRound,
  AlertTriangle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  updateOrganizationName,
  updateProfileName,
  convertToOwnOrganization,
} from "@/app/(app)/settings/profile/actions";

type Tone = "blue" | "emerald" | "rose" | "yellow";

const TONE_STYLES: Record<Tone, { iconBg: string; iconText: string }> = {
  blue: { iconBg: "bg-blue-100", iconText: "text-blue-700" },
  emerald: { iconBg: "bg-emerald-100", iconText: "text-emerald-700" },
  rose: { iconBg: "bg-rose-100", iconText: "text-rose-700" },
  yellow: { iconBg: "bg-yellow-100", iconText: "text-yellow-700" },
};

function SectionCard({
  icon: Icon,
  tone,
  title,
  description,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const t = TONE_STYLES[tone];
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", t.iconBg, t.iconText)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function PrimaryButton({
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      disabled={disabled}
      className="h-10 bg-yellow-600 px-4 font-semibold text-white shadow-sm transition-colors hover:bg-yellow-700"
    >
      {children}
    </Button>
  );
}

export function ProfileForm({
  initialFullName,
  initialOrgName,
  isAdmin,
  email,
}: {
  initialFullName: string;
  initialOrgName: string;
  isAdmin: boolean;
  email: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [orgName, setOrgName] = useState(initialOrgName);
  const [pending, startTransition] = useTransition();
  const [convertOpen, setConvertOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Yeni şifre en az 8 karakter olmalı.");
      return;
    }
    if (newPassword !== newPassword2) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("Yeni şifre eskisinden farklı olmalı.");
      return;
    }
    setPwdSaving(true);
    try {
      const supabase = createClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInErr) {
        toast.error("Mevcut şifre yanlış.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Şifreniz güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Şifre güncellenemedi.");
    } finally {
      setPwdSaving(false);
    }
  }

  function doConvert() {
    startTransition(async () => {
      try {
        const r = await convertToOwnOrganization();
        toast.success(`Kendi paneliniz açıldı: ${r.newOrgName}. Yönetici oldunuz.`);
        setConvertOpen(false);
        window.location.href = "/";
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProfileName(fullName);
        toast.success("Adın güncellendi.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  function saveOrg(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateOrganizationName(orgName);
        toast.success("Şirket adı güncellendi.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* PROFIL BİLGİLERİ */}
      <SectionCard
        icon={User}
        tone="blue"
        title="Profil bilgileri"
        description="Görünen adınızı güncelleyin — ekip arkadaşlarınız sizi bu isimle görür."
      >
        <form onSubmit={saveName} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide uppercase text-slate-700">
                Ad Soyad
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn. Furkan Ozan Seyfi"
                className="h-11 border-slate-200 bg-white focus-visible:border-yellow-400 focus-visible:ring-yellow-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide uppercase text-slate-700">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={email}
                  readOnly
                  className="h-11 border-slate-200 bg-slate-50 pl-10 text-slate-600"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                E-posta değişimi için iletişime geçin.
              </p>
            </div>
          </div>
          <div>
            <PrimaryButton type="submit" disabled={pending}>
              <Save className="mr-1.5 size-4" />
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </PrimaryButton>
          </div>
        </form>
      </SectionCard>

      {/* ŞİRKET / PANEL */}
      <SectionCard
        icon={Building2}
        tone="emerald"
        title="Şirket / panel adı"
        description={
          <>
            Sidebar başlığında ve topbar&apos;da görünen şirket adı.
            {!isAdmin && (
              <>
                {" "}
                <span className="font-medium text-rose-600">Sadece yönetici değiştirebilir.</span>
              </>
            )}
          </>
        }
      >
        <form onSubmit={saveOrg} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold tracking-wide uppercase text-slate-700">
              Şirket adı
            </Label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Örn. Kontrolmatik Mühendislik"
              className="h-11 border-slate-200 bg-white focus-visible:border-yellow-400 focus-visible:ring-yellow-200"
              disabled={!isAdmin}
            />
          </div>
          <div>
            <PrimaryButton type="submit" disabled={pending || !isAdmin}>
              <Save className="mr-1.5 size-4" />
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </PrimaryButton>
          </div>
        </form>
      </SectionCard>

      {/* ŞİFRE GÜVENLİĞİ */}
      <SectionCard
        icon={KeyRound}
        tone="rose"
        title="Şifre güvenliği"
        description={
          <>
            Mevcut şifrenizi onaylayarak yeni bir şifre belirleyin. Şifrenizi unuttuysanız çıkış
            yapıp <strong>&quot;Şifremi unuttum&quot;</strong> bağlantısını kullanın.
          </>
        }
      >
        <form onSubmit={changePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-pwd" className="text-xs font-semibold tracking-wide uppercase text-slate-700">
              Mevcut şifre
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="current-pwd"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-slate-200 bg-white pl-10 focus-visible:border-yellow-400 focus-visible:ring-yellow-200"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-pwd" className="text-xs font-semibold tracking-wide uppercase text-slate-700">
                Yeni şifre
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="new-pwd"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  className="h-11 border-slate-200 bg-white pl-10 focus-visible:border-yellow-400 focus-visible:ring-yellow-200"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pwd2" className="text-xs font-semibold tracking-wide uppercase text-slate-700">
                Yeni şifre (tekrar)
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="new-pwd2"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword2}
                  onChange={(e) => setNewPassword2(e.target.value)}
                  placeholder="En az 8 karakter"
                  className="h-11 border-slate-200 bg-white pl-10 focus-visible:border-yellow-400 focus-visible:ring-yellow-200"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton type="submit" disabled={pwdSaving}>
              <ShieldCheck className="mr-1.5 size-4" />
              {pwdSaving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </PrimaryButton>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <AlertTriangle className="size-3" />
              Şifre değişiminden sonra mevcut oturumlar bozulmaz.
            </span>
          </div>
        </form>
      </SectionCard>

      {/* KENDİ PANELİMİ AÇ — sadece admin olmayanlara */}
      {!isAdmin && (
        <SectionCard
          icon={Sparkles}
          tone="yellow"
          title="Kendi panelimi aç"
          description="Kendi şirketinizi açarak kendi panelinizin yöneticisi olabilirsiniz. Mevcut paneldeki üyeliğiniz korunur."
          className="border-yellow-200/70 bg-gradient-to-br from-yellow-50/40 via-white to-white"
        >
          <Button
            onClick={() => setConvertOpen(true)}
            disabled={pending}
            className="h-10 bg-yellow-600 px-4 font-semibold text-white shadow-sm hover:bg-yellow-700"
          >
            <Sparkles className="mr-1.5 size-4" />
            Kendi Panelimi Aç
          </Button>
        </SectionCard>
      )}

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-yellow-600" /> Kendi Panelinizi Açmak Üzeresiniz
            </DialogTitle>
            <DialogDescription>
              Sıfırdan boş bir panel oluşturulacak ve siz onun <strong>yöneticisi</strong>{" "}
              olacaksınız.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm">
            <li>✅ Yeni boş bir panel açılır, siz <strong>yöneticisi</strong> olursunuz</li>
            <li>✅ Sıfırdan karşılaştırma, proje, firma yaratabilirsiniz</li>
            <li>✅ Kendi ekibinizi davet edebilirsiniz</li>
            <li>
              ✅ <strong>Mevcut paneldeki üyeliğiniz korunur</strong> — topbar&apos;daki panel
              seçici ile aralarında geçiş yapabilirsiniz
            </li>
            <li>ℹ️ Önceki panelden veri kopyalanmaz; her panel bağımsızdır</li>
          </ul>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConvertOpen(false)} disabled={pending}>
              İptal
            </Button>
            <Button
              onClick={doConvert}
              disabled={pending}
              className="bg-yellow-600 font-semibold text-white hover:bg-yellow-700"
            >
              <Sparkles className="mr-1.5 size-4" />
              {pending ? "Açılıyor..." : "Onaylıyorum, Kendi Panelimi Aç"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
