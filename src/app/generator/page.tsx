import type { Metadata } from "next";
import { Hammer } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Generator — RSCertio",
};

export default function GeneratorPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-gold/15 text-gold">
          <Hammer className="size-7" aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Generator sedang disiapkan</h1>
        <p className="mt-3 text-navy/70">
          Pemilihan template, input nama, editor, dan generate PDF akan hadir di fase berikutnya.
        </p>
      </main>
      <Footer />
    </>
  );
}
