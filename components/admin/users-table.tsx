"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { inviteUser, updateUserRole, deleteUser } from "@/app/(app)/admin/users/actions";

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export function UsersTable({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("user");
  const [pending, startTransition] = useTransition();

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
    if (!confirm(`${email} kullanıcısını silmek istediğine emin misin? Bu işlem geri alınamaz.`)) return;
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

  function roleBadgeTone(role: UserRole) {
    return {
      admin: "bg-emerald-100 text-emerald-800",
      user: "bg-blue-100 text-blue-800",
      viewer: "bg-slate-100 text-slate-700",
    }[role];
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">{users.length} kullanıcı</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-1 size-4" /> Yeni Kullanıcı Davet Et
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead className="w-44">Rol</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isMe = u.id === currentUserId;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="from-primary to-primary/70 bg-gradient-to-br text-xs font-semibold text-white">
                            {initials(u)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {u.full_name || "—"}
                            {isMe && <Badge variant="outline" className="ml-2 text-[10px]">Sen</Badge>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => onRoleChange(u.id, v as UserRole)}
                        disabled={pending || (isMe && u.role === "admin")}
                      >
                        <SelectTrigger className={`h-8 w-full text-xs ${roleBadgeTone(u.role)} border-0`}>
                          <SelectValue>{ROLE_LABELS[u.role]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Yönetici</SelectItem>
                          <SelectItem value="user">Kullanıcı</SelectItem>
                          <SelectItem value="viewer">Görüntüleyici</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.created_at).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      {!isMe && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(u.id, u.email)}
                          disabled={pending}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-5" /> Yeni Kullanıcı Davet Et
            </DialogTitle>
            <DialogDescription>
              Davet bağlantısı içeren mail gönderilir; alıcı şifresini belirleyip hesabını aktifleştirir.
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
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div>
                      <div className="font-medium">Kullanıcı</div>
                      <div className="text-muted-foreground text-xs">Kendi karşılaştırmalarını yönetir</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div>
                      <div className="font-medium">Yönetici</div>
                      <div className="text-muted-foreground text-xs">Tüm sistem yetkisi</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div>
                      <div className="font-medium">Görüntüleyici</div>
                      <div className="text-muted-foreground text-xs">Sadece paylaşılanları okur</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)} disabled={pending}>
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
    </>
  );
}
