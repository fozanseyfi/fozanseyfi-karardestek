"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditFirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("firms").select("*").eq("id", id).single();
      if (error || !data) {
        toast.error("Firma bulunamadı");
        router.push("/firms");
        return;
      }
      setName(data.name);
      setContactName(data.contact_name ?? "");
      setContactEmail(data.contact_email ?? "");
      setContactPhone(data.contact_phone ?? "");
      setNotes(data.notes ?? "");
      setLoading(false);
    })();
  }, [id, router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("firms")
      .update({
        name: name.trim(),
        contact_name: contactName.trim() || null,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Firma güncellendi");
      router.push(`/firms/${id}`);
    }
  }

  async function deleteFirm() {
    if (!confirm("Bu firmayı silmek istediğine emin misin? Tüm karşılaştırmalardaki kayıtlar etkilenebilir.")) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("firms").delete().eq("id", id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Firma silindi");
      router.push("/firms");
    }
  }

  if (loading) return <div className="text-muted-foreground p-8">Yükleniyor...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/firms/${id}`}>
          <ChevronLeft className="mr-1 size-4" /> Firma Detayı
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Firmayı Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Firma Adı *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-11 text-base" />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Yetkili Adı</Label>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>Telefon</Label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>E-posta</Label>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Notlar</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Sektör, vade tercihi, kapasiteler, sertifikalar..." />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <Button type="button" variant="destructive" size="sm" onClick={deleteFirm} disabled={saving}>
                <Trash2 className="mr-1 size-4" /> Sil
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild disabled={saving}>
                  <Link href={`/firms/${id}`}>İptal</Link>
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-1 size-4" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
