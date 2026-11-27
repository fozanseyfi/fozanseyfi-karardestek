import { Globe, Mail } from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.5 18V10H6v8h2.5Zm-1.25-9.1c.83 0 1.5-.67 1.5-1.5S8.08 5.9 7.25 5.9 5.75 6.57 5.75 7.4s.67 1.5 1.5 1.5ZM18 18v-4.6c0-2.16-1.16-3.16-2.7-3.16-1.25 0-1.81.69-2.13 1.18V10H10.7c.03.71 0 8 0 8h2.47v-4.47c0-.22.02-.44.08-.6.18-.44.59-.9 1.27-.9.9 0 1.26.69 1.26 1.7V18H18Z" />
    </svg>
  );
}

/** Alt bilgi — Teklif / Fizibilite / Proje Yönetim / Solar BOM ile aynı. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const cls = "text-muted-foreground transition-colors hover:text-primary";
  return (
    <footer className="bg-background/40 mt-12 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span>© {year}</span>
          <span className="text-foreground font-medium">KararDestek</span>
          <span className="text-muted-foreground/60">·</span>
          <span>
            Tasarım &amp; Geliştirme:{" "}
            <a
              href="https://fozanseyfi.com"
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:text-primary font-medium"
            >
              Furkan Ozan Seyfi
            </a>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/fozanseyfi/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className={cls}
          >
            <LinkedInIcon className="size-4" />
          </a>
          <a
            href="https://fozanseyfi.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Web sitesi"
            className={cls}
          >
            <Globe className="size-4" />
          </a>
          <a
            href="mailto:fozanseyfi@gmail.com"
            aria-label="E-posta"
            className={cls}
          >
            <Mail className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
