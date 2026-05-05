"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function InviteAcceptPage() {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
      data: { full_name: name },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Hesabınız aktifleştirildi. Yönlendiriliyorsunuz...");
      setTimeout(() => (window.location.href = "/"), 800);
    }
  }

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">EPC Karar Destek</h1>
          <p className="text-muted-foreground mt-1 text-sm">Karar Destek Platformu</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Hesabınızı Tamamlayın</CardTitle>
            <CardDescription>
              Davet bağlantısından girdiniz. Adınızı ve yeni şifrenizi belirleyerek hesabınızı aktifleştirin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Hesabı Aktifleştir"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
