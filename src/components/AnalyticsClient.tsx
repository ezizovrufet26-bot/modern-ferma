'use client'

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { Milk, Banknote, TrendingUp, TrendingDown, Info, Users } from 'lucide-react';

interface AnalyticsProps {
  milkData: { name: string, yield: number }[];
  financeData: { name: string, value: number, color: string }[];
  herdData: { name: string, count: number }[];
  income: number;
  expense: number;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/20">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-gray-900">
          {payload[0].value.toLocaleString()} 
          <span className="text-xs ml-1 text-gray-500 font-bold uppercase">{unit || 'Litr'}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsClient({ milkData, financeData, herdData, income, expense }: AnalyticsProps) {
  const balance = income - expense;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MILK YIELD TREND */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-600/5 border border-gray-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-600/20">
                <Milk className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Süd İstehsalı Trendi</h3>
                <p className="text-gray-400 text-sm font-medium">Son 14 günün dinamikası</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-black text-gray-900 flex items-baseline gap-1">
                {milkData.reduce((acc, d) => acc + d.yield, 0).toFixed(0)}
                <span className="text-sm font-bold text-gray-400 uppercase">L</span>
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Cəmi 14 GÜN</p>
            </div>
          </div>

          <div className="h-[250px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={milkData}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  interval={1}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                />
                <Tooltip content={<CustomTooltip unit="L" />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#2563eb" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorYield)" 
                  animationDuration={2000}
                  activeDot={{ r: 8, fill: '#2563eb', stroke: '#fff', strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* HERD GROWTH TREND */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-600/5 border border-gray-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-lg shadow-indigo-600/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Sürü Artımı</h3>
                <p className="text-gray-400 text-sm font-medium">Heyvan sayının dəyişməsi</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-black text-indigo-600">
                {herdData[herdData.length-1]?.count || 0}
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Cari Say</p>
            </div>
          </div>

          <div className="h-[250px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={herdData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  interval={1}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                />
                <Tooltip content={<CustomTooltip unit="Baş" />} />
                <Line 
                  type="stepAfter" 
                  dataKey="count" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 4 }}
                  animationDuration={2500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* FINANCE ANALYSIS - FULL WIDTH */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-8 rounded-[40px] shadow-2xl shadow-emerald-600/5 border border-gray-100 flex flex-col"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-600 text-white rounded-3xl shadow-lg shadow-emerald-600/20">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Maliyyə Analizi</h3>
              <p className="text-gray-400 text-sm font-medium">Aylıq dövriyyə və mənfəət</p>
            </div>
          </div>
          <div className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-sm ${balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {balance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {balance.toLocaleString()} AZN
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="h-[250px] w-full lg:w-1/3 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={10}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {financeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 800 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mənfəət</span>
              <span className="text-xl font-black text-gray-900">
                {((income / (income + expense || 1)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50/30 rounded-[32px] border border-emerald-100/50">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gəlir</span>
                </div>
                <span className="text-emerald-600 font-black">{income.toLocaleString()} AZN</span>
              </div>
              <div className="w-full bg-emerald-100/50 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(income / (income + expense || 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-emerald-500 h-full rounded-full" 
                />
              </div>
            </div>
            
            <div className="p-6 bg-red-50/30 rounded-[32px] border border-red-100/50">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Xərc</span>
                </div>
                <span className="text-red-500 font-black">{expense.toLocaleString()} AZN</span>
              </div>
              <div className="w-full bg-red-100/50 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(expense / (income + expense || 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="bg-red-500 h-full rounded-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
