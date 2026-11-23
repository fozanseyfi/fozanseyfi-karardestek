"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  UserPlus,
  Mail,
  Search,
  Shield,
  User as UserIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ROLE_LABELS } from "@/lib/permissions";
import type { UserRole } from "@/lib/constants";
import {
  inviteUser,
  updateUserRole,
  deleteUser,
} from "@/app/(app)/admin/users/actions";
import { VisibilityDialog } from "@/components/admin/visibility-dialog";

const ROLES: UserRole[] = ["admin", "user", "viewer"];

/** Rol başına renk + ikon + kısa açıklama — diğer platformlardaki Kullanıcılar sayfasıyla aynı düzen */
const ROLE_META: Record<
  UserRole,
  {
    icon: React.ComponentType<{ className?: string }>;
    pill: string;
    desc: string;
  }
> = {
  admin: {
    icon: Shield,
    pill: "bg-info/10 text-info-soft-foreground",
    desc: "Kişi davet eder, rolleri ve erişimleri yönetir",
  },
  user: {
    icon: UserIcon,
    pill: "bg-success/10 text-success-soft-foreground",
    desc: "Karşılaştırma, proje ve firmalarla çalışır",
  },
  viewer: {
    icon: Eye,
    pill: "bg-secondary text-muted-foreground",
    desc: "Yalnızca paylaşılanları görüntüler",
  },
};

function RolePill({
  role,
  className = "",
}: {
  role: UserRole;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${ROLE_META[role].pill} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {ROLE_LABELS[role]}
    </span>
  );
}

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("user");
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<UserRole | "all">("all");

  const counts = useMemo(() => {
    const c: Record<UserRole, number> = { admin: 0, user: 0, viewer: 0 };
    users.forEach((u) => c[u.role]++);
    return c;
  }, [users]);

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr-TR");
    return users
      .filter((u) => filter === "all" || u.role === filter)
      .filter(
        (u) =>
          !term ||
          (u.full_name ?? "").toLocaleLowerCase("tr-TR").includes(term) ||
          u.email.toLowerCase().includes(term),
      )
      .sort((a, b) =>
        a.id === currentUserId ? -1 : b.id === currentUserId ? 1 : 0,
      );
  }, [users, q, filter, currentUserId]);

  const segs: [UserRole | "all", string, number][] = [
    ["all", "Tümü", users.length],
    ...ROLES.map(
      (r) => [r, ROLE_LABELS[r], counts[r]] as [UserRole, string, number],
    ),
  ];

  function onInvite(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await inviteUser(inviteEmail, inviteRole, inviteName.trim() || null);
        toast.success(`Davet maili gönderildi: ${inviteEmail}`);
        setInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
        setInviteRole("user");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Davet hatası");
      }
    });
  }

  function onRoleChange(userId: string, newRole: UserRole) {
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        toast.success("Rol güncellendi.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  function onDelete(userId: string, email: string) {
    if (
      !confirm(
        `${email} kullanıcısını silmek istediğine emin misin? Bu işlem geri alınamaz.`,
      )
    )
      return;
    startTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success("Kullanıcı silindi.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  function initials(u: UserRow) {
    return (
      u.full_name
        ?.split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() ||
      u.email[0]?.toUpperCase() ||
      "?"
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      {/* Başlık şeridi */}
      <section className="flex flex-wrap items-end justify-between gap-4 rounded-xl border bg-gradient-to-b from-card to-secondary/30 px-6 py-6">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            Yönetici paneli
          </p>
          <h1 className="mt-1.5 text-[26px] leading-tight font-bold tracking-tight">
            Ekip ve yetkilendirme
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Panele kişi davet edin, rollerini belirleyin ve kaynak bazında
            erişimlerini yönetin.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-1.5">
          <UserPlus className="size-4" /> Kişi davet et
        </Button>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Üye listesi */}
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5">
            <div
              className="flex max-w-full overflow-x-auto rounded-lg bg-secondary p-[3px] text-[12.5px]"
              role="tablist"
            >
              {segs.map(([v, l, n]) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={filter === v}
                  onClick={() => setFilter(v)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors ${
                    filter === v
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l} <span className="tabular-nums opacity-70">{n}</span>
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="İsim veya e-posta ara"
                className="h-9 pl-8 text-[13px]"
              />
            </div>
          </div>

          {list.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium">Eşleşen üye yok</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Aramayı veya rol filtresini değiştirin.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {list.map((u) => {
                const isMe = u.id === currentUserId;
                return (
                  <li
                    key={u.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-2 px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_110px_150px_auto]"
                  >
                    <div className="flex size-[38px] items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
                      {initials(u)}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <span className="truncate">{u.full_name || "—"}</span>
                        {isMe && (
                          <span className="rounded bg-info/10 px-1.5 py-px text-[10px] font-bold tracking-wide text-info-soft-foreground uppercase">
                            Siz
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[12.5px] text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                    <p
                      className="hidden text-xs text-muted-foreground sm:block"
                      title="Katılma tarihi"
                    >
                      {new Date(u.created_at).toLocaleDateString("tr-TR")}
                    </p>
                    <div className="col-span-2 col-start-2 row-start-2 sm:col-span-1 sm:col-start-auto sm:row-start-auto">
                      {isMe ? (
                        <RolePill role={u.role} />
                      ) : (
                        <Select
                          value={u.role}
                          onValueChange={(v) =>
                            onRoleChange(u.id, v as UserRole)
                          }
                          disabled={pending}
                        >
                          <SelectTrigger
                            className="h-8 w-full max-w-[150px] text-xs"
                            aria-label={`${u.full_name || u.email} rolü`}
                          >
                            <SelectValue>{ROLE_LABELS[u.role]}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="col-start-3 row-start-1 flex items-center justify-end gap-0.5 sm:col-start-auto sm:row-start-auto">
                      {!isMe && (
                        <VisibilityDialog
                          userId={u.id}
                          userName={u.full_name || u.email}
                          userRole={u.role}
                        />
                      )}
                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => onDelete(u.id, u.email)}
                          disabled={pending}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Kullanıcıyı sil"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Yan sütun */}
        <aside className="space-y-4">
          <section className="space-y-2.5 rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Roller</h2>
            {ROLES.map((r) => (
              <div key={r} className="flex items-start gap-2.5 text-[12.5px]">
                <RolePill role={r} className="min-w-[104px] justify-center" />
                <span className="pt-px text-muted-foreground">
                  {ROLE_META[r].desc}
                </span>
              </div>
            ))}
          </section>
          <p className="rounded-xl border bg-secondary/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Davet edilen kişiye şifresini belirleyeceği bir bağlantı e-postayla
            gönderilir. Göz simgesiyle kişinin hangi karşılaştırma, proje ve
            firmaları göreceğini kısıtlayabilirsiniz.
          </p>
        </aside>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-5" /> Yeni Kullanıcı Davet Et
            </DialogTitle>
            <DialogDescription>
              Davet bağlantısı içeren mail gönderilir; alıcı şifresini
              belirleyip hesabını aktifleştirir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onInvite} className="space-y-3">
            <div className="space-y-1.5">
              <Label>E-posta *</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="ad@firma.com"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ad Soyad (opsiyonel)</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Ad Soyad"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div>
                      <div className="font-medium">Kullanıcı</div>
                      <div className="text-muted-foreground text-xs">
                        Kendi karşılaştırmalarını yönetir
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div>
                      <div className="font-medium">Yönetici</div>
                      <div className="text-muted-foreground text-xs">
                        Tüm sistem yetkisi
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div>
                      <div className="font-medium">Görüntüleyici</div>
                      <div className="text-muted-foreground text-xs">
                        Sadece paylaşılanları okur
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(false)}
                disabled={pending}
              >
                İptal
              </Button>
              <Button type="submit" disabled={pending}>
                <Mail className="mr-1 size-4" />
                {pending ? "Gönderiliyor..." : "Davet Gönder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
