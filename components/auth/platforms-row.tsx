"use client";

import { Sparkles, FolderKanban, Trophy, LineChart, Wrench, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "violet" | "amber" | "blue" | "rose";

type Platform = {
  key: string;
  title: string;
  short: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  href: string | null;
  current?: boolean;
};

const PLATFORMS: Platform[] = [
  {
    key: "karar-destek",
    title: "Satınalma Karar Destek",
    short: "Satınalma Karar Destek",
    description: "Çoklu kriterli skor ile en doğru tedarik",
    icon: Trophy,
    tone: "amber",
    href: "/login",
    current: true,
  },
  {
    key: "solar-teklif",
    title: "Solar Teklif Platformu",
    short: "Solar Teklif Pla...",
    description: "Solar EPC fiyatlandırma & cash flow",
    icon: Sparkles,
    tone: "emerald",
    href: "https://teklif.fozanseyfi.com",
  },
  {
    key: "proje-yonetim",
    title: "Proje Yönetim Platformu",
    short: "Proje Yönetim Platformu",
    description: "Çoklu proje, ekip & ilerleme takibi",
    icon: FolderKanban,
    tone: "violet",
    href: null,
  },
  {
    key: "fizibilite",
    title: "Solar Fizibilite Platformu",
    short: "Solar Fizibilite Platformu",
    description: "Solar yatırım & geri ödeme analizi",
    icon: LineChart,
    tone: "blue",
    href: null,
  },
  {
    key: "ges-muhendislik",
    title: "GES Mühendislik Platformu",
    short: "GES Mühendislik Platformu",
    description: "Tasarım, hesap & teknik dokümantasyon",
    icon: Wrench,
    tone: "rose",
    href: null,
  },
];

const TONE_STYLES: Record<Tone, { iconBg: string; iconText: string; ring: string; hoverBorder: string }> = {
  emerald: {
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    ring: "ring-emerald-200/70",
    hoverBorder: "hover:border-emerald-300",
  },
  violet: {
    iconBg: "bg-violet-100",
    iconText: "text-violet-600",
    ring: "ring-violet-200/70",
    hoverBorder: "hover:border-violet-300",
  },
  amber: {
    iconBg: "bg-yellow-100",
    iconText: "text-yellow-600",
    ring: "ring-yellow-300",
    hoverBorder: "hover:border-yellow-300",
  },
  blue: {
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    ring: "ring-blue-200/70",
    hoverBorder: "hover:border-blue-300",
  },
  rose: {
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    ring: "ring-rose-200/70",
    hoverBorder: "hover:border-rose-300",
  },
};

export function PlatformsRow() {
  return (
    <div className="border-t border-yellow-200/70 bg-yellow-50/40">
    <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-14">
      <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-yellow-200/70 bg-yellow-50 px-3 py-1 text-[11px] font-medium text-yellow-800">
        <Sparkles className="size-3" />
        DİĞER ÜCRETSİZ PLATFORMLARIM
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
        Geliştirdiğim diğer platformlara da göz atın
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
        Hepsi tamamen ücretsiz, <strong>bağımsız bir inisiyatifle</strong> sektör paydaşlarına sunuluyor. Buraya
        yaptığınız tek kayıt ile <strong>tüm platformlarıma aynı şifreyle giriş yapabilirsiniz</strong> — diğer
        platformlarıma ulaşmak için kart üzerine tıklamanız yeterli.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {PLATFORMS.map((p) => (
          <PlatformCard key={p.key} platform={p} />
        ))}
      </div>
    </section>
    </div>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  const tone = TONE_STYLES[platform.tone];
  const Icon = platform.icon;
  const disabled = platform.href === null;
  const isExternal = platform.href !== null && platform.href.startsWith("http");

  const inner = (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-2 rounded-2xl border bg-white p-4 shadow-sm transition-all",
        platform.current
          ? "border-yellow-300 ring-2 ring-yellow-300/60"
          : disabled
            ? "border-slate-200 opacity-90"
            : `border-slate-200 hover:shadow-md ${tone.hoverBorder}`
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-lg", tone.iconBg, tone.iconText)}>
          <Icon className="size-4" />
        </div>
        {platform.current ? (
          <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white shadow-sm">
            BURADASIN
          </span>
        ) : disabled ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-500">
            YAKINDA
          </span>
        ) : isExternal ? (
          <ExternalLink className="size-3.5 text-slate-400 transition-colors group-hover:text-slate-700" />
        ) : null}
      </div>
      <div className="text-sm font-semibold tracking-tight text-slate-900">{platform.title}</div>
      <div className="text-xs leading-snug text-slate-500">{platform.description}</div>
    </div>
  );

  if (platform.current) {
    return <div className="cursor-default">{inner}</div>;
  }

  if (disabled) {
    return <div className="cursor-not-allowed">{inner}</div>;
  }

  if (isExternal) {
    return (
      <a href={platform.href!} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }

  return (
    <a href={platform.href!} className="block">
      {inner}
    </a>
  );
}
