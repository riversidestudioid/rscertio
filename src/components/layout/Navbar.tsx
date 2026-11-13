import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-navy/10 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-navy text-gold">
            <BadgeCheck className="size-5" aria-hidden />
          </span>
          <span className="text-lg">
            RS<span className="text-teal">Certio</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/#cara-kerja" className="hidden text-navy/70 transition hover:text-navy sm:inline">
            Cara Kerja
          </Link>
          <Link
            href="/generator"
            className="rounded-full bg-teal px-5 py-2 font-medium text-white transition hover:bg-teal/90"
          >
            Mulai Membuat
          </Link>
        </div>
      </nav>
    </header>
  );
}
