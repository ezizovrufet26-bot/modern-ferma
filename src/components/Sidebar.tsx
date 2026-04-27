'use client'

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, List, Stethoscope, Droplets, Wallet, Settings, LayoutDashboard, Database, Syringe, Banknote, ShieldCheck, Wheat, Menu, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();

  // Hide sidebar on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Sürü İdarəetmə", href: "/herd", icon: Database },
    { name: "Süd Verimi", href: "/milk", icon: Droplets },
    { name: "Yemləmə", href: "/feeding", icon: Wheat },
    { name: "Sağlamlıq", href: "/health", icon: Syringe },
    { name: "Maliyyə", href: "/finance", icon: Banknote },
    { name: "Heyət", href: "/staff", icon: List },
    { name: "Ayarlar", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <aside className={`hidden md:sticky top-0 left-0 w-80 h-screen bg-[#020617] text-white md:flex flex-col shadow-2xl z-[90] border-r border-white/5`}>
        <div className="p-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 relative">
               <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
               <img src="/app_icon.png" className="w-full h-full rounded-2xl object-cover relative z-10 border border-white/10" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">
                Modern<span className="text-blue-500">Ferma</span>
              </h1>
              <p className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest mt-1">v2.0 Professional</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-5 py-3.5 text-gray-400 rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-300 group"
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 space-y-4">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-5 py-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-widest border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Çıxış Et
          </button>

          <div className="mt-6 pt-6 border-t border-white/5 text-[10px] text-gray-500 font-medium text-center">
            &copy; 2026 Antigravity AI
          </div>
        </div>
      </aside>
    </>
  );
}
