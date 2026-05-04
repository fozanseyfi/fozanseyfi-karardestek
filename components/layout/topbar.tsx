"use client";

import { useState } from "react";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
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

export function Topbar({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);

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
    <header className="bg-background sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 md:px-6">
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
          <Sidebar profile={profile} />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 gap-2 px-2">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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
