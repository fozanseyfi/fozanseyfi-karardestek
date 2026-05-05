"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Building2, User, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  updateOrganizationName,
  updateProfileName,
  convertToOwnOrganization,
} from "@/app/(app)/settings/profile/actions";

export function ProfileForm({
  initialFullName,
  initialOrgName,
  isAdmin,
}: {
  initialFullName: string;
  initialOrgName: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [orgName, setOrgName] = useState(initialOrgName);
  const [pending, startTransition] = useTransition();
  const [convertOpen, setConvertOpen] = useState(false);

  function doConvert() {
    startTransition(async () => {
      try {
        const r = await convertToOwnOrganization();
        toast.success(`Kendi paneliniz açıldı: ${r.newOrgName}. Yönetici oldunuz.`);
        setConvertOpen(false);
        // Sayfayı tamamen yenile (yeni org context'i için)
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4" /> Profil Bilgileri
          </CardTitle>
          <CardDescription>Görünen adınızı güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveName} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Ad Soyad</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 text-base"
              />
            </div>
            <Button type="submit" disabled={pending}>
              <Save className="mr-1 size-4" />
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4" /> Şirket / Panel Adı
          </CardTitle>
          <CardDescription>
            Sidebar üstünde ve topbar&apos;da görünen şirket adı.{" "}
            {!isAdmin && (
              <span className="text-rose-600">Sadece yönetici değiştirebilir.</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveOrg} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Şirket Adı</Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Örn. Kontrolmatik Mühendislik"
                className="h-11 text-base"
                disabled={!isAdmin}
              />
            </div>
            <Button type="submit" disabled={pending || !isAdmin}>
              <Save className="mr-1 size-4" />
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Kendi panelimi aç — sadece admin olmayanlara göster */}
      {!isAdmin && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Sparkles className="size-4" /> Kendi Panelimi Aç
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Kendi şirketinizi açarak <strong>kendi panelinizin yöneticisi</strong> olabilirsiniz. Davet edildiğiniz
              panelden ayrılırsınız ve sıfırdan kendi karşılaştırmalarınızı, projelerinizi, firmalarınızı
              oluşturursunuz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setConvertOpen(true)} disabled={pending}>
              <Sparkles className="mr-1 size-4" /> Kendi Panelimi Aç
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-amber-600 size-5" /> Kendi Panelinizi Açmak Üzeresiniz
            </DialogTitle>
            <DialogDescription>
              Bu işlem <strong>geri alınamaz</strong> (manuel olarak admin tarafından geri davet edilmediğiniz sürece).
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm space-y-2">
            <li>✅ Yeni boş bir panel açılır, siz <strong>yöneticisi</strong> olursunuz</li>
            <li>✅ Sıfırdan karşılaştırma, proje, firma yaratabilirsiniz</li>
            <li>✅ Kendi ekibinizi davet edebilirsiniz</li>
            <li>❌ Mevcut paneldeki erişiminiz kesilir (görüntüleme dahil)</li>
            <li>❌ Önceki panelden hiçbir veri kopyalanmaz</li>
          </ul>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConvertOpen(false)} disabled={pending}>
              İptal
            </Button>
            <Button onClick={doConvert} disabled={pending}>
              <Sparkles className="mr-1 size-4" />
              {pending ? "Açılıyor..." : "Onaylıyorum, Kendi Panelimi Aç"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
