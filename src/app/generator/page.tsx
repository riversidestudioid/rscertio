import type { Metadata } from "next";
import { GeneratorWorkspace } from "@/components/generator/GeneratorWorkspace";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Generator — RSCertio",
};

export default function GeneratorPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <GeneratorWorkspace />
      </main>
      <Footer />
    </>
  );
}
