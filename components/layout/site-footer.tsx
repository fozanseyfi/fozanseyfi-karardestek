import { Globe, Mail, Sparkles, ShieldCheck, Heart } from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Sütun 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="from-primary to-primary/80 flex size-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm">
                <Sparkles className="text-primary-foreground size-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">EPC Karar Destek</div>
                <div className="text-muted-foreground text-[10px]">Karar Destek Platformu</div>
              </div>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              GES &amp; RES projelerinde taşeron, malzeme ve hizmet tekliflerini akıllı skor algoritmasıyla
              değerlendiren, ekip tabanlı karar destek platformu.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-800">
              <ShieldCheck className="size-3" />
              Bağımsız · Ücretsiz · Reklamsız
            </div>
          </div>

          {/* Sütun 2: Geliştirici */}
          <div className="space-y-3">
            <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Tasarım & Geliştirme
            </div>
            <div>
              <a
                href="https://www.linkedin.com/in/fozanseyfi/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary text-sm font-semibold transition-colors"
              >
                Furkan Ozan Seyfi
              </a>
              <div className="text-muted-foreground text-xs">Elektrik Mühendisi</div>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Sahadaki ihtiyaçları ve yönetimsel zorlukları bizzat deneyimlemiş bir mühendis olarak,
              hiçbir ticari beklenti gütmeksizin sektör paydaşlarına sunulmuştur.
            </p>
          </div>

          {/* Sütun 3: İletişim */}
          <div className="space-y-3">
            <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              İletişim & Bağlantılar
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.linkedin.com/in/fozanseyfi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
                >
                  <span className="bg-muted/50 group-hover:bg-blue-50 flex size-7 items-center justify-center rounded-md">
                    <LinkedinIcon className="size-3.5" />
                  </span>
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://fozanseyfi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
                >
                  <span className="bg-muted/50 flex size-7 items-center justify-center rounded-md">
                    <Globe className="size-3.5" />
                  </span>
                  fozanseyfi.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:fozanseyfi@gmail.com"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
                >
                  <span className="bg-muted/50 flex size-7 items-center justify-center rounded-md">
                    <Mail className="size-3.5" />
                  </span>
                  fozanseyfi@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-[11px] md:flex-row">
          <div className="text-muted-foreground text-center md:text-left">
            © {year} <strong className="text-foreground">EPC Karar Destek Platformu</strong> · Tüm hakları saklıdır
          </div>
          <div className="text-muted-foreground inline-flex items-center gap-1">
            <Heart className="size-3 text-rose-500" /> ile sektör için geliştirildi
          </div>
        </div>
      </div>
    </footer>
  );
}

