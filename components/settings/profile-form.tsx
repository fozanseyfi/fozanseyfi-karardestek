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

function Panel({
  icon: Icon,
  title,
  desc,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      <div className="flex items-start gap-3 border-b px-5 py-3.5">
        <Icon className="mt-0.5 size-4 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function FieldGroup({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
      <Input
        id={id}
        type="password"
        required
        minLength={autoComplete === "new-password" ? 8 : undefined}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
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
        toast.success(
          `Kendi paneliniz açıldı: ${r.newOrgName}. Yönetici oldunuz.`,
        );
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
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Profil + şirket adı */}
        <Panel
          icon={User}
          title="Profil"
          desc="Görünen adınız ve sidebar'da görünen şirket adı."
        >
          <form onSubmit={saveName} className="space-y-3.5">
            <FieldGroup label="Ad Soyad">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ad Soyad"
              />
            </FieldGroup>
            <FieldGroup label="E-posta">
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={email}
                  readOnly
                  className="bg-muted/50 pl-9 text-muted-foreground"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                E-posta değişimi için iletişime geçin.
              </p>
            </FieldGroup>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={pending}>
                <Save className="size-3.5" />
                {pending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
          <form onSubmit={saveOrg} className="mt-4 space-y-3.5 border-t pt-4">
            <FieldGroup label="Şirket / panel adı">
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Örn. Kontrolmatik Mühendislik"
                disabled={!isAdmin}
              />
              {!isAdmin && (
                <p className="text-[11px] text-rose-600">
                  Sadece yönetici değiştirebilir.
                </p>
              )}
            </FieldGroup>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={pending || !isAdmin}>
                <Building2 className="size-3.5" />
                Şirket adını kaydet
              </Button>
            </div>
          </form>
        </Panel>

        {/* Şifre */}
        <Panel
          icon={KeyRound}
          title="Şifre"
          desc={
            <>
              Mevcut şifrenizi onaylayarak yeni şifre belirleyin. Unuttuysanız
              çıkış yapıp <strong>&quot;Şifremi unuttum&quot;</strong>{" "}
              bağlantısını kullanın.
            </>
          }
        >
          <form onSubmit={changePassword} className="space-y-3.5">
            <FieldGroup label="Mevcut şifre" htmlFor="current-pwd">
              <PasswordField
                id="current-pwd"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </FieldGroup>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <FieldGroup label="Yeni şifre" htmlFor="new-pwd">
                <PasswordField
                  id="new-pwd"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="En az 8 karakter"
                  autoComplete="new-password"
                />
              </FieldGroup>
              <FieldGroup label="Yeni şifre (tekrar)" htmlFor="new-pwd2">
                <PasswordField
                  id="new-pwd2"
                  value={newPassword2}
                  onChange={setNewPassword2}
                  placeholder="Tekrar yazın"
                  autoComplete="new-password"
                />
              </FieldGroup>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <AlertTriangle className="size-3" />
                Mevcut oturumlar bozulmaz.
              </span>
              <Button type="submit" size="sm" disabled={pwdSaving}>
                <ShieldCheck className="size-3.5" />
                {pwdSaving ? "Güncelleniyor..." : "Şifreyi güncelle"}
              </Button>
            </div>
          </form>
        </Panel>
      </div>

      {/* KENDİ PANELİMİ AÇ — sadece admin olmayanlara */}
      {!isAdmin && (
        <Panel
          icon={Sparkles}
          title="Kendi panelimi aç"
          desc="Kendi şirketinizi açarak kendi panelinizin yöneticisi olabilirsiniz. Mevcut paneldeki üyeliğiniz korunur."
        >
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setConvertOpen(true)}
              disabled={pending}
            >
              <Sparkles className="size-3.5" />
              Kendi Panelimi Aç
            </Button>
          </div>
        </Panel>
      )}

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Kendi Panelinizi
              Açmak Üzeresiniz
            </DialogTitle>
            <DialogDescription>
              Sıfırdan boş bir panel oluşturulacak ve siz onun{" "}
              <strong>yöneticisi</strong> olacaksınız.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm">
            <li>
              ✅ Yeni boş bir panel açılır, siz <strong>yöneticisi</strong>{" "}
              olursunuz
            </li>
            <li>✅ Sıfırdan karşılaştırma, proje, firma yaratabilirsiniz</li>
            <li>✅ Kendi ekibinizi davet edebilirsiniz</li>
            <li>
              ✅ <strong>Mevcut paneldeki üyeliğiniz korunur</strong> —
              topbar&apos;daki panel seçici ile aralarında geçiş yapabilirsiniz
            </li>
            <li>ℹ️ Önceki panelden veri kopyalanmaz; her panel bağımsızdır</li>
          </ul>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setConvertOpen(false)}
              disabled={pending}
            >
              İptal
            </Button>
            <Button
              onClick={doConvert}
              disabled={pending}
              className="font-semibold"
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
