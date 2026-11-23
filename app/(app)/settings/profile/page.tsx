import { ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, isAdmin } from "@/lib/permissions";
import { ProfileForm } from "@/components/settings/profile-form";

function getInitials(name: string | null, email: string): string {
  const source = (name && name.trim()) || email;
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProfileSettingsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", profile?.organization_id ?? "")
    .single();

  const initials = profile
    ? getInitials(profile.full_name, profile.email)
    : "??";
  const roleLabel = profile ? ROLE_LABELS[profile.role] : "—";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      {/* Kimlik şeridi */}
      <section className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border bg-gradient-to-b from-card to-muted/40 px-6 py-5">
        <div className="flex min-w-0 basis-full items-center gap-4 sm:basis-0 sm:flex-1">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              Profilim
            </p>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <span className="truncate">
                {profile?.full_name?.trim() || profile?.email || "Kullanıcı"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary-soft-foreground">
                <ShieldCheck className="size-3" /> {roleLabel}
              </span>
            </h1>
            {profile?.email && (
              <p className="truncate text-[13px] text-muted-foreground">
                {profile.email}
              </p>
            )}
          </div>
        </div>
        <dl className="flex gap-6 text-xs">
          <div>
            <dt className="text-muted-foreground">Şirket</dt>
            <dd className="font-semibold text-foreground">
              {org?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Üyelik</dt>
            <dd className="font-semibold text-foreground">
              {formatDate(profile?.created_at)}
            </dd>
          </div>
        </dl>
      </section>

      <ProfileForm
        initialFullName={profile?.full_name ?? ""}
        initialOrgName={org?.name ?? ""}
        isAdmin={isAdmin(profile)}
        email={profile?.email ?? ""}
      />
    </div>
  );
}
