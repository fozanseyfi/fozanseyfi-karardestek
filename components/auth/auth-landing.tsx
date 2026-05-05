"use client";

import {
  Sparkles,
  Shield,
  GitCompareArrows,
  Users,
  FileText,
  Mail,
  Globe,
  Check,
} from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: GitCompareArrows,
    title: "Çoklu kriterli skor",
    body: "10 metrikle (kapsam, sapma, teknik, referans, ödeme şartları vb.) ağırlıklı skor.",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    icon: FileText,
    title: "Şablonlar + revize",
    body: "GES/RES için 6 dolu şablon. Revize tekliflerini % indirim/zam ile karşılaştırın.",
    iconBg: "bg-violet-100 text-violet-700",
  },
  {
    icon: Users,
    title: "Multi-tenant panel",
    body: "Her kullanıcı kendi şirketinin yöneticisi; ekibinizi davet edin, görünürlük yönetin.",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
];

export function AuthHeader() {
  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="from-primary to-primary/80 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm">
            <Sparkles className="text-primary-foreground size-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">EPC Karar Destek</div>
            <div className="text-muted-foreground text-[10px]">Karar Destek Platformu</div>
          </div>
        </a>
        <div className="hidden items-center gap-1 sm:flex">
          <a
            href="https://www.linkedin.com/in/fozanseyfi/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors"
          >
            <LinkedinIcon className="size-4" />
          </a>
          <a
            href="https://fozanseyfi.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Web Sitesi"
            title="fozanseyfi.com"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors"
          >
            <Globe className="size-4" />
          </a>
          <a
            href="mailto:fozanseyfi@gmail.com"
            aria-label="E-posta"
            title="fozanseyfi@gmail.com"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors"
          >
            <Mail className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

export function AuthMarketing() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 md:px-6">
      {/* Özellikler */}
      <div>
        <div className="mb-5 text-center">
          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Platform Özellikleri
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Tedarik kararlarını <span className="text-primary">veri odaklı</span> verin
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-3 flex size-10 items-center justify-center rounded-lg ${f.iconBg}`}>
                  <Icon className="size-5" />
                </div>
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="text-muted-foreground mt-1 text-xs leading-relaxed">{f.body}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Veri güvenliği */}
      <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-white p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Shield className="size-7" />
          </div>
          <div>
            <div className="text-emerald-900 text-xs font-semibold tracking-wide uppercase">
              Veri Gizliliği & Sorumluluk
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              Verileriniz size aittir. Geliştirici dahil hiç kimse görüntüleyemez.
            </h3>
            <ul className="mt-3 grid gap-1.5 text-sm text-slate-700 md:grid-cols-2">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>Satır seviyesinde güvenlik (RLS) ile şifrelenir</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>Hesaplar arası tam izolasyon</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>Üçüncü taraf izleme veya analitik yok</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>Yalnızca sizin davet ettikleriniz erişebilir</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

