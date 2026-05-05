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
    title: "Çoklu kriterli skor algoritması",
    body: "10 metrik (3 otomatik + 7 manuel) ile fiyat, teknik yeterlilik, referans, ödeme şartları gibi kriterleri ağırlıklandırın.",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    icon: FileText,
    title: "Hazır şablonlar + revize karşılaştırma",
    body: "GES/RES için 6 dolu örnek şablon. Firmaların revize tekliflerini turlar arası % indirim ile karşılaştırın.",
    iconBg: "bg-violet-100 text-violet-700",
  },
  {
    icon: Users,
    title: "Multi-tenant — kendi paneliniz",
    body: "Her kullanıcı kendi şirketinin yöneticisi. Ekibinizi davet edin, görünürlüklerini kişi bazında kontrol edin.",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
];

export function AuthSidePanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-10 py-12 lg:flex lg:w-[48%] xl:w-[42%]">
      {/* Subtle decorative shapes */}
      <div className="pointer-events-none absolute -top-32 -right-32 size-64 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 size-72 rounded-full bg-violet-100/40 blur-3xl" />

      <div className="relative space-y-8">
        {/* Logo + başlık */}
        <div className="flex items-center gap-3">
          <div className="from-primary to-primary/80 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md">
            <Sparkles className="text-primary-foreground size-5" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight text-slate-900">EPC Karar Destek</div>
            <div className="text-xs text-slate-500">Karar Destek Platformu</div>
          </div>
        </div>

        {/* Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Sparkles className="size-3" />
            GES &amp; RES Tedarik Kararı
          </div>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-slate-900">
            Tedarik kararlarını <span className="text-primary">veri odaklı</span> verin.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Taşeron, malzeme ve hizmet tekliflerini akıllı skor algoritmasıyla değerlendirin. Revizyonları kalem
            bazında karşılaştırın. Kararlarınızı PDF olarak raporlayın.
          </p>
        </div>

        {/* Özellikler */}
        <div className="space-y-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-sm transition-shadow hover:shadow-sm"
              >
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${f.iconBg}`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{f.title}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-slate-600">{f.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Veri güvenliği kart */}
        <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Shield className="size-4" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-emerald-900 uppercase">Veri Gizliliği</span>
          </div>
          <ul className="space-y-1.5 text-sm leading-relaxed text-slate-700">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>Satır seviyesinde güvenlik (RLS) ile şifrelenir, izole edilir</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>
                <strong className="text-slate-900">Geliştirici dahil</strong> hiçbir üçüncü taraf görüntüleyemez
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>Yalnızca siz ve davet ettiğiniz ekip üyeleri erişebilir</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Geliştirici — alt */}
      <div className="relative mt-8 border-t border-slate-200/70 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Tasarım &amp; Geliştirme
            </div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900">Furkan Ozan Seyfi</div>
            <div className="text-xs text-slate-500">Elektrik Mühendisi</div>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="https://www.linkedin.com/in/fozanseyfi/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <LinkedinIcon className="size-4" />
            </a>
            <a
              href="https://fozanseyfi.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Web Sitesi"
              title="fozanseyfi.com"
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            >
              <Globe className="size-4" />
            </a>
            <a
              href="mailto:fozanseyfi@gmail.com"
              aria-label="E-posta"
              title="fozanseyfi@gmail.com"
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
