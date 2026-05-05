"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AuthHeader, AuthMarketing, AuthFooter } from "@/components/auth/auth-landing";
import { AuthMissionCard } from "@/components/auth/auth-mission-card";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-white">
      <AuthHeader />

      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-6 md:px-6 md:pt-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Ücretsiz Başlangıç
          </div>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            Hesap Oluştur
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
            E-posta ve şifrenle kayıt ol; doğrulama maili gelecek.
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-md">
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>

          <p className="text-muted-foreground mt-4 text-center text-sm">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Giriş yap
            </Link>
          </p>

          <AuthMissionCard />
        </div>
      </section>

      <AuthMarketing />
      <AuthFooter />
    </div>
  );
}

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorDetail(null);
    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${baseUrl}/auth/callback`,
        },
      });
      if (error) {
        console.error("[signup error]", error);
        throw error;
      }
      console.log("[signup] success:", data);
      setSent(true);
      toast.success("Doğrulama e-postası gönderildi");
    } catch (err) {
      console.error("[signup exception]", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Kayıt başarısız";
      setErrorDetail(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/30 shadow-lg">
        <CardHeader>
          <div className="bg-emerald-600 mx-auto mb-3 flex size-14 items-center justify-center rounded-full text-white shadow-sm">
            <CheckCircle2 className="size-7" />
          </div>
          <CardTitle className="text-center">Doğrulama maili gönderildi</CardTitle>
          <CardDescription className="text-center">
            <strong className="text-foreground">{email}</strong> adresine gönderdiğimiz bağlantıya tıklayarak hesabını
            aktifleştir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-background rounded-lg border p-3 text-xs text-slate-700 leading-relaxed">
            ⚠️ <strong>Mail gelmediyse:</strong>
            <ul className="mt-1.5 list-inside list-disc space-y-1">
              <li>Junk / Spam klasörünü kontrol et</li>
              <li>5-10 dakika beklemen gerekebilir</li>
              <li>Aynı e-posta zaten kayıtlıysa mail gelmez</li>
            </ul>
          </div>
          <Button asChild className="w-full" variant="outline">
            <Link href="/login">Giriş sayfasına dön</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <div className="relative">
              <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ad Soyad"
                className="h-11 pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad@firma.com"
                className="h-11 pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 8 karakter"
                className="h-11 pl-10"
              />
            </div>
          </div>

          {errorDetail && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <strong>Hata:</strong> {errorDetail}
            </div>
          )}

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
