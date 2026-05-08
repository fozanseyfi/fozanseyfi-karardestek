import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { createClient } from "@/lib/supabase/server";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { PLATFORM_KEY } from "@/lib/platform";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  // Her sorguyu izole et: birinin patlaması SSR'ı çökertmesin.
  let unreadCount = 0;
  let organizationName: string | null = null;
  let memberships: { id: string; name: string; role: string }[] = [];

  try {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .is("read_at", null);
    unreadCount = count ?? 0;
  } catch (err) {
    console.error("[layout] notifications count failed:", err);
  }

  try {
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .maybeSingle();
    organizationName = org?.name ?? null;
  } catch (err) {
    console.error("[layout] active org name failed:", err);
  }

  try {
    type RawMembership = {
      organization_id: string;
      role: string;
      organizations: { id: string; name: string } | null;
    };
    const { data: membersRaw, error: mErr } = await supabase
      .from("organization_members")
      .select("organization_id, role, organizations(id, name)")
      .eq("user_id", profile.id)
      .eq("platform", PLATFORM_KEY);
    if (mErr) {
      console.error("[layout] memberships query error:", mErr);
    } else {
      memberships = ((membersRaw ?? []) as unknown as RawMembership[])
        .filter((m) => m.organizations !== null)
        .map((m) => ({
          id: m.organizations!.id,
          name: m.organizations!.name,
          role: m.role,
        }));
    }
  } catch (err) {
    console.error("[layout] memberships catch:", err);
  }

  const showOnboarding = !profile.onboarding_completed;

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
