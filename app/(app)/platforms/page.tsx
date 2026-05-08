"use client";

import {
  Sparkles,
  FolderKanban,
  LineChart,
  Wrench,
  ExternalLink,
  Boxes,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "violet" | "blue" | "rose";

type Platform = {
  key: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  href: string | null;
};

const PLATFORMS: Platform[] = [
  {
    key: "solar-teklif",
    title: "Solar Teklif Platformu",
    tagline: "EPC fiyatlandırma & cash flow",
    description:
      "Solar EPC projeleri için fiyatlandırma, akıllı marj hesabı ve nakit akışı yönetimi. Hazır şablonlar, PDF & Excel çıktıları ile teklif sürecini saatler yerine dakikalar içinde tamamlarsın.",
    icon: Sparkles,
    tone: "emerald",
    href: "https://teklif.fozanseyfi.com",
  },
  {
    key: "proje-yonetim",
    title: "Proje Yönetim Platformu",
    tagline: "Çoklu proje, ekip & ilerleme",
    description:
      "Birden fazla projeyi tek panelde yönet: milestone takibi, görev atama, ilerleme yüzdeleri ve bütçe izleme. Ekip içi şeffaflık, geç kalan iş yok.",
    icon: FolderKanban,
    tone: "violet",
    href: null,
  },
  {
    key: "fizibilite",
    title: "Solar Fizibilite Platformu",
    tagline: "Yatırım & geri ödeme analizi",
    description:
      "Solar yatırım kararları için geri ödeme süresi, IRR ve NPV hesaplamaları. Senaryo karşılaştırması ve risk değerlendirme — yatırımcıya gitmeden önce sayıları gör.",
    icon: LineChart,
    tone: "blue",
    href: null,
  },
  {
    key: "ges-muhendislik",
    title: "GES Mühendislik Platformu",
    tagline: "Tasarım, hesap & dokümantasyon",
    description:
      "Tasarım hesabı, kayıp analizi, kablo & inverter seçimi. Tek hat şeması ve teknik dokümantasyon üretimi — sahaya inmeden önce her şey hazır.",
    icon: Wrench,
    tone: "rose",
    href: null,
  },
];

const TONE_STYLES: Record<
  Tone,
  { iconBg: string; iconText: string; ring: string; hoverBorder: string; gradient: string }
> = {
  emerald: {
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    ring: "ring-emerald-200/60",
    hoverBorder: "hover:border-emerald-300",
    gradient: "from-emerald-50/60 via-white to-white",
  },
  violet: {
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    ring: "ring-violet-200/60",
    hoverBorder: "hover:border-violet-300",
    gradient: "from-violet-50/60 via-white to-white",
  },
  blue: {
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
    ring: "ring-blue-200/60",
    hoverBorder: "hover:border-blue-300",
    gradient: "from-blue-50/60 via-white to-white",
  },
  rose: {
    iconBg: "bg-rose-100",
    iconText: "text-rose-700",
    ring: "ring-rose-200/60",
    hoverBorder: "hover:border-rose-300",
    gradient: "from-rose-50/60 via-white to-white",
  },
};

export default function PlatformsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-yellow-200/60 bg-gradient-to-br from-yellow-50/80 via-white to-white p-7 md:p-10">
        <div className="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-yellow-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-yellow-50 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200/70 bg-yellow-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-yellow-700 uppercase">
            <Boxes className="size-3" />
            Diğer Platformlar
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Geliştirdiğim diğer platformlara da göz atın
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
            Hepsi tamamen ücretsiz, <strong>bağımsız bir inisiyatifle</strong> sektör paydaşlarına
            sunuluyor. Buraya yaptığınız tek kayıt ile tüm platformlara aynı şifreyle
            giriş yaparsınız.
          </p>
        </div>
      </div>

      {/* PLATFORMS GRID */}
      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((p) => (
          <PlatformCard key={p.key} platform={p} />
        ))}
      </div>
    </div>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  const tone = TONE_STYLES[platform.tone];
  const Icon = platform.icon;
  const isLive = platform.href !== null;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br p-6 shadow-sm transition-all",
        tone.gradient,
        isLive ? `hover:shadow-md ${tone.hoverBorder}` : "opacity-95"
      )}
    >
      {/* Header: icon + status badge */}
      <div className="flex items-start justify-between">
        <div className={cn("flex size-12 items-center justify-center rounded-xl", tone.iconBg, tone.iconText)}>
          <Icon className="size-6" />
        </div>
        {isLive ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            CANLIDA
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-500">
            YAKINDA
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-4 flex-1">
        <div className={cn("text-[11px] font-semibold tracking-[0.14em] uppercase", tone.iconText)}>
          {platform.tagline}
        </div>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
          {platform.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{platform.description}</p>
      </div>

      {/* Footer: action button */}
      <div className="mt-5">
        {isLive ? (
          <a
            href={platform.href!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-yellow-700"
          >
            İncele
            <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-400"
          >
            Yakında
            <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>
    </article>
  );
}
