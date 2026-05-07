"use client";

import { createBrowserClient } from "@supabase/ssr";
import { withSharedDomain } from "@/lib/supabase/cookie-config";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: withSharedDomain(),
    }
  );
}
