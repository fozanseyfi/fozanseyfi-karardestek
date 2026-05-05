"use client";

import { Sparkles, Shield, Zap, GitCompareArrows, Users, FileText, Mail, Globe } from "lucide-react";

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
  },
  {
    icon: FileText,
    title: "Hazır şablonlar + revize karşılaştırma",
    body: "GES/RES için 6 dolu örnek şablon. Firmaların revize tekliflerini turlar arası % indirim ile karşılaştırın.",
  },
  {
    icon: Users,
    title: "Multi-tenant — kendi paneliniz",
    body: "Her kullanıcı kendi şirketinin yöneticisi. Ekibinizi davet edin, görünürlüklerini kişi bazında kontrol edin.",
  },
];

export function AuthSidePanel() {
  return (
    <div className="from-primary via-primary/95 to-primary/80 relative hidden flex-col bg-gradient-to-br p-10 text-white lg:flex lg:w-[45%] xl:w-[40%]">
      {/* Pattern overlay */}
      <div className="bg-grid-white/[0.03] pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]" />

      <div className="relative flex h-full flex-col">
        {/* Logo + başlık */}
        <div className="mb-10 flex items-center gap-3">
          <div className="bg-white/20 flex size-12 items-center justify-center rounded-xl backdrop-blur-sm">
            <Sparkles className="size-6" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">EPC Karar Destek</div>
            <div className="text-xs opacity-80">Karar Destek Platformu</div>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight">
            Tedarik kararlarını veri odaklı, şeffaf ve hızlı verin.
          </h1>
          <p className="mt-3 text-base leading-relaxed opacity-90">
            GES &amp; RES projelerinde taşeron, malzeme ve hizmet tekliflerini akıllı skor algoritmasıyla
            değerlendirin; revizyonları kalem bazında karşılaştırın; kararlarınızı PDF olarak raporlayın.
          </p>
        </div>

        {/* Özellikler */}
        <div className="mb-10 space-y-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex gap-3">
                <div className="bg-white/15 flex size-9 shrink-0 items-center justify-center rounded-lg backdrop-blur-sm">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="mt-0.5 text-xs leading-relaxed opacity-80">{f.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Veri güvenliği — vurgulu */}
        <div className="bg-white/10 mb-8 rounded-xl border border-white/20 p-5 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="size-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">Veri Gizliliği</span>
          </div>
          <p className="text-sm leading-relaxed">
            Verileriniz <strong>satır seviyesinde güvenlik (RLS)</strong> politikalarıyla şifrelenir ve izole edilir.
            <strong className="block mt-1">
              Geliştirici dahil hiçbir üçüncü taraf hesabınızdaki firma, fiyat veya karşılaştırma verilerini
              izleyemez ya da görüntüleyemez.
            </strong>
            <span className="text-xs opacity-80 mt-1 block">Yalnızca siz ve davet ettiğiniz ekip üyeleri erişebilir.</span>
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Geliştirici kartı */}
        <div className="border-t border-white/15 pt-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-70">
            <Zap className="size-3" /> Tasarım & Geliştirme
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Furkan Ozan Seyfi</div>
              <div className="text-xs opacity-75">Elektrik Mühendisi</div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href="https://www.linkedin.com/in/fozanseyfi/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="bg-white/10 hover:bg-white/20 flex size-9 items-center justify-center rounded-lg transition-colors"
                title="LinkedIn"
              >
                <LinkedinIcon className="size-4" />
              </a>
              <a
                href="https://fozanseyfi.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Web Sitesi"
                className="bg-white/10 hover:bg-white/20 flex size-9 items-center justify-center rounded-lg transition-colors"
                title="fozanseyfi.com"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="mailto:fozanseyfi@gmail.com"
                aria-label="E-posta"
                className="bg-white/10 hover:bg-white/20 flex size-9 items-center justify-center rounded-lg transition-colors"
                title="fozanseyfi@gmail.com"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
