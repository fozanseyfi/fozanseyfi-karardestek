# EPC Karar Destek — Production Deploy Rehberi

Bu rehber projeyi Vercel + Supabase + Resend ile canlıya almanız için adım adım kılavuzdur.

## 1. Production Supabase Project

Geliştirme için kullandığımız `epc-karar-destek-dev` projesini canlıda da kullanabilirsin (basit/ekonomik) **veya** ayrı bir prod project açabilirsin (önerilen — schema değişiklikleri prod verisini bozmasın).

### Ayrı prod project açma
1. https://supabase.com/dashboard → "New Project"
2. **Name**: `epc-karar-destek-prod`
3. **Region**: `eu-central-1` (Frankfurt) — Türkiye'ye en yakın
4. **DB Password**: güçlü, 1Password/Bitwarden'a kaydet
5. Proje hazırlandığında **Project Settings → API**'den:
   - Project URL
   - `anon public` key
   - `service_role` key
   not al

### Migration'ları prod'a push
```powershell
# proje dizininde
$env:SUPABASE_ACCESS_TOKEN = "sbp_..."
supabase --workdir epc-karar-destek link --project-ref <PROD_PROJECT_REF> --password "<DB_PASSWORD>"
supabase --workdir epc-karar-destek db push
```

### İlk admin kullanıcısını oluştur
Trigger sayesinde, `ozan.seyfi@kontrolmatik.com` ile giriş yapan ilk kullanıcı otomatik admin atanır. Production'da farklı admin için trigger fonksiyonundaki `admin_email` değiştirilebilir veya manuel SQL ile profile'ın role'ü `admin` yapılır.

Magic link için Supabase default SMTP yetersiz; production'da **Resend SMTP** ayarla (aşağıda).

## 2. Resend Hesabı + Domain Doğrulama

1. https://resend.com → kayıt ol (free tier: 3K mail/ay)
2. **Domains** → `fozanseyfi.com` ekle
3. Resend sana 3 CNAME (DKIM) + 1 TXT (SPF) + 1 TXT (DMARC) DNS kaydı verir
4. Domain sağlayıcının (Cloudflare/Namecheap/...) DNS panelinde bu kayıtları ekle
5. 5–60 dk içinde Resend doğrulamayı tamamlar
6. **API Keys** → "Create API Key" → `epc-karar-destek-prod` → `re_...` token'ı kopyala

### Supabase Auth → SMTP Custom
Supabase Dashboard → **Authentication → SMTP Settings**:
- Enable Custom SMTP: ✅
- Sender name: `EPC Karar Destek`
- Sender email: `noreply@fozanseyfi.com`
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: `<RESEND_API_KEY>`
- Save

Authentication → **URL Configuration**:
- Site URL: `https://app.fozanseyfi.com`
- Redirect URLs: `https://app.fozanseyfi.com/**`, `http://localhost:3000/**`

## 3. GitHub Repository

```powershell
# proje dizininde (epc-karar-destek/)
gh auth login
gh repo create epc-karar-destek --private --source . --push
```

Veya manuel: GitHub'da yeni private repo oluştur, `git remote add origin ...` + `git push -u origin master`.

## 4. Vercel Deploy

1. https://vercel.com/dashboard → "Add New" → "Project"
2. GitHub repo'yu seç (`epc-karar-destek`)
3. Framework Preset: **Next.js** (otomatik)
4. **Root Directory**: `epc-karar-destek` (alt klasör — repo root değil)
5. Build Command: `pnpm build` (varsayılan)
6. **Environment Variables** (Production + Preview):

   | Key | Değer |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` (prod) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | prod service_role key |
   | `RESEND_API_KEY` | `re_...` |
   | `NEXT_PUBLIC_APP_URL` | `https://app.fozanseyfi.com` |
   | `NEXT_PUBLIC_APP_NAME` | `EPC Karar Destek` |

7. **Deploy** → ilk build başlasın
8. Build başarılıysa preview URL açılır

## 5. Custom Domain (`app.fozanseyfi.com`)

1. Vercel project → **Settings → Domains**
2. `app.fozanseyfi.com` ekle
3. Vercel sana CNAME kaydı verir (genelde `cname.vercel-dns.com`)
4. Domain sağlayıcının DNS panelinde:
   - Type: `CNAME`
   - Name: `app`
   - Target: `cname.vercel-dns.com`
   - TTL: 300
5. Vercel SSL otomatik provisionlar (Let's Encrypt) — 1-5 dk

Apex (`fozanseyfi.com`) tercih edersen Vercel size A/AAAA kayıtları verir.

## 6. Smoke Test (canlıda)

| Test | Adım | Beklenen |
|---|---|---|
| 1. Login | `app.fozanseyfi.com/login` → magic link | `noreply@fozanseyfi.com`'dan mail |
| 2. Magic link tıkla | mail içindeki bağlantı | Dashboard'a yönlendirir |
| 3. Yeni karşılaştırma | Şablondan klonla | 4 firma + dolu fiyatlar |
| 4. Skor hesabı | Detay sayfası | Skor doğru hesaplanıyor |
| 5. PDF | Sağ üstte PDF butonu | 5 sayfalık rapor iniyor |
| 6. Excel | Excel butonu | XLSX iniyor |
| 7. Revize | "Revize Kaydet" → fiyat gir | Rev2 oluşur, revizeler sekmesi gösterir |
| 8. Karar | Karar Özeti → firma seç → Onayla | Status "Karar Verildi" |
| 9. Paylaş | Comparison shares insert | Bildirim oluşmalı (notifications tablosu) |
| 10. Mobil | 375px width chrome devtools | Sidebar drawer, table responsive |

## 7. Production Sonrası

### Supabase Storage
- `bid-pdfs` bucket: file_size_limit 10 MB, MIME `application/pdf`
- RLS politikaları zaten aktif (migration ile)

### Backup
Supabase Pro tier ($25/ay) günlük otomatik backup sunar. Free tier'de:
- Manuel backup: Dashboard → Database → Backups → "Schedule backup"
- veya PSQL ile dump: `pg_dump`

### Monitoring
- Vercel Analytics — opsiyonel, otomatik kurulu
- Supabase Logs — Auth, Database, API logları
- Resend Logs — gönderilen mailler

### Rate Limits
- Resend free: 3K mail/ay, 100/gün
- Supabase free: 500 MB DB, 1 GB storage, 50K MAU
- Pro upgrade gerektiğinde: $25 (Supabase) + $20 (Resend)

## 8. Geliştirme Akışı (Production sonrası)

```powershell
# Yeni feature branch
git checkout -b feature/X
# Geliştir, test et
pnpm dev
pnpm vitest run
pnpm build
# Commit ve push
git add -A; git commit -m "feat: X"
git push origin feature/X
# Vercel otomatik preview deploy yapar; PR açıp main'e merge
```

Migration'lar prod'a push:
```powershell
supabase --workdir epc-karar-destek db push  # link prod'a
```

## 9. Troubleshooting

| Sorun | Çözüm |
|---|---|
| Magic link gelmiyor | Resend Logs'a bak; SMTP yapılandırmasını doğrula |
| 500 hatası "infinite recursion in policy" | RLS recursion → migration `20260504100600` push edildi mi? |
| Karar Verildi olamıyor | Decision sekmesinden firma seç ve onayla |
| PDF Türkçe karakter bozuk | `public/fonts/Inter-*.woff` deploy'a dahil edildi mi? Vercel'de `public/` otomatik yayınlanır |
| Build hata: env eksik | Vercel env vars + redeploy |

## 10. Ek Geliştirme Önerileri (post-launch)

- [ ] Admin sayfası: kullanıcı davet (Magic Link) + rol değiştirme UI
- [ ] Şablon oluşturma UI (admin için)
- [ ] Karşılaştırmadan şablon türetme
- [ ] Bildirim için Resend Edge Function (in-app notifications + e-posta send)
- [ ] Onboarding turu (yeni kullanıcı için)
- [ ] Audit log (kim ne zaman değiştirdi)
- [ ] Mobile PWA manifest
- [ ] Çoklu dil (i18n)
