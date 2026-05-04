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
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at");

  type Row = { id: string; email: string; full_name: string | null; role: UserRole; created_at: string };
  const list = (users ?? []) as Row[];

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
