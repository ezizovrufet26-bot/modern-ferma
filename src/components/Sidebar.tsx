import Link from "next/link";
import { Home, List, Stethoscope, Droplets, Wallet, Settings, LayoutDashboard, Database, Syringe, Banknote, ShieldCheck } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Sürü İdarəetmə", href: "/herd", icon: Database },
    { name: "Süd Verimi", href: "/milk", icon: Droplets },
    { name: "Sağlamlıq", href: "/health", icon: Syringe },
    { name: "Maliyyə", href: "/finance", icon: Banknote },
    { name: "Təhlükəsizlik", href: "/security", icon: ShieldCheck },
    { name: "Ayarlar", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-80 h-screen bg-[#020617] text-white flex flex-col hidden md:flex sticky top-0 shadow-2xl z-50 border-r border-white/5">
      <div className="p-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 relative">
             <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
             <img src="/icon-192x192.png" className="w-full h-full rounded-2xl object-cover relative z-10 border border-white/10" alt="Logo" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white leading-none">
              Modern<span className="text-blue-500">Ferma</span>
            </h1>
            <p className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest mt-1">SaaS Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-5 py-3.5 text-gray-400 rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-300 group"
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-400 mb-1">PRO Versiya</p>
          <p className="text-[10px] text-gray-400 leading-relaxed">Bütün analitik imkanlar aktivdir.</p>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5 text-[10px] text-gray-500 font-medium">
          &copy; 2026 Antigravity AI
        </div>
      </div>
    </aside>
  );
}
