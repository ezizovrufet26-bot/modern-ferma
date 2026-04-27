'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wheat, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Calculator, 
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  History,
  PieChart as PieChartIcon,
  ShoppingBag
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface FeedingDashboardProps {
  feeds: any[];
  rations: any[];
  feedingHistory: any[];
  onAddFeeding: (data: any) => Promise<void>;
}

export default function FeedingDashboard({ feeds, rations, feedingHistory, onAddFeeding }: FeedingDashboardProps) {
  const [animalCount, setAnimalCount] = useState(100);
  const [selectedRationId, setSelectedRationId] = useState(rations[0]?.id || '');
  const [isCalculating, setIsCalculating] = useState(false);

  const selectedRation = rations.find(r => r.id === selectedRationId);
  const calculatedItems = selectedRation?.items.map((item: any) => ({
    name: item.feedItem.name,
    totalAmount: (item.amount * animalCount).toFixed(1),
    unit: item.feedItem.unit,
    cost: (item.amount * animalCount * item.feedItem.costPerUnit).toFixed(2),
    stockAfter: item.feedItem.stock - (item.amount * animalCount)
  })) || [];

  const totalCost = calculatedItems.reduce((acc: number, item: any) => acc + parseFloat(item.cost), 0);

  // Chart Data: Last 7 days feeding costs
  const chartData = feedingHistory.slice(0, 7).map(h => ({
    name: new Date(h.date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }),
    cost: h.totalCost
  })).reverse();

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-10">
      {/* TOP ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INVENTORY STATUS CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-2xl shadow-amber-600/5 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-500 text-white rounded-3xl shadow-lg shadow-amber-500/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Anbar Vəziyyəti</h3>
                <p className="text-gray-400 text-sm font-medium">Yem ehtiyatı və kritik hədlər</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feeds.map((feed, idx) => {
              const isLow = feed.stock <= (feed.minStock || 50);
              const percentage = Math.min(100, (feed.stock / ((feed.minStock || 50) * 5)) * 100);
              
              return (
                <div key={feed.id} className={`p-6 rounded-[32px] border transition-all ${isLow ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100 hover:border-amber-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-black text-gray-900 truncate pr-2">{feed.name}</span>
                    {isLow && (
                      <div className="bg-red-500 text-white p-1 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{feed.stock.toFixed(0)}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{feed.unit}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-amber-500'}`}
                      />
                    </div>
                  </div>
                  
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kritik Hədd: {feed.minStock || 50} {feed.unit}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* FEEDING COST CHART */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-600/5 border border-gray-100 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-600/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Xərc Trendi</h3>
              <p className="text-gray-400 text-sm font-medium">Son 7 günlük yem xərci</p>
            </div>
          </div>

          <div className="h-[180px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#64748b', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="cost" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* SMART CALCULATOR SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CALCULATOR PANEL */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 transform rotate-12">
            <Calculator className="w-64 h-64" />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Scale className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Rasion Hesablayıcı</h3>
                <p className="text-slate-400 text-sm font-medium">Heyvan sayına görə yemləmə planı</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Heyvan Sayı</label>
                <input 
                  type="number" 
                  value={animalCount}
                  onChange={e => setAnimalCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-xl font-black outline-none focus:ring-4 focus:ring-amber-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Seçilmiş Rasion</label>
                <select 
                  value={selectedRationId}
                  onChange={e => setSelectedRationId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-lg font-black outline-none focus:ring-4 focus:ring-amber-500/20 transition-all appearance-none"
                >
                  {rations.map(r => <option key={r.id} value={r.id} className="text-slate-900">{r.name}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white/5 rounded-[40px] p-8 border border-white/10 space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Təxmini Ümumi Xərc</p>
                <p className="text-4xl font-black text-amber-400">₼ {totalCost.toLocaleString()}</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/10">
                {calculatedItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full group-hover:scale-150 transition-transform" />
                      <span className="text-sm font-bold text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-white">{item.totalAmount} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={async () => {
                setIsCalculating(true);
                await onAddFeeding({
                  groupName: 'HESABLANMIŞ',
                  animalCount,
                  rationId: selectedRationId
                });
                setIsCalculating(false);
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-6 rounded-[32px] font-black text-lg shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3"
            >
              {isCalculating ? <Loader2 className="w-6 h-6 animate-spin" /> : <History className="w-6 h-6" />}
              Yemləməni İndi Qeyd Et
            </button>
          </div>
        </motion.div>

        {/* RECENT FEEDING RECORDS */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500 text-white rounded-3xl shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Son Yemləmələr</h3>
                <p className="text-gray-400 text-sm font-medium">Gündəlik hesabat</p>
              </div>
            </div>
            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {feedingHistory.slice(0, 4).map((feeding, idx) => (
              <div key={feeding.id} className="group relative pl-8 pb-8 border-l-2 border-gray-100 last:pb-0 last:border-none">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-emerald-500 group-hover:scale-125 transition-transform" />
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-black text-gray-900 leading-tight">{feeding.groupName}</h5>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {new Date(feeding.date).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} • {feeding.animalCount} Baş
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₼ {feeding.totalCost.toFixed(0)}</p>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase">Tamamlanıb</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
             <div className="bg-emerald-50/50 p-6 rounded-[32px] flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <PieChartIcon className="w-8 h-8 text-emerald-600" />
                   <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Bugünkü Ümumi</p>
                      <p className="text-2xl font-black text-gray-900">₼ {feedingHistory.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).reduce((acc, h) => acc + h.totalCost, 0).toLocaleString()}</p>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
