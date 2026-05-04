import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "EPC Karar Destek",
  description:
    "GES ve RES projeleri için akıllı skor algoritmasıyla taşeron, malzeme ve ekipman teklifi karşılaştırma platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background text-foreground min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
