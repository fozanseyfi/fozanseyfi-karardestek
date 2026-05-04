import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { isAdmin, ROLE_LABELS } from "@/lib/permissions";
import type { UserRole } from "@/lib/constants";

export default async function AdminUsersPage() {
  const me = await getCurrentProfile();
  if (!isAdmin(me)) redirect("/");

  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("created_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kullanıcılar</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sistem kullanıcılarını ve rollerini yönet.</p>
      </div>
      <Card>
        <CardContent className="divide-y p-0">
          {users?.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-medium">{u.full_name ?? u.email}</div>
                <div className="text-muted-foreground text-sm">{u.email}</div>
              </div>
              <Badge variant={u.role === "admin" ? "default" : "secondary"}>{ROLE_LABELS[u.role as UserRole]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
