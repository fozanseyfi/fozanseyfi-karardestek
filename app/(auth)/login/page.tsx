"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { AuthHeader } from "@/components/auth/auth-landing";
import { AuthMissionCard } from "@/components/auth/auth-mission-card";
import { FeaturesShowcase } from "@/components/auth/features-showcase";
import { SiteFooter } from "@/components/layout/site-footer";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-white">
      <AuthHeader />

      {/* HERO + LOGIN FORM */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-6 md:px-6 md:pt-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            GES &amp; RES Tedarik Kararı
          </div>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            Hoş Geldiniz
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
            Hesabınıza giriş yapın.
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-md">
          <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
          </Suspense>

          <p className="text-muted-foreground mt-4 text-center text-sm">
            Hesabın yok mu?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Hemen kayıt ol
            </Link>
          </p>

          <AuthMissionCard />
        </div>
      </section>

      <FeaturesShowcase />
      <SiteFooter />
    </div>
  );
}

function LoginSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Giriş Yap</CardTitle>
        <CardDescription>Yükleniyor...</CardDescription>
      </CardHeader>
    </Card>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = redirect;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ad@firma.com"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
              >
                Şifremi unuttum
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
