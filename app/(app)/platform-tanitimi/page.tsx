import type { Metadata } from "next";
import { TourView } from "@/components/tanitim/tour-view";
import { TourEmpty } from "@/components/tanitim/tour-empty";
import { TOUR_READY } from "@/lib/tanitim/ready";

export const metadata: Metadata = {
  title: "Platform Tanıtımı — KararDestek",
};

/** Sol menüdeki “Platform Tanıtımı” — uygulama kabuğu içinde (üst bar 56px + sayfa boşluğu 24px). */
export default function PlatformTanitimiPage() {
  return TOUR_READY ? <TourView top={56 + 24} /> : <TourEmpty inApp />;
}
