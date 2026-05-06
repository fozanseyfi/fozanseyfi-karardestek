"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles, Shield, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/components/auth/auth-landing";
import { AuthMissionCard } from "@/components/auth/auth-mission-card";
import { HeroPreviewCard } from "@/components/auth/hero-preview-card";
import { FeaturesShowcase } from "@/components/auth/features-showcase";
import { PlatformsRow } from "@/components/auth/platforms-row";
import { SiteFooter } from "@/components/layout/site-footer";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AuthHeader />

      {/* HERO: 2-column login + preview */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 pb-12 md:px-8 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-12">
          {/* LEFT — login form & welcome */}
          <div className="flex flex-col">
            <div className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-yellow-200/70 bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800">
              <Sparkles className="size-3" />
              BAĞIMSIZ BİR İNİSİYATİF
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-4xl">
              Hoş Geldiniz
            </h1>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Hesabınıza giriş yapın ve karşılaştırma yönetimine kaldığınız yerden devam edin.
            </p>

            <div className="mt-6">
              <Suspense fallback={<LoginSkeleton />}>
                <LoginForm />
              </Suspense>
            </div>

            <p className="mt-4 text-center text-sm text-slate-600">
              Hesabın yok mu?{" "}
              <Link href="/signup" className="font-semibold text-yellow-700 hover:underline">
                Hemen kayıt ol
              </Link>
            </p>

            <AuthMissionCard />
          </div>

          {/* RIGHT — eye-catching preview hero */}
          <div className="lg:pl-2">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — full width, centered */}
      <FeaturesShowcase showPrivacy={false} maxWidthClass="max-w-7xl" />

      {/* PRIVACY (amber, full width) */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-8">
        <div className="rounded-2xl border border-yellow-200/70 bg-gradient-to-br from-yellow-50 via-white to-white p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-yellow-500 text-white shadow-md">
              <Shield className="size-7" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-[0.14em] text-yellow-900 uppercase">
                Veri Gizliliği
              </div>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                Verileriniz size aittir. Geliştirici dahil hiç kimse görüntüleyemez.
              </h3>
              <ul className="mt-3 grid gap-1.5 text-sm text-slate-700 md:grid-cols-2">
                {[
                  "Satır seviyesinde güvenlik (RLS) ile şifrelenir",
                  "Hesaplar arası tam izolasyon",
                  "Üçüncü taraf izleme veya analitik yok",
                  "Yalnızca sizin davet ettikleriniz erişebilir",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-yellow-600" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OTHER PLATFORMS */}
      <PlatformsRow />

      <SiteFooter />
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm">
      <div className="text-sm text-muted-foreground">Yükleniyor...</div>
    </div>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
          E-posta
        </Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@firma.com"
          className="h-11 border-slate-200 bg-white focus-visible:border-yellow-400 focus-visible:ring-yellow-200"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
            Şifre
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-yellow-700 hover:underline"
          >
            Şifremi unuttum
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 border-slate-200 bg-white pr-10 focus-visible:border-yellow-400 focus-visible:ring-yellow-200"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            tabIndex={-1}
            aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
            className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-yellow-50 hover:text-yellow-700"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-yellow-500 font-semibold text-white shadow-sm hover:bg-yellow-600"
      >
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
