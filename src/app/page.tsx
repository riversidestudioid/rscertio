import Link from "next/link";
import { ArrowRight, Download, LayoutTemplate, ListPlus, ShieldCheck, Zap } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const steps = [
  {
    icon: LayoutTemplate,
    title: "Pilih Template",
    text: "Gunakan template bawaan atau unggah desain sertifikat Anda sendiri (PNG/JPG).",
  },
  {
    icon: ListPlus,
    title: "Masukkan Nama",
    text: "Ketik, tempel, atau impor daftar nama dari CSV dan Excel, lalu atur posisi teks.",
  },
  {
    icon: Download,
    title: "Generate & Unduh",
    text: "Satu klik menghasilkan semua sertifikat PDF, siap diunduh dalam satu ZIP.",
  },
];

const perks = [
  { icon: ShieldCheck, text: "Diproses di browser, data tidak diunggah" },
  { icon: Zap, text: "Tanpa login dan tanpa biaya" },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 text-center sm:pt-24">
          <p className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-medium text-navy">
            Generator sertifikat online otomatis
          </p>
          <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Buat Sertifikat Massal dalam <span className="text-teal-dark">Sekali Klik</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-xl text-lg text-navy/70">
            Punya 150 peserta? Pilih satu template, masukkan daftar nama, dan RSCertio membuat
            semua sertifikat untuk Anda.
          </p>
          <div className="animate-fade-up mt-9 flex justify-center">
            <Link
              href="/generator"
              className="group inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3.5 font-semibold text-cream shadow-lg shadow-navy/20 transition hover:bg-navy/90"
            >
              Mulai Membuat
              <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          <ul className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-navy/70 sm:flex-row sm:gap-8">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className="size-4 text-teal-dark" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section id="cara-kerja" className="scroll-mt-16 bg-white py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center text-3xl font-bold tracking-tight">Tiga Langkah Mudah</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li
                  key={title}
                  className="rounded-2xl border border-navy/10 bg-cream p-7 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-teal/10 text-teal-dark">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="text-4xl font-bold text-gold" aria-hidden>{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/70">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
