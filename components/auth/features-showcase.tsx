"use client";

import { GitCompareArrows, FileStack, History, Shield, Check } from "lucide-react";
import { ScoreDemo } from "@/components/auth/score-demo";
import { TemplateDemo } from "@/components/auth/template-demo";
import { RevisionDemo } from "@/components/auth/revision-demo";

export function FeaturesShowcase() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-16 px-4 py-12 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Platform Özellikleri
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Tedarik kararlarını <span className="text-primary">veri odaklı</span> verin
        </h2>
        <p className="text-muted-foreground mt-3 text-sm md:text-base">
          GES & RES projelerinde taşeron, malzeme ve hizmet tekliflerini akıllı skor algoritmasıyla
          değerlendirin. Aşağıdaki üç ana özellik canlı demolarla anlatılıyor.
        </p>
      </div>

      <FeatureBlock
        icon={GitCompareArrows}
        iconBg="bg-blue-100 text-blue-700"
        title="Çoklu kriterli skor algoritması"
        bullets={[
          "10 metrik (3 otomatik + 7 manuel) ile ağırlıklı skor",
          "Hedef sapma · kapsam · en düşük teklif otomatik hesaplanır",
          "Teknik · referans · ödeme · finansal · kalite · deneyim · teslim manuel girilir",
          "Anomali (outlier) firmalar otomatik işaretlenir",
        ]}
        demo={<ScoreDemo />}
      />

      <FeatureBlock
        icon={FileStack}
        iconBg="bg-violet-100 text-violet-700"
        title="Hazır şablonlar — sıfırdan başlamayın"
        bullets={[
          "GES & RES için 6 hazır şablon (mekanik, kablo, foundation, kule, vb.)",
          "Örnek firmalar, fiyatlar, manuel skorlar ve metrik ağırlıkları yüklü gelir",
          "Tek tıkla klonla, kendi tekliflerinle düzenle",
          "Şablonun metrik ağırlıklarını yönetici özelleştirebilir",
        ]}
        demo={<TemplateDemo />}
        reverse
      />

      <FeatureBlock
        icon={History}
        iconBg="bg-amber-100 text-amber-700"
        title="Revize tekliflerini turlar arası karşılaştır"
        bullets={[
          "Her teklif R1, R2, R3... olarak versiyonlanır",
          "Kalem bazında % indirim/zam otomatik hesaplanır",
          "Turlar arasında kazanan firmanın değişip değişmediği netleşir",
          "Kalem detayında her revizyon ayrı görüntülenir",
        ]}
        demo={<RevisionDemo />}
      />

      {/* Veri güvenliği — değişmedi, ama daha kompakt */}
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

function FeatureBlock({
  icon: Icon,
  iconBg,
  title,
  bullets,
  demo,
  reverse,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  title: string;
  bullets: string[];
  demo: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className={`grid gap-8 lg:grid-cols-2 lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <div className="space-y-3">
        <div className={`inline-flex size-12 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="size-6" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h3>
        <ul className="space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="text-primary mt-0.5 size-4 shrink-0" />
              <span className="text-foreground">{b}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground pt-1 text-xs italic">
          ↓ Demo otomatik döngüde oynar; üzerine geldiğinde durur.
        </p>
      </div>
      <div>{demo}</div>
    </div>
  );
}
