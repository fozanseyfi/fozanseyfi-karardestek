"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  TrendingDown,
  AlertTriangle,
  CircleCheck,
  Activity,
  Sparkles,
  Sliders,
  History,
  FileStack,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 40;

export function HeroPreviewCard() {
  const slides = [
    { key: "ranking", label: "KARŞILAŞTIRMA SONUCU", node: <RankingSlide /> },
    { key: "score", label: "SKOR DETAYI", node: <ScoreBreakdownSlide /> },
    { key: "revisions", label: "REVİZE TURLARI", node: <RevisionsSlide /> },
    { key: "templates", label: "ŞABLON GALERİSİ", node: <TemplatesSlide /> },
  ];

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pulse, setPulse] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const count = slides.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count]);

  useEffect(() => {
    const t = setInterval(() => setPulse((v) => !v), 2000);
    return () => clearInterval(t);
  }, []);

  function next() {
    setActive((p) => (p + 1) % count);
  }
  function prev() {
    setActive((p) => (p - 1 + count) % count);
  }
  function onTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartXRef.current;
    touchStartXRef.current = null;
    setPaused(false);
    if (start === null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0) next();
    else prev();
  }

  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-yellow-200/70 bg-white p-5 shadow-[0_18px_60px_-25px_rgb(202_138_4_/_0.45)] md:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-yellow-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 size-64 rounded-full bg-yellow-50 blur-3xl" />

      {/* Top header line */}
      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-yellow-800">
          <span
            className={cn(
              "inline-block size-1.5 rounded-full bg-yellow-600 transition-opacity",
              pulse ? "opacity-100" : "opacity-30"
            )}
          />
          {slides[active].label}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-600 shadow-sm">
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      </div>

      {/* Slides */}
      <div className="relative mt-4 min-h-[470px] md:min-h-[460px]">
        {slides.map((s, i) => (
          <div
            key={s.key}
            className={cn(
              "transition-opacity duration-500",
              i === active
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            )}
            aria-hidden={i !== active}
          >
            {s.node}
          </div>
        ))}
      </div>

      {/* Side navigation arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Önceki"
        className="absolute top-1/2 left-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 opacity-0 shadow-md backdrop-blur transition-all hover:border-yellow-400 hover:text-yellow-700 group-hover:opacity-100 focus:opacity-100 active:scale-95"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Sonraki"
        className="absolute top-1/2 right-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 opacity-0 shadow-md backdrop-blur transition-all hover:border-yellow-400 hover:text-yellow-700 group-hover:opacity-100 focus:opacity-100 active:scale-95"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Bottom dots */}
      <div className="relative mt-5 flex items-center justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Slayt ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-8 bg-yellow-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ============= SLIDE 1: RANKING =============

const FIRMS = [
  { name: "Alfa Mühendislik", score: 87.4, win: true, badge: "ÖNERİLEN" },
  { name: "Beta İnşaat", score: 81.9 },
  { name: "Gamma Solar", score: 74.2 },
  { name: "Delta Yapı", score: 58.6, outlier: true },
];

const STATS = [
  { label: "Firma", value: "4" },
  { label: "Metrik", value: "10" },
  { label: "Revize", value: "R3" },
  { label: "Tasarruf", value: "%6.4" },
];

function RankingSlide() {
  return (
    <div className="relative">
      <div className="text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">
        GES Kuzey Saha
      </div>
      <h3 className="mt-0.5 text-xl font-semibold leading-tight tracking-tight text-slate-900 md:text-2xl">
        İnverter tedariği — karşılaştırma sonucu
      </h3>

      {/* Winner card */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/60 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow-600 text-white shadow-md">
            <Trophy className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-yellow-700 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
                1. SIRA
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-yellow-800">
                ÖNERİLEN
              </span>
            </div>
            <div className="mt-0.5 truncate text-base font-bold tracking-tight text-slate-900">
              Alfa Mühendislik
            </div>
            <div className="text-[11px] text-slate-600">
              %92 hedef sapma · %100 kapsam · 90 teknik
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold tracking-wider text-yellow-700">SKOR</div>
            <div className="text-2xl leading-none font-black tabular-nums text-yellow-700">
              87.4
            </div>
          </div>
        </div>
      </div>

      {/* Ranking bars */}
      <div className="mt-3 space-y-1.5">
        {FIRMS.map((f, i) => (
          <RankBar key={f.name} rank={i + 1} {...f} />
        ))}
      </div>

      {/* Stats strip */}
      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center shadow-sm"
          >
            <div className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">
              {s.label}
            </div>
            <div className="text-sm font-bold tabular-nums text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Footer chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip icon={Sparkles} label="10 metrikli skor" />
        <Chip icon={Activity} label="R1 → R3 revize" />
        <Chip icon={TrendingDown} label="%6.4 tasarruf" />
        <Chip icon={CircleCheck} label="PDF + Excel" />
      </div>
    </div>
  );
}

function RankBar({
  rank,
  name,
  score,
  win,
  outlier,
  badge,
}: {
  rank: number;
  name: string;
  score: number;
  win?: boolean;
  outlier?: boolean;
  badge?: string;
}) {
  const max = 100;
  const pct = Math.max(8, (score / max) * 100);
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
        win ? "border-yellow-200 bg-yellow-50/60" : "border-slate-200 bg-white"
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          rank === 1 ? "bg-yellow-600 text-white" : "bg-slate-100 text-slate-600"
        )}
      >
        {rank}
      </span>
      <span className="w-32 truncate text-[11px] font-semibold text-slate-800">{name}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            win ? "bg-gradient-to-r from-yellow-500 to-yellow-700" : "bg-slate-300"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {outlier && (
        <span className="inline-flex items-center gap-0.5 rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
          <AlertTriangle className="size-2.5" />
          ANOMALİ
        </span>
      )}
      {badge && !outlier && (
        <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
          {badge}
        </span>
      )}
      <span className="w-10 text-right text-xs font-bold tabular-nums text-slate-900">
        {score}
      </span>
    </div>
  );
}

// ============= SLIDE 2: SCORE BREAKDOWN =============

const METRICS: { label: string; type: "auto" | "manual"; pct: number; weight: number }[] = [
  { label: "Hedef Sapma", type: "auto", pct: 92, weight: 25 },
  { label: "Kapsam", type: "auto", pct: 100, weight: 20 },
  { label: "Teknik Yeterlilik", type: "manual", pct: 90, weight: 20 },
  { label: "Referanslar", type: "manual", pct: 85, weight: 15 },
  { label: "Ödeme Şartları", type: "manual", pct: 70, weight: 10 },
  { label: "Teslim Süresi", type: "manual", pct: 80, weight: 5 },
  { label: "En Düşük Teklif", type: "auto", pct: 85, weight: 5 },
];

function ScoreBreakdownSlide() {
  return (
    <div className="relative">
      <div className="text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">
        Alfa Mühendislik
      </div>
      <h3 className="mt-0.5 text-xl font-semibold leading-tight tracking-tight text-slate-900 md:text-2xl">
        Skor hesaplaması — adım adım şeffaf
      </h3>

      {/* Score header card */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/60 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow-600 text-white shadow-md">
            <Sliders className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold tracking-wider text-yellow-800">
              7 METRİK · 3 OTOMATİK + 4 MANUEL
            </div>
            <div className="mt-0.5 text-base font-bold tracking-tight text-slate-900">
              Toplam ağırlıklı skor
            </div>
            <div className="text-[11px] text-slate-600">Lineer interpolasyon · şeffaf formül</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold tracking-wider text-yellow-700">SKOR</div>
            <div className="text-2xl leading-none font-black tabular-nums text-yellow-700">
              87.4
            </div>
          </div>
        </div>
      </div>

      {/* Metrics list */}
      <div className="mt-3 space-y-1">
        {METRICS.map((m) => (
          <div key={m.label} className="flex items-center gap-2 text-[11px]">
            <span
              className={cn(
                "rounded px-1 py-0.5 text-[8px] font-bold",
                m.type === "auto" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"
              )}
            >
              {m.type === "auto" ? "OTO" : "MAN"}
            </span>
            <span className="w-32 truncate font-medium text-slate-700">{m.label}</span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full",
                  m.type === "auto" ? "bg-blue-500" : "bg-violet-500"
                )}
                style={{ width: `${m.pct}%` }}
              />
            </div>
            <span className="w-7 text-right tabular-nums text-slate-500">×{m.weight}%</span>
            <span className="w-7 text-right font-bold tabular-nums text-slate-900">{m.pct}</span>
          </div>
        ))}
      </div>

      {/* Footer chips */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip icon={Sliders} label="Toplam 100 ağırlık" />
        <Chip icon={CircleCheck} label="Otomatik + manuel" />
        <Chip icon={Activity} label="Şeffaf breakdown" />
        <Chip icon={Sparkles} label="Anomali tespiti" />
      </div>
    </div>
  );
}

// ============= SLIDE 3: REVISIONS =============

const REVISION_ROWS = [
  { item: "İnverter 250 kW", r1: 482000, r2: 459500, r3: 451200 },
  { item: "DC Kablolama", r1: 128400, r2: 124000, r3: 122600 },
  { item: "Yapısal Çelik", r1: 96200, r2: 96200, r3: 92500 },
  { item: "Mühendislik", r1: 85000, r2: 81000, r3: 79000 },
];

function fmtTRY(n: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);
}

function RevisionsSlide() {
  const totalR1 = REVISION_ROWS.reduce((s, r) => s + r.r1, 0);
  const totalR3 = REVISION_ROWS.reduce((s, r) => s + r.r3, 0);
  const savings = (((totalR3 - totalR1) / totalR1) * 100).toFixed(1);

  return (
    <div className="relative">
      <div className="text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">
        Alfa Mühendislik
      </div>
      <h3 className="mt-0.5 text-xl font-semibold leading-tight tracking-tight text-slate-900 md:text-2xl">
        Revize turları — kalem bazında karşılaştırma
      </h3>

      {/* Summary card */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/60 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow-600 text-white shadow-md">
            <History className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold tracking-wider text-yellow-800">
              R1 → R2 → R3 · 3 TUR
            </div>
            <div className="mt-0.5 text-base font-bold tracking-tight text-slate-900">
              Toplam tasarruf
            </div>
            <div className="text-[11px] text-slate-600">
              {fmtTRY(totalR1 - totalR3)} TRY · {savings}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold tracking-wider text-yellow-700">FİNAL</div>
            <div className="text-lg leading-none font-black tabular-nums text-yellow-700">
              {fmtTRY(totalR3)}
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <div className="grid grid-cols-[1fr_64px_64px_64px_56px] items-center gap-2 bg-slate-50 px-3 py-1.5 text-[9px] font-bold tracking-wider text-slate-500 uppercase">
          <span>Kalem</span>
          <span className="text-right">R1</span>
          <span className="text-right">R2</span>
          <span className="text-right">R3</span>
          <span className="text-right">Δ %</span>
        </div>
        {REVISION_ROWS.map((r) => {
          const delta = +(((r.r3 - r.r1) / r.r1) * 100).toFixed(1);
          return (
            <div
              key={r.item}
              className="grid grid-cols-[1fr_64px_64px_64px_56px] items-center gap-2 border-t border-slate-100 px-3 py-1.5 text-[11px]"
            >
              <span className="truncate font-medium text-slate-800">{r.item}</span>
              <span className="text-right tabular-nums text-slate-500">{fmtTRY(r.r1)}</span>
              <span className="text-right tabular-nums text-slate-600">{fmtTRY(r.r2)}</span>
              <span className="text-right font-semibold tabular-nums text-slate-900">
                {fmtTRY(r.r3)}
              </span>
              <span
                className={cn(
                  "rounded px-1 py-0.5 text-right text-[10px] font-bold tabular-nums",
                  delta < 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                )}
              >
                {delta > 0 ? "+" : ""}
                {delta}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip icon={History} label="R1 → R3 turlar" />
        <Chip icon={TrendingDown} label="% indirim/zam" />
        <Chip icon={CircleCheck} label="Kazanan değişti mi?" />
        <Chip icon={Activity} label="Tarihsel kayıt" />
      </div>
    </div>
  );
}

// ============= SLIDE 4: TEMPLATES =============

const TEMPLATES = [
  { name: "GES — İnverter Tedariği", items: 14, tone: "blue" },
  { name: "GES — Panel Tedariği", items: 18, tone: "yellow" },
  { name: "GES — DC/AC Kablolama", items: 22, tone: "violet" },
  { name: "RES — Türbin Tedariği", items: 26, tone: "emerald" },
  { name: "RES — Trafo & Şalt", items: 19, tone: "rose" },
  { name: "Mühendislik Hizmetleri", items: 11, tone: "slate" },
];

const TEMPLATE_TONES: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
};

function TemplatesSlide() {
  return (
    <div className="relative">
      <div className="text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">
        GES + RES + Ortak
      </div>
      <h3 className="mt-0.5 text-xl font-semibold leading-tight tracking-tight text-slate-900 md:text-2xl">
        6 hazır şablon — sıfırdan başlamayın
      </h3>

      {/* Header card */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/60 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow-600 text-white shadow-md">
            <FileStack className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold tracking-wider text-yellow-800">
              ÖRNEK FİRMALAR · MANUEL SKORLAR · 3 REVİZE
            </div>
            <div className="mt-0.5 text-base font-bold tracking-tight text-slate-900">
              Tek tıkla klonla, kullanmaya başla
            </div>
            <div className="text-[11px] text-slate-600">
              Ağırlık özelleştir · firma ekle/çıkar · sıfırla
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold tracking-wider text-yellow-700">ŞABLON</div>
            <div className="text-2xl leading-none font-black tabular-nums text-yellow-700">6</div>
          </div>
        </div>
      </div>

      {/* Templates grid */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md",
                TEMPLATE_TONES[t.tone]
              )}
            >
              <FileStack className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-semibold text-slate-900">{t.name}</div>
              <div className="text-[10px] text-slate-500">
                {t.items} kalem · 3 firma · R1-R3
              </div>
            </div>
            <span className="rounded-md bg-yellow-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-yellow-700">
              KLONLA
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= SHARED =============

function Chip({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
      <Icon className="size-3 text-yellow-700" />
      {label}
    </span>
  );
}
