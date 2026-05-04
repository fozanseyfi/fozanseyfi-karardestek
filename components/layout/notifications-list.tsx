"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsList({ initial }: { initial: Notif[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function markAsRead(id: string) {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    router.refresh();
  }

  async function markAllRead() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw error;
      setItems((p) => p.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
      toast.success("Tüm bildirimler okundu olarak işaretlendi.");
      router.refresh();
    } catch {
      toast.error("Hata");
    } finally {
      setBusy(false);
    }
  }

  const unreadCount = items.filter((n) => !n.read_at).length;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="text-muted-foreground mx-auto size-10" />
          <p className="text-muted-foreground mt-2">Bildirim yok.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : "Hepsi okundu."}
        </p>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={busy}>
            <CheckCheck className="mr-1 size-4" /> Hepsini Okundu İşaretle
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {items.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 p-4 transition-colors",
                !n.read_at && "bg-blue-50/50"
              )}
            >
              <Bell className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{n.title}</span>
                  {!n.read_at && <Badge className="bg-blue-600 px-1 py-0 text-[10px]">YENİ</Badge>}
                </div>
                {n.body && <p className="text-muted-foreground mt-0.5 text-sm">{n.body}</p>}
                <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                  <span>{new Date(n.created_at).toLocaleString("tr-TR")}</span>
                  {n.link && (
                    <Link href={n.link} className="hover:text-foreground hover:underline">
                      Görüntüle →
                    </Link>
                  )}
                </div>
              </div>
              {!n.read_at && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="shrink-0">
                  <Check className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
