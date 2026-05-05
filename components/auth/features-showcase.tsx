"use client";

import { useState } from "react";
import {
  GitCompareArrows,
  FileStack,
  History,
  Users,
  Crown,
  User,
  Eye,
  Check,
  X,
  Shield,
  Info,
} from "lucide-react";
import { ScoreDemo } from "@/components/auth/score-demo";
import { TemplateDemo } from "@/components/auth/template-demo";
import { RevisionDemo } from "@/components/auth/revision-demo";
import { RoleDemo } from "@/components/auth/role-demo";
import { cn } from "@/lib/utils";

type TabKey = "score" | "templates" | "revisions" | "roles";

const TABS: {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}[] = [
  { key: "score", label: "Çoklu Kriterli Skor", icon: GitCompareArrows, tone: "blue" },
  { key: "templates", label: "Hazır Şablonlar", icon: FileStack, tone: "violet" },
  { key: "revisions", label: "Revize Karşılaştırma", icon: History, tone: "amber" },
  { key: "roles", label: "Roller & İzinler", icon: Users, tone: "emerald" },
];

export function FeaturesShowcase() {
  const [active, setActive] = useState<TabKey>("score");

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 md:px-6">
      {/* Heading */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Nasıl Çalışır
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Tedarik kararlarını <span className="text-primary">veri odaklı</span> verin
        </h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Aşağıdaki sekmelere tıklayarak özelliklerin canlı demolarını görebilirsiniz.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-slate-200"
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border bg-gradient-to-b from-white to-slate-50/50 p-5 shadow-sm md:p-7">
        {active === "score" && <ScoreTab />}
        {active === "templates" && <TemplatesTab />}
        {active === "revisions" && <RevisionsTab />}
        {active === "roles" && <RolesTab />}
      </div>

      {/* Veri güvenliği */}
      <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-white p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Shield className="size-7" />
          </div>
          <div>
            <div className="text-emerald-900 text-xs font-semibold tracking-wide uppercase">
              Veri Gizliliği
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

      {/* Yasal sorumluluk uyarısı */}
      <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
            <Info className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-amber-900 text-xs font-semibold tracking-wide uppercase">
              Sorumluluk Reddi
            </div>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              <strong className="text-amber-900">EPC Karar Destek</strong>, bir <strong>karar destek aracıdır</strong>;
              nihai satın alma kararının sorumluluğu kullanıcıya aittir. Algoritma sonuçları yol gösterici niteliktedir
              ve <strong>teknik, finansal veya hukuki danışmanlık yerine geçmez</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============= TAB CONTENTS =============

function ScoreTab() {
  return (
    <FeatureLayout
      title="Çoklu kriterli skor algoritması"
      bullets={[
        "10 metrik (3 otomatik + 7 manuel) ile ağırlıklı skor",
        "Hedef sapma · kapsam · en düşük teklif otomatik hesaplanır",
        "Teknik · referans · ödeme · kalite · deneyim manuel girilir",
        "Anomali (outlier) firmalar otomatik işaretlenir",
      ]}
      demo={<ScoreDemo />}
    />
  );
}

function TemplatesTab() {
  return (
    <FeatureLayout
      title="Hazır şablonlar — sıfırdan başlamayın"
      bullets={[
        "GES & RES için 6 hazır şablon",
        "Örnek firma, fiyat, manuel skor ve metrik ağırlık yüklü gelir",
        "Tek tıkla klonla → kendi karşılaştırmana dönüşür",
        "Yönetici şablon metriklerini özelleştirebilir",
      ]}
      demo={<TemplateDemo />}
    />
  );
}

function RevisionsTab() {
  return (
    <FeatureLayout
      title="Revize tekliflerini turlar arası karşılaştır"
      bullets={[
        "Her teklif R1, R2, R3... olarak versiyonlanır",
        "Kalem bazında % indirim/zam otomatik hesaplanır",
        "Turlar arasında kazanan değişti mi anlık görürsün",
        "Eski revizyonlar kalıcı kayıt olarak saklanır",
      ]}
      demo={<RevisionDemo />}
    />
  );
}

function RolesTab() {
  return (
    <div className="space-y-6">
      {/* Detaylı 3 rol kartı */}
      <div className="grid gap-3 md:grid-cols-3">
        <RoleCard
          icon={Crown}
          label="Yönetici"
          tagline="Tam yetki — paneli yönetir, izinleri dağıtır"
          tone="emerald"
          caps={[
            { label: "Tüm karşılaştırma, proje, firma görür", ok: true },
            { label: "Yeni kayıtlar oluşturur", ok: true },
            { label: "Tüm kayıtları düzenler ve siler", ok: true },
            { label: "Kullanıcı davet eder, rolleri değiştirir", ok: true },
            { label: "Kaynak bazında izin atar (salt okunur / gizli)", ok: true },
            { label: "Şirket adını değiştirir, firma silebilir", ok: true },
          ]}
        />
        <RoleCard
          icon={User}
          label="Kullanıcı"
          tagline="Operasyonel ekip — yaratır ve düzenler"
          tone="blue"
          caps={[
            { label: "Tüm org karşılaştırma, proje, firma görür", ok: true },
            { label: "Yeni kayıtlar oluşturur", ok: true },
            { label: "Tüm kayıtları düzenler (kilit yoksa)", ok: true },
            { label: "Kendi yarattığı kayıtları silebilir", ok: true },
            { label: "Kullanıcı yönetimi yapamaz", ok: false },
            { label: "Firma silemez", ok: false },
          ]}
        />
        <RoleCard
          icon={Eye}
          label="Görüntüleyici"
          tagline="Salt okunur — paydaş ya da denetçi"
          tone="slate"
          caps={[
            { label: "Tüm panel içeriğini görür", ok: true },
            { label: "Karşılaştırma/proje/firma yaratamaz", ok: false },
            { label: "Hiçbir kaydı düzenleyemez", ok: false },
            { label: "Hiçbir kaydı silemez", ok: false },
            { label: "Şablondan klonlama yapamaz", ok: false },
            { label: "Kendi panelini açabilir", ok: true },
          ]}
        />
      </div>

      {/* Demo + açıklama */}
      <FeatureLayout
        title="Yönetici, kaynak bazında izin verir"
        bullets={[
          "Her karşılaştırma için 3 mod: Tam Erişim · Salt Okunur · Gizli",
          "Tek tıkla erişim seviyesi değiştirilir",
          "Salt Okunur: kullanıcı görür ama düzenleyemez",
          "Gizli: kullanıcının panelinde hiç görünmez",
        ]}
        demo={<RoleDemo />}
        compact
      />
    </div>
  );
}

// ============= LAYOUT HELPERS =============

function FeatureLayout({
  title,
  bullets,
  demo,
  compact,
}: {
  title: string;
  bullets: string[];
  demo: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-6 lg:items-center", compact ? "lg:grid-cols-[1fr_460px]" : "lg:grid-cols-2")}>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h3>
        <ul className="space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="text-primary mt-0.5 size-4 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>{demo}</div>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  label,
  tagline,
  tone,
  caps,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tagline: string;
  tone: "emerald" | "blue" | "slate";
  caps: { label: string; ok: boolean }[];
}) {
  const toneStyles = {
    emerald: { header: "bg-gradient-to-br from-emerald-500 to-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50" },
    blue: { header: "bg-gradient-to-br from-blue-500 to-blue-600", text: "text-blue-700", bg: "bg-blue-50" },
    slate: { header: "bg-gradient-to-br from-slate-500 to-slate-600", text: "text-slate-700", bg: "bg-slate-50" },
  }[tone];
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className={cn("flex items-center gap-2 p-3 text-white", toneStyles.header)}>
        <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
          <Icon className="size-4" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">{label}</div>
          <div className="text-[10px] opacity-90">{tagline}</div>
        </div>
      </div>
      <ul className="space-y-1.5 p-3 text-xs">
        {caps.map((c, i) => (
          <li key={i} className="flex items-start gap-1.5">
            {c.ok ? (
              <span className={cn("mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full", toneStyles.bg, toneStyles.text)}>
                <Check className="size-2" />
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground/70 mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full">
                <X className="size-2" />
              </span>
            )}
            <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
