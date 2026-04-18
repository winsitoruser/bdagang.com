# Monorepo aplikasi Bedagang

## Ringkasan

| Proyek | Folder | Port dev | Peran |
|--------|--------|----------|--------|
| **Platform utama (HQ + API + halaman legacy)** | repo root (`pages/`, `components/`, …) | `3001` (`npm run dev`) | Semua rute termasuk `/hq/*`; API di `/api/*`. |
| **bedagang.com — cabang / non-HQ (POS, inventori, …)** | `apps/store-web/` | `3003` (`npm run dev:store-web`) | UI + **API `/api/*` sendiri** (re-export ke `pages/api` di root); **tidak** mem-proxy ke 3001. |
| **Admin terpisah (partner / aktivasi / outlet)** | `admin-panel/` | `3002` (`cd admin-panel && npm run dev`) | Panel internal; paket workspace `bedagang-admin-panel`. |

## Admin — struktur yang disarankan

Kode admin tetap di `admin-panel/`. Konvensi target (boleh diterapkan bertahap):

```
admin-panel/
  pages/           # rute Next.js (login, dashboard, partners, …)
  pages/api/       # API admin
  lib/             # koneksi DB, session, util
  models/          # Sequelize (mirror / subset domain)
  styles/          # global admin
```

Tidak memindahkan folder secara otomatis; ini peta agar tim punya “rumah” jelas untuk fitur admin.

## Store-web — modul yang termasuk

Generator memetakan folder di `pages/`: `customers`, `inventory`, `pos`, `settings`, `reports`, `finance`, `kitchen`, `tables`, `employees`, `reservations`, plus `promo-voucher.tsx`, `loyalty-program.tsx`, alias `/reservation` → `/reservations`.

**Regenerasi halaman tipis:** `npm run generate:store-pages` (root) atau `npm run generate:pages` di `apps/store-web`.

**Regenerasi API:** `npm run generate:store-api` (root) atau `npm run generate:api` di `apps/store-web` — menulis `apps/store-web/pages/api/**` yang meneruskan ke `pages/api/**` monorepo (satu basis kode, dua entrypoint Next).

**Lingkungan (wajib agar DB & auth jalan di 3003):** jalankan sekali dari akar repo:

```bash
npm run sync:store-env
```

Perintah ini menyalin `.env` + `.env.local` dari root ke `apps/store-web/.env.local` dan memaksa **`NEXTAUTH_URL=http://localhost:3003`**. Anda juga bisa menyalin manual jika lebih suka.

**Middleware:** `apps/store-web/middleware.ts` meneruskan ke `middleware.ts` di akar repo (redirect login & aturan peran), sehingga perlindungan rute selaras dengan app utama.

**Halaman yang sengaja tidak di-mirror / manual:** lihat `EXCLUDE`, `MANUAL_PAGES`, dan komentar di `scripts/generate-store-web-reexports.mjs`.

## Instalasi workspace

Dari root:

```bash
npm install --legacy-peer-deps
```

(Peer dependency TypeScript/Prisma di repo ini membutuhkan flag tersebut.)
