# RSCertio

Generator sertifikat online otomatis oleh **Riverside Studio**. Pilih template, masukkan daftar nama, atur posisi teks, lalu hasilkan ratusan sertifikat PDF sekaligus. Semua diproses di browser — tanpa login, tanpa database, tanpa upload ke server.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Lucide React (ikon)
- pdf-lib + @pdf-lib/fontkit (pembuatan PDF)
- JSZip (paket ZIP)
- read-excel-file (impor `.xlsx`) dan PapaParse (impor CSV)

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate tipe Next + `tsc --noEmit` |
| `npm test` | Unit test parsing nama (node:test) |
| `npm run build` | Build produksi |

## Struktur

```
src/
  app/            # Route (landing, /generator)
  components/     # layout/, landing/, ... komponen UI
  lib/            # logika murni (nama, template, PDF) — ditambah per fase
docs/PLAN.md      # Perencanaan & roadmap fase
```

## Palet Warna

Deep Navy `#0C222D` · Teal `#168F88` · Cream `#FAF9F6` · Gold `#E9B431` · Gray `#929BA1`

## Status

Fase 1–4 selesai (setup, template, input nama, editor posisi). Lihat [docs/PLAN.md](docs/PLAN.md) untuk roadmap.

## Font

Font sertifikat (Playfair Display, Montserrat, Great Vibes, Lora) berasal dari [Fontsource](https://fontsource.org) dan berlisensi SIL Open Font License 1.1. File `.woff` (subset Latin) ada di `public/fonts/` dan dipakai bersamaan oleh preview (CSS) dan generator PDF (pdf-lib + fontkit) supaya hasilnya identik. Karakter di luar subset Latin akan ditangani di fase generate.
