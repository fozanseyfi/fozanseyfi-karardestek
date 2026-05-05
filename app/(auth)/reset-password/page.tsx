"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Loader2, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AuthHeader } from "@/components/auth/auth-landing";
import { SiteFooter } from "@/components/layout/site-footer";

type SessionState = "checking" | "ok" | "missing";

export default function ResetPasswordPage() {
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setSessionState("missing");
        return;
      }
      setEmail(user.email ?? "");
      setSessionState("ok");
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== password2) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Şifreniz güncellendi.");
      setTimeout(() => (window.location.href = "/"), 600);
    } catch (err) {
      console.error("[reset password]", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Şifre güncellenemedi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-white">
      <AuthHeader />

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 pt-12 pb-12 md:px-6 md:pt-20">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <KeyRound className="size-3" />
            Şifre Sıfırlama
          </div>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            Yeni Şifre Belirleyin
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
            Aşağıya yeni şifrenizi girin. Onayladıktan sonra otomatik olarak giriş yapılacaktır.
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-md">
          {sessionState === "checking" && (
            <Card className="border-border/60 shadow-lg">
              <CardContent className="flex items-center justify-center gap-2 p-8 text-sm text-slate-600">
                <Loader2 className="size-4 animate-spin" />
                Sıfırlama bağlantısı doğrulanıyor...
              </CardContent>
            </Card>
          )}

          {sessionState === "missing" && (
            <Card className="border-rose-200 bg-rose-50/40 shadow-lg">
              <CardHeader>
                <CardTitle>Bağlantı geçersiz</CardTitle>
                <CardDescription>
                  Sıfırlama bağlantısının süresi dolmuş veya zaten kullanılmış olabilir. Lütfen yeniden talep edin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/forgot-password">Yeniden Sıfırlama Talep Et</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/login">Giriş sayfasına dön</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {sessionState === "ok" && (
            <Card className="border-border/60 shadow-lg">
              <CardContent className="p-6">
                {email && (
                  <div className="bg-muted/50 mb-4 rounded-md border px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Hesap:</span>{" "}
                    <strong className="text-foreground">{email}</strong>
                  </div>
                )}
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Yeni Şifre</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="password2">Yeni Şifre (tekrar)</Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        id="password2"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Şifrenizi tekrar girin"
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="h-11 w-full" disabled={loading}>
                    {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
