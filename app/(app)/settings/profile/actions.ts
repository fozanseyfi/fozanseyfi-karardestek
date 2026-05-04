"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateOrganizationName(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();
  if (!profile) throw new Error("Profil bulunamadı");
  if (profile.role !== "admin") throw new Error("Sadece yönetici şirket adını değiştirebilir");

  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error("Şirket adı en az 2 karakter olmalı");

  const { error } = await supabase
    .from("organizations")
    .update({ name: trimmed })
    .eq("id", profile.organization_id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings/profile", "layout");
  revalidatePath("/", "layout");
}

export async function updateProfileName(fullName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim() || null })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings/profile", "layout");
  revalidatePath("/", "layout");
}
