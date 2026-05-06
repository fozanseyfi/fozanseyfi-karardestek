"use client";

import { useState } from "react";
import { HeartHandshake, ChevronDown, ChevronUp, Sparkles, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthMissionCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-yellow-200/70 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/40 shadow-sm">
      {/* KISA VERSİYON */}
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-yellow-500 text-white shadow-sm">
            <HeartHandshake className="size-4" />
          </div>
          <h3 className="whitespace-nowrap text-xs font-semibold tracking-tight text-yellow-900">
            Bilgi Paylaşımı Amacıyla Geliştirilmiş Ücretsiz Platform
          </h3>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-yellow-900/80">
          Tamamen <strong>bağımsız bir inisiyatifle</strong> hayata geçirilmiş olup; herhangi bir{" "}
          <strong>ticari model</strong>, <strong>gizli maliyet</strong> veya <strong>abonelik şartı</strong>{" "}
          barındırmaz.
        </p>
      </div>

      {/* UZUN VERSİYONA AÇMA / KAPATMA */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-1 border-t border-yellow-200/60 bg-yellow-50/60 px-4 py-2 text-[11px] font-medium text-yellow-800 transition-colors hover:bg-yellow-100/60"
        aria-expanded={open}
      >
        {open ? (
          <>
            Notu kapat <ChevronUp className="size-3" />
          </>
        ) : (
          <>
            Geliştiricinin notu <ChevronDown className="size-3" />
          </>
        )}
      </button>

      {/* UZUN VERSİYON */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 px-4 pt-3 pb-4 text-xs leading-relaxed text-slate-700">
            <p>
              Bu platform,{" "}
              <strong className="text-slate-900">uzun yıllar boyunca yürüttüğüm operasyonlarda</strong> verimliliği
              artırmak adına{" "}
              <strong className="text-slate-900">kendi kullanımım için geliştirdiğim yapının</strong>, modern bir
              arayüzle sektöre kazandırılmış halidir.
            </p>
            <p>
              Sahadaki ihtiyaçları ve yönetimsel zorlukları bizzat deneyimlemiş bir mühendis olarak; bu projeyi{" "}
              <strong className="text-yellow-800">hiçbir ticari beklenti gütmeksizin</strong>, tamamen bireysel bir
              katkı ve sektör paydaşlarımıza pratik bir çözüm desteği olarak sunuyorum.
            </p>

            {/* Önem noktaları rozetler */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Pill icon={Sparkles} text="Bireysel katkı" tone="violet" />
              <Pill icon={ShieldCheck} text="Veri sizin" tone="amber" />
              <Pill icon={MessageCircleHeart} text="Geri bildirim açık" tone="blue" />
            </div>

            <p className="border-t border-yellow-100 pt-3">
              Sizlerin tecrübeleriyle şekillenecek{" "}
              <strong className="text-slate-900">her türlü geri bildirim ve görüş benim için çok kıymetli</strong>.
              Platformu daha işlevsel hale getirecek fikir ve önerilerinizi paylaşmanızdan memnuniyet duyarım.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({
  icon: Icon,
  text,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  tone: "violet" | "amber" | "blue";
}) {
  const toneClasses = {
    violet: "bg-violet-50 text-violet-700 ring-violet-200/70",
    amber: "bg-yellow-50 text-yellow-700 ring-yellow-200/70",
    blue: "bg-blue-50 text-blue-700 ring-blue-200/70",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
        toneClasses
      )}
    >
      <Icon className="size-2.5" />
      {text}
    </span>
  );
}
