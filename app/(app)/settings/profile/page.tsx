import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { ROLE_LABELS } from "@/lib/permissions";

export default async function ProfileSettingsPage() {
  const profile = await getCurrentProfile();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{profile?.full_name ?? profile?.email}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="text-muted-foreground">E-posta</div>
          <div>{profile?.email}</div>
          <div className="text-muted-foreground mt-3">Rol</div>
          <div>
            <Badge variant="secondary">{profile ? ROLE_LABELS[profile.role] : "—"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
