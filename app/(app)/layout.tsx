import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { createClient } from "@/lib/supabase/server";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [{ count: unreadCount }, { data: org }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .is("read_at", null),
    supabase.from("organizations").select("name").eq("id", profile.organization_id).single(),
  ]);

  const showOnboarding = !profile.onboarding_completed;
  const organizationName = org?.name ?? null;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <Sidebar profile={profile} organizationName={organizationName} />
        <div className="flex flex-1 flex-col">
          <Topbar profile={profile} unreadCount={unreadCount ?? 0} organizationName={organizationName} />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
      <OnboardingDialog initialOpen={showOnboarding} />
    </TooltipProvider>
  );
}
