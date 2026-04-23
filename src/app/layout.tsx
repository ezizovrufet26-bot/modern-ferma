import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modern Ferma - Professional İdarəetmə",
  description: "Müasir heyvandarlıq və təsərrüfat idarəetmə sistemi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Modern Ferma v2",
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
      <head>
        <link rel="icon" href="/app_icon.png" />
        <link rel="apple-touch-icon" href="/app_icon.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 flex flex-col md:flex-row`} suppressHydrationWarning>
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto flex flex-col">
          <MobileHeader />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 opacity-30 pointer-events-none z-50">v1.2.0-FINAL</div>
          <div className="flex-1">
            {children}
          </div>
        </main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }, function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
