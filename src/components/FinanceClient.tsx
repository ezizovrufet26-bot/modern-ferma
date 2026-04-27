'use client';

import { useState } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, Trash2, Edit, 
  Calendar, DollarSign, Filter, X, ArrowUpRight, ArrowDownLeft,
  PieChart, BarChart3, Receipt, Tag
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Legend
} from 'recharts';
import { useI18n } from '@/lib/i18n';

type FinanceRecord = {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  description: string | null;
};

export default function FinanceClient({ 
  initialRecords, 
  addAction, 
  deleteAction, 
  updateAction,
  targetFarmId,
  staffList = []
}: { 
  initialRecords: any[], 
  addAction: (formData: FormData, targetFarmId?: string) => Promise<void>,
  deleteAction: (id: string, targetFarmId?: string) => Promise<void>,
  updateAction: (id: string, formData: FormData, targetFarmId?: string) => Promise<void>,
  targetFarmId?: string,
  staffList?: any[]
}) {
  const { t } = useI18n();
  const [records, setRecords] = useState(initialRecords);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>(editingRecord?.category || 'OTHER');

  // Update handlers to pass targetFarmId
  const handleAdd = async (formData: FormData) => {
    await addAction(formData, targetFarmId);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if(confirm(t.deleteConfirm)) {
      await deleteAction(id, targetFarmId);
    }
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    await updateAction(id, formData, targetFarmId);
    setShowModal(false);
  };

  const totalIncome = initialRecords
    .filter(r => r.type === 'INCOME')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalExpense = initialRecords
    .filter(r => r.type === 'EXPENSE')
    .reduce((acc, r) => acc + r.amount, 0);

  const balance = totalIncome - totalExpense;

  // Chart Data Preparation
  const chartData = initialRecords.reduce((acc: any[], r) => {
    const month = new Date(r.date).toLocaleString('az-AZ', { month: 'short' });
    const existing = acc.find(d => d.name === month);
    if (existing) {
      if (r.type === 'INCOME') existing.income += r.amount;
      else existing.expense += r.amount;
    } else {
      acc.push({ 
        name: month, 
        income: r.type === 'INCOME' ? r.amount : 0, 
        expense: r.type === 'EXPENSE' ? r.amount : 0 
      });
    }
    return acc;
  }, []).slice(-6);

  const categoryData = initialRecords
    .filter(r => r.type === 'EXPENSE')
    .reduce((acc: any[], r) => {
      const existing = acc.find(d => d.name === r.category);
      if (existing) existing.value += r.amount;
      else acc.push({ name: r.category, value: r.amount });
      return acc;
    }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'MILK_SALE': return 'Süd Satışı';
      case 'FEED': return 'Yem Xərci';
      case 'VET': return 'Baytar Xərci';
      case 'SALARY_HEAD_VET': return 'Baş Həkim Maaşı';
      case 'SALARY_VET': return 'Həkim Maaşı';
      case 'SALARY_TECH': return 'Texnik Maaşı';
      case 'SALARY_WORKER': return 'İşçi Maaşı';
      case 'ANIMALS': return 'Heyvan Alışı';
      case 'ANIMAL_SALE': return 'Heyvan Satışı';
      default: return 'Digər';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            {t.financeManagement}
          </h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Gəlir və xərclərin real-vaxt analitikası
          </p>
        </div>
        <button 
          onClick={() => { setEditingRecord(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" /> {t.addRecord}
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel rounded-[40px] p-8 shadow-2xl shadow-blue-500/5 relative overflow-hidden group border border-white/50">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{t.income}</p>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">₼ {totalIncome.toLocaleString()}</h3>
          <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100">
             <ArrowUpRight className="w-3 h-3" /> Gəlir artımı stabildir
          </div>
        </div>

        <div className="glass-panel rounded-[40px] p-8 shadow-2xl shadow-red-500/5 relative overflow-hidden group border border-white/50">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{t.expense}</p>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">₼ {totalExpense.toLocaleString()}</h3>
          <div className="mt-6 flex items-center gap-2 text-red-600 font-bold text-xs bg-red-50 w-fit px-4 py-1.5 rounded-full border border-red-100">
             <ArrowDownLeft className="w-3 h-3" /> Aylıq xərclər
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[40px] p-8 shadow-2xl shadow-blue-900/20 relative overflow-hidden group border border-white/10 text-white">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <Wallet className="w-24 h-24 text-white" />
          </div>
          <p className="text-blue-200 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{t.balance}</p>
          <h3 className="text-4xl font-black tracking-tighter">₼ {balance.toLocaleString()}</h3>
          <div className="mt-6 flex items-center gap-2 text-blue-100 font-bold text-xs bg-white/10 backdrop-blur-md w-fit px-4 py-1.5 rounded-full border border-white/10">
             Net Mənfəət
          </div>
        </div>
      </section>

      {/* CHARTS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-[48px] p-10 shadow-2xl shadow-blue-500/5 border border-white/50">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                 <BarChart3 className="w-6 h-6 text-blue-600" /> Pul Axını
              </h2>
           </div>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px'}}
                  />
                  <Bar dataKey="income" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Gəlir" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} name="Xərc" />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-panel rounded-[48px] p-10 shadow-2xl shadow-blue-500/5 border border-white/50">
           <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-10 flex items-center gap-3">
              <PieChart className="w-6 h-6 text-blue-600" /> Xərc Bölgüsü
           </h2>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </RePieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </section>

      {/* TRANSACTIONS LIST */}
      <section className="glass-panel rounded-[48px] overflow-hidden shadow-2xl shadow-blue-500/5 border border-white/50">
         <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/30 backdrop-blur-md">
            <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Əməliyyat Tarixçəsi</h2>
               <p className="text-gray-500 text-sm font-medium mt-1">Bütün gəlir və xərc hərəkətləri</p>
            </div>
            <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl">
               <button 
                 onClick={() => setFilterType(null)}
                 className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!filterType ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 {t.all}
               </button>
               <button 
                 onClick={() => setFilterType('INCOME')}
                 className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === 'INCOME' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 {t.income}
               </button>
               <button 
                 onClick={() => setFilterType('EXPENSE')}
                 className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === 'EXPENSE' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 {t.expense}
               </button>
            </div>
         </div>

         <div className="p-4 bg-gray-50/30">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                       <th className="px-8 py-4">{t.date}</th>
                       <th className="px-8 py-4">{t.category}</th>
                       <th className="px-8 py-4">{t.description}</th>
                       <th className="px-8 py-4 text-right">{t.amount}</th>
                       <th className="px-8 py-4 text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialRecords
                      .filter(r => !filterType || r.type === filterType)
                      .map((record) => (
                      <tr key={record.id} className="group bg-white hover:bg-blue-50/30 transition-all border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                        <td className="px-8 py-6 rounded-l-[32px] border-y border-l border-gray-100">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                                 <Calendar className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-gray-900 text-sm">
                                 {new Date(record.date).toLocaleDateString('az-AZ')}
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6 border-y border-gray-100">
                           <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
                             record.type === 'INCOME' 
                             ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                             : 'bg-red-50 text-red-600 border-red-100'
                           }`}>
                             {getCategoryLabel(record.category)}
                           </span>
                        </td>
                        <td className="px-8 py-6 border-y border-gray-100">
                           <p className="text-sm font-medium text-gray-500 truncate max-w-xs">{record.description || '-'}</p>
                        </td>
                        <td className="px-8 py-6 border-y border-gray-100 text-right">
                           <span className={`text-lg font-black ${record.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {record.type === 'INCOME' ? '+' : '-'} ₼ {record.amount.toLocaleString()}
                           </span>
                        </td>
                        <td className="px-8 py-6 rounded-r-[32px] border-y border-r border-gray-100 text-center">
                           <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingRecord(record); setShowModal(true); }}
                                className="w-10 h-10 bg-gray-100 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center justify-center"
                              >
                                 <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="w-10 h-10 bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all flex items-center justify-center"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {initialRecords.length === 0 && (
                      <tr>
                         <td colSpan={5} className="py-20 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-gray-300">
                               <Receipt className="w-10 h-10" />
                            </div>
                            <p className="text-gray-400 font-black text-lg">{t.noData}</p>
                         </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 md:p-10 overflow-y-auto pt-10 md:pt-20">
          <form action={async (formData) => {
            if (editingRecord) {
              await handleUpdate(editingRecord.id, formData);
            } else {
              await handleAdd(formData);
            }
            setShowModal(false);
          }} className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl w-full max-w-xl space-y-8 md:space-y-10 relative">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                     <Plus className="w-7 h-7"/>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-2xl tracking-tight">{editingRecord ? t.edit : t.addRecord}</h4>
                    <p className="text-gray-500 text-sm font-bold">Maliyyə hərəkətini qeyd edin.</p>
                  </div>
               </div>
               <button type="button" onClick={() => setShowModal(false)} className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6"/>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.type}</label>
                <select name="type" defaultValue={editingRecord?.type || 'EXPENSE'} className="w-full text-sm px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black appearance-none">
                  <option value="INCOME">{t.income} (+)</option>
                  <option value="EXPENSE">{t.expense} (-)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.category}</label>
                <select 
                  name="category" 
                  defaultValue={editingRecord?.category || 'OTHER'} 
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full text-sm px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black appearance-none"
                >
                  <option value="MILK_SALE">Süd Satışı</option>
                  <option value="ANIMAL_SALE">Heyvan Satışı (+)</option>
                  <option value="FEED">Yem Xərci</option>
                  <option value="VET">Baytar Xərci</option>
                  <option value="SALARY_HEAD_VET">Baş Həkim Maaşı (-)</option>
                  <option value="SALARY_VET">Həkim Maaşı (-)</option>
                  <option value="SALARY_TECH">Texnik Maaşı (-)</option>
                  <option value="SALARY_WORKER">İşçi Maaşı (-)</option>
                  <option value="ANIMALS">Heyvan Alışı (-)</option>
                  <option value="OTHER">Digər</option>
                </select>
              </div>

              {activeCategory.startsWith('SALARY_') && staffList && staffList.length > 0 && (
                <div className="space-y-3 col-span-full">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Müvafiq İşçini Seçin (Məlumatları doldurmaq üçün)</label>
                  <select 
                    className="w-full text-sm px-6 py-5 bg-blue-50 border border-blue-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black appearance-none"
                    onChange={(e) => {
                      const staff = staffList.find(s => s.id === e.target.value);
                      if (staff) {
                        const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
                        if (descInput) descInput.value = `${staff.name} - ${getCategoryLabel(activeCategory)} ödənişi`;
                        const amountInput = document.querySelector('input[name="amount"]') as HTMLInputElement;
                        if (amountInput && staff.salary) amountInput.value = staff.salary.toString();
                      }
                    }}
                  >
                    <option value="">Siyahıdan seçin...</option>
                    {staffList
                      .filter(s => {
                         if (activeCategory === 'SALARY_HEAD_VET') return s.role === 'BAS_HEKIM';
                         if (activeCategory === 'SALARY_VET') return s.role === 'HEKIM';
                         if (activeCategory === 'SALARY_TECH') return s.role === 'TEXNIK';
                         if (activeCategory === 'SALARY_WORKER') return s.role === 'ISCI';
                         return true;
                      })
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name} - ₼{s.salary}</option>
                      ))
                    }
                  </select>
                </div>
              )}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.amount} (AZN)</label>
                <div className="relative">
                   <DollarSign className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input type="number" step="0.01" name="amount" defaultValue={editingRecord?.amount || ''} required className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-lg" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.date}</label>
                <input type="date" name="date" defaultValue={editingRecord ? new Date(editingRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="w-full text-sm px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black" />
              </div>
              <div className="col-span-full space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.description}</label>
                <textarea name="description" defaultValue={editingRecord?.description || ''} rows={2} className="w-full text-sm px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold placeholder:font-medium" placeholder="Əlavə qeydlər..."></textarea>
              </div>
            </div>

            <div className="flex gap-6 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-6 rounded-[32px] text-lg font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30">{t.save}</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-12 py-6 bg-gray-50 text-gray-500 rounded-[32px] text-lg font-black hover:bg-gray-100 transition-all border border-gray-100">{t.cancel}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
