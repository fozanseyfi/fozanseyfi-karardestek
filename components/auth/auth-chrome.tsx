"use client";

import Link from "next/link";
import { Globe, Mail, PlayCircle, Sparkles } from "lucide-react";
import { PlatformLogo } from "@/components/common/platform-logos";
import { DEVELOPER } from "@/components/common/platforms-data";
import { OtherPlatforms } from "@/components/auth/other-platforms";
import { TourPromo } from "@/components/auth/tour-promo";
import { TOUR_READY } from "@/lib/tanitim/ready";

/**
 * Auth sayfalarının ortak çerçevesi (üst başlık + tanıtım şeridi + diğer platformlar + geliştirici footer'ı).
 * Teklif / Fizibilite / Solar BOM platformlarındaki giriş şablonunun KararDestek uyarlaması.
 */

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

const iconBtn =
  "flex size-8 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary-soft-foreground";

export function SocialIcons() {
  return (
    <>
      <a
        href={DEVELOPER.linkedin.href}
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn"
        className={iconBtn}
      >
        <LinkedInIcon className="size-4" />
      </a>
      <a
        href={DEVELOPER.website.href}
        target="_blank"
        rel="noopener noreferrer"
        title={DEVELOPER.website.label}
        className={iconBtn}
      >
        <Globe className="size-4" />
      </a>
      <a href={`mailto:${DEVELOPER.email}`} title="E-posta" className={iconBtn}>
        <Mail className="size-4" />
      </a>
    </>
  );
}

export function AuthChrome({
  children,
  cta = "register",
}: {
  children: React.ReactNode;
  /** Üst başlığın sağındaki buton: kayıt sayfasında "Giriş Yap"a döner */
  cta?: "register" | "login";
}) {
  return (
    <div className="min-h-screen bg-soft-gradient">
      {/* ÜST BAŞLIK */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-10">
          <Link href="/login" className="flex items-center gap-2 sm:gap-2.5">
            <PlatformLogo
              id="karardestek"
              size={36}
              className="size-8 shrink-0 rounded-xl shadow-sm sm:size-9"
            />
            <div className="leading-tight">
              <p className="text-[13px] font-bold tracking-tight text-foreground sm:text-sm">
                KararDestek
              </p>
              <p className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Satınalma Karar Destek Platformu
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <SocialIcons />
            </div>
            {TOUR_READY && (
              <Link
                href="/tanitim"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-border/70 bg-card px-2.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary sm:ml-1.5 sm:h-9 sm:gap-1.5 sm:px-3.5 sm:text-xs"
              >
                <PlayCircle className="size-3 sm:size-3.5" />
                <span className="hidden sm:inline">Platform Tanıtımı</span>
                <span className="sm:hidden">Tanıtım</span>
              </Link>
            )}
            <Link
              href={cta === "register" ? "/signup" : "/login"}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:ml-1.5 sm:h-9 sm:gap-1.5 sm:px-3.5 sm:text-xs"
            >
              <Sparkles className="size-3 sm:size-3.5" />
              {cta === "register" ? (
                <>
                  <span className="hidden sm:inline">Hesap Oluştur</span>
                  <span className="sm:hidden">Kayıt</span>
                </>
              ) : (
                "Giriş Yap"
              )}
            </Link>
          </div>
        </div>
      </header>

      {children}

      {/* PLATFORM TANITIMI — kayıt olmadan önce gerçek ekranlarla */}
      {TOUR_READY && <TourPromo />}

      {/* DİĞER PLATFORMLAR */}
      <OtherPlatforms />

      {/* GELİŞTİRİCİ FOOTER */}
      <footer className="border-t border-border/60 bg-background/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 py-4 text-[11px] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4 sm:px-6 sm:py-5 sm:text-[12px] lg:px-10">
          <span className="flex flex-wrap items-center justify-center gap-1.5 text-center sm:text-left">
            <span>© {new Date().getFullYear()} KararDestek</span>
            <span className="text-muted-foreground/60">·</span>
            <span>
              Tasarım &amp; Geliştirme:{" "}
              <a
                href={DEVELOPER.linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-primary hover:underline"
              >
                {DEVELOPER.name}
              </a>
            </span>
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <SocialIcons />
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Form başlığı: rozet + büyük başlık + açıklama */
export function AuthHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <>
      <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/60 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary-soft-foreground sm:px-3 sm:py-1 sm:text-[10px]">
        <Sparkles className="size-2.5 sm:size-3" />
        Bağımsız bir inisiyatif
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2.4rem] lg:leading-tight">
        {title}
      </h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground sm:mt-2 sm:text-sm">
        {subtitle}
      </p>
    </>
  );
}

/** Tek kolonlu auth içerik alanı (kayıt, şifre sıfırlama, davet) */
export function AuthSingleColumn({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-12">
      <div className="mx-auto w-full max-w-md animate-in-up">{children}</div>
    </main>
  );
}
