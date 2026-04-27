'use client'

import { useState } from 'react';
import { 
  Droplets, TrendingUp, TrendingDown, Plus, Trash2, Edit, 
  Calendar, Info, Check, X, Filter, BarChart3, LineChart as LineIcon,
  Search, ArrowUpRight, Award, Beaker
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useI18n } from '@/lib/i18n';

export default function MilkClient({ 
  animals, 
  initialRecords, 
  addAction, 
  deleteAction, 
  updateAction,
  targetFarmId 
}: { 
  animals: any[],
  initialRecords: any[],
  addAction: (formData: FormData, targetFarmId?: string) => Promise<void>,
  deleteAction: (id: string, targetFarmId?: string) => Promise<void>,
  updateAction: (id: string, formData: FormData, targetFarmId?: string) => Promise<void>,
  targetFarmId?: string
}) {
  const { t } = useI18n();
  const [records, setRecords] = useState(initialRecords);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = initialRecords.filter(r => new Date(r.date).toISOString().split('T')[0] === today);
  const totalToday = todayRecords.reduce((acc, r) => acc + r.totalYield, 0);
  
  // Chart Data: Last 7 days total yield
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTotal = initialRecords
      .filter(r => new Date(r.date).toISOString().split('T')[0] === dateStr)
      .reduce((acc, r) => acc + r.totalYield, 0);
    return {
      date: d.toLocaleDateString('az-AZ', { weekday: 'short' }),
      amount: dayTotal,
      fullDate: dateStr
    };
  }).reverse();

  // Top producers
  const producerStats = initialRecords.reduce((acc: Record<string, {tag: string, total: number, count: number}>, r) => {
    if (!acc[r.animalId]) {
      acc[r.animalId] = { tag: r.animal.tagNumber, total: 0, count: 0 };
    }
    acc[r.animalId].total += r.totalYield;
    acc[r.animalId].count += 1;
    return acc;
  }, {});

  const topProducers = Object.values(producerStats)
    .sort((a: any, b: any) => (b.total / b.count) - (a.total / a.count))
    .slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
             <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                <Droplets className="w-8 h-8" />
             </div>
             {t.milk} <span className="text-blue-600">{t.milkRecords}</span>
          </h1>
          <p className="text-gray-500 mt-3 font-medium flex items-center gap-2">
            <Beaker className="w-4 h-4 text-blue-500" /> {t.dailyMilk}
          </p>
        </div>
        <button 
          onClick={() => { setEditingRecord(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[24px] font-black transition-all shadow-2xl shadow-blue-600/20 flex items-center gap-2 transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" /> {t.addMilk}
        </button>
      </header>

      {/* STATS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel rounded-[40px] p-8 shadow-2xl shadow-blue-500/5 relative overflow-hidden group border border-white/50">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-50 opacity-50 group-hover:scale-110 transition-transform">
             <Droplets className="w-full h-full" />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{t.todayMilk}</p>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{totalToday.toLocaleString()} <span className="text-lg text-gray-400 ml-1">{t.liters}</span></h3>
          <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-100">
             <TrendingUp className="w-3 h-3" /> Stabil artım
          </div>
        </div>

        <div className="glass-panel rounded-[40px] p-8 shadow-2xl shadow-emerald-500/5 relative overflow-hidden group border border-white/50">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform">
             <LineIcon className="w-full h-full" />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Ortalama (Son 7 gün)</p>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
            {(last7Days.reduce((acc, d) => acc + d.amount, 0) / 7).toFixed(1)} <span className="text-lg text-gray-400 ml-1">{t.liters}</span>
          </h3>
          <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100">
             <ArrowUpRight className="w-3 h-3" /> Hədəfə uyğundur
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[40px] p-8 shadow-2xl shadow-blue-600/20 relative overflow-hidden group border border-white/10 text-white">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform">
             <Award className="w-full h-full" />
          </div>
          <p className="text-blue-100 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Ən Yaxşı İstehsalçı</p>
          <h3 className="text-4xl font-black tracking-tighter">
            {topProducers[0]?.tag || '-'}
          </h3>
          <div className="mt-6 flex items-center gap-2 text-blue-100 font-bold text-xs bg-white/10 backdrop-blur-md w-fit px-4 py-1.5 rounded-full border border-white/10">
             Günlük orta: {(topProducers[0]?.total / topProducers[0]?.count || 0).toFixed(1)} L
          </div>
        </div>
      </section>

      {/* CHARTS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-[48px] p-10 shadow-2xl shadow-blue-500/5 border border-white/50">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                 <BarChart3 className="w-6 h-6 text-blue-600" /> Həftəlik Trend
              </h2>
           </div>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px'}}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorYield)" name="Ümumi Litr" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-panel rounded-[48px] p-10 shadow-2xl shadow-blue-500/5 border border-white/50">
           <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-10 flex items-center gap-3">
              <Award className="w-6 h-6 text-blue-600" /> Ən Çox Süd Verənlər
           </h2>
           <div className="space-y-6">
              {topProducers.map((p: any, i) => (
                <div key={p.tag} className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                      {i + 1}
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-gray-900 text-sm">{p.tag}</p>
                      <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                         <div 
                           className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                           style={{ width: `${(p.total / p.count / 40) * 100}%` }} 
                         />
                      </div>
                   </div>
                   <p className="font-black text-gray-900 text-sm">{(p.total / p.count).toFixed(1)} L</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* RECORD LIST */}
      <section className="glass-panel rounded-[48px] overflow-hidden shadow-2xl shadow-blue-500/5 border border-white/50 bg-white/30 backdrop-blur-md">
         <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t.milkRecords}</h2>
               <p className="text-gray-500 text-sm font-medium mt-1">Gündəlik qeydlər siyahısı</p>
            </div>
            <div className="relative w-full md:w-80 group">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder={t.search} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
              />
            </div>
         </div>

         <div className="p-6">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                       <th className="px-8 py-4">{t.tagNumber}</th>
                       <th className="px-8 py-4">{t.date}</th>
                       <th className="px-8 py-4 text-center">{t.morning} (L)</th>
                       <th className="px-8 py-4 text-center">{t.evening} (L)</th>
                       <th className="px-8 py-4 text-center">{t.total} (L)</th>
                       <th className="px-8 py-4 text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = initialRecords
                        .filter(r => r.animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      
                      const totalPages = Math.ceil(filtered.length / itemsPerPage);
                      const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                      return (
                        <>
                          {displayed.map((record) => (
                            <tr key={record.id} className="group bg-white hover:bg-blue-50/30 transition-all border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                              <td className="px-8 py-6 rounded-l-[32px] border-y border-l border-gray-100">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-sm">
                                       {record.animal.tagNumber.slice(-2)}
                                    </div>
                                    <span className="font-black text-gray-900">{record.animal.tagNumber}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6 border-y border-gray-100 text-sm font-bold text-gray-500">
                                 {new Date(record.date).toLocaleDateString('az-AZ')}
                              </td>
                              <td className="px-8 py-6 border-y border-gray-100 text-center font-bold text-gray-900">
                                 {record.yieldMorning.toFixed(0)}
                              </td>
                              <td className="px-8 py-6 border-y border-gray-100 text-center font-bold text-gray-900">
                                 {record.yieldEvening.toFixed(0)}
                              </td>
                              <td className="px-8 py-6 border-y border-gray-100 text-center">
                                 <span className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-600/20">
                                   {record.totalYield.toFixed(0)} L
                                 </span>
                              </td>
                              <td className="px-8 py-6 rounded-r-[32px] border-y border-r border-gray-100 text-center">
                                 <div className="flex justify-center gap-2 opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => { setEditingRecord(record); setShowModal(true); }}
                                      className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center justify-center"
                                    >
                                       <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        if (confirm(t.deleteConfirm)) await deleteAction(record.id, targetFarmId);
                                      }}
                                      className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all flex items-center justify-center"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                            </tr>
                          ))}
                          
                          {totalPages > 1 && (
                            <tr>
                              <td colSpan={6} className="py-8">
                                <div className="flex justify-center items-center gap-2">
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button 
                                      key={p} 
                                      onClick={() => setCurrentPage(p)}
                                      className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                      {p}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()}
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-start justify-center p-4 md:p-10 overflow-y-auto pt-10 md:pt-20">
          <form action={async (formData) => {
            if (editingRecord) {
              await updateAction(editingRecord.id, formData, targetFarmId);
            } else {
              await addAction(formData, targetFarmId);
            }
            setShowModal(false);
          }} className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl w-full max-w-xl space-y-6 md:space-y-10 relative">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                     <Plus className="w-6 h-6 md:w-7 md:h-7"/>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-xl md:text-2xl tracking-tight">{editingRecord ? t.edit : t.addMilk}</h4>
                    <p className="text-gray-500 text-xs md:text-sm font-bold">Məlumatları daxil edin.</p>
                  </div>
               </div>
               <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 md:w-6 md:h-6"/>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {!editingRecord && (
                <div className="col-span-full space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Bırka ilə axtar</label>
                    <div className="relative group">
                       <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                       <input 
                         type="text" 
                         placeholder="Məs: 1234" 
                         value={modalSearchTerm}
                         onChange={(e) => setModalSearchTerm(e.target.value)}
                         className="w-full pl-12 pr-6 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.tagNumber}</label>
                    <select name="animalId" required className="w-full text-sm px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black appearance-none">
                      <option value="">{modalSearchTerm ? 'Axtarışa uyğun nəticələr...' : 'Siyahıdan seçin...'}</option>
                      {(animals || [])
                        .filter(a => a.gender === 'FEMALE' && (a.tagNumber.toLowerCase().includes(modalSearchTerm.toLowerCase())))
                        .map(a => (
                          <option key={a.id} value={a.id}>{a.tagNumber} {a.name ? `(${a.name})` : ''}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 md:space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.date}</label>
                <input type="date" name="date" defaultValue={editingRecord ? new Date(editingRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 md:px-6 py-4 md:py-5 bg-gray-50 border border-gray-100 rounded-2xl md:rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black" />
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.morning} (L)</label>
                <input type="number" step="0.1" name="yieldMorning" defaultValue={editingRecord?.yieldMorning || ''} required className="w-full text-sm px-5 md:px-6 py-4 md:py-5 bg-gray-50 border border-gray-100 rounded-2xl md:rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black" placeholder="0.0" />
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.evening} (L)</label>
                <input type="number" step="0.1" name="yieldEvening" defaultValue={editingRecord?.yieldEvening || ''} required className="w-full text-sm px-5 md:px-6 py-4 md:py-5 bg-gray-50 border border-gray-100 rounded-2xl md:rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black" placeholder="0.0" />
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 pt-2 md:pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 md:py-6 rounded-2xl md:rounded-[32px] text-base md:text-lg font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30">{t.save}</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-6 md:px-12 py-4 md:py-6 bg-gray-50 text-gray-500 rounded-2xl md:rounded-[32px] text-base md:text-lg font-black hover:bg-gray-100 transition-all border border-gray-100">{t.cancel}</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
