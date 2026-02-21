import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FleetFlow - Modular Fleet & Logistics Management",
  description: "Offline-first logistics ERP that replaces manual logbooks with strict business logic. Built for modern fleet operations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FleetFlow",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#714b67",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FleetFlow" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <PWAInstaller />
        {children}
      </body>
    </html>
  );
}
