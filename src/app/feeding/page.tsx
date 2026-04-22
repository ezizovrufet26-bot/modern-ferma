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
import { 
  getFeeds, addFeed, updateFeed, deleteFeed,
  getRations, createRation, updateRation, deleteRation,
  addFeedingRecord, updateFeedingRecord, deleteFeedingRecord 
} from '@/app/actions/feeding';

export default function FeedingPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [feeds, setFeeds] = useState<any[]>([]);
  const [rations, setRations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newFeed, setNewFeed] = useState({ name: '', unit: 'kg', costPerUnit: 0, stock: 0 });
  const [newRation, setNewRation] = useState({ name: '', description: '', items: [] as any[] });
  const [feedingData, setFeedingData] = useState({ groupName: 'SAĞMAL 1', animalCount: 0, rationId: '' });

  // Edit states
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const [f, r] = await Promise.all([getFeeds(), getRations()]);
    setFeeds(f);
    setRations(r);
    setLoading(false);
  };

  const handleAddFeed = async (e: any) => {
    e.preventDefault();
    if (editingItem) {
      await updateFeed(editingItem.id, newFeed);
      setEditingItem(null);
    } else {
      await addFeed(newFeed);
    }
    setNewFeed({ name: '', unit: 'kg', costPerUnit: 0, stock: 0 });
    refreshData();
  };

  const handleAddRation = async (e: any) => {
    e.preventDefault();
    if (newRation.items.length === 0) return alert('Rasiona yem əlavə edin!');
    if (editingItem) {
      await updateRation(editingItem.id, newRation.name, newRation.description, newRation.items);
      setEditingItem(null);
    } else {
      await createRation(newRation.name, newRation.description, newRation.items);
    }
    setNewRation({ name: '', description: '', items: [] });
    refreshData();
  };

  const handleFeeding = async (e: any) => {
    e.preventDefault();
    if (!feedingData.rationId) return alert('Rasion seçin!');
    if (editingItem) {
      await updateFeedingRecord(editingItem.id, feedingData);
      setEditingItem(null);
    } else {
      await addFeedingRecord(feedingData);
    }
    setFeedingData({ groupName: 'SAĞMAL 1', animalCount: 0, rationId: '' });
    refreshData();
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
      rationId: feeding.rationId 
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
            <Wheat className="w-10 h-10 text-amber-500" /> Yem <span className="text-amber-600">İdarəetməsi</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Stoklar, rasionlar və gündəlik yemləmə qeydləri.</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button 
            onClick={() => { setActiveTab('inventory'); setEditingItem(null); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Ambar
          </button>
          <button 
            onClick={() => { setActiveTab('rations'); setEditingItem(null); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'rations' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Rasionlar
          </button>
          <button 
            onClick={() => { setActiveTab('feeding'); setEditingItem(null); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'feeding' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Yemləmə
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: FORMS (Conditional Title based on Edit mode) */}
        <div className="lg:col-span-1 space-y-8">
          {activeTab === 'inventory' && (
            <div className="glass-panel rounded-[32px] p-8 shadow-xl shadow-amber-500/5 border border-amber-100/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  {editingItem ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
                  {editingItem ? 'Yemi Yenilə' : 'Yeni Yem Əlavə Et'}
                </h3>
                {editingItem && <button onClick={() => { setEditingItem(null); setNewFeed({ name: '', unit: 'kg', costPerUnit: 0, stock: 0 }); }}><X className="w-5 h-5 text-gray-400" /></button>}
              </div>
              <form onSubmit={handleAddFeed} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yem Adı</label>
                  <input 
                    type="text" 
                    value={newFeed.name}
                    onChange={e => setNewFeed({...newFeed, name: e.target.value})}
                    placeholder="Məs: Arpa"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Qiymət (₼)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={newFeed.costPerUnit}
                      onChange={e => setNewFeed({...newFeed, costPerUnit: parseFloat(e.target.value)})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vahid</label>
                    <select 
                      value={newFeed.unit}
                      onChange={e => setNewFeed({...newFeed, unit: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="litr">litr</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stok</label>
                  <input 
                    type="number" 
                    value={newFeed.stock}
                    onChange={e => setNewFeed({...newFeed, stock: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                    required
                  />
                </div>
                <button type="submit" className={`w-full ${editingItem ? 'bg-blue-600' : 'bg-amber-500'} text-white py-4 rounded-2xl font-black text-sm shadow-lg transition-all`}>
                  {editingItem ? 'Dəyişiklikləri Saxla' : 'Anbara Əlavə Et'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'rations' && (
            <div className="glass-panel rounded-[32px] p-8 shadow-xl shadow-amber-500/5 border border-amber-100/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  {editingItem ? 'Rasionu Redaktə Et' : 'Yeni Rasion Yarat'}
                </h3>
                {editingItem && <button onClick={() => { setEditingItem(null); setNewRation({ name: '', description: '', items: [] }); }}><X className="w-5 h-5 text-gray-400" /></button>}
              </div>
              <form onSubmit={handleAddRation} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rasion Adı</label>
                  <input 
                    type="text" 
                    value={newRation.name}
                    onChange={e => setNewRation({...newRation, name: e.target.value})}
                    placeholder="Məs: Sağmal 1 Qarışığı"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yemlər</label>
                  {newRation.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select 
                        value={item.feedItemId}
                        onChange={e => {
                          const newItems = [...newRation.items];
                          newItems[idx].feedItemId = e.target.value;
                          setNewRation({...newRation, items: newItems});
                        }}
                        className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-xs font-bold"
                      >
                        <option value="">Seçin</option>
                        {feeds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                      <input 
                        type="number"
                        value={item.amount}
                        onChange={e => {
                          const newItems = [...newRation.items];
                          newItems[idx].amount = parseFloat(e.target.value);
                          setNewRation({...newRation, items: newItems});
                        }}
                        className="w-20 bg-gray-50 border-none rounded-xl p-3 text-xs font-bold"
                      />
                      <button type="button" onClick={() => setNewRation({...newRation, items: newRation.items.filter((_, i) => i !== idx)})} className="p-3 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewRation({...newRation, items: [...newRation.items, { feedItemId: '', amount: 0 }]})} className="w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-2xl font-bold text-xs hover:border-amber-300 hover:text-amber-500">+ Yem Əlavə Et</button>
                </div>

                <button type="submit" className={`w-full ${editingItem ? 'bg-blue-600' : 'bg-amber-500'} text-white py-4 rounded-2xl font-black text-sm shadow-lg transition-all`}>
                  {editingItem ? 'Rasionu Yenilə' : 'Rasionu Saxla'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'feeding' && (
            <div className="glass-panel rounded-[32px] p-8 shadow-xl shadow-amber-500/5 border border-amber-100/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  {editingItem ? 'Qeydi Düzəlt' : 'Yemləməni Qeyd Et'}
                </h3>
                {editingItem && <button onClick={() => { setEditingItem(null); setFeedingData({ groupName: 'SAĞMAL 1', animalCount: 0, rationId: '' }); }}><X className="w-5 h-5 text-gray-400" /></button>}
              </div>
              <form onSubmit={handleFeeding} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Qrup</label>
                  <select value={feedingData.groupName} onChange={e => setFeedingData({...feedingData, groupName: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold">
                    <option value="SAĞMAL 1">SAĞMAL 1</option>
                    <option value="SAĞMAL 2">SAĞMAL 2</option>
                    <option value="YENİ DOĞANLAR">YENİ DOĞANLAR</option>
                    <option value="BUZOVLAR">BUZOVLAR</option>
                    <option value="DANALAR">DANALAR</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Heyvan Sayı</label>
                  <input type="number" value={feedingData.animalCount} onChange={e => setFeedingData({...feedingData, animalCount: parseInt(e.target.value)})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rasion</label>
                  <select value={feedingData.rationId} onChange={e => setFeedingData({...feedingData, rationId: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold" required>
                    <option value="">Rasion seçin</option>
                    {rations.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <button type="submit" className={`w-full ${editingItem ? 'bg-blue-600' : 'bg-green-600'} text-white py-5 rounded-[24px] font-black text-sm shadow-xl transition-all`}>
                  {editingItem ? 'Düzəlişi Saxla' : 'Yemləməni Tamamla'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LISTS with Edit/Delete Buttons */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'inventory' && (
            <div className="glass-panel rounded-[40px] p-10 shadow-2xl shadow-amber-500/5">
              <h3 className="text-2xl font-black mb-8">Ambar Vəziyyəti</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feeds.map(feed => (
                  <div key={feed.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditFeed(feed)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(confirm('Silmək istəyirsiniz?')) { await deleteFeed(feed.id); refreshData(); } }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4"><Scale className="w-6 h-6 text-amber-500" /></div>
                    <h4 className="text-xl font-black text-gray-900">{feed.name}</h4>
                    <div className="mt-4 flex justify-between items-end">
                      <div><p className="text-gray-400 text-xs font-bold uppercase mb-1">Stok</p><p className="text-2xl font-black text-gray-900">{feed.stock} {feed.unit}</p></div>
                      <div className="text-right"><p className="text-gray-400 text-xs font-bold uppercase mb-1">Qiymət</p><p className="text-lg font-black text-amber-600">₼ {feed.costPerUnit}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rations' && (
            <div className="glass-panel rounded-[40px] p-10 shadow-2xl shadow-amber-500/5">
              <h3 className="text-2xl font-black mb-8">Rasion Siyahısı</h3>
              <div className="space-y-4">
                {rations.map(ration => (
                  <div key={ration.id} className="bg-white rounded-[28px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditRation(ration)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(confirm('Silmək istəyirsiniz?')) { await deleteRation(ration.id); refreshData(); } }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                      <p className="text-amber-600 font-black text-[10px] uppercase mb-1">Cəmi Qiymət</p>
                      <p className="text-2xl font-black text-amber-700">₼ {ration.items.reduce((acc: any, i: any) => acc + (i.amount * i.feedItem.costPerUnit), 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feeding' && (
            <div className="glass-panel rounded-[40px] p-10 shadow-2xl shadow-amber-500/5">
              <h3 className="text-2xl font-black mb-8">Yemləmə Tarixçəsi</h3>
              <div className="space-y-4">
                {rations.flatMap(r => r.feedings || []).map((feeding: any) => (
                  <div key={feeding.id} className="bg-white rounded-3xl p-6 border border-gray-100 flex justify-between items-center group relative hover:border-amber-300 transition-all">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditFeeding(feeding)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(confirm('Bu yemləmə qeydini silmək istəyirsiniz? (Maliyyə xərci də silinəcək)')) { await deleteFeedingRecord(feeding.id); refreshData(); } }} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-bold group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">{new Date(feeding.date).getDate()}</div>
                      <div>
                        <p className="font-black text-gray-900 uppercase tracking-tighter">{feeding.groupName}</p>
                        <p className="text-gray-400 text-xs font-bold">{feeding.animalCount} baş heyvan • {rations.find(r => r.id === feeding.rationId)?.name}</p>
                      </div>
                    </div>
                    <div className="text-right mr-16">
                      <p className="text-lg font-black text-gray-900">₼ {feeding.totalCost.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase">Maliyyəyə işlənib</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
