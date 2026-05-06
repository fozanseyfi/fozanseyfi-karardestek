import "server-only";
import { createClient } from "./server";
import type { Profile } from "@/types/domain";

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      console.error("[getCurrentProfile] query error:", error);
      return null;
    }
    return (data as Profile | null) ?? null;
  } catch (err) {
    // Next.js dynamic server signal'larını re-throw et — yoksa build sırasında route static gibi davranır
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      ((err as { digest: string }).digest.startsWith("DYNAMIC_SERVER_USAGE") ||
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT"))
    ) {
      throw err;
    }
    console.error("[getCurrentProfile] uncaught:", err);
    return null;
  }
}
