"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AuthSidePanel } from "@/components/auth/auth-side-panel";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      <AuthSidePanel />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="from-primary to-primary/70 flex size-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm">
              <Sparkles className="text-primary-foreground size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">EPC Karar Destek</div>
              <div className="text-muted-foreground text-[10px]">Karar Destek Platformu</div>
            </div>
          </div>
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>
          <div className="text-muted-foreground mt-6 text-center text-xs lg:hidden">
            <p>
              Geliştirici:{" "}
              <a href="https://www.linkedin.com/in/fozanseyfi/" className="hover:underline">
                Furkan Ozan Seyfi
              </a>{" "}
              · <a href="https://fozanseyfi.com" className="hover:underline">fozanseyfi.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${baseUrl}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5 text-emerald-600" /> Doğrulama maili gönderildi
          </CardTitle>
          <CardDescription>
            <strong>{email}</strong> adresine gönderilen bağlantıya tıklayarak hesabını aktifleştir. Junk/spam
            klasörünü kontrol etmeyi unutma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" variant="outline">
            <Link href="/login">Giriş sayfasına dön</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hesap Oluştur</CardTitle>
        <CardDescription>
          E-posta ve şifrenle kayıt ol — doğrulama maili gönderilecek.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                className="pl-10"
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
                className="pl-10"
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
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="text-foreground font-medium hover:underline">
              Giriş yap
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
