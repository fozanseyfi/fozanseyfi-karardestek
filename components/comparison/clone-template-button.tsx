"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Şablon detay sayfasındaki "Bu Şablonu Kullan" butonu.
 * Wizard'a yönlendirir; wizard sample_data varsa firmaları+fiyatları+skorları otomatik yükler,
 * kullanıcı sadece proje ve karşılaştırma adını girer ve istediği yerleri düzenler.
 */
export function CloneTemplateButton({ templateId, hasSample }: { templateId: string; hasSample: boolean }) {
  return (
    <Button asChild size="lg">
      <Link href={`/comparisons/new?template=${templateId}`}>
        {hasSample ? <Sparkles className="mr-1 size-4" /> : <ArrowRight className="mr-1 size-4" />}
        Bu Şablonu Kullan
      </Link>
    </Button>
  );
}
