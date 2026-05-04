"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/constants";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Yetkisiz: bu işlem için admin gerekir");
  return user;
}

export async function inviteUser(email: string, role: UserRole, fullName: string | null) {
  await requireAdmin();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error("E-posta gerekli");

  const adminSb = await createServiceClient();
  const { data, error } = await adminSb.auth.admin.inviteUserByEmail(cleanEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    data: fullName ? { full_name: fullName } : undefined,
  });
  if (error) throw new Error(error.message);

  // Trigger profile yarattı; rol farklıysa güncelle
  if (data.user && role !== "user") {
    await adminSb.from("profiles").update({ role }).eq("id", data.user.id);
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const me = await requireAdmin();
  if (userId === me.id && role !== "admin") {
    throw new Error("Kendi admin yetkisini düşüremezsin.");
  }
  const adminSb = await createServiceClient();
  const { error } = await adminSb.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(userId: string) {
  const me = await requireAdmin();
  if (userId === me.id) {
    throw new Error("Kendini silemezsin.");
  }
  const adminSb = await createServiceClient();
  const { error } = await adminSb.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  return { ok: true };
}
