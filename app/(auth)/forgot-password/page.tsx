"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">EPC Karar Destek</h1>
          <p className="text-muted-foreground mt-1 text-sm">Karar Destek Platformu</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/callback?next=/settings/password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Sıfırlama bağlantısı gönderildi.");
  }

  return (
    <PageWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Şifremi Unuttum</CardTitle>
        <CardDescription>E-posta adresinize sıfırlama bağlantısı gönderilecek.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ad@firma.com"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Bağlantı Gönder"}
          </Button>
          <div className="text-muted-foreground text-center text-sm">
            <Link href="/login" className="hover:text-foreground underline-offset-4 hover:underline">
              Girişe dön
            </Link>
          </div>
        </form>
      </CardContent>
      </Card>
    </PageWrapper>
  );
}
