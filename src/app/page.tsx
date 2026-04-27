import Link from "next/link";
import { redirect } from "next/navigation";
import { getAnimals } from "@/app/actions/herd";
import { 
  Users, 
  Droplets, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Activity, 
  LogOut, 
  Database, 
  Milk, 
  Wallet, 
  Stethoscope, 
  Info, 
  Check,
  Shield,
  Settings,
  Bell
} from "lucide-react";
import { getAnimalGroup } from "@/lib/herd-utils";
import { auth, signOut } from "@/auth";
import { getMilkRecords } from "@/app/actions/milk";
import { getFinanceRecords } from "@/app/actions/finance";
import { getFeeds } from "@/app/actions/feeding";
import AnalyticsClient from "@/components/AnalyticsClient";
import NotificationCenter from "@/components/NotificationCenter";
import TaskWidget from "@/components/TaskWidget";
import { generateAutomatedTasks } from "@/lib/task-engine";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  const animals = await getAnimals() as any[];
  const milkRecords = await getMilkRecords();
  const financeRecords = await getFinanceRecords();
  const feeds = await getFeeds();

  const automatedTasks = generateAutomatedTasks(animals, feeds);

  const isAdmin = session?.user?.role === 'SUPER_ADMIN';
  const isFarmAdmin = session?.user?.role === 'FARM_ADMIN';

  // Group Counts
  const counts = animals.reduce((acc: any, a) => {
    const group = getAnimalGroup(a);
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  const fresh = counts['YENİ DOĞANLAR'] || 0;
  const milking1 = counts['SAĞMAL 1'] || 0;
  const milking2 = counts['SAĞMAL 2'] || 0;
  const dryOff = counts['QURUYA ÇIXANLAR'] || 0;
  const closeup = counts['DOĞUMA 1 AY QALMIŞLAR'] || 0;
  const calves = counts['BUZOVLAR'] || 0;
  const heifers = counts['DANALAR'] || 0;

  // Status Summary
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const sick = animals.filter(a => (a.healthRecords || []).some((r: any) => new Date(r.date) >= fourteenDaysAgo)).length;
  
  const pregnant = animals.filter(a => {
    const lastAI = (a.reproRecords || []).find((r: any) => r.eventType === 'INSEMINATION');
    const lastCalving = (a.calvingRecords || [])[0];
    if (!lastAI) return false;
    const aiDate = new Date(lastAI.date);
    if (lastCalving && new Date(lastCalving.date) > aiDate) return false;
    const daysSinceAI = Math.floor((today.getTime() - aiDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceAI >= 30 && daysSinceAI < 285;
  }).length;

  const milking = milking1 + milking2 + fresh;
  const adultFemales = animals.filter(a => a.gender === 'FEMALE' && (new Date().getTime() - new Date(a.birthDate || 0).getTime()) / (1000 * 60 * 60 * 24) > 450).length;
  const empty = Math.max(0, adultFemales - pregnant);

  // Milk Stats
  const todayMilk = milkRecords.filter(r => new Date(r.date).toISOString().split('T')[0] === todayStr).reduce((acc, r) => acc + r.totalYield, 0);
  const avgMilk = milkRecords.length > 0 ? (milkRecords.reduce((acc, r) => acc + r.totalYield, 0) / milkRecords.length).toFixed(0) : 0;

  // Finance Stats
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const monthlyFinance = financeRecords.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const income = monthlyFinance.filter(r => r.type === 'INCOME').reduce((acc, r) => acc + r.amount, 0);
  const expense = monthlyFinance.filter(r => r.type === 'EXPENSE').reduce((acc, r) => acc + r.amount, 0);
  const balance = income - expense;

  // Analytics Data preparation
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const milkData = last14Days.map(date => {
    const dayMilk = milkRecords.filter(r => new Date(r.date).toISOString().split('T')[0] === date)
      .reduce((acc, r) => acc + r.totalYield, 0);
    const d = new Date(date);
    const label = d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
    return { name: label, yield: dayMilk };
  });

  const herdData = last14Days.map(date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    const count = animals.filter(a => new Date(a.createdAt) <= d).length;
    const label = new Date(date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
    return { name: label, count };
  });

  const financeData = [
    { name: 'Gəlir', value: income, color: '#10b981' },
    { name: 'Xərc', value: expense, color: '#ef4444' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in">
      <div className="bg-blue-600 text-white text-center py-2 rounded-xl text-xs font-black tracking-widest shadow-lg animate-pulse">
        🚀 MODERN FERMA SaaS v2.5 - ENTERPRISE EDITION 🚀
      </div>
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {isAdmin ? "Super Admin Paneli" : "Fərma Dashboard"}
            </h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isAdmin ? 'bg-slate-900 text-white' : isFarmAdmin ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {isAdmin ? 'Super Admin' : isFarmAdmin ? 'Fərma Admin' : 'İstifadəçi'}
            </span>
          </div>
          <p className="text-gray-500 mt-1 font-bold text-lg">Xoş gəldiniz, {session.user.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <NotificationCenter tasks={automatedTasks} />
           <form action={async () => {
             'use server'
             await signOut()
           }}>
             <button className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-4 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-all shadow-sm">
               <LogOut className="w-5 h-5" /> Çıxış
             </button>
           </form>
        </div>
      </header>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-600/5 border border-gray-100 flex items-center gap-6 hover:translate-y-[-4px] transition-all">
          <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{animals.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Sürü Sayı</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-sky-600/5 border border-gray-100 flex items-center gap-6 hover:translate-y-[-4px] transition-all">
          <div className="p-5 bg-sky-50 text-sky-600 rounded-3xl">
            <Milk className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{todayMilk.toFixed(0)} <span className="text-sm">L</span></div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Bugünkü Süd</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-emerald-600/5 border border-gray-100 flex items-center gap-6 hover:translate-y-[-4px] transition-all">
          <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <div className={`text-2xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {balance.toFixed(0)} <span className="text-sm font-bold">AZN</span>
            </div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Aylıq Balans</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-red-600/5 border border-gray-100 flex items-center gap-6 hover:translate-y-[-4px] transition-all">
          <div className="p-5 bg-red-50 text-red-600 rounded-3xl">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{sick}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Xəstə/Müalicə</div>
          </div>
        </div>
      </div>

      {/* AUTOMATED TASKS WIDGET */}
      <TaskWidget tasks={automatedTasks} />

      {/* ANALYTICS SECTION */}
      <AnalyticsClient 
        milkData={milkData} 
        financeData={financeData} 
        herdData={herdData}
        income={income} 
        expense={expense} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REPRODUCTION STATUS */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-2xl shadow-purple-600/5 border border-gray-100">
           <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
             <Activity className="w-6 h-6 text-purple-600" /> Reproduksiya
           </h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-purple-50 rounded-3xl">
                 <span className="font-bold text-purple-900">Boğaz Heyvanlar</span>
                 <span className="text-2xl font-black text-purple-600">{pregnant}</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-amber-50 rounded-3xl">
                 <span className="font-bold text-amber-900">Quruya çıxanlar</span>
                 <span className="text-2xl font-black text-amber-600">{dryOff}</span>
              </div>
              <div className="flex justify-between items-center p-5 bg-red-50 rounded-3xl">
                 <span className="font-bold text-red-900">Açıq (Boş) İnəklər</span>
                 <span className="text-2xl font-black text-red-600">{empty}</span>
              </div>
           </div>
        </div>

        {/* HERD GROUPS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
             <Users className="w-6 h-6 text-blue-600" /> Sürü Qrupları Üzrə Say
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Sağmal', count: milking, color: 'bg-blue-100 text-blue-600' },
              { name: 'Buzov', count: calves, color: 'bg-sky-100 text-sky-600' },
              { name: 'Dana', count: heifers, color: 'bg-indigo-100 text-indigo-600' },
              { name: 'Dügə', count: counts['DÜGƏLƏR'] || 0, color: 'bg-purple-100 text-purple-600' },
            ].map((group) => (
              <div key={group.name} className="p-6 rounded-[32px] border border-gray-50 flex flex-col items-center text-center group hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-2xl ${group.color} flex items-center justify-center font-black text-lg mb-3 group-hover:scale-110 transition-transform`}>
                  {group.count}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[
          { label: 'Heyvan Əlavə Et', icon: Plus, href: '/herd/new', color: 'bg-blue-600' },
          { label: 'Süd Qeydi', icon: Droplets, iconColor: 'text-sky-500', href: '/milk' },
          { label: 'Yemləmə', icon: Milk, iconColor: 'text-amber-500', href: '/feeding' },
          { label: 'Maliyyə', icon: Wallet, iconColor: 'text-emerald-500', href: '/finance' },
          { label: 'Sürü Siyahısı', icon: Database, iconColor: 'text-indigo-500', href: '/herd' },
          { label: isAdmin ? 'Admin Panel' : 'Ayarlar', icon: isAdmin ? Shield : Settings, iconColor: 'text-gray-500', href: isAdmin ? '/admin/users' : '/settings' },
        ].map((link, i) => (
          <Link 
            key={i}
            href={link.href}
            className={`p-6 rounded-[32px] ${link.color || 'bg-white border border-gray-100 shadow-sm'} flex flex-col items-center text-center gap-4 hover:translate-y-[-6px] transition-all group`}
          >
            <div className={`p-4 rounded-2xl ${link.color ? 'bg-white/20 text-white' : 'bg-gray-50 ' + link.iconColor} group-hover:scale-110 transition-transform`}>
              <link.icon className="w-6 h-6" />
            </div>
            <div className={`text-[11px] font-black uppercase tracking-wider ${link.color ? 'text-white' : 'text-gray-900'}`}>{link.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
