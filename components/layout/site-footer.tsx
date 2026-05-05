import { Globe, Mail } from "lucide-react";

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
    <footer className="mt-auto border-t bg-white">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs md:flex-row md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center md:justify-start md:text-left">
          <span>© {year}</span>
          <span className="text-foreground font-medium">EPC Karar Destek</span>
          <span className="opacity-50">·</span>
          <span>Tasarım & Geliştirme:</span>
          <a
            href="https://www.linkedin.com/in/fozanseyfi/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary font-medium transition-colors"
          >
            Furkan Ozan Seyfi
          </a>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://www.linkedin.com/in/fozanseyfi/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-md transition-colors"
          >
            <LinkedinIcon className="size-3.5" />
          </a>
          <a
            href="https://fozanseyfi.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Web Sitesi"
            title="fozanseyfi.com"
            className="hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-md transition-colors"
          >
            <Globe className="size-3.5" />
          </a>
          <a
            href="mailto:fozanseyfi@gmail.com"
            aria-label="E-posta"
            title="fozanseyfi@gmail.com"
            className="hover:text-foreground hover:bg-muted flex size-7 items-center justify-center rounded-md transition-colors"
          >
            <Mail className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
