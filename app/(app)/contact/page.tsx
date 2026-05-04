"use client";

import { useState } from "react";
import { Mail, Phone, User, MessageSquare, Send, Sparkles, Globe, Linkedin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const DEV = {
  name: "Furkan Ozan Seyfi",
  phone: "0506 684 29 33",
  email: "fozanseyfi@gmail.com",
  linkedin: "https://www.linkedin.com/in/fozanseyfi/",
  website: "https://fozanseyfi.com",
};

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || message.trim().length < 10) {
      toast.error("Konu ve en az 10 karakterlik mesaj gerekli.");
      return;
    }
    setSending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum yok");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("feedbacks").insert({
        user_id: user.id,
        user_email: profile?.email ?? user.email ?? null,
        user_name: profile?.full_name ?? null,
        subject: subject.trim(),
        message: message.trim(),
      });
      if (error) throw error;

      toast.success("Geri bildiriminiz iletildi. Teşekkürler!");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gönderim hatası");
    } finally {
      setSending(false);
    }
  }

  function mailto() {
    const body = `Konu: ${subject}\n\n${message}`;
    window.location.href = `mailto:${DEV.email}?subject=${encodeURIComponent(
      "EPC Karar Destek — " + (subject || "Geri Bildirim")
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">İletişime Geç</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sorularınız, hata bildirimleriniz ve iyileştirme önerileriniz için aşağıdan iletebilirsiniz.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Geliştirici Kartı */}
        <Card className="from-primary via-primary/95 to-primary/80 overflow-hidden bg-gradient-to-br text-white shadow-lg lg:col-span-2">
          <CardContent className="p-6">
            <div className="bg-white/20 mb-4 flex size-14 items-center justify-center rounded-xl backdrop-blur-sm">
              <Sparkles className="size-6" />
            </div>
            <div className="text-xs font-medium tracking-wide uppercase opacity-80">Geliştirici</div>
            <h2 className="mt-1 text-2xl font-bold">{DEV.name}</h2>
            <p className="mt-2 text-sm opacity-90">
              EPC Karar Destek Platformu&apos;nun tasarımı ve geliştirilmesinden sorumlu elektrik mühendisi.
            </p>

            <div className="mt-6 space-y-2">
              <a
                href={`tel:${DEV.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-lg bg-white/10 p-3 transition-colors hover:bg-white/20"
              >
                <Phone className="size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs opacity-75">Telefon</div>
                  <div className="font-medium">{DEV.phone}</div>
                </div>
              </a>
              <a
                href={`mailto:${DEV.email}`}
                className="flex items-center gap-3 rounded-lg bg-white/10 p-3 transition-colors hover:bg-white/20"
              >
                <Mail className="size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs opacity-75">E-posta</div>
                  <div className="break-all font-medium">{DEV.email}</div>
                </div>
              </a>
              <a
                href={DEV.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg bg-white/10 p-3 transition-colors hover:bg-white/20"
              >
                <Linkedin className="size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs opacity-75">LinkedIn</div>
                  <div className="font-medium">linkedin.com/in/fozanseyfi</div>
                </div>
              </a>
              <a
                href={DEV.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg bg-white/10 p-3 transition-colors hover:bg-white/20"
              >
                <Globe className="size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs opacity-75">Web Sitesi</div>
                  <div className="font-medium">fozanseyfi.com</div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Geri Bildirim Formu */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="text-primary size-5" /> İyileştirme Önerisi / Geri Bildirim
            </CardTitle>
            <CardDescription>
              Önerinizi aşağıdaki forma yazın. Geri bildiriminiz geliştiriciye iletilecek ve hesabınıza bağlı olarak
              takip edilebilecek.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Konu *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Örn. PDF çıktısında font sorunu, Yeni özellik önerisi vb."
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Mesaj *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detaylı açıklama, varsa ekran görüntüsü tarif ediniz, hangi sayfada karşılaştığınızı belirtin..."
                  rows={8}
                  required
                  minLength={10}
                />
                <p className="text-muted-foreground text-xs">En az 10 karakter</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <Button type="button" variant="outline" onClick={mailto} disabled={sending}>
                  <Mail className="mr-1 size-4" /> E-posta ile Gönder
                </Button>
                <Button type="submit" disabled={sending}>
                  <Send className="mr-1 size-4" />
                  {sending ? "Gönderiliyor..." : "Gönder"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="text-muted-foreground flex items-center gap-3 p-4 text-sm">
          <User className="text-primary size-4 shrink-0" />
          <p>
            Acil durumlar için doğrudan{" "}
            <a href={`tel:${DEV.phone.replace(/\s/g, "")}`} className="text-foreground font-medium underline-offset-4 hover:underline">
              {DEV.phone}
            </a>{" "}
            arayabilir veya{" "}
            <a href={`mailto:${DEV.email}`} className="text-foreground font-medium underline-offset-4 hover:underline">
              {DEV.email}
            </a>{" "}
            adresine yazabilirsiniz.
          </p>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs">
        <Link href="/" className="hover:text-foreground hover:underline">
          ← Pano&apos;ya Dön
        </Link>
      </div>
    </div>
  );
}
