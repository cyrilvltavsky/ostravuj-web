import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { RandomPickerProvider } from "@/components/random-picker";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ostravuj — Objevuj nejlepší místa v Ostravě",
  description:
    "Kurátorský průvodce nejlepšími místy v Ostravě. Gastro, aktivity, rande, místa zdarma.",
  metadataBase: new URL("https://ostravuj.cz"),
  openGraph: {
    title: "Ostravuj",
    description: "Objevuj nejlepší místa v Ostravě.",
    url: "https://ostravuj.cz",
    siteName: "Ostravuj",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        <RandomPickerProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
        </RandomPickerProvider>
      </body>
    </html>
  );
}
