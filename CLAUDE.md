# EPC Karar Destek Platformu — Claude Bağlam Dosyası

Bu dosya Claude Code (veya başka AI agent) projeye yeniden bağlandığında bağlamı hızlıca anlaması için.

## Proje Özeti

GES (Güneş) ve RES (Rüzgar) enerji santrali projelerinde EPC tedarik süreçlerini destekleyen, çoklu kriterli karar destek SaaS platformu. Multi-tenant — her kullanıcı kendi şirketinin admin'i, başkalarını davet edebilir.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Mail**: Gmail SMTP (geçici, üretim için Cloudflare DNS sonra Resend planlandı)
- **Hosting**: Vercel
- **State**: Zustand + React Server Components
- **Tablo**: TanStack Table
- **Grafik**: Recharts
- **PDF**: @react-pdf/renderer
- **Excel**: SheetJS

## Production URL'leri

- **Custom domain**: https://karardestek.fozanseyfi.com
- **Vercel default**: https://fozanseyfi-karardestek.vercel.app
- **GitHub repo**: https://github.com/fozanseyfi/fozanseyfi-karardestek
- **Supabase project**: tbpcwbavcvgljzmcrtma (region: eu-central-1)

## Mimari Kararlar

- **Multi-tenant**: `organizations` tablosu + `profiles.organization_id`. Tüm tablolarda BEFORE INSERT trigger ile organization_id otomatik set. RLS `current_user_org_id()` helper ile filtreleme.
- **Skor algoritması**: 10 metrik (3 otomatik + 7 manuel). Hedef sapma medyandan değil, kullanıcının `target_price × qty` toplamından hesaplanır. En düşük teklif metriği toplam fiyattan değerlendirilir (lineer interpolation, en düşük = 100 puan).
- **Manuel skor input**: 5-buton (Riskli/Zayıf/Orta/İyi/ÇokIyi → 10/30/50/75/100). Slider değil.
- **Revize sistemi**: `bid_prices.revision` sayacı. UNIQUE (item_id, firm_id, revision).
- **Şablon klonu**: Wizard'a yönlendir, sample_data ile firmaları/fiyatları/skorları/3 revizyonu otomatik yükler. Sample firmalar `firms.is_sample=true` ile firma listesinde gizli.
- **Onboarding**: `profiles.onboarding_completed` flag + welcome dialog + Dashboard checklist.
- **Bildirimler**: DB trigger (`notify_on_share`, `notify_on_decision`) → notifications tablosu. Resend Edge Function planlandı ama henüz yok.

## Klasör Yapısı

```
epc-karar-destek/
├── app/
│   ├── (auth)/login, signup, forgot-password, invite/[token]
│   ├── (app)/
│   │   ├── page.tsx (Dashboard)
│   │   ├── projects/, comparisons/, firms/, templates/
│   │   ├── notifications/, settings/profile/
│   │   ├── admin/users/ (server actions)
│   │   ├── contact/
│   │   └── layout.tsx (Topbar + Sidebar + footer)
│   └── auth/callback/
├── components/
│   ├── ui/ (shadcn)
│   ├── comparison/ (wizard, ranking, breakdown, revisions, vb.)
│   ├── layout/ (sidebar, topbar, notifications)
│   ├── dashboard/ (status-chart)
│   ├── onboarding/ (dialog, checklist)
│   ├── settings/ (profile-form)
│   └── admin/ (users-table)
├── lib/
│   ├── supabase/ (client, server, middleware, get-profile)
│   ├── scoring.ts, metrics.ts, currency.ts, constants.ts
│   ├── pdf.tsx, excel.ts, permissions.ts, utils.ts
├── types/ (database.ts, domain.ts)
├── supabase/migrations/ (15+ migration dosyası, kronolojik)
└── public/fonts/ (Inter Regular/Bold for PDF)
```

## Kritik Komutlar

```powershell
# Geliştirme
pnpm dev                                        # localhost:3000
pnpm exec tsc --noEmit                          # TypeScript check
pnpm exec vitest run lib/scoring.test.ts        # Scoring testleri
pnpm build                                      # Production build

# Supabase migration (proje dizininden)
$env:SUPABASE_ACCESS_TOKEN = "<token>"
supabase --workdir . link --project-ref tbpcwbavcvgljzmcrtma --password "<DB_PASSWORD>"
supabase --workdir . db push                    # Yeni migration'ları uygula
supabase --workdir . gen types typescript --linked > types/database.ts

# Git akışı
git add -A
git commit -m "feat: ..."
git push origin main                            # Vercel otomatik deploy
```

## Geliştirme Konvansiyonları

- **Türkçe arayüz**: Tüm kullanıcı mesajları, label'lar, validasyon hataları Türkçe.
- **Tarih**: `tr-TR` locale (`new Date().toLocaleDateString("tr-TR")`)
- **Para birimi**: TRY/USD/EUR — `lib/currency.ts` (`formatCompactCurrency`)
- **Karar verme**: Önce 2-3 cümle ile yaklaşım, sonra `AskUserQuestion` ile kritik tercihler, sonra implement.
- **Migration**: Her değişiklik için ayrı dosya `YYYYMMDDHHMMSS_<isim>.sql` formatında, push'tan önce kontrol.
- **TypeScript strict mode**, `pnpm exec tsc --noEmit` her commit öncesi temiz olmalı.
- **Dosya yapısı**: PRD §12 baz alındı, server/client component'ler doğru ayrılı.

## v2'ye Ertelenenler

- Onay zinciri (mühendis → şef → müdür imza akışı)
- Audit log (kim ne zaman değiştirdi)
- Dark mode
- 2FA
- Mobile PWA
- TCMB anlık kur API
- Resend Edge Function (DB notification → e-posta)
- Custom domain için Cloudflare DNS (Wix DNS sınırı nedeniyle)

## Geliştirici

- **Furkan Ozan Seyfi** — Elektrik Mühendisi
- **Mail**: fozanseyfi@gmail.com · **Tel**: +90 506 684 29 33
- **LinkedIn**: https://www.linkedin.com/in/fozanseyfi/
- **Web**: https://fozanseyfi.com
