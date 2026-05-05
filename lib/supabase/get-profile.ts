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
    console.error("[getCurrentProfile] uncaught:", err);
    return null;
  }
}
