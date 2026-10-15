import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "SimpleMath – kalkulator dla uczniów",
  description:
    "Kalkulator matematyczny dla uczniów szkół podstawowych i średnich: ułamki, okresy, pierwiastki, logarytmy i trygonometria.",
  appleWebApp: {
    capable: true,
    title: "SimpleMath",
    statusBarStyle: "default",
  },
  // Safari nie powinien zamieniać ciągów cyfr w zadaniach na linki telefoniczne.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Treść rysuje się pod notchem/Dynamic Island – odstępy zapewnia env(safe-area-inset-*) w CSS.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
