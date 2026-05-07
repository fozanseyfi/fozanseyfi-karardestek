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
  ArrowRight,
  Check,
  Info,
  Shield,
  Sparkles,
  Crown,
  User,
  Eye,
  AlertTriangle,
  Pencil,
  Plus,
  Mail,
} from "lucide-react";

const STEPS: {
  num: number;
  title: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  body: React.ReactNode;
  tip?: string;
}[] = [
  {
    num: 1,
    title: "Şirket hesabını oluştur ve ekibini davet et",
    short: "Hesap & ekip kurulumu",
    icon: Building2,
    body: (
      <>
        <p>
          Kayıt sırasında yazdığın <strong>şirket adı</strong> seninle aynı panele bağlı tüm
          kullanıcıların ortak çalışma alanı olur. Sen otomatik olarak{" "}
          <strong>Yönetici (admin)</strong> rolüne atanırsın.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Sol menü →{" "}
              <Link href="/admin/users" className="font-medium text-yellow-700 hover:underline">
                Kullanıcılar
              </Link>{" "}
              → <strong>Davet Et</strong> ile e-posta adresleriyle ekip üyelerini çağır.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Her davete <strong>rol ata</strong>: Yönetici · Kullanıcı · Görüntüleyici. Davet
              e-postasındaki link ile kayıt olunca otomatik panele eklenir.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Multi-tenant</strong>: senin paneline başka şirketler erişemez, başka şirketin
              paneline sen erişemezsin — RLS ile DB seviyesinde izole.
            </span>
          </li>
        </ul>
      </>
    ),
    tip: "İlk açtığında ekibe davet göndermek istemezsen tek başına da çalışabilirsin — sonradan istediğin zaman davet edebilirsin.",
  },
  {
    num: 2,
    title: "Proje aç ve karşılaştırmalarını altında topla",
    short: "Proje yapısı",
    icon: FolderKanban,
    body: (
      <>
        <p>
          Her saha (örn. <em>GES Kuzey 50 MWp</em>) için bir <strong>Proje</strong> aç. Bu proje
          altında <strong>birden fazla karşılaştırma</strong> tutabilirsin (inverter tedariği,
          panel tedariği, yapısal çelik, mühendislik hizmetleri vb.).
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Sol menü →{" "}
              <Link href="/projects" className="font-medium text-yellow-700 hover:underline">
                Projeler
              </Link>{" "}
              → <strong>Yeni Proje</strong> butonu.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Proje detayında: lokasyon, kapasite, müşteri/sahibi, hedef tarih ve para birimi
              (TRY/USD/EUR).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Karşılaştırma içinden de <strong>"Yeni proje oluştur"</strong> ile akışı kesmeden
              proje açabilirsin.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    num: 3,
    title: "Firmaları sisteme ekle (bir kez yap, her yerde kullan)",
    short: "Firma kütüphanesi",
    icon: Users,
    body: (
      <>
        <p>
          Bir firma kart açıp ekledikten sonra her karşılaştırmada listeden seçersin —{" "}
          <strong>tekrar tekrar bilgi yazmana gerek yok</strong>. İletişim, vergi no, web, notlar
          merkezi olarak saklanır.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Sol menü →{" "}
              <Link href="/firms" className="font-medium text-yellow-700 hover:underline">
                Firmalar
              </Link>{" "}
              → <strong>Yeni Firma</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Firma detayında <strong>geçmiş skorlar</strong> ve <strong>katıldığı
              karşılaştırmalar</strong> birikir — zamanla performans trendini görürsün.
            </span>
          </li>
        </ul>
      </>
    ),
    tip: "Şablondan klonladığın karşılaştırmalarda örnek firmalar otomatik gelir — onları kendi firmanla değiştirebilirsin.",
  },
  {
    num: 4,
    title: "Karşılaştırma oluştur — sıfırdan veya şablondan",
    short: "Wizard veya şablon",
    icon: GitCompareArrows,
    body: (
      <>
        <p>
          İki yol var. Hangisi sana uygunsa onu seç:
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-yellow-200/70 bg-yellow-50/40 p-3">
            <div className="flex items-center gap-2">
              <FileStack className="size-4 text-yellow-700" />
              <span className="text-sm font-bold tracking-tight">Hızlı: Şablondan klonla</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-700">
              GES & RES için <strong>6 hazır şablon</strong> ile gelir: kalemler, örnek firmalar,
              fiyatlar, manuel skorlar ve <strong>3 revize</strong> dolu. Tek tıkla kopyala,
              firmaları kendi listenden değiştir.
            </p>
            <div className="mt-2.5">
              <Link
                href="/templates"
                className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 hover:underline"
              >
                Şablonlara git <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-slate-700" />
              <span className="text-sm font-bold tracking-tight">Sıfırdan: Wizard</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-700">
              Adım adım sihirbaz: Proje seç → Kalemleri yaz → Hedef fiyatları gir → Firmaları seç →
              Metrik ağırlıklarını ayarla. Her adımda <strong>"sonraki"</strong> ile ilerlersin.
            </p>
            <div className="mt-2.5">
              <Link
                href="/comparisons/new"
                className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 hover:underline"
              >
                Yeni karşılaştırma <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    num: 5,
    title: "Kalemleri ve hedef fiyatları gir",
    short: "Kapsam tanımı",
    icon: FileText,
    body: (
      <>
        <p>
          Karşılaştırmanın iskeleti <strong>kalemler</strong>dir. Her kalem için:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Açıklama</strong> (örn. "İnverter 250 kW string") · <strong>Miktar</strong>{" "}
              (örn. 80 adet) · <strong>Birim</strong> (adet / m / kg / hizmet).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Hedef birim fiyat</strong>: senin beklentin/bütçen. Sapma metriği bunun
              üzerinden hesaplanır — toplam = hedef × miktar.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Firmalar <strong>her kalem için ayrı fiyat</strong> verir. Bir firma bir kalemi
              vermek istemiyorsa boş bırakırsın → "Kapsam" metriği etkilenir.
            </span>
          </li>
        </ul>
      </>
    ),
    tip: "Şablondan klonladıysan kalemler ve hedef fiyatlar zaten dolu gelir — sadece güncelle.",
  },
  {
    num: 6,
    title: "Metrik ağırlıklarını ayarla — toplam 100 olmalı",
    short: "Skor algoritması",
    icon: Sliders,
    body: (
      <>
        <p>
          Skor 10 metrik üzerinden hesaplanır. Sektör/proje tipine göre <strong>ağırlıkları
          özelleştir</strong> — toplam 100% olmak zorunda.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-blue-200/60 bg-blue-50/40 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
              <span className="rounded bg-blue-200 px-1.5 py-0.5 text-[9px]">OTO</span>
              3 Otomatik metrik
            </div>
            <ul className="mt-2 space-y-1 text-xs text-slate-700">
              <li>· Hedef sapma (toplam fiyat - hedef toplam)</li>
              <li>· Kapsam (kaç kalemi karşıladığı)</li>
              <li>· En düşük teklif (toplam fiyatta lider olma)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-violet-200/60 bg-violet-50/40 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-800">
              <span className="rounded bg-violet-200 px-1.5 py-0.5 text-[9px]">MAN</span>
              7 Manuel metrik
            </div>
            <ul className="mt-2 space-y-1 text-xs text-slate-700">
              <li>· Teknik yeterlilik · Referanslar</li>
              <li>· Ödeme şartları · Teslim süresi</li>
              <li>· Kalite · Garanti · Deneyim</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-sm">
          <strong>Manuel skor giriş:</strong> 5 buton — Riskli (10) · Zayıf (30) · Orta (50) · İyi
          (75) · Çok İyi (100). Slider değil — daha kararlı ve tutarlı sonuç verir.
        </p>
      </>
    ),
    tip: "Hızlı çözüm: Riskli=10, Zayıf=30, Orta=50, İyi=75, Çok İyi=100. Hangi seviyeyi seçersen seç, algoritma o sayıyı kullanır.",
  },
  {
    num: 7,
    title: "Revize turlarıyla pazarlık et",
    short: "R1 → R2 → R3",
    icon: History,
    body: (
      <>
        <p>
          İlk teklif (R1) sonrası firmalarla pazarlık ettin, indirim/zam aldın? Yeni revizyonu{" "}
          <strong>R2</strong> olarak ekle. Sistem her kalem için <strong>% farkı</strong> otomatik
          hesaplar.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              Karşılaştırma → <strong>Revizeler sekmesi</strong> → "Yeni Revize Ekle" → fiyatları
              güncelle.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Eski revizyonlar silinmez</strong> — her tur kalıcı kayıt olarak saklanır.
              Tarihsel iz, denetim için önemli.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Kazanan değişti mi?</strong> Sıralama tablosu turlar arasında otomatik
              güncellenir — bir turda anomali olan firma sonraki turda lider olabilir.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    num: 8,
    title: "Sıralamayı oku — anomali (outlier) tespiti",
    short: "Sıralama & analiz",
    icon: Trophy,
    body: (
      <>
        <p>
          Tüm fiyatlar ve manuel skorlar girildikten sonra <strong>Sıralama</strong> sekmesinde
          firmalar otomatik puanlanır:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Trophy className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Önerilen rozet</strong> en yüksek toplam puan + makul fiyat birleşimine
              gider.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" />
            <span>
              <strong>Anomali rozeti</strong>: bir firma medyandan çok uzak (çok düşük veya çok
              yüksek) fiyat verdiyse otomatik işaretlenir — şüpheyle değerlendir.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Skor breakdown</strong>: bir firmaya tıkla, her metrikten kaç puan aldığını
              gör. Şeffaf formül, sürpriz yok.
            </span>
          </li>
        </ul>
      </>
    ),
    tip: "Sıralama sadece yol gösterici; nihai kararı sen verirsin. Algoritma sayıları doğru toplar, iş tecrüben skoru yorumlar.",
  },
  {
    num: 9,
    title: "Karara bağla ve PDF/Excel olarak paylaş",
    short: "Raporlama & onay",
    icon: FileText,
    body: (
      <>
        <p>
          Karar verdiğinde karşılaştırma durumunu <strong>"Karar Verildi"</strong> olarak işaretle:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Karar PDF</strong>: kapsam · firma listesi · skor breakdown · imza alanı ·
              logo ile yönetici onayına hazır.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Excel breakdown</strong>: tüm firmalar, revizyonlar, kalem bazında %
              değişim — pazarlık raporu için ideal.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Paydaş paylaşımı</strong>: ekipten birine "Salt Okunur" izinle paylaş —
              değiştiremesin ama görsün.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    num: 10,
    title: "İzleme ve bildirimler",
    short: "Pano & bildirim",
    icon: Sparkles,
    body: (
      <>
        <p>
          Aktivite <strong>Pano</strong>'da ve <strong>Bildirimler</strong>de takip edilir:
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Pano</strong> →{" "}
              <Link href="/" className="font-medium text-yellow-700 hover:underline">
                ana sayfa
              </Link>
              : aktif karşılaştırmalar, bekleyen onaylar, son aktivite, durum dağılım grafiği.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <span>
              <strong>Bildirim</strong>: ekip üyesi seninle bir karşılaştırma paylaştığında veya
              karar verildiğinde otomatik bildirim — okunmamışlar üst bara sayı düşer.
            </span>
          </li>
        </ul>
      </>
    ),
  },
];

const ROLES: { icon: React.ComponentType<{ className?: string }>; tone: string; label: string; tagline: string; bullets: string[] }[] = [
  {
    icon: Crown,
    tone: "from-emerald-500 to-emerald-600",
    label: "Yönetici",
    tagline: "Tam yetki — paneli yönetir",
    bullets: [
      "Tüm karşılaştırma, proje, firma görür",
      "Yeni kayıtlar oluşturur, tüm kayıtları düzenler",
      "Kullanıcı davet eder, rolleri değiştirir",
      "Kaynak bazında izin atar (salt okunur / gizli)",
      "Şirket adını değiştirir, firma silebilir",
    ],
  },
  {
    icon: User,
    tone: "from-blue-500 to-blue-600",
    label: "Kullanıcı",
    tagline: "Operasyonel ekip — yaratır ve düzenler",
    bullets: [
      "Tüm panel içeriğini görür",
      "Yeni karşılaştırma/proje/firma yaratır",
      "Tüm kayıtları düzenler (kilit yoksa)",
      "Kendi yarattığı kayıtları silebilir",
      "Kullanıcı yönetimi yapamaz, firma silemez",
    ],
  },
  {
    icon: Eye,
    tone: "from-slate-500 to-slate-600",
    label: "Görüntüleyici",
    tagline: "Salt okunur — paydaş ya da denetçi",
    bullets: [
      "Tüm panel içeriğini görür",
      "Hiçbir kaydı yaratamaz, düzenleyemez, silemez",
      "Şablondan klonlama yapamaz",
      "Sadece okur ve PDF/Excel indirebilir",
    ],
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
            Tedarik kararını <span className="text-yellow-700">10 adımda</span> kanıtlanabilir hâle getir
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
            Şirket hesabını açmaktan PDF imza alanına kadar her adım. Aşağıyı sırasıyla oku — her
            bölüm tek bir görev, hangi menüden ne yapılacağı yazıyor.
          </p>
        </div>
      </div>

      {/* TABLE OF CONTENTS */}
      <nav className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">
          Hızlı geçiş
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.num}
                href={`#step-${s.num}`}
                className="group flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 transition-all hover:border-yellow-300 hover:bg-yellow-50/40 hover:shadow-sm"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-yellow-100 text-[11px] font-bold tabular-nums text-yellow-800">
                  {String(s.num).padStart(2, "0")}
                </span>
                <Icon className="size-4 shrink-0 text-yellow-700" />
                <span className="truncate text-sm font-medium text-slate-800 group-hover:text-slate-900">
                  {s.short}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* STEPS */}
      <div className="space-y-6">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.num}
              id={`step-${s.num}`}
              className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7"
            >
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 text-white shadow-md">
                    <Icon className="size-6" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[11px] font-bold tabular-nums text-white shadow">
                    {String(s.num).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold tracking-[0.18em] text-yellow-700 uppercase">
                    Adım {s.num}
                  </div>
                  <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                    {s.title}
                  </h2>
                  <div className="mt-3 text-sm leading-relaxed text-slate-700 md:text-[15px]">
                    {s.body}
                  </div>
                  {s.tip && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-200/70 bg-yellow-50/60 p-3">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-yellow-700" />
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.14em] text-yellow-800 uppercase">
                          İpucu
                        </div>
                        <div className="mt-0.5 text-xs leading-relaxed text-slate-700">
                          {s.tip}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ROLES SECTION */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/60 to-white p-6 shadow-sm md:p-8">
        <div className="mb-5">
          <div className="text-[10px] font-bold tracking-[0.18em] text-yellow-700 uppercase">
            Roller & İzinler
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Ekip üyesine doğru rolü ver
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            3 hazır rol + her karşılaştırma için kaynak bazında izin (Tam Erişim · Salt Okunur ·
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
                <ul className="space-y-1.5 p-3 text-xs text-slate-700">
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

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-2">
            <Pencil className="mt-0.5 size-4 shrink-0 text-yellow-700" />
            <div className="text-sm text-slate-700">
              <strong>Kaynak bazında izin:</strong> Yönetici, herhangi bir karşılaştırmayı belirli
              kullanıcıya{" "}
              <span className="rounded bg-emerald-50 px-1 py-0.5 text-xs font-semibold text-emerald-700">
                Tam Erişim
              </span>
              ,{" "}
              <span className="rounded bg-blue-50 px-1 py-0.5 text-xs font-semibold text-blue-700">
                Salt Okunur
              </span>{" "}
              veya{" "}
              <span className="rounded bg-slate-100 px-1 py-0.5 text-xs font-semibold text-slate-700">
                Gizli
              </span>{" "}
              olarak ayarlayabilir. <em>Salt okunur</em> kullanıcı görür ama düzenleyemez;{" "}
              <em>gizli</em> kullanıcının panelinde hiç görünmez.
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-white p-6 md:p-8">
        <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Shield className="size-7" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-900 uppercase">
              Veri Gizliliği
            </div>
            <h3 className="mt-0.5 text-lg font-semibold tracking-tight">
              Verileriniz size aittir. Geliştirici dahil hiç kimse görüntüleyemez.
            </h3>
            <ul className="mt-3 grid gap-1.5 text-sm text-slate-700 md:grid-cols-2">
              {[
                "Satır seviyesinde güvenlik (RLS) ile şifrelenir",
                "Hesaplar arası tam izolasyon",
                "Üçüncü taraf izleme veya analitik yok",
                "Yalnızca sizin davet ettikleriniz erişebilir",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="rounded-2xl border border-yellow-200/60 bg-yellow-50/30 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-white shadow-sm">
            <Info className="size-5" />
          </div>
          <div className="text-sm text-slate-700">
            <div className="text-[10px] font-bold tracking-[0.14em] text-yellow-900 uppercase">
              Sorumluluk Reddi
            </div>
            <h4 className="mt-0.5 text-sm font-semibold text-slate-900">
              Karar destek aracı
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed">
              Algoritma sonuçları yol gösterici niteliktedir. Nihai satın alma kararının
              sorumluluğu kullanıcıya aittir;{" "}
              <strong>teknik/finansal/hukuki danışmanlık yerine geçmez</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/comparisons/new"
          className="group rounded-xl border border-yellow-300 bg-gradient-to-br from-yellow-500 to-yellow-700 p-4 text-white shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <GitCompareArrows className="size-5" />
            <span className="text-sm font-bold">Yeni Karşılaştırma</span>
          </div>
          <p className="mt-1.5 text-xs opacity-90">Sıfırdan başla — wizard ile adım adım</p>
        </Link>
        <Link
          href="/templates"
          className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-yellow-300 hover:shadow-sm"
        >
          <div className="flex items-center gap-2">
            <FileStack className="size-5 text-yellow-700" />
            <span className="text-sm font-bold text-slate-900">Şablondan Başla</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">Hızlı: GES/RES için 6 hazır şablon</p>
        </Link>
        <Link
          href="/contact"
          className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-yellow-300 hover:shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-yellow-700" />
            <span className="text-sm font-bold text-slate-900">Sorum Var</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">İletişime geç — geri bildirim &amp; destek</p>
        </Link>
      </section>
    </div>
  );
}
