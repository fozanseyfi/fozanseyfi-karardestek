"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/constants";
import { PLATFORM_KEY } from "@/lib/platform";

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
      .eq("organization_id", orgId)
      .eq("platform", PLATFORM_KEY);
    if (alreadyMemberCheck) {
      // ignore — sadece insert dene
    }
    const { error: insertErr } = await adminSb
      .from("organization_members")
      .insert({ user_id: existing.id, organization_id: orgId, role, platform: PLATFORM_KEY });
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
    .eq("organization_id", orgId)
    .eq("platform", PLATFORM_KEY);
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
  try {
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

    // 1. Kullanıcıyı bu org'dan (sadece BU platformdan) çıkar
    //    Diger platformlardaki üyeligi etkilenmez
    const { error: omErr, count: deletedCount } = await adminSb
      .from("organization_members")
      .delete({ count: "exact" })
      .eq("user_id", userId)
      .eq("organization_id", orgId)
      .eq("platform", PLATFORM_KEY);
    if (omErr) {
      console.error("[deleteUser] om delete failed:", omErr);
      throw new Error(`Üyelik silinemedi: ${omErr.message}`);
    }
    if (deletedCount === 0) {
      console.warn("[deleteUser] no rows matched for delete", { userId, orgId });
    }

    // 2. Kullanıcının aktif org'u bu org idi mi?
    const { data: targetProfile, error: tpErr } = await adminSb
      .from("profiles")
      .select("organization_id, full_name, email")
      .eq("id", userId)
      .single();
    if (tpErr) {
      console.error("[deleteUser] target profile read failed:", tpErr);
    }

    if (targetProfile?.organization_id === orgId) {
      // Diğer üyeliklerden birini bul (yine sadece BU platformda)
      const { data: others } = await adminSb
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", userId)
        .eq("platform", PLATFORM_KEY)
        .limit(1);
      const otherMembership = others?.[0];

      if (otherMembership) {
        await adminSb
          .from("profiles")
          .update({
            organization_id: otherMembership.organization_id,
            role: otherMembership.role,
          })
          .eq("id", userId);
      } else {
        // Hiç org kalmadı → kendi paneli aç
        const displayName =
          (targetProfile.full_name && targetProfile.full_name.trim()) ||
          targetProfile.email.split("@")[0];
        const { data: newOrg, error: orgErr } = await adminSb
          .from("organizations")
          .insert({ name: `${displayName} Paneli`, owner_id: userId })
          .select()
          .single();
        if (orgErr) {
          console.error("[deleteUser] new org for orphan user failed:", orgErr);
        } else if (newOrg) {
          await adminSb
            .from("organization_members")
            .insert({
              user_id: userId,
              organization_id: newOrg.id,
              role: "admin",
              platform: PLATFORM_KEY,
            });
          await adminSb
            .from("profiles")
            .update({ organization_id: newOrg.id, role: "admin" })
            .eq("id", userId);
        }
      }
    }

    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    console.error("[deleteUser] uncaught:", err);
    throw err;
  }
}
