import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Diğer platformlarla ortak: gece modu ve klasik (sade, kurumsal) görünüm katmanları
import "./dark.css";
import "./classic.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "EPC Karar Destek",
  description:
    "GES ve RES projeleri için akıllı skor algoritmasıyla taşeron, malzeme ve ekipman teklifi karşılaştırma platformu.",
};

// Gece modu seçimini ilk boyamadan önce uygula (yazdırırken açık tema)
const THEME_SCRIPT =
  "try{var d=document.documentElement;if(localStorage.getItem('theme')==='dark')d.classList.add('dark');" +
  "var w=false;addEventListener('beforeprint',function(){w=d.classList.contains('dark');d.classList.remove('dark')});" +
  "addEventListener('afterprint',function(){if(w)d.classList.add('dark')})}catch(e){}";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} classic h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="bg-background text-foreground min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
