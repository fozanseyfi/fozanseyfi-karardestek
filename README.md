# EPC Karar Destek Platformu

GES & RES projelerinde taşeron, malzeme ve hizmet tekliflerini akıllı skor algoritmasıyla değerlendiren çoklu kullanıcılı SaaS karar destek platformu.

🌐 **Canlı**: https://karardestek.fozanseyfi.com

## Hızlı Başlangıç (yeni geliştirici)

### Önkoşullar
- Node.js 20+ (önerilen 22)
- pnpm 11+ — `npm install -g pnpm` veya `winget install pnpm.pnpm`
- Git
- Supabase CLI (opsiyonel, migration için) — `scoop install supabase`

### Klonlama ve kurulum

```bash
git clone https://github.com/fozanseyfi/fozanseyfi-karardestek.git epc-karar-destek
cd epc-karar-destek
pnpm install
```

### Environment dosyası

`.env.local` oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tbpcwbavcvgljzmcrtma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EPC Karar Destek
```

> Production değerleri Vercel → Settings → Environment Variables'da. Anon ve service-role key'leri Supabase Dashboard → Project Settings → API'den alınır.

### Geliştirme sunucusu

```bash
pnpm dev   # http://localhost:3000
```

### Build & Test

```bash
pnpm build               # Production build
pnpm exec tsc --noEmit   # TypeScript kontrolü
pnpm exec vitest run     # Birim testler
```

## Geliştirme Akışı

```bash
git checkout -b feature/yeni-ozellik
# kod yaz...
pnpm exec tsc --noEmit
git add -A && git commit -m "feat: yeni özellik"
git push -u origin feature/yeni-ozellik
# Vercel otomatik PREVIEW deploy yapar
# PR aç → main'e merge → otomatik PRODUCTION deploy
```

### Hızlı düzeltme (main'e direkt)

```bash
git checkout main
git pull
# değişiklik
git commit -am "fix: ..."
git push origin main
# 2 dk sonra production'da
```

## Database Değişiklikleri

```bash
# Yeni migration: supabase/migrations/YYYYMMDDHHMMSS_<isim>.sql
$env:SUPABASE_ACCESS_TOKEN = "<token>"
supabase link --project-ref tbpcwbavcvgljzmcrtma --password "<DB_PASSWORD>"
supabase db push
supabase gen types typescript --linked > types/database.ts
```

## Production

| | |
|---|---|
| **Custom domain** | https://karardestek.fozanseyfi.com |
| **Vercel default** | https://fozanseyfi-karardestek.vercel.app |
| **GitHub** | https://github.com/fozanseyfi/fozanseyfi-karardestek |
| **Supabase** | `tbpcwbavcvgljzmcrtma` (eu-central-1) |
| **DNS** | Wix → CNAME `karardestek` → `cname.vercel-dns.com` |
| **Mail** | Gmail SMTP (geçici, sender: `fozanseyfi@gmail.com`) |

Detaylı bağlam için [CLAUDE.md](./CLAUDE.md) ve [DEPLOY.md](./DEPLOY.md).

---

**Geliştirici**: Furkan Ozan Seyfi · [LinkedIn](https://www.linkedin.com/in/fozanseyfi/) · [fozanseyfi.com](https://fozanseyfi.com)
