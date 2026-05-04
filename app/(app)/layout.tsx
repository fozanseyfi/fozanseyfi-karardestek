import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentProfile } from "@/lib/supabase/get-profile";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <Sidebar profile={profile} />
        <div className="flex flex-1 flex-col">
          <Topbar profile={profile} />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </TooltipProvider>
  );
}
