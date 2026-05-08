"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  GitCompareArrows,
  Building2,
  FileStack,
  Bell,
  Users,
  ChevronLeft,
  ChevronRight,
  Trophy,
  MessageCircle,
  BookOpen,
  Boxes,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/domain";
import { isAdmin } from "@/lib/permissions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  group?: string;
};

const NAV: NavItem[] = [
  { href: "/", label: "Pano", icon: LayoutDashboard, group: "Genel" },
  { href: "/projects", label: "Projeler", icon: FolderKanban, group: "Çalışma" },
  { href: "/comparisons", label: "Karşılaştırmalar", icon: GitCompareArrows, group: "Çalışma" },
  { href: "/firms", label: "Firmalar", icon: Building2, group: "Çalışma" },
  { href: "/templates", label: "Şablonlar", icon: FileStack, group: "Kaynaklar" },
  { href: "/admin/users", label: "Kullanıcılar", icon: Users, adminOnly: true, group: "Yönetim" },
  { href: "/settings/profile", label: "Profilim", icon: UserIcon, group: "Yönetim" },
  { href: "/notifications", label: "Bildirimler", icon: Bell, group: "Yönetim" },
  { href: "/how-it-works", label: "Nasıl Çalışır", icon: BookOpen, group: "Destek" },
  { href: "/contact", label: "İletişime Geç", icon: MessageCircle, group: "Destek" },
  { href: "/platforms", label: "Diğer Platformlar", icon: Boxes, group: "Diğer Platformlar" },
];

const STORAGE_KEY = "sidebar-collapsed";

export function Sidebar({
  profile,
  mobile = false,
  organizationName,
}: {
  profile: Profile | null;
  mobile?: boolean;
  organizationName?: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mobile) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, [mobile]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    if (!mobile) localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  }

  const items = NAV.filter((i) => !i.adminOnly || isAdmin(profile));

  // Group by category, preserve order
  const groups: { name: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const groupName = item.group ?? "Diğer";
    let g = groups.find((x) => x.name === groupName);
    if (!g) {
      g = { name: groupName, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }

  // Mobile sheet'te her zaman expanded
  const isCollapsed = mobile ? false : collapsed;

  return (
    <aside
      className={cn(
        "bg-sidebar border-sidebar-border flex flex-col border-r transition-[width] duration-200 ease-out",
        mobile ? "w-full" : isCollapsed ? "w-16" : "w-64",
        !mobile && "hidden md:sticky md:top-0 md:flex md:h-screen md:self-start"
      )}
      style={!mounted && !mobile ? { width: 256 } : undefined}
    >
      {/* Header */}
      <div
        className={cn(
          "border-sidebar-border flex h-14 items-center border-b px-3",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/"
          className={cn(
            "text-sidebar-foreground flex min-w-0 items-center gap-2 overflow-hidden",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-sm">
            <Trophy className="size-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm leading-tight font-semibold">
                {organizationName || "KararDestek"}
              </div>
              <div className="truncate text-[10px] leading-tight font-medium tracking-[0.12em] text-yellow-700">
                SATIN ALMA KARAR DESTEK
              </div>
            </div>
          )}
        </Link>
        {!mobile && !isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground size-7 shrink-0"
            aria-label="Daralt"
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
      </div>
      {!mobile && isCollapsed && (
        <div className="border-sidebar-border flex justify-center border-b py-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground size-7"
            aria-label="Genişlet"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((g) => (
          <div key={g.name} className={cn("mb-4 last:mb-0", isCollapsed && "mb-3")}>
            {!isCollapsed && (
              <div className="text-sidebar-foreground/50 mb-1.5 px-2 text-[10px] font-semibold tracking-wider uppercase">
                {g.name}
              </div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sidebar-foreground/85 group flex items-center gap-3 rounded-md text-sm font-medium transition-all",
                      isCollapsed ? "justify-center p-2.5" : "px-3 py-2",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      active &&
                        "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-semibold"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-transform",
                        "group-hover:scale-110",
                        active && "text-primary"
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    {isCollapsed && !mobile ? (
                      <Tooltip delayDuration={150}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      linkContent
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

    </aside>
  );
}
