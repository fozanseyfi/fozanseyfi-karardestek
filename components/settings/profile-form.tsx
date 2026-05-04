"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { updateOrganizationName, updateProfileName } from "@/app/(app)/settings/profile/actions";

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
    </div>
  );
}
