import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGT Product AI",
  description: "AI product studio for e-commerce content creation.",
  applicationName: "AGT Product AI",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
