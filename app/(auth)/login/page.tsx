"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthChrome, AuthHeading } from "@/components/auth/auth-chrome";
import { PlatformNoteCard, PrivacyCard } from "@/components/auth/login-info";
import { TourLink } from "@/components/auth/tour-promo";
import { TOUR_READY } from "@/lib/tanitim/ready";
import { HeroPreviewCard } from "@/components/auth/hero-preview-card";

/**
 * Giriş ekranı — Teklif / Fizibilite / Solar BOM platformlarıyla aynı şablon:
 * üst başlık, iki sütun (form + örnek önizleme), tanıtım şeridi, diğer platformlar, geliştirici footer'ı.
 */
export default function LoginPage() {
  return (
    <AuthChrome>
      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 pb-8 pt-6 sm:gap-8 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(380px,5fr)_7fr] lg:gap-12 lg:px-10 lg:pt-12">
        {/* SOL — Form */}
        <section className="flex flex-col">
          <div className="mx-auto w-full max-w-md animate-in-up">
            <AuthHeading
              title="Hoş Geldiniz"
              subtitle="KararDestek, tedarikçi tekliflerini ölçütlere göre puanlayıp karşılaştıran ücretsiz bir satınalma platformudur. Devam etmek için giriş yapın."
            />

            <Suspense
              fallback={
                <div className="mt-7 text-sm text-muted-foreground">
                  Yükleniyor...
                </div>
              }
            >
              <LoginForm />
            </Suspense>

            <p className="mt-4 text-center text-[13px] text-muted-foreground sm:mt-5 sm:text-sm">
              Hesabın yok mu?{" "}
              <Link
                href="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Hemen kayıt ol
              </Link>
            </p>

            {TOUR_READY && (
              <div className="mt-4">
                <TourLink />
              </div>
            )}

            <div className="mt-5 sm:mt-6">
              <PlatformNoteCard />
            </div>
          </div>
        </section>

        {/* SAĞ — Örnek önizleme + Veri Gizliliği (lg+) */}
        <section className="hidden flex-col gap-4 lg:flex lg:self-start">
          <HeroPreviewCard />
          <PrivacyCard />
        </section>
      </main>
    </AuthChrome>
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      window.location.href = redirect;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-3.5 sm:mt-7 sm:space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@firma.com"
          className="h-10 bg-background"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Şifre</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Şifremi unuttum
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10 bg-background pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            tabIndex={-1}
            aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPw ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-10 w-full text-sm font-semibold"
      >
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
