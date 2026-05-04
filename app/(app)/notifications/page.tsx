import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bildirimler</h1>
        <p className="text-muted-foreground mt-1 text-sm">Son sistem bildirimleri.</p>
      </div>

      {notifications && notifications.length > 0 ? (
        <Card>
          <CardContent className="divide-y p-0">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3 p-4">
                <Bell className="text-muted-foreground mt-0.5 size-4" />
                <div className="flex-1">
                  <div className="font-medium">{n.title}</div>
                  {n.body && <div className="text-muted-foreground text-sm">{n.body}</div>}
                  <div className="text-muted-foreground mt-1 text-xs">
                    {new Date(n.created_at).toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="text-muted-foreground mx-auto size-10" />
            <p className="text-muted-foreground mt-2">Bildirim yok.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
