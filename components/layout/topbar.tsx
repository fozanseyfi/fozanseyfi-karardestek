"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Menu, LogOut, User as UserIcon, Bell, Building2, Check, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import type { Profile } from "@/types/domain";
import { ROLE_LABELS } from "@/lib/permissions";
import { switchActiveOrganization } from "@/app/(app)/settings/profile/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Membership = { id: string; name: string; role: string };

export function Topbar({
  profile,
  unreadCount = 0,
  organizationName,
  memberships = [],
  activeOrgId = null,
}: {
  profile: Profile | null;
  unreadCount?: number;
  organizationName?: string | null;
  memberships?: Membership[];
  activeOrgId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [switching, startSwitch] = useTransition();

  function switchTo(orgId: string) {
    if (orgId === activeOrgId || switching) return;
    startSwitch(async () => {
      try {
        await switchActiveOrganization(orgId);
        // Sayfayı tamamen yenile (yeni org context'i için)
        window.location.href = "/";
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Panel değiştirilemedi.");
      }
    });
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    profile?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasyon</SheetTitle>
          </SheetHeader>
          <Sidebar profile={profile} mobile />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        {memberships.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground -ml-2 h-9 gap-2 px-2 font-normal"
                disabled={switching}
              >
                <Building2 className="size-4" />
                <span className="text-xs">Panel:</span>
                <span className="text-foreground text-sm font-medium">
                  {organizationName ?? "—"}
                </span>
                <ChevronDown className="text-muted-foreground size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Üye olduğunuz paneller ({memberships.length})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {memberships.map((m) => {
                const isActive = m.id === activeOrgId;
                return (
                  <DropdownMenuItem
                    key={m.id}
                    onClick={() => switchTo(m.id)}
                    className={cn("flex items-start gap-2 py-2.5", isActive && "bg-muted/60")}
                    disabled={switching}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                      <Building2 className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{m.name}</span>
                        {isActive && <Check className="size-3.5 shrink-0 text-emerald-600" />}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {ROLE_LABELS[m.role as keyof typeof ROLE_LABELS] ?? m.role}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          organizationName && (
            <div className="text-muted-foreground hidden items-center gap-1.5 text-xs md:flex">
              <Building2 className="size-3.5" />
              <span>Panel:</span>
              <span className="text-foreground font-medium">{organizationName}</span>
            </div>
          )
        )}
      </div>

      <Button asChild variant="ghost" size="icon" className="relative">
        <Link href="/notifications" aria-label="Bildirimler">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 gap-2 px-2">
            <Avatar className="size-7">
              <AvatarFallback className="from-primary to-primary/70 bg-gradient-to-br text-[11px] font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <div className="text-sm leading-tight font-medium">
                {profile?.full_name || profile?.email || "Kullanıcı"}
              </div>
              <div className="text-muted-foreground text-xs leading-tight">
                {profile ? ROLE_LABELS[profile.role] : "—"}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Hesap</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/settings/profile" className="flex items-center gap-2">
              <UserIcon className="size-4" /> Profil
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
            <LogOut className="size-4" /> Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
