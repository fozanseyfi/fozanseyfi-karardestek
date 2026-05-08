import { Building2, Calendar, ShieldCheck, UserCircle } from "lucide-react";
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

  const initials = profile ? getInitials(profile.full_name, profile.email) : "??";
  const roleLabel = profile ? ROLE_LABELS[profile.role] : "—";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HERO PROFILE CARD */}
      <div className="relative overflow-hidden rounded-2xl border border-yellow-200/60 bg-gradient-to-br from-yellow-50/80 via-white to-white p-6 md:p-8">
        <div className="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-yellow-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-yellow-50 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 text-2xl font-bold text-white shadow-md md:size-24 md:text-3xl">
            {initials}
          </div>

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200/70 bg-yellow-50 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-yellow-700 uppercase">
              <UserCircle className="size-3" />
              Profilim
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {profile?.full_name?.trim() || profile?.email || "Kullanıcı"}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
                <ShieldCheck className="size-3" />
                {roleLabel}
              </span>
              <span className="text-sm text-slate-600">{profile?.email}</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard icon={Building2} label="Şirket" value={org?.name ?? "—"} />
          <StatCard icon={ShieldCheck} label="Rol" value={roleLabel} />
          <StatCard icon={Calendar} label="Üyelik tarihi" value={formatDate(profile?.created_at)} />
        </div>
      </div>

      {/* FORM SECTIONS */}
      <ProfileForm
        initialFullName={profile?.full_name ?? ""}
        initialOrgName={org?.name ?? ""}
        isAdmin={isAdmin(profile)}
        email={profile?.email ?? ""}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
