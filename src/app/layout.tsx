import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";
import { I18nProvider } from "@/lib/i18n";

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
        <I18nProvider>
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto flex flex-col pb-24 md:pb-0">
          <MobileHeader />
          <div className="flex-1">
            {children}
          </div>
          <MobileNav />
        </main>
        </I18nProvider>
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
