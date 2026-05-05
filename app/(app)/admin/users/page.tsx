import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { isAdmin } from "@/lib/permissions";
import { UsersTable } from "@/components/admin/users-table";
import type { UserRole } from "@/lib/constants";

export default async function AdminUsersPage() {
  const me = await getCurrentProfile();
  if (!isAdmin(me)) redirect("/");

  const supabase = await createClient();
  // Admin'in org'undaki tüm üyeler (organization_members üzerinden)
  // Kullanıcının aktif org'u burası olmasa bile listede görünür.
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id, role, profiles!inner(id, email, full_name, created_at)")
    .eq("organization_id", me!.organization_id);

  type RawMember = {
    user_id: string;
    role: UserRole;
    profiles: { id: string; email: string; full_name: string | null; created_at: string };
  };
  type Row = { id: string; email: string; full_name: string | null; role: UserRole; created_at: string };
  const list: Row[] = ((members ?? []) as unknown as RawMember[])
    .map((m) => ({
      id: m.profiles.id,
      email: m.profiles.email,
      full_name: m.profiles.full_name,
      role: m.role,
      created_at: m.profiles.created_at,
    }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

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
