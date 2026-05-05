import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeRelativePath(value: string | null): string {
  if (!value) return "/";
  // Yalnızca tek "/" ile başlayan ve "//" ya da "/\" ile başlamayanlar — açık yönlendirmeyi engeller
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }
  return "/";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const rawRedirect = url.searchParams.get("redirect") ?? url.searchParams.get("next");
  const redirect = safeRelativePath(rawRedirect);

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchange failed:", error.message);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "invite" | "magiclink" | "email_change",
      token_hash: tokenHash,
    });
    if (error) {
      console.error("[auth/callback] verifyOtp failed:", error.message);
    }
  }

  // Davet akışında, oturum kuruldu ama henüz şifre belirlenmedi —
  // user metadata'da invited_org_id varsa ve invite_completed işaretlenmediyse şifre sayfasına yönlendir
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const meta = (user?.user_metadata ?? null) as Record<string, unknown> | null;
  const isPendingInvite = !!meta && meta.invited_org_id != null && meta.invite_completed !== true;

  let finalRedirect = redirect;
  if (isPendingInvite || (type === "invite" && redirect === "/")) {
    finalRedirect = "/invite/accept";
  }

  return NextResponse.redirect(new URL(finalRedirect, url.origin));
}
