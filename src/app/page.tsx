import Link from "next/link";
import { getAnimals } from "@/app/actions/herd";
import { Users, Droplets, Calendar, TrendingUp, Plus, Activity, LogOut, Trash2, Database, Milk, Wallet, Stethoscope, Info, Check } from "lucide-react";

export default async function DashboardPage() {
  const animals = await getAnimals();

  // Helper function to get group (same as in HerdClient)
  const getAnimalGroup = (animal: any) => {
    const today = new Date();
    const birthDate = animal.birthDate ? new Date(animal.birthDate) : null;
    const ageInDays = birthDate ? Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)) : 1000;
    
    // Male animals
    if (animal.gender === 'MALE') {
      if (ageInDays < 180) return 'BUZOVLAR';
      if (ageInDays < 450) return 'DANALAR';
      return 'DANALAR/BUĞALAR';
    }

    // Female animals logic
    const lastCalving = animal.calvingRecords && animal.calvingRecords[0];
    const lastAI = animal.reproRecords && animal.reproRecords.find((r: any) => r.eventType === 'INSEMINATION');
    
    // Babies (Calves)
    if (ageInDays < 180) return 'BUZOVLAR'; 
    
    // Pregnancy & Calving Logic
    if (lastAI) {
      const aiDate = new Date(lastAI.date);
      const isPregnant = !lastCalving || new Date(lastCalving.date) < aiDate;
      
      if (isPregnant) {
        const expectedCalving = new Date(aiDate.getTime() + (285 * 24 * 60 * 60 * 1000));
        const daysToCalving = Math.floor((expectedCalving.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysToCalving <= 30 && daysToCalving > 0) return 'DOĞUMA 1 AY QALMIŞLAR';
        if (daysToCalving <= 60 && daysToCalving > 30) return 'QURUYA ÇIXANLAR';
      }
    }

    // Milking status for adult females
    if (lastCalving) {
      const daysSinceCalving = Math.floor((today.getTime() - new Date(lastCalving.date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCalving <= 30) return 'YENİ DOĞANLAR'; // Fresh cows
      if (daysSinceCalving <= 150) return 'SAĞMAL 1';
      return 'SAĞMAL 2';
    }

    // Young females
    if (ageInDays < 450) return 'DANALAR';
    return 'DÜYƏLƏR'; // Females > 15 months that haven't calved yet
  };

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

  // Status Summary (Re-calculating for the status section)
  const today = new Date();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const sick = animals.filter(a => a.healthRecords.some((r: any) => new Date(r.date) >= fourteenDaysAgo)).length;
  
  const pregnant = animals.filter(a => {
    const lastAI = a.reproRecords.find((r: any) => r.eventType === 'INSEMINATION');
    const lastCalving = a.calvingRecords[0];
    if (!lastAI) return false;
    const aiDate = new Date(lastAI.date);
    if (lastCalving && new Date(lastCalving.date) > aiDate) return false;
    const daysSinceAI = Math.floor((today.getTime() - aiDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceAI >= 30 && daysSinceAI < 285;
  }).length;

  const milking = milking1 + milking2 + fresh;
  const dry = dryOff;
  const adultFemales = animals.filter(a => a.gender === 'FEMALE' && (new Date().getTime() - new Date(a.birthDate || 0).getTime()) / (1000 * 60 * 60 * 24) > 450).length;
  const empty = Math.max(0, adultFemales - pregnant);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Xoş Gəldiniz <span className="text-blue-600">Rufet!</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 21 Aprel, 2026 • Sürü vəziyyəti stabildir.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/staff" className="bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm flex items-center gap-2">
            <Users className="w-5 h-5" /> Həkimlər
          </Link>
          <Link href="/herd/new" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 transform hover:scale-105">
            <Plus className="w-5 h-5" /> Yeni Heyvan
          </Link>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-[32px] p-6 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database className="w-20 h-20 text-blue-600" />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Cəmi Heyvan</p>
          <h3 className="text-4xl font-black text-gray-900">{animals.length}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-3 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" /> +2 bu ay
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Droplets className="w-20 h-20 text-blue-500" />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Sağmal İnek</p>
          <h3 className="text-4xl font-black text-gray-900">{milking}</h3>
          <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Info className="w-3 h-3" /> {((milking / (animals.length || 1)) * 100).toFixed(0)}% sürü payı
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-20 h-20 text-emerald-500" />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Hamiləlik</p>
          <h3 className="text-4xl font-black text-gray-900">{pregnant}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-3 py-1 rounded-full">
            <Check className="w-3 h-3" /> İdeal vəziyyət
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6 shadow-xl shadow-red-500/5 border-red-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Stethoscope className="w-20 h-20 text-red-500" />
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Müalicədə</p>
          <h3 className="text-4xl font-black text-gray-900">{sick}</h3>
          <div className="mt-4 flex items-center gap-2 text-red-600 font-bold text-xs bg-red-50 w-fit px-3 py-1 rounded-full">
            <Activity className="w-3 h-3" /> Təcili baxış tələb olunur
          </div>
        </div>
      </section>

      {/* DETAILED CATEGORIES */}
      <section className="glass-panel rounded-[40px] p-10 shadow-2xl shadow-blue-500/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Qrup Bölgüləri</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Sürünün bioloji və məhsuldarlıq vəziyyəti</p>
          </div>
          <Link href="/herd" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2">
            Bütün Siyahı <LogOut className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <Link href="/herd?group=YENİ DOĞANLAR" className="group relative">
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-[28px] p-6 text-center transition-all duration-300 group-hover:bg-pink-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-pink-500/20">
              <span className="block text-[10px] font-black uppercase text-pink-600 group-hover:text-pink-100 mb-1">0-90 GÜN</span>
              <span className="block text-2xl font-black text-pink-700 group-hover:text-white">{fresh}</span>
              <span className="block text-[11px] font-bold text-pink-500 group-hover:text-pink-200 mt-2">Yeni Doğan</span>
            </div>
          </Link>

          <Link href="/herd?group=SAĞMAL 1" className="group relative">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-[28px] p-6 text-center transition-all duration-300 group-hover:bg-blue-600 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-blue-600/20">
              <span className="block text-[10px] font-black uppercase text-blue-600 group-hover:text-blue-100 mb-1">PEAK</span>
              <span className="block text-2xl font-black text-blue-700 group-hover:text-white">{milking1}</span>
              <span className="block text-[11px] font-bold text-blue-500 group-hover:text-blue-200 mt-2">Sağmal 1</span>
            </div>
          </Link>

          <Link href="/herd?group=SAĞMAL 2" className="group relative">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[28px] p-6 text-center transition-all duration-300 group-hover:bg-cyan-600 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-cyan-600/20">
              <span className="block text-[10px] font-black uppercase text-cyan-600 group-hover:text-cyan-100 mb-1">ORTA</span>
              <span className="block text-2xl font-black text-cyan-700 group-hover:text-white">{milking2}</span>
              <span className="block text-[11px] font-bold text-cyan-500 group-hover:text-cyan-200 mt-2">Sağmal 2</span>
            </div>
          </Link>

          <Link href="/herd?group=QURUYA ÇIXANLAR" className="group relative">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-[28px] p-6 text-center transition-all duration-300 group-hover:bg-orange-600 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-orange-600/20">
              <span className="block text-[10px] font-black uppercase text-orange-600 group-hover:text-orange-100 mb-1">-60 GÜN</span>
              <span className="block text-2xl font-black text-orange-700 group-hover:text-white">{dryOff}</span>
              <span className="block text-[11px] font-bold text-orange-500 group-hover:text-orange-200 mt-2">Quruda</span>
            </div>
          </Link>

          <Link href="/herd?group=DOĞUMA 1 AY QALMIŞLAR" className="group relative">
            <div className="bg-red-500/10 border border-red-500/20 rounded-[28px] p-6 text-center transition-all duration-300 group-hover:bg-red-600 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-red-600/20">
              <span className="block text-[10px] font-black uppercase text-red-600 group-hover:text-red-100 mb-1">-30 GÜN</span>
              <span className="block text-2xl font-black text-red-700 group-hover:text-white">{closeup}</span>
              <span className="block text-[11px] font-bold text-red-500 group-hover:text-red-200 mt-2">Klose-up</span>
            </div>
          </Link>

          <Link href="/herd?group=BUZOVLAR" className="group relative">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] p-6 text-center transition-all duration-300 group-hover:bg-emerald-600 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-emerald-600/20">
              <span className="block text-[10px] font-black uppercase text-emerald-600 group-hover:text-emerald-100 mb-1">GƏNC</span>
              <span className="block text-2xl font-black text-emerald-700 group-hover:text-white">{calves}</span>
              <span className="block text-[11px] font-bold text-emerald-500 group-hover:text-emerald-200 mt-2">Buzovlar</span>
            </div>
          </Link>

          <Link href="/herd?group=DANALAR" className="group relative">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-[28px] p-6 text-center transition-all duration-300 group-hover:bg-purple-600 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-purple-600/20">
              <span className="block text-[10px] font-black uppercase text-purple-600 group-hover:text-purple-100 mb-1">DÜYƏ</span>
              <span className="block text-2xl font-black text-purple-700 group-hover:text-white">{heifers}</span>
              <span className="block text-[11px] font-bold text-purple-500 group-hover:text-purple-200 mt-2">Danalar</span>
            </div>
          </Link>
        </div>
      </section>

      {/* FINANCE & MILK PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 glass-panel rounded-[40px] p-10 shadow-2xl shadow-blue-500/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Məhsuldarlıq</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Süd verimi və qrafik analizi</p>
            </div>
            <div className="flex gap-2">
               <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                 <Droplets className="w-5 h-5" />
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-600/30">
              <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
                <Droplets className="w-48 h-48" />
              </div>
              <p className="text-blue-100 font-bold text-xs uppercase tracking-widest mb-2">Gündəlik Ortalam SGG</p>
              <h4 className="text-5xl font-black mb-6">32.4 <span className="text-2xl opacity-70">LT</span></h4>
              <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-2xl backdrop-blur-md">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">+1.2 lt artım</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-1">Cəmi Süd (Bu gün)</p>
                  <p className="text-2xl font-black text-gray-900">1,240 LT</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-1">Hədəf Verim</p>
                  <p className="text-2xl font-black text-gray-900">1,500 LT</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[40px] p-10 shadow-2xl shadow-blue-500/5 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Maliyyə</h2>
            <Link href="/finance" className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <div className="text-center">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Balans</p>
              <h4 className="text-5xl font-black text-gray-900">₼ 12,450</h4>
              <p className="text-emerald-500 font-bold text-sm mt-2 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" /> +15.4% bu ay
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
                <p className="text-emerald-600 font-bold text-[10px] uppercase mb-1">Gəlir</p>
                <p className="text-lg font-black text-emerald-700">₼ 8.2k</p>
              </div>
              <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                <p className="text-red-600 font-bold text-[10px] uppercase mb-1">Xərc</p>
                <p className="text-lg font-black text-red-700">₼ 3.1k</p>
              </div>
            </div>
          </div>
          
          <button className="mt-10 w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/20">
            Hesabatı Yüklə
          </button>
        </section>
      </div>
    </div>
  );
}
