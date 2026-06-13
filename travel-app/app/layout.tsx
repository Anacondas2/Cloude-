import type { Metadata, Viewport } from "next";
import { Inter, Unbounded } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trewel — В каких странах ты был?",
  description:
    "Выбери страны, которые ты посетил, и попади в общую публичную ленту путешествий своей группы.",
  openGraph: {
    title: "Trewel — карта путешествий группы",
    description: "Проверь, кто где был 🌍 Выбери свои страны и посмотри результаты.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06180f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${display.variable}`}>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <div className="aurora-bg" aria-hidden />
        {children}
      </body>
    </html>
  );
}
