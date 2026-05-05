"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { AuthSidePanel } from "@/components/auth/auth-side-panel";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <AuthSidePanel />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Mobile için kompakt logo (lg ekranda zaten side panel var) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="from-primary to-primary/70 flex size-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm">
              <Sparkles className="text-primary-foreground size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">EPC Karar Destek</div>
              <div className="text-muted-foreground text-[10px]">Karar Destek Platformu</div>
            </div>
          </div>

          <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
          </Suspense>

          {/* Mobile için altta kısa bilgi */}
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
      <CardHeader>
        <CardTitle className="text-2xl">Hoş Geldiniz</CardTitle>
        <CardDescription>Hesabınıza giriş yapın</CardDescription>
      </CardHeader>
      <CardContent>
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
          <div className="border-t pt-4 text-center text-sm">
            <span className="text-muted-foreground">Hesabınız yok mu? </span>
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Hemen kayıt olun
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
