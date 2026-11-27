"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
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
  ChevronDown,
  MessageCircle,
  BookOpen,
  Boxes,
  PlayCircle,
  UserCircle2,
  LogOut,
  Menu,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PlatformLogo } from "@/components/common/platform-logos";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { Profile } from "@/types/domain";
import { isAdmin, ROLE_LABELS } from "@/lib/permissions";
import { TOUR_READY } from "@/lib/tanitim/ready";
import { createClient } from "@/lib/supabase/client";
import { switchActiveOrganization } from "@/app/(app)/settings/profile/actions";

/*
 * Üst bar + sol menü — Teklif / Fizibilite / Proje Yönetim / Solar BOM ile aynı kabuk:
 * koyu lacivert menü, zümrüt seçili öğe, üst barda solda hesap + panel menüsü, sağda bildirim ve tema.
 * Masaüstünde menü sabit (daraltılabilir), mobilde soldan açılan çekmece.
 */

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  match?: (p: string) => boolean;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Ana Menü",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        match: (p) => p === "/",
      },
    ],
  },
  {
    label: "Çalışma Alanı",
    items: [
      { href: "/projects", label: "Projeler", icon: FolderKanban },
      {
        href: "/comparisons",
        label: "Karşılaştırmalar",
        icon: GitCompareArrows,
      },
      { href: "/firms", label: "Firmalar", icon: Building2 },
      { href: "/templates", label: "Şablonlar", icon: FileStack },
    ],
  },
  {
    label: "Yönetim",
    items: [
      {
        href: "/admin/users",
        label: "Kullanıcılar",
        icon: Users,
        adminOnly: true,
      },
      { href: "/settings/profile", label: "Profilim", icon: UserCircle2 },
      { href: "/notifications", label: "Bildirimler", icon: Bell },
    ],
  },
  {
    label: "Destek",
    items: [
      { href: "/how-it-works", label: "Nasıl Çalışır", icon: BookOpen },
      { href: "/contact", label: "İletişime Geç", icon: MessageCircle },
    ],
  },
  {
    label: "Platformlarım",
    items: [
      ...(TOUR_READY
        ? [
            {
              href: "/platform-tanitimi",
              label: "Platform Tanıtımı",
              icon: PlayCircle,
            },
          ]
        : []),
      { href: "/platforms", label: "Platformlarım", icon: Boxes },
    ],
  },
];

const STORAGE_KEY = "sidebar-collapsed";
const W_OPEN = "14rem";
const W_COLLAPSED = "4rem";

type Membership = { id: string; name: string; role: string };

export function AppChrome({
  profile,
  unreadCount = 0,
  organizationName,
  memberships = [],
  activeOrgId = null,
}: {
  profile: Profile;
  unreadCount?: number;
  organizationName?: string | null;
  memberships?: Membership[];
  activeOrgId?: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const initial = localStorage.getItem(STORAGE_KEY) === "1";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount'ta localStorage'dan başlangıç durumu
    setCollapsed(initial);
    document.documentElement.style.setProperty(
      "--sidebar-w",
      initial ? W_COLLAPSED : W_OPEN,
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- rota değişince mobil menüyü kapat
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      document.documentElement.style.setProperty(
        "--sidebar-w",
        next ? W_COLLAPSED : W_OPEN,
      );
      return next;
    });
  }

  const admin = isAdmin(profile);
  const account = (compact: boolean) => (
    <AccountMenu
      compact={compact}
      profile={profile}
      organizationName={organizationName ?? null}
      memberships={memberships}
      activeOrgId={activeOrgId}
    />
  );

  return (
    <>
      {/* Sol menü üst bardan ÖNCE: logonun degrade tanımı, mobilde gizlenen üst bar logosundan önce gelsin
          (display:none içindeki SVG tanımları Chrome'da çizilmez). */}
      {/* SOL MENÜ */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-[transform,width] duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:[width:var(--sidebar-w,14rem)]",
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Menüyü kapat"
          className="text-sidebar-muted hover:bg-sidebar-border/40 absolute top-3 right-3 z-40 flex size-9 items-center justify-center rounded-lg transition-colors hover:text-white lg:hidden"
        >
          <X className="size-5" />
        </button>

        <div
          className={cn(
            "border-sidebar-border flex h-16 items-center border-b",
            "max-lg:gap-3 max-lg:px-5",
            collapsed
              ? "lg:justify-center lg:px-2"
              : "lg:gap-3 lg:pr-2 lg:pl-5",
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-lg transition-opacity hover:opacity-80",
              collapsed ? "lg:flex-none lg:gap-0" : "flex-1",
            )}
          >
            <PlatformLogo
              id="karardestek"
              size={36}
              className="shrink-0 rounded-[9px]"
            />
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-sm leading-tight font-semibold tracking-tight text-white",
                collapsed && "lg:hidden",
              )}
            >
              KararDestek
            </p>
          </Link>
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Menüyü daralt"
            title="Menüyü daralt"
            className={cn(
              "text-sidebar-muted hover:bg-sidebar-border/50 hidden size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:text-white lg:flex",
              collapsed && "lg:hidden",
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Menüyü aç"
            title="Menüyü aç"
            className="text-sidebar-muted hover:bg-sidebar-border/50 mx-auto mt-2 hidden size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:text-white lg:flex"
          >
            <ChevronRight className="size-4" />
          </button>
        )}

        <nav
          className={cn(
            "flex-1 overflow-y-auto py-4 max-lg:px-3",
            collapsed ? "lg:px-2" : "lg:px-3",
          )}
        >
          {NAV_GROUPS.map((group, gi) => {
            const items = group.items.filter((i) => !i.adminOnly || admin);
            if (items.length === 0) return null;
            return (
              <div key={group.label} className={gi > 0 ? "mt-5" : ""}>
                <p
                  className={cn(
                    "text-sidebar-muted/80 mb-1.5 px-3 text-[10px] font-semibold tracking-[0.12em] uppercase",
                    collapsed && "lg:hidden",
                  )}
                >
                  {group.label}
                </p>
                {collapsed && gi > 0 && (
                  <div className="bg-sidebar-border mx-2 mb-2 hidden h-px lg:block" />
                )}
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      collapsed={collapsed}
                      active={
                        item.match
                          ? item.match(pathname)
                          : pathname === item.href ||
                            pathname.startsWith(`${item.href}/`)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* ÜST BAR */}
      <header className="border-border bg-background/90 fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 border-b px-3 backdrop-blur-md sm:px-4 lg:px-6">
        <div className="contents lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
            className="text-foreground hover:bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <Menu className="size-5" />
          </button>
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <PlatformLogo
              id="karardestek"
              size={32}
              className="shrink-0 rounded-lg"
            />
            <span className="truncate text-sm font-semibold">
              KararDestek<span className="max-[420px]:hidden"> Platformu</span>
            </span>
          </Link>
        </div>

        <div
          className="hidden min-w-0 items-center lg:flex"
          style={{
            marginLeft: "var(--sidebar-w, 14rem)",
            transition: "margin-left 200ms",
          }}
        >
          {account(false)}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Link
            href="/notifications"
            aria-label="Bildirimler"
            title="Bildirimler"
            className="border-border bg-secondary text-foreground hover:bg-secondary/80 relative flex size-9 items-center justify-center rounded-md border transition-colors"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] leading-4 font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
          <div className="lg:hidden">{account(true)}</div>
        </div>
      </header>
    </>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  // Daraltılmışken üzerine gelince ad — portal ile, menünün taşma kırpmasına takılmasın
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);
  const Icon = item.icon;
  return (
    <>
      <Link
        href={item.href}
        onClick={() => setTip(null)}
        onMouseEnter={(e) => {
          if (!collapsed || window.innerWidth < 1024) return;
          const r = e.currentTarget.getBoundingClientRect();
          setTip({ top: r.top + r.height / 2, left: r.right + 10 });
        }}
        onMouseLeave={() => setTip(null)}
        className={cn(
          "group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors",
          collapsed && "lg:justify-center lg:gap-0 lg:px-2 lg:py-2",
          active
            ? "bg-sidebar-accent/20 text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-border/40 hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors",
            active
              ? "text-sidebar-accent-foreground"
              : "text-sidebar-muted group-hover:text-sidebar-foreground",
          )}
        />
        <span className={cn("truncate", collapsed && "lg:hidden")}>
          {item.label}
        </span>
        {active && (
          <span
            className={cn(
              "bg-sidebar-accent-foreground ml-auto size-1.5 rounded-full",
              collapsed && "lg:hidden",
            )}
          />
        )}
      </Link>
      {tip &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[100] hidden select-none lg:block"
            style={{
              top: tip.top,
              left: tip.left,
              transform: "translateY(-50%)",
            }}
          >
            <div className="relative rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-white/10">
              {item.label}
              <span className="absolute top-1/2 right-full -translate-y-1/2 border-y-[5px] border-r-[5px] border-y-transparent border-r-slate-900" />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/** Hesap + panel menüsü: ad · panel, e-posta; açılır listede paneller, Profilim ve Çıkış. */
function AccountMenu({
  profile,
  organizationName,
  memberships,
  activeOrgId,
  compact,
}: {
  profile: Profile;
  organizationName: string | null;
  memberships: Membership[];
  activeOrgId: string | null;
  compact: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [switching, startSwitch] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const name = profile.full_name || profile.email || "Kullanıcı";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function switchTo(orgId: string) {
    if (orgId === activeOrgId || switching) return;
    startSwitch(async () => {
      try {
        await switchActiveOrganization(orgId);
        window.location.href = "/";
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Panel değiştirilemedi.",
        );
      }
    });
  }

  async function logout() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Hesap ve panel menüsü"
        aria-expanded={open}
        className="hover:bg-secondary flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors"
      >
        <div className="bg-sidebar flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white">
          {initials(name)}
        </div>
        {!compact && (
          <>
            <div className="min-w-0 leading-tight">
              <p className="flex min-w-0 items-center gap-1.5">
                <span className="text-foreground truncate text-[13px] font-semibold">
                  {name}
                </span>
                {organizationName && (
                  <>
                    <span className="text-muted-foreground/60 shrink-0">·</span>
                    <span className="bg-primary-soft text-primary-soft-foreground truncate rounded px-1.5 py-px text-[11px] font-semibold">
                      {organizationName}
                    </span>
                  </>
                )}
              </p>
              <p className="text-muted-foreground truncate text-[11px]">
                {profile.email}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "text-muted-foreground size-3.5 shrink-0 transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "bg-card absolute top-full z-50 mt-1 w-72 overflow-hidden rounded-lg border shadow-lg",
            compact ? "right-0" : "left-0",
          )}
        >
          <div className="bg-secondary/40 border-b px-3 py-2">
            <p className="text-foreground truncate text-sm font-semibold">
              {name}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {profile.email} · {ROLE_LABELS[profile.role]}
            </p>
          </div>

          {memberships.length > 0 && (
            <>
              <p className="text-muted-foreground px-3 pt-2.5 pb-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                Çalışılan panel
              </p>
              <ul className="max-h-60 overflow-y-auto pb-1">
                {memberships.map((m) => {
                  const active = m.id === activeOrgId;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => switchTo(m.id)}
                        disabled={active || switching}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                          active
                            ? "bg-primary-soft/50 cursor-default"
                            : "hover:bg-secondary",
                          switching && !active && "opacity-50",
                        )}
                      >
                        <Building2
                          className={cn(
                            "size-4 shrink-0",
                            active ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-sm font-semibold">
                            {m.name}
                          </p>
                          <p className="text-muted-foreground text-[10.5px]">
                            {ROLE_LABELS[m.role as keyof typeof ROLE_LABELS] ??
                              m.role}
                          </p>
                        </div>
                        {active && (
                          <Check className="text-primary size-4 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <Link
            href="/settings/profile"
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-secondary flex w-full items-center gap-2 border-t px-3 py-2 text-sm transition-colors"
          >
            <UserCircle2 className="text-muted-foreground size-4" />
            Profilim ve panellerim
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-foreground hover:bg-secondary flex w-full items-center gap-2 border-t px-3 py-2 text-sm transition-colors"
          >
            <LogOut className="text-muted-foreground size-4" />
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
