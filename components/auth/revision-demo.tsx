"use client";

import { History, ArrowDown, ArrowUp, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoShell } from "@/components/auth/demo-shell";

const CAPTIONS = [
  "İlk teklifler — firmalar fiyat verir, R1 kayıt edilir",
  "Yeni revize geldiğinde R2 olarak işaretlenir; her kalem için fark % otomatik hesaplanır",
  "Turlar arası karşılaştırma: kim ne kadar indirim/zam yaptı, kazanan değişti mi?",
];

export function RevisionDemo() {
  return (
    <DemoShell
      frames={[
        <Frame1Initial key="1" />,
        <Frame2Revised key="2" />,
        <Frame3Compare key="3" />,
      ]}
      captions={CAPTIONS}
    />
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
        <PriceRow firm="Alfa Mühendislik" price="240 TL/adet" winner />
        <PriceRow firm="Gamma Solar" price="265 TL/adet" />
        <PriceRow firm="Beta İnşaat" price="245 TL/adet" />
        <PriceRow firm="Delta Yapı" price="280 TL/adet" />
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
        <Trophy className={cn("size-3", newWinner ? "animate-pulse text-yellow-500" : "text-yellow-500")} />
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
        <PriceRow firm="Alfa Mühendislik" price="232 TL/adet" delta={{ pct: 3.3, up: false }} />
        <PriceRow firm="Gamma Solar" price="240 TL/adet" delta={{ pct: 9.4, up: false }} />
        <PriceRow firm="Beta İnşaat" price="225 TL/adet" delta={{ pct: 8.2, up: false }} newWinner />
        <PriceRow firm="Delta Yapı" price="285 TL/adet" delta={{ pct: 1.8, up: true }} />
      </div>
      <div className="rounded bg-yellow-50 px-2 py-1 text-[10px] text-yellow-900">
        ⚡ Beta İnşaat %8.2 indirimle <strong>kazanan değişti</strong>
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
            { firm: "Alfa", price: "240" },
            { firm: "Beta", price: "245" },
            { firm: "Gamma", price: "265" },
            { firm: "Delta", price: "280" },
          ]}
          winner="Alfa"
        />
        <RevColumn
          title="R2"
          subtitle="Revize"
          highlight
          rows={[
            { firm: "Beta", price: "225", delta: -8.2, color: "emerald" },
            { firm: "Alfa", price: "232", delta: -3.3, color: "emerald" },
            { firm: "Gamma", price: "240", delta: -9.4, color: "emerald" },
            { firm: "Delta", price: "285", delta: 1.8, color: "rose" },
          ]}
          winner="Beta"
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

