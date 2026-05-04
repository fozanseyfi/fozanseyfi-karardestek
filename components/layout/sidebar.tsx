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
  Sparkles,
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
  { href: "/notifications", label: "Bildirimler", icon: Bell, group: "Kaynaklar" },
  { href: "/admin/users", label: "Kullanıcılar", icon: Users, adminOnly: true, group: "Yönetim" },
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
        !mobile && "hidden md:flex"
      )}
      style={!mounted && !mobile ? { width: 256 } : undefined}
    >
      {/* Header */}
      <div
        className={cn(
          "border-sidebar-border flex h-14 items-center border-b px-3",
          isCollapsed && "justify-center"
        )}
      >
        <Link
          href="/"
          className={cn(
            "text-sidebar-foreground flex items-center gap-2 overflow-hidden",
            isCollapsed && "justify-center"
          )}
        >
          <div className="from-primary to-primary/70 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm">
            <Sparkles className="text-primary-foreground size-4" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm leading-tight font-semibold">
                {organizationName || "EPC Karar"}
              </div>
              <div className="text-sidebar-foreground/60 truncate text-[10px] leading-tight">
                Karar Destek Paneli
              </div>
            </div>
          )}
        </Link>
      </div>

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

      {/* Collapse toggle */}
      {!mobile && (
        <div className="border-sidebar-border border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className={cn(
              "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full justify-center",
              !isCollapsed && "justify-start"
            )}
            aria-label={isCollapsed ? "Genişlet" : "Daralt"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="mr-1 size-4" />
                <span className="text-xs">Daralt</span>
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  );
}
