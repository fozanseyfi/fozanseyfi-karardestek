import { createClient } from "@/lib/supabase/server";
import { NotificationsList } from "@/components/layout/notifications-list";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bildirimler</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Paylaşımlar, kararlar ve sistem bildirimleri.
        </p>
      </div>
      <NotificationsList initial={notifications ?? []} />
    </div>
  );
}
