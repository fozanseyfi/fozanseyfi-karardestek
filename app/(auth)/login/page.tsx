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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
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
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${baseUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
        });
        if (error) throw error;
        toast.success("Giriş bağlantısı e-postanıza gönderildi.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = redirect;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giriş Yap</CardTitle>
        <CardDescription>
          {mode === "magic"
            ? "E-posta adresinize gönderilen tek kullanımlık bağlantıyla giriş yapın."
            : "E-posta ve şifrenizle giriş yapın."}
        </CardDescription>
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
            />
          </div>
          {mode === "password" && (
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Gönderiliyor..." : mode === "magic" ? "Giriş Bağlantısı Gönder" : "Giriş Yap"}
          </Button>
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <button
              type="button"
              className="hover:text-foreground underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "magic" ? "password" : "magic")}
            >
              {mode === "magic" ? "Şifre ile gir" : "Bağlantı ile gir"}
            </button>
            <Link href="/forgot-password" className="hover:text-foreground underline-offset-4 hover:underline">
              Şifremi unuttum
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
