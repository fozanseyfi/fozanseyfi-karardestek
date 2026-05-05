"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  Settings2,
  Pencil,
  Lock,
  EyeOff,
  Mail,
  Check,
  GitCompareArrows,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Frame = {
  id: number;
  caption: string;
  body: React.ReactNode;
};

const FRAME_DURATION_MS = 3500;

export function RoleDemo() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % FRAMES.length);
    }, FRAME_DURATION_MS);
    return () => clearInterval(t);
  }, [paused]);

  const frame = FRAMES[active];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Mock browser bar */}
      <div className="flex items-center gap-1.5 border-b bg-slate-50 px-3 py-2">
        <div className="size-2.5 rounded-full bg-rose-400" />
        <div className="size-2.5 rounded-full bg-amber-400" />
        <div className="size-2.5 rounded-full bg-emerald-400" />
        <div className="ml-3 flex-1 truncate rounded bg-white px-2 py-0.5 text-[10px] text-slate-500">
          karardestek.fozanseyfi.com
        </div>
      </div>

      {/* Frame content */}
      <div className="relative h-[260px] bg-slate-50">
        {FRAMES.map((f, idx) => (
          <div
            key={f.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              idx === active ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-hidden={idx !== active}
          >
            {f.body}
          </div>
        ))}
      </div>

      {/* Caption + progress */}
      <div className="border-t bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground text-[10px] font-bold tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(FRAMES.length).padStart(2, "0")}
          </span>
          <span className="text-foreground font-medium">{frame.caption}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {FRAMES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                idx === active ? "bg-blue-600" : idx < active ? "bg-blue-200" : "bg-slate-200"
              )}
              aria-label={`Adım ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============= FRAMES =============

const FRAMES: Frame[] = [
  {
    id: 1,
    caption: "Yönetici, Kullanıcılar sekmesinden ekibini davet eder",
    body: <Frame1AdminUsers />,
  },
  {
    id: 2,
    caption: "Yeni davet: e-posta + rol seçimi (Kullanıcı / Görüntüleyici / Yönetici)",
    body: <Frame2InviteDialog />,
  },
  {
    id: 3,
    caption: "Davet edilen kişi listede görünür — rol her zaman değiştirilebilir",
    body: <Frame3UserAdded />,
  },
  {
    id: 4,
    caption: "⚙️ ikonuyla kullanıcının kaynak erişimi yönetilir",
    body: <Frame4OpenAccess />,
  },
  {
    id: 5,
    caption: "Her karşılaştırma için 3 mod: Tam Erişim · Salt Okunur · Gizli",
    body: <Frame5AccessModes />,
  },
  {
    id: 6,
    caption: "Kullanıcı, salt-okunur işaretlenen karşılaştırmayı görür ama düzenleyemez",
    body: <Frame6UserView />,
  },
];

// --- Frame 1: Admin Users page ---
function Frame1AdminUsers() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 text-slate-700" />
          <span className="text-xs font-semibold">Kullanıcılar</span>
        </div>
        <div className="animate-pulse rounded-md bg-blue-600 px-2 py-1 text-[10px] font-medium text-white shadow-sm ring-2 ring-blue-200">
          <UserPlus className="mr-0.5 inline size-3" />
          Yeni Kullanıcı Davet Et
        </div>
      </div>
      <div className="flex-1 rounded-md border bg-white">
        <Row name="Mert Demir" email="ozan@example.com" role="Yönetici" tone="emerald" you />
      </div>
    </div>
  );
}

// --- Frame 2: Invite dialog ---
function Frame2InviteDialog() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-900/40 p-3">
      <div className="w-[300px] rounded-lg border bg-white p-3 shadow-xl">
        <div className="mb-2 flex items-center gap-1.5">
          <Mail className="size-3.5 text-blue-700" />
          <span className="text-xs font-semibold">Yeni Kullanıcı Davet Et</span>
        </div>
        <div className="space-y-2">
          <div className="rounded border bg-slate-50 px-2 py-1.5 text-[10px] text-slate-600">
            canan@example.com
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Rol</div>
          <div className="grid grid-cols-3 gap-1">
            <RolePill label="Yönetici" tone="emerald" />
            <RolePill label="Kullanıcı" tone="blue" active />
            <RolePill label="Görüntüleyici" tone="slate" />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <div className="rounded bg-blue-600 px-3 py-1 text-[10px] font-medium text-white">
            Davet Gönder
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Frame 3: New user added ---
function Frame3UserAdded() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <Users className="size-3.5 text-slate-700" />
        <span className="text-xs font-semibold">Kullanıcılar</span>
        <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700">
          +1 yeni
        </span>
      </div>
      <div className="flex-1 space-y-1 rounded-md border bg-white">
        <Row name="Mert Demir" email="ozan@example.com" role="Yönetici" tone="emerald" you />
        <Row
          name="Canan Aydın"
          email="canan@example.com"
          role="Kullanıcı"
          tone="blue"
          highlight
        />
      </div>
    </div>
  );
}

// --- Frame 4: Click access settings ---
function Frame4OpenAccess() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <Users className="size-3.5 text-slate-700" />
        <span className="text-xs font-semibold">Kullanıcılar</span>
      </div>
      <div className="flex-1 space-y-1 rounded-md border bg-white">
        <Row name="Mert Demir" email="ozan@example.com" role="Yönetici" tone="emerald" you />
        <RowWithGearHighlight />
      </div>
    </div>
  );
}

// --- Frame 5: Access modes dialog ---
function Frame5AccessModes() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-900/40 p-3">
      <div className="w-[340px] rounded-lg border bg-white p-3 shadow-xl">
        <div className="mb-2 flex items-center gap-1.5">
          <Settings2 className="size-3.5 text-slate-700" />
          <span className="text-xs font-semibold">Canan Aydın — Erişim Yönetimi</span>
        </div>
        <ResourceRow name="Saha A — Mekanik Montaj" mode="full" />
        <ResourceRow name="Saha B — Foundation İşleri" mode="readonly" />
        <ResourceRow name="Trafo Tedarik Q1" mode="hidden" />
      </div>
    </div>
  );
}

// --- Frame 6: User view shows locked badge ---
function Frame6UserView() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <GitCompareArrows className="size-3.5 text-slate-700" />
        <span className="text-xs font-semibold">Karşılaştırmalar</span>
        <span className="ml-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">
          Canan&apos;ın Görünümü
        </span>
      </div>
      <div className="flex-1 space-y-1.5">
        <ComparisonRow name="Saha A — Mekanik Montaj" canEdit />
        <ComparisonRow name="Saha B — Foundation İşleri" canEdit={false} />
      </div>
    </div>
  );
}

// ============= SUB COMPONENTS =============

function Row({
  name,
  email,
  role,
  tone,
  you,
  highlight,
}: {
  name: string;
  email: string;
  role: string;
  tone: "emerald" | "blue" | "slate";
  you?: boolean;
  highlight?: boolean;
}) {
  const toneClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 text-[10px]",
        highlight && "animate-pulse bg-emerald-50/60"
      )}
    >
      <div className={cn("flex size-5 items-center justify-center rounded-full text-[9px] font-bold", toneClasses)}>
        {name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {name}
          {you && <span className="ml-1 rounded border px-1 text-[8px] text-slate-500">SEN</span>}
        </div>
        <div className="truncate text-[9px] text-slate-500">{email}</div>
      </div>
      <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", toneClasses)}>{role}</span>
    </div>
  );
}

function RowWithGearHighlight() {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 text-[10px]">
      <div className="flex size-5 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">
        A
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">Canan Aydın</div>
        <div className="truncate text-[9px] text-slate-500">canan@example.com</div>
      </div>
      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">
        Kullanıcı
      </span>
      <button className="flex size-6 animate-pulse items-center justify-center rounded ring-2 ring-blue-400">
        <Settings2 className="size-3 text-blue-700" />
      </button>
    </div>
  );
}

function RolePill({ label, tone, active }: { label: string; tone: "emerald" | "blue" | "slate"; active?: boolean }) {
  const toneClasses = {
    emerald: active ? "bg-emerald-600 text-white ring-2 ring-emerald-200" : "bg-emerald-50 text-emerald-700",
    blue: active ? "bg-blue-600 text-white ring-2 ring-blue-200" : "bg-blue-50 text-blue-700",
    slate: active ? "bg-slate-600 text-white ring-2 ring-slate-200" : "bg-slate-50 text-slate-600",
  }[tone];
  return (
    <div className={cn("rounded px-1.5 py-1.5 text-center text-[9px] font-medium", toneClasses)}>
      {label}
      {active && <Check className="ml-0.5 inline size-2.5" />}
    </div>
  );
}

function ResourceRow({ name, mode }: { name: string; mode: "full" | "readonly" | "hidden" }) {
  const containerTone = {
    full: "",
    readonly: "bg-amber-50/40",
    hidden: "bg-rose-50/40",
  }[mode];

  return (
    <div className={cn("mt-1.5 flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-[10px]", containerTone)}>
      <span className={cn("truncate", mode === "hidden" && "line-through text-slate-400")}>{name}</span>
      <div className="flex shrink-0 items-center gap-0.5 rounded border bg-white p-0.5">
        <ModeBtn icon={Pencil} active={mode === "full"} tone="emerald" />
        <ModeBtn icon={Lock} active={mode === "readonly"} tone="amber" />
        <ModeBtn icon={EyeOff} active={mode === "hidden"} tone="rose" />
      </div>
    </div>
  );
}

function ModeBtn({
  icon: Icon,
  active,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  tone: "emerald" | "amber" | "rose";
}) {
  const activeTone = {
    emerald: "bg-emerald-600 text-white",
    amber: "bg-amber-500 text-white",
    rose: "bg-rose-600 text-white",
  }[tone];
  return (
    <span
      className={cn(
        "flex size-5 items-center justify-center rounded transition-colors",
        active ? activeTone : "text-slate-400"
      )}
    >
      <Icon className="size-2.5" />
    </span>
  );
}

function ComparisonRow({ name, canEdit }: { name: string; canEdit: boolean }) {
  return (
    <div className="flex items-center justify-between rounded border bg-white px-2 py-2 text-[10px]">
      <div className="flex min-w-0 items-center gap-1.5">
        <GitCompareArrows className="size-3 shrink-0 text-blue-600" />
        <span className="truncate font-medium">{name}</span>
        {!canEdit && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
            <Lock className="-mt-px mr-0.5 inline size-2" /> Salt Okunur
          </span>
        )}
      </div>
      {canEdit ? (
        <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">
          Düzenle
        </span>
      ) : (
        <span className="rounded border bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
          Görüntüle
        </span>
      )}
    </div>
  );
}
