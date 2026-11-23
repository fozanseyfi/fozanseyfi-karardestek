"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoginKitPage } from "@/components/auth/login-kit";
import { LOGIN_PLATFORM } from "@/lib/login-platform";

/*
 * Giriş sayfası. Görünüm bütün platformlarda ortak (components/auth/login-kit.tsx);
 * bu platforma özgü tanıtım ve ekranlar lib/login-platform.tsx'te.
 */
export default function LoginPage() {
  // useSearchParams statik ön-render'da Suspense ister
  return (
    <Suspense
      fallback={
        <LoginKitPage platform={LOGIN_PLATFORM} form={{ pending: true }} />
      }
    >
      <Login />
    </Suspense>
  );
}

function Login() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
      if (err) throw err;
      window.location.href = redirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
      setPending(false);
    }
  }

  return (
    <LoginKitPage
      platform={LOGIN_PLATFORM}
      form={{ onSubmit, pending, error }}
    />
  );
}
