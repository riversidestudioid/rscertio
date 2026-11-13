export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-8 text-sm sm:flex-row">
        <p className="font-medium">
          RS<span className="text-gold">Certio</span> by Riverside Studio
        </p>
        <p className="text-slate">
          Data Anda diproses di browser dan tidak diunggah ke server.
        </p>
      </div>
    </footer>
  );
}
