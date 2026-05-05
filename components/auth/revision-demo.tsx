"use client";

import { useEffect, useState } from "react";
import { History, ArrowDown, ArrowUp, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const FRAME_DURATION_MS = 3500;

const CAPTIONS = [
  "İlk teklifler — firmalar fiyat verir, R1 kayıt edilir",
  "Yeni revize geldiğinde R2 olarak işaretlenir; her kalem için fark % otomatik hesaplanır",
  "Turlar arası karşılaştırma: kim ne kadar indirim/zam yaptı, kazanan değişti mi?",
];

export function RevisionDemo() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % 3), FRAME_DURATION_MS);
    return () => clearInterval(t);
  }, [paused]);

  const Frames = [Frame1Initial, Frame2Revised, Frame3Compare];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <BrowserChrome />
      <div className="relative h-[260px] bg-slate-50">
        {Frames.map((F, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              idx === active ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <F />
          </div>
        ))}
      </div>
      <Caption active={active} count={3} captions={CAPTIONS} />
    </div>
  );
}

function Frame1Initial() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <History className="size-3.5 text-slate-700" />
        <span className="text-xs font-semibold">İlk Tur (R1)</span>
        <span className="ml-auto rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
          Revize 1/1
        </span>
      </div>
      <div className="flex-1 space-y-1">
        <PriceRow firm="Sesa Mühendislik" price="240 TL/adet" winner />
        <PriceRow firm="Soldera Solar" price="265 TL/adet" />
        <PriceRow firm="Bekir Ökmen" price="245 TL/adet" />
        <PriceRow firm="Efesun Yapı" price="280 TL/adet" />
      </div>
      <div className="text-muted-foreground rounded bg-blue-50 px-2 py-1 text-[10px]">
        Mekanik kazık çakımı · 1000 adet
      </div>
    </div>
  );
}

function PriceRow({
  firm,
  price,
  winner,
  delta,
  newWinner,
}: {
  firm: string;
  price: string;
  winner?: boolean;
  delta?: { pct: number; up: boolean };
  newWinner?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-white px-2 py-1.5 text-[10px]",
        (winner || newWinner) && "border-emerald-200 bg-emerald-50/40"
      )}
    >
      <span className="min-w-0 flex-1 truncate font-medium">{firm}</span>
      <span className="font-semibold tabular-nums">{price}</span>
      {delta && (
        <span
          className={cn(
            "flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium",
            delta.up ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
          )}
        >
          {delta.up ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
          {delta.pct}%
        </span>
      )}
      {(winner || newWinner) && (
        <Trophy className={cn("size-3", newWinner ? "animate-pulse text-amber-500" : "text-amber-500")} />
      )}
    </div>
  );
}

function Frame2Revised() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <RotateCcw className="size-3.5 text-blue-600" />
        <span className="text-xs font-semibold">Yeni Tur (R2)</span>
        <span className="ml-auto rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">
          Revize 2/2
        </span>
      </div>
      <div className="flex-1 space-y-1">
        <PriceRow firm="Sesa Mühendislik" price="232 TL/adet" delta={{ pct: 3.3, up: false }} />
        <PriceRow firm="Soldera Solar" price="240 TL/adet" delta={{ pct: 9.4, up: false }} />
        <PriceRow firm="Bekir Ökmen" price="225 TL/adet" delta={{ pct: 8.2, up: false }} newWinner />
        <PriceRow firm="Efesun Yapı" price="285 TL/adet" delta={{ pct: 1.8, up: true }} />
      </div>
      <div className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-900">
        ⚡ Bekir Ökmen %8.2 indirimle <strong>kazanan değişti</strong>
      </div>
    </div>
  );
}

function Frame3Compare() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold">Turlar Arası Karşılaştırma</span>
      </div>
      <div className="flex flex-1 gap-2">
        <RevColumn
          title="R1"
          subtitle="İlk Teklif"
          rows={[
            { firm: "Sesa", price: "240" },
            { firm: "Bekir", price: "245" },
            { firm: "Soldera", price: "265" },
            { firm: "Efesun", price: "280" },
          ]}
          winner="Sesa"
        />
        <RevColumn
          title="R2"
          subtitle="Revize"
          highlight
          rows={[
            { firm: "Bekir", price: "225", delta: -8.2, color: "emerald" },
            { firm: "Sesa", price: "232", delta: -3.3, color: "emerald" },
            { firm: "Soldera", price: "240", delta: -9.4, color: "emerald" },
            { firm: "Efesun", price: "285", delta: 1.8, color: "rose" },
          ]}
          winner="Bekir"
        />
      </div>
    </div>
  );
}

function RevColumn({
  title,
  subtitle,
  rows,
  winner,
  highlight,
}: {
  title: string;
  subtitle: string;
  rows: { firm: string; price: string; delta?: number; color?: "emerald" | "rose" }[];
  winner?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 rounded-lg border bg-white p-2",
        highlight && "border-blue-200 bg-blue-50/30 ring-1 ring-blue-100"
      )}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-bold">{title}</span>
        <span className="text-[9px] text-slate-500">{subtitle}</span>
      </div>
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div
            key={r.firm}
            className={cn(
              "flex items-center justify-between rounded px-1 py-0.5 text-[9px]",
              r.firm === winner && "bg-emerald-100"
            )}
          >
            <span className="truncate font-medium">{r.firm}</span>
            <div className="flex items-center gap-1">
              <span className="tabular-nums">{r.price}</span>
              {r.delta !== undefined && (
                <span
                  className={cn(
                    "rounded px-1 text-[8px] font-medium",
                    r.color === "emerald" ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"
                  )}
                >
                  {r.delta > 0 ? "+" : ""}
                  {r.delta}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrowserChrome() {
  return (
    <div className="flex items-center gap-1.5 border-b bg-slate-50 px-3 py-2">
      <div className="size-2.5 rounded-full bg-rose-400" />
      <div className="size-2.5 rounded-full bg-amber-400" />
      <div className="size-2.5 rounded-full bg-emerald-400" />
      <div className="ml-3 flex-1 truncate rounded bg-white px-2 py-0.5 text-[10px] text-slate-500">
        karardestek.fozanseyfi.com
      </div>
    </div>
  );
}

function Caption({ active, count, captions }: { active: number; count: number; captions: string[] }) {
  return (
    <div className="border-t bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground text-[10px] font-bold tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <span className="text-foreground font-medium">{captions[active]}</span>
      </div>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: count }).map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              idx === active ? "bg-blue-600" : idx < active ? "bg-blue-200" : "bg-slate-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}
