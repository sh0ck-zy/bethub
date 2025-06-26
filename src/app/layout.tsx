import type { Metadata } from "next";
import { Inter as GeistSans } from "next/font/google";
import { JetBrains_Mono as GeistMono } from "next/font/google";
import "./globals.css";
// import '@/i18n'; // Initialize i18n

const geistSans = GeistSans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = GeistMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "BetHub - Premium Sports Analysis & Insights",
  description: "Professional sports analysis and betting insights platform with AI-powered match predictions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {children}
      </body>
    </html>
  );
}


