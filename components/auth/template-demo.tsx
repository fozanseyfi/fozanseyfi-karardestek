"use client";

import { FileStack, Sparkles, Building2, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoShell } from "@/components/auth/demo-shell";

const CAPTIONS = [
  "GES & RES için 6 hazır şablon — örnek firmalar, fiyatlar ve skorlarla dolu",
  "Tek tıkla şablonu klonla — kendi karşılaştırmana dönüşür",
  "Firmaları ve fiyatları kendi tekliflerinle değiştir, hazır metrik ağırlıklarını koru",
];

export function TemplateDemo() {
  return (
    <DemoShell
      frames={[
        <Frame1Gallery key="1" />,
        <Frame2Clone key="2" />,
        <Frame3Editing key="3" />,
      ]}
      captions={CAPTIONS}
    />
  );
}

function Frame1Gallery() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <FileStack className="size-3.5 text-slate-700" />
        <span className="text-xs font-semibold">Şablonlar</span>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        <TemplateCard category="GES" name="Mekanik Montaj" items={6} firms={4} />
        <TemplateCard category="GES" name="MV/LV Kablo" items={5} firms={3} />
        <TemplateCard category="RES" name="Foundation" items={6} firms={3} highlight />
        <TemplateCard category="RES" name="Kule Erection" items={4} firms={3} />
      </div>
    </div>
  );
}

function TemplateCard({
  category,
  name,
  items,
  firms,
  highlight,
}: {
  category: "GES" | "RES";
  name: string;
  items: number;
  firms: number;
  highlight?: boolean;
}) {
  const cat = category === "GES" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border bg-white p-2",
        highlight && "ring-2 ring-blue-400 ring-offset-1"
      )}
    >
      <div className="flex items-center gap-1">
        <span className={cn("rounded px-1 py-0.5 text-[8px] font-bold", cat)}>{category}</span>
        <Sparkles className="ml-auto size-3 text-amber-500" />
      </div>
      <div className="text-[10px] font-semibold leading-tight">{name}</div>
      <div className="text-[9px] text-slate-500">
        {items} kalem · {firms} firma
      </div>
      {highlight && (
        <div className="mt-auto rounded bg-blue-600 px-1.5 py-0.5 text-center text-[9px] font-medium text-white">
          Bu Şablonu Kullan
        </div>
      )}
    </div>
  );
}

function Frame2Clone() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
      <div className="flex items-center gap-3">
        <CloneCard label="RES Foundation" sub="Şablon" tone="emerald" />
        <ArrowRight className="size-5 animate-pulse text-blue-600" />
        <CloneCard label="RES Foundation" sub="Senin Karşılaştırman" tone="blue" highlight />
      </div>
      <div className="mt-2 grid w-full max-w-xs grid-cols-2 gap-2 text-[10px]">
        <CloneFeature text="3 firma kopyalandı" />
        <CloneFeature text="6 kalem yüklendi" />
        <CloneFeature text="Fiyatlar atandı" />
        <CloneFeature text="Manuel skorlar set" />
      </div>
    </div>
  );
}

function CloneCard({
  label,
  sub,
  tone,
  highlight,
}: {
  label: string;
  sub: string;
  tone: "emerald" | "blue";
  highlight?: boolean;
}) {
  const toneClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
  }[tone];
  return (
    <div className={cn("rounded-lg border-2 p-2.5", toneClasses, highlight && "shadow-md")}>
      <div className="text-[9px] font-medium uppercase tracking-wide opacity-70">{sub}</div>
      <div className="text-[11px] font-semibold">{label}</div>
    </div>
  );
}

function CloneFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check className="size-2 text-emerald-700" />
      </span>
      <span className="truncate text-slate-700">{text}</span>
    </div>
  );
}

function Frame3Editing() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <Building2 className="size-3.5 text-slate-700" />
        <span className="text-xs font-semibold">Firmalar — Senin Tekliflerinle Düzenle</span>
      </div>
      <div className="flex-1 space-y-1.5">
        <FirmEditRow original="Örnek Firma A" custom="Alfa Mühendislik" />
        <FirmEditRow original="Örnek Firma B" custom="Beta İnşaat" />
        <FirmEditRow original="Örnek Firma C" custom="Gamma Yapı" unchanged />
      </div>
      <div className="rounded-md bg-blue-50 px-2 py-1.5 text-[9px] text-blue-900">
        ✓ Metrik ağırlıkları (foundation için optimize edilmiş 6 metrik) korunuyor
      </div>
    </div>
  );
}

function FirmEditRow({
  original,
  custom,
  unchanged,
}: {
  original: string;
  custom: string;
  unchanged?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <Building2 className="size-3 text-slate-400" />
      {!unchanged ? (
        <>
          <span className="text-slate-400 line-through">{original}</span>
          <ArrowRight className="size-3 text-slate-400" />
          <span className="font-medium">{custom}</span>
          <span className="ml-auto rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">
            Değiştirildi
          </span>
        </>
      ) : (
        <>
          <span className="font-medium">{custom}</span>
          <span className="ml-auto rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700">
            Aynen kullanılıyor
          </span>
        </>
      )}
    </div>
  );
}

