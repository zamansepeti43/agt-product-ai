import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGT Product AI — Ürün İçerik Stüdyosu",
  description: "Ürün fotoğraflarını e-ticaret görsellerine, katalog metinlerine ve SEO içeriğine dönüştüren AI ürün stüdyosu.",
  applicationName: "AGT Product AI",
  manifest: "/manifest.webmanifest",
  keywords: ["ürün fotoğrafı", "AI ürün görseli", "e-ticaret", "Etsy", "katalog", "SEO", "AGT Studio"],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
