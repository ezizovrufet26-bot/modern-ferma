'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Database, Droplets, Wheat, Menu, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNav() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event to show our custom install banner
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Hide nav on login/register
  if (pathname === '/login' || pathname === '/register') return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  const navItems = [
    { name: 'Ana Səhifə', href: '/', icon: Home },
    { name: 'Sürü', href: '/herd', icon: Database },
    { name: 'Süd', href: '/milk', icon: Droplets },
    { name: 'Yem', href: '/feeding', icon: Wheat },
    { name: 'Daha Çox', href: '/settings', icon: Menu },
  ];

  return (
    <>
      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstall && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="md:hidden fixed bottom-24 left-4 right-4 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl z-50 flex items-center justify-between border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">Tətbiqi Quraşdır</p>
                <p className="text-[10px] text-gray-400">Daha sürətli və oflayn istifadə üçün</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowInstall(false)} className="px-3 py-2 text-xs font-bold text-gray-400">Sonra</button>
              <button onClick={handleInstall} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black">Yüklə</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 pb-safe">
        <nav className="flex justify-around items-center h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href} className="relative w-full h-full flex flex-col items-center justify-center group">
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-600/30 -translate-y-2' : 'hover:bg-gray-50'}`}>
                  <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.name}
                </span>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div 
                    layoutId="mobileNavIndicator"
                    className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
