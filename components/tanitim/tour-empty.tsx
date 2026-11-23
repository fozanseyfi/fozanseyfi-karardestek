import Link from "next/link";
import { PlayCircle } from "lucide-react";

/** Tanıtım ekranları henüz çekilmemişken gösterilen yer tutucu. */
export function TourEmpty({ inApp = false }: { inApp?: boolean }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
        <PlayCircle className="size-6" />
      </span>
      <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">
        Platform tanıtımı hazırlanıyor
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Platformun bütün adımlarını gerçek ekranlar üzerinden anlatan tanıtım
        çok yakında burada olacak.
      </p>
      <Link
        href={inApp ? "/how-it-works" : "/login"}
        className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {inApp ? "Nasıl Çalışır sayfasına git" : "Giriş sayfasına dön"}
      </Link>
    </div>
  );
}
