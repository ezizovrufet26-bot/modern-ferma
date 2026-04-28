'use client';

import { useState, useEffect } from 'react';
import { 
  Wheat, 
  Plus, 
  History, 
  Database, 
  Scale, 
  Save, 
  Trash2, 
  Loader2,
  CheckCircle2,
  Calculator,
  Edit2,
  X
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function FeedingClient({
  initialFeeds,
  initialRations,
  getFeedsAction,
  getRationsAction,
  addFeedAction,
  updateFeedAction,
  deleteFeedAction,
  createRationAction,
  updateRationAction,
  deleteRationAction,
  addFeedingRecordAction,
  updateFeedingRecordAction,
  deleteFeedingRecordAction,
  getFeedingRecordsAction,
  targetFarmId,
  initialHistory,
  groupCounts
}: {
  initialFeeds: any[],
  initialRations: any[],
  getFeedsAction: (targetFarmId?: string) => Promise<any[]>,
  getRationsAction: (targetFarmId?: string) => Promise<any[]>,
  addFeedAction: (data: any, targetFarmId?: string) => Promise<any>,
  updateFeedAction: (id: string, data: any, targetFarmId?: string) => Promise<any>,
  deleteFeedAction: (id: string, targetFarmId?: string) => Promise<any>,
  createRationAction: (name: string, description: string, items: any[], targetFarmId?: string) => Promise<any>,
  updateRationAction: (id: string, name: string, description: string, items: any[], targetFarmId?: string) => Promise<any>,
  deleteRationAction: (id: string, targetFarmId?: string) => Promise<any>,
  addFeedingRecordAction: (data: any, targetFarmId?: string) => Promise<any>,
  updateFeedingRecordAction: (id: string, data: any, targetFarmId?: string) => Promise<any>,
  deleteFeedingRecordAction: (id: string, targetFarmId?: string) => Promise<any>,
  getFeedingRecordsAction: (targetFarmId?: string) => Promise<any[]>,
  targetFarmId?: string,
  initialHistory?: any[],
  groupCounts?: Record<string, number>
}) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('inventory');
  const [feeds, setFeeds] = useState<any[]>(initialFeeds);
  const [rations, setRations] = useState<any[]>(initialRations);
  const [history, setHistory] = useState<any[]>(initialHistory || []);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newFeed, setNewFeed] = useState({ name: '', unit: 'kg', costPerUnit: 0, stock: 0 });
  const [newRation, setNewRation] = useState({ name: '', description: '', items: [] as any[] });
  const [feedingData, setFeedingData] = useState({ 
    groupName: 'SAĞMAL 1', 
    animalCount: groupCounts?.['SAĞMAL 1'] || 0, 
    rationId: '',
    frequency: 3,
    completedMeals: 1
  });

  // Edit states
  const [editingItem, setEditingItem] = useState<any>(null);

  const refreshData = async () => {
    setLoading(true);
    const [f, r, h] = await Promise.all([
      getFeedsAction(targetFarmId), 
      getRationsAction(targetFarmId),
      getFeedingRecordsAction(targetFarmId)
    ]);
    setFeeds(f);
    setRations(r);
    setHistory(h);
    setLoading(false);
  };

  const handleAddFeed = async (e: any) => {
    e.preventDefault();
    if (editingItem) {
      await updateFeedAction(editingItem.id, newFeed, targetFarmId);
      setEditingItem(null);
    } else {
      await addFeedAction(newFeed, targetFarmId);
    }
    setNewFeed({ name: '', unit: 'kg', costPerUnit: 0, stock: 0 });
    refreshData();
  };

  const handleAddRation = async (e: any) => {
    e.preventDefault();
    if (newRation.items.length === 0) return alert(t.alertAddFeed);
    if (editingItem) {
      await updateRationAction(editingItem.id, newRation.name, newRation.description, newRation.items, targetFarmId);
      setEditingItem(null);
    } else {
      await createRationAction(newRation.name, newRation.description, newRation.items, targetFarmId);
    }
    setNewRation({ name: '', description: '', items: [] });
    refreshData();
  };

  const handleFeeding = async (e: any) => {
    e.preventDefault();
    if (!feedingData.rationId) return alert(t.alertSelectRation);
    if (editingItem) {
      await updateFeedingRecordAction(editingItem.id, feedingData, targetFarmId);
      setEditingItem(null);
    } else {
      await addFeedingRecordAction(feedingData, targetFarmId);
    }
    setFeedingData({ 
      groupName: 'SAĞMAL 1', 
      animalCount: groupCounts?.['SAĞMAL 1'] || 0, 
      rationId: '',
      frequency: 3,
      completedMeals: 7 // Default all 3 bits (1|2|4 = 7)
    });
    await refreshData();
    window.location.reload();
  };

  const startEditFeed = (feed: any) => {
    setEditingItem(feed);
    setNewFeed({ name: feed.name, unit: feed.unit, costPerUnit: feed.costPerUnit, stock: feed.stock });
  };

  const startEditRation = (ration: any) => {
    setEditingItem(ration);
    setNewRation({ 
      name: ration.name, 
      description: ration.description || '', 
      items: ration.items.map((i: any) => ({ feedItemId: i.feedItemId, amount: i.amount })) 
    });
  };

  const startEditFeeding = (feeding: any) => {
    setEditingItem(feeding);
    setFeedingData({ 
      groupName: feeding.groupName, 
      animalCount: feeding.animalCount, 
      rationId: feeding.rationId,
      frequency: feeding.frequency || 3,
      completedMeals: feeding.completedMeals || (feeding.frequency || 3)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Wheat className="w-10 h-10 text-amber-500" /> {t.feedManagement}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">{t.feedDesc}</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button 
            onClick={() => { setActiveTab('inventory'); setEditingItem(null); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {t.feedType}
          </button>
          <button 
            onClick={() => { setActiveTab('rations'); setEditingItem(null); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'rations' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {t.rations}
          </button>
          <button 
            onClick={() => { setActiveTab('feeding'); setEditingItem(null); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'feeding' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {t.feeding}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {activeTab === 'inventory' && (
            <div className="glass-panel rounded-[32px] p-8 shadow-xl shadow-amber-500/5 border border-amber-100/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  {editingItem ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
                  {editingItem ? t.edit : t.add}
                </h3>
                {editingItem && <button onClick={() => { setEditingItem(null); setNewFeed({ name: '', unit: 'kg', costPerUnit: 0, stock: 0 }); }}><X className="w-5 h-5 text-gray-400" /></button>}
              </div>
              <form onSubmit={handleAddFeed} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.feedName}</label>
                  <input type="text" value={newFeed.name} onChange={e => setNewFeed({...newFeed, name: e.target.value})} placeholder="Məs: Arpa" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.price}</label>
                    <input type="number" step="0.01" value={newFeed.costPerUnit} onChange={e => setNewFeed({...newFeed, costPerUnit: parseFloat(e.target.value)})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.unit}</label>
                    <select value={newFeed.unit} onChange={e => setNewFeed({...newFeed, unit: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none">
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="litr">litr</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.stock}</label>
                  <input type="number" value={newFeed.stock} onChange={e => setNewFeed({...newFeed, stock: parseFloat(e.target.value)})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none" required />
                </div>
                <button type="submit" className={`w-full ${editingItem ? 'bg-blue-600' : 'bg-amber-500'} text-white py-4 rounded-2xl font-black text-sm shadow-lg transition-all`}>
                  {editingItem ? t.save : t.add}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'rations' && (
            <div className="glass-panel rounded-[32px] p-8 shadow-xl shadow-amber-500/5 border border-amber-100/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  {editingItem ? t.editRation : t.newRation}
                </h3>
                {editingItem && <button onClick={() => { setEditingItem(null); setNewRation({ name: '', description: '', items: [] }); }}><X className="w-5 h-5 text-gray-400" /></button>}
              </div>
              <form onSubmit={handleAddRation} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.rationName}</label>
                  <input type="text" value={newRation.name} onChange={e => setNewRation({...newRation, name: e.target.value})} placeholder="Məs: Sağmal 1 Qarışığı" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.feeds}</label>
                  {newRation.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={item.feedItemId} onChange={e => {
                          const newItems = [...newRation.items];
                          newItems[idx].feedItemId = e.target.value;
                          setNewRation({...newRation, items: newItems});
                        }} className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-xs font-bold">
                        <option value="">{t.select}</option>
                        {feeds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                      <input type="number" value={item.amount} onChange={e => {
                          const newItems = [...newRation.items];
                          newItems[idx].amount = parseFloat(e.target.value);
                          setNewRation({...newRation, items: newItems});
                        }} className="w-20 bg-gray-50 border-none rounded-xl p-3 text-xs font-bold" />
                      <button type="button" onClick={() => setNewRation({...newRation, items: newRation.items.filter((_, i) => i !== idx)})} className="p-3 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewRation({...newRation, items: [...newRation.items, { feedItemId: '', amount: 0 }]})} className="w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-2xl font-bold text-xs hover:border-amber-300 hover:text-amber-500">{t.addFeedBtn}</button>
                </div>
                <button type="submit" className={`w-full ${editingItem ? 'bg-blue-600' : 'bg-amber-500'} text-white py-4 rounded-2xl font-black text-sm shadow-lg transition-all`}>
                  {editingItem ? t.updateRation : t.saveRation}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'feeding' && (
            <div className="glass-panel rounded-[32px] p-8 shadow-xl shadow-amber-500/5 border border-amber-100/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  {editingItem ? t.edit : t.addRecord}
                </h3>
                {editingItem && <button onClick={() => { setEditingItem(null); setFeedingData({ groupName: 'SAĞMAL 1', animalCount: groupCounts?.['SAĞMAL 1'] || 0, rationId: '', frequency: 3, completedMeals: 1 }); }}><X className="w-5 h-5 text-gray-400" /></button>}
              </div>
              <form onSubmit={handleFeeding} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.group}</label>
                   <select 
                     value={feedingData.groupName} 
                     onChange={e => {
                       const group = e.target.value;
                       setFeedingData({
                         ...feedingData, 
                         groupName: group,
                         animalCount: groupCounts?.[group] || 0
                       });
                     }} 
                     className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold"
                   >
                     <option value="SAĞMAL 1">SAĞMAL 1</option>
                     <option value="SAĞMAL 2">SAĞMAL 2</option>
                     <option value="YENİ DOĞANLAR">YENİ DOĞANLAR</option>
                     <option value="BUZOVLAR">BUZOVLAR</option>
                     <option value="DANALAR">DANALAR</option>
                     <option value="QURUYA ÇIXANLAR">QURUYA ÇIXANLAR</option>
                     <option value="DÜYƏLƏR">DÜYƏLƏR</option>
                   </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.animalCount}</label>
                  <input type="number" value={feedingData.animalCount} onChange={e => setFeedingData({...feedingData, animalCount: parseInt(e.target.value)})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.ration}</label>
                  <select value={feedingData.rationId} onChange={e => setFeedingData({...feedingData, rationId: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold" required>
                    <option value="">{t.selectRation}</option>
                    {rations.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.dailyFrequency}</label>
                      <select value={feedingData.frequency} onChange={e => setFeedingData({...feedingData, frequency: parseInt(e.target.value)})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold">
                        <option value="1">{t.times1}</option>
                        <option value="2">{t.times2}</option>
                        <option value="3">{t.times3}</option>
                        <option value="4">{t.times4}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t.hoursDone}</label>
                      <div className="flex flex-wrap gap-2 pt-2">
                        { (feedingData.frequency === 3 ? [6, 14, 22] : feedingData.frequency === 2 ? [7, 17] : feedingData.frequency === 4 ? [6, 12, 18, 0] : [12]).map((hour, idx) => (
                           <button 
                             key={idx}
                             type="button"
                             onClick={() => {
                               const bit = 1 << idx;
                               const newMeals = (feedingData.completedMeals & bit) ? (feedingData.completedMeals & ~bit) : (feedingData.completedMeals | bit);
                               setFeedingData({...feedingData, completedMeals: newMeals});
                             }}
                             className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${ (feedingData.completedMeals & (1 << idx)) ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-emerald-300'}`}
                           >
                             {hour}:00
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                <button type="submit" className={`w-full ${editingItem ? 'bg-blue-600' : 'bg-green-600'} text-white py-5 rounded-[24px] font-black text-sm shadow-xl transition-all`}>
                  {editingItem ? t.save : t.save}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'inventory' && (
            <div className="glass-panel rounded-[40px] p-10 shadow-2xl shadow-amber-500/5">
              <h3 className="text-2xl font-black mb-8">{t.inventoryStatus}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feeds.map(feed => (
                  <div key={feed.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditFeed(feed)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(confirm(t.deleteConfirm)) { await deleteFeedAction(feed.id, targetFarmId); refreshData(); } }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4"><Scale className="w-6 h-6 text-amber-500" /></div>
                    <h4 className="text-xl font-black text-gray-900">{feed.name}</h4>
                    <div className="mt-4 flex justify-between items-end">
                      <div><p className="text-gray-400 text-xs font-bold uppercase mb-1">{t.stock}</p><p className="text-2xl font-black text-gray-900">{feed.stock} {feed.unit}</p></div>
                      <div className="text-right"><p className="text-gray-400 text-xs font-bold uppercase mb-1">{t.price}</p><p className="text-lg font-black text-amber-600">₼ {feed.costPerUnit}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rations' && (
            <div className="glass-panel rounded-[40px] p-10 shadow-2xl shadow-amber-500/5">
              <h3 className="text-2xl font-black mb-8">{t.rationList}</h3>
              <div className="space-y-4">
                {rations.map(ration => (
                  <div key={ration.id} className="bg-white rounded-[28px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditRation(ration)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(confirm(t.deleteConfirm)) { await deleteRationAction(ration.id, targetFarmId); refreshData(); } }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-black text-gray-900 mb-2">{ration.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {ration.items.map((item: any) => (
                          <span key={item.id} className="bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-100">{item.feedItem.name}: {item.amount} {item.feedItem.unit}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-3xl text-center min-w-[140px] border border-amber-100">
                      <p className="text-amber-600 font-black text-[10px] uppercase mb-1">{t.totalPrice}</p>
                      <p className="text-2xl font-black text-amber-700">₼ {ration.items.reduce((acc: any, i: any) => acc + (i.amount * i.feedItem.costPerUnit), 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feeding' && (
            <div className="glass-panel rounded-[40px] p-10 shadow-2xl shadow-amber-500/5">
              <h3 className="text-2xl font-black mb-8">{t.feedingHistory}</h3>
              <div className="space-y-4">
                 {history.map((feeding: any) => {
                   const frequency = feeding.frequency || (['SAĞMAL 1', 'SAĞMAL 2', 'YENİ DOĞANLAR', 'BUZOVLAR'].includes(feeding.groupName) ? 3 : 2);
                   const completed = feeding.completedMeals ?? frequency;
                   const times = frequency === 3 ? [6, 14, 22] : frequency === 2 ? [7, 17] : [12];
                   
                   const isToday = new Date(feeding.date).toDateString() === new Date().toDateString();
                   const currentHour = new Date().getHours();

                   return (
                     <div key={feeding.id} className="bg-white rounded-[32px] p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center group relative hover:border-amber-300 transition-all gap-6 shadow-sm hover:shadow-xl">
                       <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { startEditFeeding(feeding); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={async () => { if(confirm(t.deleteConfirm)) { await deleteFeedingRecordAction(feeding.id, targetFarmId); refreshData(); } }} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                       </div>
                       
                       <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-amber-50 rounded-2xl flex flex-col items-center justify-center text-amber-600 font-black group-hover:bg-amber-500 group-hover:text-white transition-all shadow-inner">
                           <span className="text-xl">{new Date(feeding.date).getDate()}</span>
                           <span className="text-[10px] uppercase">{new Date(feeding.date).toLocaleString('az-AZ', { month: 'short' })}</span>
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{feeding.groupName}</p>
                             <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">{countSetBits(completed)}/{frequency} {t.feedingCount}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              {times.map((hour, idx) => {
                                 let colorClass = "bg-gray-200"; 
                                 if (completed & (1 << idx)) {
                                    colorClass = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
                                 } else {
                                    colorClass = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"; 
                                 }

                                 return (
                                    <div key={idx} className="flex flex-col items-center gap-1">
                                       <div className={`w-3 h-3 rounded-full ${colorClass} transition-all duration-500`} />
                                       <span className="text-[8px] font-black text-gray-400">{hour}:00</span>
                                    </div>
                                 );
                              })}
                           </div>
                         </div>
                       </div>

                       <div className="flex flex-wrap gap-4 md:gap-10">
                         <div className="text-center md:text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.status}</p>
                            <p className={`text-sm font-black ${completed === frequency ? 'text-emerald-600' : 'text-amber-600'}`}>
                               {completed === frequency ? t.completed : `${completed} / ${frequency} ${t.done}`}
                            </p>
                         </div>
                         <div className="text-center md:text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.total}</p>
                            <p className="text-sm font-black text-gray-900">{feeding.animalCount} {t.head}</p>
                         </div>
                       </div>

                       <div className="bg-gray-50 p-6 rounded-3xl text-right min-w-[140px] border border-gray-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-all">
                         <p className="text-gray-400 font-black text-[10px] uppercase mb-1">{t.financialCost}</p>
                         <p className="text-2xl font-black text-gray-900">₼ {feeding.totalCost.toLocaleString()}</p>
                       </div>
                     </div>
                   );
                 })}
                 {history.length === 0 && (
                   <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
                     <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                     <p className="text-gray-400 font-bold italic">{t.noRecords}</p>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function countSetBits(n: number) {
  let count = 0;
  while (n > 0) {
    n &= (n - 1);
    count++;
  }
  return count;
}
