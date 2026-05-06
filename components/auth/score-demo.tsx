"use client";

import { Trophy, AlertTriangle, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoShell } from "@/components/auth/demo-shell";

const CAPTIONS = [
  "10 metriği seç ve ağırlıklarını ayarla — toplam 100 olmalı",
  "Otomatik (kapsam, sapma, en düşük) + manuel (teknik, referans, ödeme...) skorlar birleşir",
  "Ağırlıklı skor sıralaması — anomali firmalar otomatik işaretlenir",
];

export function ScoreDemo() {
  return (
    <DemoShell
      frames={[
        <Frame1MetricSelect key="1" />,
        <Frame2ScoreCalc key="2" />,
        <Frame3Ranking key="3" />,
      ]}
      captions={CAPTIONS}
    />
  );
}

function Frame1MetricSelect() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <Sliders className="size-3.5 text-slate-700" />
        <span className="text-xs font-semibold">Skorlama Metriklerini Düzenle</span>
        <span className="ml-auto rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
          100/100
        </span>
      </div>
      <div className="flex-1 space-y-1.5">
        <MetricBar label="Hedef Sapma" tone="auto" weight={25} />
        <MetricBar label="Kapsam" tone="auto" weight={20} />
        <MetricBar label="Teknik Yeterlilik" tone="manual" weight={20} />
        <MetricBar label="Referanslar" tone="manual" weight={15} />
        <MetricBar label="Ödeme Şartları" tone="manual" weight={10} />
        <MetricBar label="Teslim Süresi" tone="manual" weight={10} />
      </div>
    </div>
  );
}

function MetricBar({ label, tone, weight }: { label: string; tone: "auto" | "manual"; weight: number }) {
  const toneBg = tone === "auto" ? "bg-blue-500" : "bg-violet-500";
  const toneText = tone === "auto" ? "text-blue-700" : "text-violet-700";
  const toneTag = tone === "auto" ? "bg-blue-50" : "bg-violet-50";
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className={cn("rounded px-1 py-0.5 text-[8px] font-medium", toneTag, toneText)}>
        {tone === "auto" ? "OTO" : "MAN"}
      </span>
      <span className="w-32 truncate font-medium">{label}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full transition-[width]", toneBg)} style={{ width: `${weight}%` }} />
      </div>
      <span className="w-7 text-right font-semibold tabular-nums">{weight}%</span>
    </div>
  );
}

function Frame2ScoreCalc() {
  return (
    <div className="flex h-full flex-col gap-1.5 p-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold">Skor Hesaplama — Alfa Mühendislik</span>
      </div>
      <div className="flex-1 space-y-1">
        <ScoreLine label="Hedef Sapma" type="auto" pct={92} weight={25} />
        <ScoreLine label="Kapsam" type="auto" pct={100} weight={20} />
        <ScoreLine label="En Düşük Teklif" type="auto" pct={85} weight={5} />
        <ScoreLine label="Teknik Yeterlilik" type="manual" pct={90} weight={20} />
        <ScoreLine label="Referanslar" type="manual" pct={85} weight={15} />
        <ScoreLine label="Ödeme Şartları" type="manual" pct={70} weight={10} />
        <ScoreLine label="Teslim Süresi" type="manual" pct={80} weight={5} />
      </div>
      <div className="mt-1 flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1 text-[11px]">
        <span className="font-semibold text-emerald-900">Toplam Skor</span>
        <span className="text-base font-bold tabular-nums text-emerald-700">87.4</span>
      </div>
    </div>
  );
}

function ScoreLine({ label, type, pct, weight }: { label: string; type: "auto" | "manual"; pct: number; weight: number }) {
  const tone = type === "auto" ? "bg-blue-500" : "bg-violet-500";
  return (
    <div className="flex items-center gap-2 text-[9px]">
      <span className={cn("inline-block size-1.5 rounded-full", tone)} />
      <span className="w-32 truncate text-slate-700">{label}</span>
      <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right tabular-nums text-slate-600">×{weight}%</span>
      <span className="w-8 text-right font-semibold tabular-nums">{pct}</span>
    </div>
  );
}

function Frame3Ranking() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <Trophy className="size-3.5 text-amber-600" />
        <span className="text-xs font-semibold">Sıralama</span>
      </div>
      <div className="flex-1 space-y-1.5">
        <RankRow rank={1} name="Alfa Mühendislik" score={87.4} highlight badge="ÖNERİLEN" />
        <RankRow rank={2} name="Beta İnşaat" score={81.9} />
        <RankRow rank={3} name="Gamma Solar" score={74.2} />
        <RankRow rank={4} name="Delta Yapı" score={58.6} outlier />
      </div>
    </div>
  );
}

function RankRow({
  rank,
  name,
  score,
  highlight,
  badge,
  outlier,
}: {
  rank: number;
  name: string;
  score: number;
  highlight?: boolean;
  badge?: string;
  outlier?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-white px-2 py-1.5 text-[10px]",
        highlight && "border-emerald-200 bg-emerald-50/40"
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
          rank === 1 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
        )}
      >
        {rank}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
      {outlier && (
        <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-medium text-rose-700">
          <AlertTriangle className="-mt-px mr-0.5 inline size-2.5" />
          ANOMALİ
        </span>
      )}
      {badge && (
        <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
      <span className="w-10 text-right text-[11px] font-bold tabular-nums">{score}</span>
    </div>
  );
}

