"use client";

import Link from "next/link";
import {
  BookOpen,
  Building2,
  FolderKanban,
  GitCompareArrows,
  FileStack,
  Sliders,
  Users,
  History,
  Trophy,
  FileText,
  Lightbulb,
  Check,
  Sparkles,
  Crown,
  User,
  Eye,
  Mail,
} from "lucide-react";

const STEPS: {
  num: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  body: React.ReactNode;
  tip?: string;
}[] = [
  {
    num: 1,
    title: "Şirket hesabını aç ve ekibi davet et",
    icon: Building2,
    body: (
      <>
        <p>
          Kayıt sırasında yazdığın şirket adı ortak çalışma alanın olur, sen otomatik{" "}
          <strong>Yönetici</strong> olursun. Sol menü →{" "}
          <Link href="/admin/users" className="font-medium text-yellow-700 hover:underline">
            Kullanıcılar
          </Link>{" "}
          → <strong>Davet Et</strong> ile e-posta üzerinden ekibi çağır, role ata
          (Yönetici / Kullanıcı / Görüntüleyici).
        </p>
      </>
    ),
    tip: "Tek başına da kullanabilirsin — ekip davetini istediğin zaman sonra eklersin.",
  },
  {
    num: 2,
    title: "Proje aç",
    icon: FolderKanban,
    body: (
      <>
        <p>
          Her saha için (örn. <em>GES Kuzey 50 MWp</em>) bir proje aç —{" "}
          <Link href="/projects" className="font-medium text-yellow-700 hover:underline">
            Projeler
          </Link>{" "}
          → <strong>Yeni Proje</strong>. Proje altında birden fazla karşılaştırma tutarsın
          (inverter, panel, çelik, mühendislik vb.). Lokasyon, kapasite, müşteri ve para birimi
          (TRY/USD/EUR) projede belirlenir.
        </p>
      </>
    ),
  },
  {
    num: 3,
    title: "Firmaları bir kez ekle",
    icon: Users,
    body: (
      <>
        <p>
          <Link href="/firms" className="font-medium text-yellow-700 hover:underline">
            Firmalar
          </Link>{" "}
          listesi merkezi kütüphanedir — her karşılaştırmada listeden seçersin, tekrar yazmana
          gerek kalmaz. Geçmiş skorları ve katıldığı karşılaştırmalar firma kartında birikir.
        </p>
      </>
    ),
  },
  {
    num: 4,
    title: "Karşılaştırma oluştur — şablon ya da sıfırdan",
    icon: GitCompareArrows,
    body: (
      <>
        <p>
          İki seçenek:{" "}
          <Link href="/templates" className="font-medium text-yellow-700 hover:underline">
            Şablon
          </Link>{" "}
          (GES & RES için 6 hazır + örnek firma + 3 revize dolu — tek tıkla klonla) veya{" "}
          <Link href="/comparisons/new" className="font-medium text-yellow-700 hover:underline">
            Wizard
          </Link>{" "}
          (sıfırdan adım adım sihirbaz).
        </p>
      </>
    ),
    tip: "İlk kez kullanıyorsan şablondan başla — tüm akışı en hızlı kavrarsın.",
  },
  {
    num: 5,
    title: "Kalemleri ve hedef fiyatları gir",
    icon: FileText,
    body: (
      <>
        <p>
          Her kalem için <strong>açıklama · miktar · birim · hedef birim fiyat</strong>. Hedef
          fiyat senin bütçendir; sapma metriği bunun üzerinden hesaplanır. Firmalar her kalem için
          ayrı fiyat verir — vermeyi istemediği kalemi boş bırakır, "Kapsam" puanı düşer.
        </p>
      </>
    ),
  },
  {
    num: 6,
    title: "Metrik ağırlıklarını ayarla",
    icon: Sliders,
    body: (
      <>
        <p>
          10 metrik var, toplamı 100 olmalı:{" "}
          <span className="rounded bg-blue-50 px-1 py-0.5 text-xs font-semibold text-blue-700">
            3 OTO
          </span>{" "}
          (sapma · kapsam · en düşük teklif) +{" "}
          <span className="rounded bg-violet-50 px-1 py-0.5 text-xs font-semibold text-violet-700">
            7 MAN
          </span>{" "}
          (teknik · referans · ödeme · teslim · kalite · garanti · deneyim). Manuel skorlar 5
          buton: <em>Riskli (10) · Zayıf (30) · Orta (50) · İyi (75) · Çok İyi (100)</em>.
        </p>
      </>
    ),
  },
  {
    num: 7,
    title: "Revize turlarıyla pazarlık et",
    icon: History,
    body: (
      <>
        <p>
          İlk teklif <strong>R1</strong>; pazarlıktan sonra <strong>R2, R3...</strong> ekle. Her
          kalemde % indirim/zam otomatik hesaplanır, eski revizyonlar silinmez (denetim için
          kalıcı). Tur değişince kazananın değişip değişmediğini sıralama sayfasında görürsün.
        </p>
      </>
    ),
  },
  {
    num: 8,
    title: "Sıralamayı oku",
    icon: Trophy,
    body: (
      <>
        <p>
          <strong>Önerilen rozeti</strong> en yüksek puan + makul fiyat birleşimine; medyandan
          uzak fiyat veren firmaya <strong>Anomali rozeti</strong>. Bir firmaya tıklayınca skor
          breakdown açılır — hangi metrikten kaç puan aldığı şeffaf görünür.
        </p>
      </>
    ),
    tip: "Sıralama yol göstericidir, nihai kararı sen verirsin.",
  },
  {
    num: 9,
    title: "Karara bağla, PDF/Excel paylaş",
    icon: FileText,
    body: (
      <>
        <p>
          Kararı verince durumu "Karar Verildi" yap. <strong>PDF</strong>: kapsam + skor +
          imza alanı + logo. <strong>Excel</strong>: tüm firmalar, revizyonlar, kalem bazında %.
          Paydaşlara "Salt Okunur" link ile paylaş — değiştiremesin, görsün.
        </p>
      </>
    ),
  },
  {
    num: 10,
    title: "İzleme: Pano & bildirimler",
    icon: Sparkles,
    body: (
      <>
        <p>
          <Link href="/" className="font-medium text-yellow-700 hover:underline">
            Pano
          </Link>{" "}
          aktif karşılaştırmaları, bekleyen onayları ve durum dağılımını gösterir.{" "}
          <Link href="/notifications" className="font-medium text-yellow-700 hover:underline">
            Bildirimler
          </Link>{" "}
          ekip paylaşımları ve karar olaylarında otomatik düşer; üst barda okunmamış sayısı
          görünür.
        </p>
      </>
    ),
  },
];

const ROLES: {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  label: string;
  tagline: string;
  bullets: string[];
}[] = [
  {
    icon: Crown,
    tone: "from-emerald-500 to-emerald-600",
    label: "Yönetici",
    tagline: "Tam yetki",
    bullets: ["Tüm kayıtlar + silme", "Kullanıcı davet & rol", "Kaynak bazında izin"],
  },
  {
    icon: User,
    tone: "from-blue-500 to-blue-600",
    label: "Kullanıcı",
    tagline: "Operasyonel ekip",
    bullets: ["Yaratır + düzenler", "Kendi kayıtlarını siler", "Kullanıcı yönetemez"],
  },
  {
    icon: Eye,
    tone: "from-slate-500 to-slate-600",
    label: "Görüntüleyici",
    tagline: "Salt okunur",
    bullets: ["Sadece okur", "PDF/Excel indirir", "Hiçbir şey değiştirmez"],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-yellow-200/60 bg-gradient-to-br from-yellow-50/80 via-white to-white p-7 md:p-10">
        <div className="pointer-events-none absolute -top-24 -right-20 size-56 rounded-full bg-yellow-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-yellow-50 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200/70 bg-yellow-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-yellow-700 uppercase">
            <BookOpen className="size-3" />
            Nasıl Çalışır
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Tedarik kararını <span className="text-yellow-700">10 adımda</span> kanıtlanabilir
            hâle getir
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
            Hesap kurulumundan PDF imza alanına kadar — her adım kısa, hangi menüden ne
            yapılacağı yazıyor.
          </p>
        </div>
      </div>

      {/* STEPS */}
      <div className="space-y-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.num}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 text-white shadow-md">
                    <Icon className="size-5" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold tabular-nums text-white shadow">
                    {String(s.num).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">
                    {s.title}
                  </h2>
                  <div className="mt-1.5 text-sm leading-relaxed text-slate-700">
                    {s.body}
                  </div>
                  {s.tip && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-yellow-200/70 bg-yellow-50/60 px-3 py-2">
                      <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-yellow-700" />
                      <div className="text-xs leading-relaxed text-slate-700">{s.tip}</div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ROLES */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/60 to-white p-6 shadow-sm md:p-7">
        <div className="mb-4">
          <div className="text-[10px] font-bold tracking-[0.18em] text-yellow-700 uppercase">
            Roller
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            Ekibe doğru rolü ver
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Üç hazır rol + her karşılaştırma için kaynak bazında izin (Tam Erişim · Salt Okunur ·
            Gizli).
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.label}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className={`flex items-center gap-2 bg-gradient-to-br ${r.tone} p-3 text-white`}>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight">{r.label}</div>
                    <div className="text-[10px] opacity-90">{r.tagline}</div>
                  </div>
                </div>
                <ul className="space-y-1 p-3 text-xs text-slate-700">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-1.5">
                      <Check className="mt-0.5 size-3 shrink-0 text-emerald-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/comparisons/new"
          className="rounded-xl border border-yellow-300 bg-gradient-to-br from-yellow-500 to-yellow-700 p-4 text-white shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <GitCompareArrows className="size-5" />
            <span className="text-sm font-bold">Yeni Karşılaştırma</span>
          </div>
          <p className="mt-1 text-xs opacity-90">Sıfırdan başla — wizard ile</p>
        </Link>
        <Link
          href="/templates"
          className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-yellow-300 hover:shadow-sm"
        >
          <div className="flex items-center gap-2">
            <FileStack className="size-5 text-yellow-700" />
            <span className="text-sm font-bold text-slate-900">Şablondan Başla</span>
          </div>
          <p className="mt-1 text-xs text-slate-600">GES/RES için 6 hazır şablon</p>
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-yellow-300 hover:shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-yellow-700" />
            <span className="text-sm font-bold text-slate-900">Sorum Var</span>
          </div>
          <p className="mt-1 text-xs text-slate-600">İletişim & destek</p>
        </Link>
      </section>
    </div>
  );
}
