"use client";

import { Crown, User, Eye, Check, X, Lock, EyeOff, Pencil } from "lucide-react";
import { RoleDemo } from "@/components/auth/role-demo";
import { cn } from "@/lib/utils";

type Capability = { label: string; available: boolean };

const ROLES: {
  key: "admin" | "user" | "viewer";
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "blue" | "slate";
  capabilities: Capability[];
}[] = [
  {
    key: "admin",
    label: "Yönetici",
    tagline: "Tam yetki — paneli yönetir, izinleri dağıtır",
    icon: Crown,
    tone: "emerald",
    capabilities: [
      { label: "Tüm karşılaştırma, proje, firma görür", available: true },
      { label: "Yeni kayıtlar oluşturur", available: true },
      { label: "Tüm kayıtları düzenler ve siler", available: true },
      { label: "Kullanıcı davet eder, rolleri değiştirir", available: true },
      { label: "Kaynak bazında izin atar (salt okunur / gizli)", available: true },
      { label: "Şirket adını değiştirir", available: true },
    ],
  },
  {
    key: "user",
    label: "Kullanıcı",
    tagline: "Operasyonel ekip üyesi — yaratır ve düzenler, yönetmez",
    icon: User,
    tone: "blue",
    capabilities: [
      { label: "Tüm karşılaştırma, proje, firma görür", available: true },
      { label: "Yeni kayıtlar oluşturur", available: true },
      { label: "Tüm kayıtları düzenler (yönetici kilitlemediği sürece)", available: true },
      { label: "Kendi yarattığı kayıtları silebilir", available: true },
      { label: "Kullanıcı yönetimi", available: false },
      { label: "Firma silme", available: false },
    ],
  },
  {
    key: "viewer",
    label: "Görüntüleyici",
    tagline: "Salt okunur erişim — paydaş ya da denetçi",
    icon: Eye,
    tone: "slate",
    capabilities: [
      { label: "Tüm panel içeriğini görür (gizli olanlar hariç)", available: true },
      { label: "Karşılaştırma, proje, firma yaratamaz", available: false },
      { label: "Hiçbir kaydı düzenleyemez", available: false },
      { label: "Hiçbir kaydı silemez", available: false },
      { label: "Şablondan klonlama yapamaz", available: false },
      { label: "Kendi panelini açabilir (kendi yöneticisi olur)", available: true },
    ],
  },
];

const TONE_STYLES = {
  emerald: {
    border: "border-emerald-200/70",
    headerBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeRing: "ring-emerald-200/60",
  },
  blue: {
    border: "border-blue-200/70",
    headerBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeRing: "ring-blue-200/60",
  },
  slate: {
    border: "border-slate-200/70",
    headerBg: "bg-gradient-to-br from-slate-500 to-slate-600",
    badgeBg: "bg-slate-50",
    badgeText: "text-slate-700",
    badgeRing: "ring-slate-200/60",
  },
} as const;

export function RoleExplainer() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 md:px-6">
      {/* Section heading */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Roller & İzinler
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Ekip yapısına göre <span className="text-primary">3 farklı yetki</span>
        </h2>
        <p className="text-muted-foreground mt-3 text-sm md:text-base">
          Yöneticiler tam kontrol sahibidir; kullanıcılar operasyonel iş yapar; görüntüleyiciler sadece okur.
          Üstüne, yönetici her kullanıcı için <strong>kaynak bazında</strong> erişim ayarlayabilir.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const tone = TONE_STYLES[r.tone];
          return (
            <div
              key={r.key}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md",
                tone.border
              )}
            >
              <div className={cn("p-5 text-white", tone.headerBg)}>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">{r.label}</div>
                    <div className="text-xs opacity-90">{r.tagline}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-5">
                <ul className="space-y-2">
                  {r.capabilities.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {c.available ? (
                        <span
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                            tone.badgeBg,
                            tone.badgeText
                          )}
                        >
                          <Check className="size-2.5" />
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground/70 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full">
                          <X className="size-2.5" />
                        </span>
                      )}
                      <span className={cn(c.available ? "text-foreground" : "text-muted-foreground")}>
                        {c.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo section */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-3 lg:max-w-md">
          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Canlı Demo
          </div>
          <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
            Yönetici, kaynak bazında izin verir
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Bir kullanıcıyı <strong>Kullanıcı</strong> rolüyle davet edersin. Sonra her karşılaştırma
            için tek tıkla erişimini ayarlarsın:
          </p>
          <div className="space-y-2 pt-1">
            <Legend
              icon={Pencil}
              label="Tam Erişim"
              desc="Kullanıcı görür ve düzenler — varsayılan"
              tone="emerald"
            />
            <Legend
              icon={Lock}
              label="Salt Okunur"
              desc="Görür ama düzenleyemez — değişiklik kapatılır"
              tone="amber"
            />
            <Legend icon={EyeOff} label="Gizli" desc="Hiç görmez — kullanıcının panelinde yer almaz" tone="rose" />
          </div>
          <p className="text-muted-foreground text-xs italic">
            Demo otomatik döngüde oynar. Üzerine geldiğinde durur, ayrılınca devam eder.
          </p>
        </div>

        <div className="lg:w-[460px]">
          <RoleDemo />
        </div>
      </div>
    </section>
  );
}

function Legend({
  icon: Icon,
  label,
  desc,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  tone: "emerald" | "amber" | "rose";
}) {
  const toneBg = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-yellow-100 text-yellow-700",
    rose: "bg-rose-100 text-rose-700",
  }[tone];
  return (
    <div className="flex items-start gap-2.5">
      <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", toneBg)}>
        <Icon className="size-3.5" />
      </div>
      <div className="text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground"> — {desc}</span>
      </div>
    </div>
  );
}
