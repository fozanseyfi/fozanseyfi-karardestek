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
  const me = await requireAdmin();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error("E-posta gerekli");

  // Davet eden admin'in organization'ı
  const supabase = await createClient();
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", me.id)
    .single();
  if (!myProfile) throw new Error("Profil bulunamadı");
  const orgId = myProfile.organization_id as string;

  const adminSb = await createServiceClient();

  // Kullanıcı zaten profiles'da var mı? (Başka panelde kayıtlı olabilir)
  const { data: existing } = await adminSb
    .from("profiles")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing?.id) {
    // Mevcut kullanıcıyı sadece org'a ekle — yeni davet maili göndermeye gerek yok
    const { error: alreadyMemberCheck } = await adminSb
      .from("organization_members")
      .select("user_id", { head: true })
      .eq("user_id", existing.id)
      .eq("organization_id", orgId);
    if (alreadyMemberCheck) {
      // ignore — sadece insert dene
    }
    const { error: insertErr } = await adminSb
      .from("organization_members")
      .insert({ user_id: existing.id, organization_id: orgId, role });
    if (insertErr) {
      // 23505 = unique_violation — zaten üye
      if ("code" in insertErr && insertErr.code === "23505") {
        throw new Error("Bu kullanıcı zaten panelinizin üyesi.");
      }
      throw new Error(insertErr.message);
    }
    revalidatePath("/admin/users");
    return { ok: true, mode: "added_existing" as const };
  }

  // Yeni kullanıcı: Supabase davet maili gönder (trigger profile + member kaydını yaratır)
  const { error } = await adminSb.auth.admin.inviteUserByEmail(cleanEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/invite/accept`,
    data: {
      full_name: fullName ?? undefined,
      invited_org_id: orgId,
      invited_role: role,
    },
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { ok: true, mode: "invited" as const };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const me = await requireAdmin();
  if (userId === me.id && role !== "admin") {
    throw new Error("Kendi admin yetkisini düşüremezsin.");
  }

  const supabase = await createClient();
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", me.id)
    .single();
  if (!myProfile) throw new Error("Profil bulunamadı");
  const orgId = myProfile.organization_id as string;

  const adminSb = await createServiceClient();

  // Kullanıcının bu org'daki rolünü güncelle
  const { error: omErr } = await adminSb
    .from("organization_members")
    .update({ role })
    .eq("user_id", userId)
    .eq("organization_id", orgId);
  if (omErr) throw new Error(omErr.message);

  // Eğer kullanıcının ŞU AN aktif org'u bu org ise profile.role'ünü de senkronize et
  const { data: targetProfile } = await adminSb
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .single();
  if (targetProfile?.organization_id === orgId) {
    await adminSb.from("profiles").update({ role }).eq("id", userId);
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(userId: string) {
  const me = await requireAdmin();
  if (userId === me.id) {
    throw new Error("Kendini silemezsin.");
  }

  const supabase = await createClient();
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", me.id)
    .single();
  if (!myProfile) throw new Error("Profil bulunamadı");
  const orgId = myProfile.organization_id as string;

  const adminSb = await createServiceClient();

  // Kullanıcıyı bu org'dan çıkar (auth user'ı silmez — başka panellerde olabilir)
  const { error: omErr } = await adminSb
    .from("organization_members")
    .delete()
    .eq("user_id", userId)
    .eq("organization_id", orgId);
  if (omErr) throw new Error(omErr.message);

  // Kullanıcının aktif org'u bu org idi ve başka org'a üyeyse → diğer org'a switch et
  // Hiç org'u kalmadıysa: profile.organization_id null bırakamıyoruz (NOT NULL).
  // Bu durumda kendi paneli oluştur.
  const { data: targetProfile } = await adminSb
    .from("profiles")
    .select("organization_id, full_name, email")
    .eq("id", userId)
    .single();

  if (targetProfile?.organization_id === orgId) {
    const { data: otherMembership } = await adminSb
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (otherMembership) {
      await adminSb
        .from("profiles")
        .update({
          organization_id: otherMembership.organization_id,
          role: otherMembership.role,
        })
        .eq("id", userId);
    } else {
      // Hiç org kalmadı — kullanıcıya kendi paneli aç
      const displayName =
        (targetProfile.full_name && targetProfile.full_name.trim()) ||
        targetProfile.email.split("@")[0];
      const { data: newOrg } = await adminSb
        .from("organizations")
        .insert({ name: `${displayName} Paneli`, owner_id: userId })
        .select()
        .single();
      if (newOrg) {
        await adminSb
          .from("organization_members")
          .insert({ user_id: userId, organization_id: newOrg.id, role: "admin" });
        await adminSb
          .from("profiles")
          .update({ organization_id: newOrg.id, role: "admin" })
          .eq("id", userId);
      }
    }
  }

  revalidatePath("/admin/users");
  return { ok: true };
}
