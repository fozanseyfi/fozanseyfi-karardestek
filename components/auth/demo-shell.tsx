"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_INTERVAL_MS = 3500;
const SWIPE_THRESHOLD_PX = 40;

export function DemoShell({
  frames,
  captions,
  intervalMs = DEFAULT_INTERVAL_MS,
}: {
  frames: React.ReactNode[];
  captions: string[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const count = frames.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % count), intervalMs);
    return () => clearInterval(t);
  }, [paused, count, intervalMs]);

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
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    setPaused(false);
    if (startX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? startX;
    const dx = endX - startX;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (dx < 0) next();
    else prev();
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b bg-slate-50 px-3 py-2">
        <div className="size-2.5 rounded-full bg-rose-400" />
        <div className="size-2.5 rounded-full bg-amber-400" />
        <div className="size-2.5 rounded-full bg-emerald-400" />
        <div className="ml-3 flex-1 truncate rounded bg-white px-2 py-0.5 text-[10px] text-slate-500">
          karardestek.fozanseyfi.com
        </div>
      </div>

      {/* Frames */}
      <div className="relative h-[260px] bg-slate-50">
        {frames.map((F, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              idx === active ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-hidden={idx !== active}
          >
            {F}
          </div>
        ))}

        {/* Side buttons */}
        <button
          type="button"
          onClick={prev}
          aria-label="Önceki"
          className="absolute top-1/2 left-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100 focus:opacity-100 active:scale-95"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Sonraki"
          className="absolute top-1/2 right-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100 focus:opacity-100 active:scale-95"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Caption + progress */}
      <div className="border-t bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground text-[10px] font-bold tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <span className="text-foreground font-medium">{captions[active]}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {frames.map((_, idx) => (
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
