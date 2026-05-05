"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

export async function convertToOwnOrganization() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum yok");

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", user.id)
      .single();
    if (pErr) {
      console.error("[convert] profile read failed:", pErr);
      throw new Error(`Profil okunamadı: ${pErr.message}`);
    }
    if (!profile) throw new Error("Profil bulunamadı");
    if (profile.role === "admin") {
      throw new Error("Zaten yönetici rolündesiniz; ayrı bir panele geçmeye gerek yok.");
    }

    const displayName =
      (profile.full_name && profile.full_name.trim()) || profile.email.split("@")[0];

    const adminSb = await createServiceClient();

    // 1. Yeni org oluştur
    const { data: newOrg, error: e1 } = await adminSb
      .from("organizations")
      .insert({ name: `${displayName} Paneli`, owner_id: user.id })
      .select()
      .single();
    if (e1) {
      console.error("[convert] org insert failed:", e1);
      throw new Error(`Yeni panel oluşturulamadı: ${e1.message}`);
    }
    if (!newOrg) throw new Error("Yeni panel oluşturuldu ama satır geri dönmedi.");

    // 2. Yeni org'a admin olarak ekle (eski membership korunur)
    const { error: e2 } = await adminSb
      .from("organization_members")
      .insert({ user_id: user.id, organization_id: newOrg.id, role: "admin" });
    if (e2) {
      console.error("[convert] org_members insert failed:", e2);
      throw new Error(`Üyelik kaydı eklenemedi: ${e2.message}`);
    }

    // 3. Aktif org'u yeniyle değiştir
    const { error: e3 } = await adminSb
      .from("profiles")
      .update({ organization_id: newOrg.id, role: "admin" })
      .eq("id", user.id);
    if (e3) {
      console.error("[convert] profile update failed:", e3);
      throw new Error(`Aktif panel değiştirilemedi: ${e3.message}`);
    }

    revalidatePath("/", "layout");
    return { ok: true, newOrgName: newOrg.name as string };
  } catch (err) {
    console.error("[convertToOwnOrganization] uncaught:", err);
    throw err;
  }
}

export async function switchActiveOrganization(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");

  const { error } = await supabase.rpc("switch_active_organization", {
    target_org_id: orgId,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function listMyMemberships() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name)")
    .eq("user_id", user.id);
  if (error) {
    console.error("[listMyMemberships]", error);
    return [];
  }
  type Row = {
    organization_id: string;
    role: string;
    organizations: { id: string; name: string } | null;
  };
  return (data ?? [])
    .map((r) => {
      const row = r as unknown as Row;
      return row.organizations
        ? {
            id: row.organizations.id,
            name: row.organizations.name,
            role: row.role,
          }
        : null;
    })
    .filter((m): m is { id: string; name: string; role: string } => m !== null);
}
