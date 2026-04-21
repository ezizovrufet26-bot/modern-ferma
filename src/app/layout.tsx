import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ModernFerma - Ferma İdarəetmə Sistemi",
  description: "İnək və Sürü idarəetmə sistemi (CowMaster alternativi)",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Modern Ferma",
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body className={`${inter.className} bg-gray-50 text-gray-900 flex`}>
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
