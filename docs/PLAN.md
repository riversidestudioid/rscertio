# RSCertio — Perencanaan

## Prinsip
- Semua pemrosesan di browser; file peserta tidak pernah dikirim ke server.
- Tanpa database, login, atau API berbayar (v1).
- Pratinjau harus identik dengan PDF: simpan posisi teks sebagai **persentase** (0–1) dari dimensi template, lalu konversi ke koordinat PDF saat generate.

## Keputusan Library
| Kebutuhan | Pilihan | Alasan |
| --- | --- | --- |
| PDF | `pdf-lib` + `@pdf-lib/fontkit` | Jalan di browser; fontkit untuk font kustom/Unicode |
| ZIP | `jszip` | Standar, jalan di browser |
| Excel | `read-excel-file` | Aktif dirawat, tanpa kerentanan npm audit; alternatif aman dari paket `xlsx` di npm yang usang |
| CSV | `papaparse` | Tangguh terhadap quoting & encoding |
| Ikon | `lucide-react` | Sesuai permintaan |

## Model Data (client-side)
```ts
type TextStyle = { fontFamily: string; fontSize: number; color: string; align: "left" | "center" | "right" };
type NamePlacement = { x: number; y: number; maxWidth: number } & TextStyle; // x,y,maxWidth: 0–1
```

## Fase
1. **Setup & landing page** — selesai.
2. **Template** (selesai) — galeri bawaan, upload PNG/JPG (validasi tipe/ukuran), preview, landscape/portrait.
3. **Input nama** (selesai) — textarea, paste, CSV/XLSX, validasi, edit/hapus, hitung nama valid.
4. **Editor** — preview, drag posisi, font/ukuran/warna/rata teks, kecocokan preview↔PDF.
5. **Generate** — pdf-lib, progres, unduh PDF/ZIP, opsional PDF gabungan, nama file aman & unik.
6. **QA & deploy** — uji, lint/tsc/build, responsif; GitHub push & Vercel **setelah persetujuan**.

## Risiko
- Memori untuk ratusan PDF: proses berurutan, beri jeda ke event loop agar UI tidak membeku.
- Nama panjang: kecilkan font otomatis hingga muat `maxWidth`.
- Karakter non-Latin: embed font Unicode via fontkit.
- Nama file: sanitasi + sufiks nomor agar tidak saling menimpa.
