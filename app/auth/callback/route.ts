import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const redirect = url.searchParams.get("redirect") ?? url.searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "invite" | "magiclink" | "email_change",
      token_hash: tokenHash,
    });
  }

  return NextResponse.redirect(new URL(redirect, url.origin));
}
