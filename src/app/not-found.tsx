import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <p className="text-6xl font-bold text-gold" aria-hidden>
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-navy/70">Alamat yang Anda tuju tidak ada atau sudah dipindahkan.</p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-teal-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-dark/90"
        >
          Kembali ke beranda
        </Link>
      </main>
      <Footer />
    </>
  );
}
