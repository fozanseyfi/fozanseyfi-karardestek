import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { isAdmin } from "@/lib/permissions";
import { UsersTable } from "@/components/admin/users-table";
import type { UserRole } from "@/lib/constants";
import { PLATFORM_KEY } from "@/lib/platform";

export default async function AdminUsersPage() {
  const me = await getCurrentProfile();
  if (!isAdmin(me)) redirect("/");

  const supabase = await createClient();
  type Row = { id: string; email: string; full_name: string | null; role: UserRole; created_at: string };
  let list: Row[] = [];

  try {
    // 1) Admin'in org'undaki BU PLATFORMA ait üyelikler
    const { data: members, error: mErr } = await supabase
      .from("organization_members")
      .select("user_id, role")
      .eq("organization_id", me!.organization_id)
      .eq("platform", PLATFORM_KEY);
    if (mErr) {
      console.error("[admin/users] memberships query error:", mErr);
    } else if (members && members.length > 0) {
      const ids = members.map((m) => m.user_id as string);
      const roleByUser = new Map<string, UserRole>(
        members.map((m) => [m.user_id as string, m.role as UserRole])
      );
      // 2) Bu üyelerin profil bilgileri (ortak org paylaştıkları için RLS izin verir)
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .in("id", ids);
      if (pErr) {
        console.error("[admin/users] profiles query error:", pErr);
      } else {
        list = (profiles ?? [])
          .map((p) => ({
            id: p.id as string,
            email: p.email as string,
            full_name: (p.full_name as string | null) ?? null,
            role: roleByUser.get(p.id as string) ?? ("user" as UserRole),
            created_at: p.created_at as string,
          }))
          .sort((a, b) => a.created_at.localeCompare(b.created_at));
      }
    }
  } catch (err) {
    console.error("[admin/users] uncaught:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kullanıcılar</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Yeni kullanıcı davet et, rolleri yönet, eski kullanıcıları sil.
        </p>
      </div>

      <UsersTable users={list} currentUserId={me!.id} />
    </div>
  );
}
