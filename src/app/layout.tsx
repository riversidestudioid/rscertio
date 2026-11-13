import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Buat ratusan sertifikat PDF otomatis dari satu template dan daftar nama. Diproses di browser Anda, tanpa login. RSCertio by Riverside Studio.";

export const metadata: Metadata = {
  title: { default: "RSCertio — Generator Sertifikat Massal Online", template: "%s" },
  description,
  applicationName: "RSCertio",
  authors: [{ name: "Riverside Studio" }],
  openGraph: {
    title: "RSCertio — Generator Sertifikat Massal Online",
    description,
    siteName: "RSCertio",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
