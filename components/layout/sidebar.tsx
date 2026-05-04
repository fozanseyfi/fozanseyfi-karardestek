"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/domain";
import { isAdmin } from "@/lib/permissions";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/", label: "Pano", icon: LayoutDashboard },
  { href: "/projects", label: "Projeler", icon: FolderKanban },
  { href: "/comparisons", label: "Karşılaştırmalar", icon: GitCompareArrows },
  { href: "/firms", label: "Firmalar", icon: Building2 },
  { href: "/templates", label: "Şablonlar", icon: FileStack },
  { href: "/notifications", label: "Bildirimler", icon: Bell },
  { href: "/admin/users", label: "Kullanıcılar", icon: Users, adminOnly: true },
];

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !i.adminOnly || isAdmin(profile));

  return (
    <aside className="bg-sidebar border-sidebar-border hidden w-64 shrink-0 border-r md:flex md:flex-col">
      <div className="border-sidebar-border flex h-14 items-center border-b px-6">
        <Link href="/" className="text-sidebar-foreground text-lg font-semibold tracking-tight">
          EPC Karar Destek
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
