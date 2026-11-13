# RSCertio

Generator sertifikat online otomatis oleh **Riverside Studio**. Pilih template, masukkan daftar nama, atur posisi teks, lalu hasilkan ratusan sertifikat PDF sekaligus. Semua diproses di browser — tanpa login, tanpa database, tanpa upload ke server.

## Cara pakai

1. Buka `/generator`, pilih template bawaan atau unggah PNG/JPG sendiri.
2. Tempel/ketik nama (satu per baris) atau impor `.csv` / `.xlsx` / `.txt`.
3. Geser nama ke posisi yang diinginkan, atur font, ukuran, warna, dan perataan.
4. Klik **Generate** lalu unduh ZIP (atau PDF satuan / PDF gabungan).

## Batas & perilaku

| Hal | Batas |
| --- | --- |
| Upload template | PNG/JPG, maks 10 MB, sisi terpendek ≥ 600 px, ≤ 40 megapiksel |
| File impor nama | `.csv`, `.xlsx`, `.txt`, maks 5 MB |
| Jumlah nama | maks 2.000 per sesi |
| Panjang nama | maks 100 karakter (di atas 45 karakter font dikecilkan otomatis) |
| Karakter | Subset Latin (termasuk aksen). Nama dengan huruf lain dilewati dengan peringatan |
| Ukuran PDF | A4 (sisi terpanjang 841,89 pt), rasio template dipertahankan |
| ZIP | Dipecah otomatis tiap ±100 MB |

Kecepatan ±15 sertifikat/detik di laptop biasa (1.000 sertifikat ≈ 1 menit, puncak memori ±125 MB). Nama file `001_Budi_Santoso.pdf`: nomor urut menjamin tidak ada yang saling menimpa.

Privasi: file template dan daftar nama tidak pernah dikirim ke server — semuanya diproses di browser.

## Tech stack

- Next.js (App Router) + TypeScript, Tailwind CSS v4, Lucide React
- pdf-lib + @pdf-lib/fontkit (PDF), JSZip (ZIP)
- read-excel-file (`.xlsx`) dan PapaParse (CSV)

## Pengembangan

```bash
npm install
npm run dev        # http://localhost:3000
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate tipe Next + `tsc --noEmit` |
| `npm test` | Unit test (node:test): parsing nama, layout, nama file, EXIF, PDF |
| `npm run build` | Build produksi |

## Struktur

```
src/
  app/                    # Route: landing, /generator, 404, icon
  components/             # layout/, generator/ (steps: template, nama, editor, generate)
  lib/
    certificate/          # font, model posisi (dipakai preview DAN PDF)
    names/                # parsing, validasi, impor CSV/XLSX
    templates/            # template bawaan, validasi upload
    pdf/                  # renderer PDF, aset browser, runner batch + ZIP
public/fonts, public/templates
docs/PLAN.md              # Perencanaan & roadmap
```

## Preview = PDF

Posisi, lebar, dan ukuran font disimpan sebagai pecahan dari template, dan dihitung dengan rumus yang sama di preview (`NamePreview`) dan PDF (`lib/pdf/generate.ts`). Browser dan pdf-lib memakai file font yang sama. Selisih posisi hasil render PDF vs preview terukur < 0,3% dari ukuran halaman.

## Palet warna

Deep Navy `#0C222D` · Teal `#168F88` · Cream `#FAF9F6` · Gold `#E9B431` · Gray `#929BA1`. Untuk teks dan tombol berlatar terang dipakai Teal gelap `#0F6F69` agar kontras ≥ 4,5:1 (WCAG AA).

## Font

Font sertifikat (Playfair Display, Montserrat, Great Vibes, Lora) berasal dari [Fontsource](https://fontsource.org) dan berlisensi SIL Open Font License 1.1. File `.woff` (subset Latin) ada di `public/fonts/`.

## Deployment

Aplikasi sepenuhnya statis (tanpa env var, database, atau API). Di Vercel: import repo ini, framework Next.js terdeteksi otomatis, tanpa konfigurasi tambahan.
