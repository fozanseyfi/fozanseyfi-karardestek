import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { createClient } from "@/lib/supabase/server";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [{ count: unreadCount }, { data: org }, { data: membersRaw }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .is("read_at", null),
    supabase.from("organizations").select("name").eq("id", profile.organization_id).single(),
    supabase
      .from("organization_members")
      .select("organization_id, role, organizations(id, name)")
      .eq("user_id", profile.id),
  ]);

  type RawMembership = {
    organization_id: string;
    role: string;
    organizations: { id: string; name: string } | null;
  };
  const memberships = ((membersRaw ?? []) as unknown as RawMembership[])
    .filter((m) => m.organizations !== null)
    .map((m) => ({
      id: m.organizations!.id,
      name: m.organizations!.name,
      role: m.role,
    }));

  const showOnboarding = !profile.onboarding_completed;
  const organizationName = org?.name ?? null;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <Sidebar profile={profile} organizationName={organizationName} />
        <div className="flex flex-1 flex-col">
          <Topbar
            profile={profile}
            unreadCount={unreadCount ?? 0}
            organizationName={organizationName}
            memberships={memberships}
            activeOrgId={profile.organization_id}
          />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
          <SiteFooter />
        </div>
      </div>
      <Toaster richColors position="top-right" />
      <OnboardingDialog initialOpen={showOnboarding} />
    </TooltipProvider>
  );
}
