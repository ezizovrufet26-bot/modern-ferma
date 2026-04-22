'use client'

import { useState } from 'react';
import { 
  Activity, Syringe, Plus, Trash2, Edit, Search, 
  Calendar, Check, X, Filter, Users, Banknote, 
  Stethoscope, AlertCircle, TrendingUp, Heart, ChevronDown, ChevronRight
} from 'lucide-react';
import { getAnimalGroup } from '@/lib/herd-utils';

export default function HealthClient({ 
  animals, 
  healthRecords, 
  vaccineRecords,
  addHealthAction,
  updateHealthAction,
  deleteHealthAction,
  addVaccineAction,
  updateVaccineAction,
  deleteVaccineAction,
  addMassVaccineAction,
  targetUserId 
}: { 
  animals: any[],
  healthRecords: any[],
  vaccineRecords: any[],
  addHealthAction: (formData: FormData, targetUserId?: string) => Promise<void>,
  updateHealthAction: (id: string, formData: FormData, targetUserId?: string) => Promise<void>,
  deleteHealthAction: (id: string, targetUserId?: string) => Promise<void>,
  addVaccineAction: (formData: FormData, targetUserId?: string) => Promise<void>,
  updateVaccineAction: (id: string, formData: FormData, targetUserId?: string) => Promise<void>,
  deleteVaccineAction: (id: string, targetUserId?: string) => Promise<void>,
  addMassVaccineAction: (formData: FormData, targetUserId?: string) => Promise<void>,
  targetUserId?: string
}) {
  const [showForm, setShowForm] = useState<'none' | 'health' | 'vaccine' | 'mass_vaccine'>('none');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [massVaccineGroup, setMassVaccineGroup] = useState('SAĞMAL 1');
  const [excludedAnimals, setExcludedAnimals] = useState<string[]>([]);

  // Grouping logic for the timeline
  const getTimelineData = () => {
    const combined = [
      ...healthRecords.map(r => ({ ...r, entryType: 'HEALTH' })),
      ...vaccineRecords.map(r => ({ ...r, entryType: 'VACCINE' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const timeline: any[] = [];
    combined.forEach(record => {
      if (record.entryType === 'VACCINE') {
        const groupName = getAnimalGroup(record.animal);
        const batchKey = `${record.vaccineName}-${new Date(record.date).toISOString().split('T')[0]}-${groupName}`;
        const existingBatch = timeline.find(g => g.batchKey === batchKey && g.entryType === 'BATCH_VACCINE');

        if (existingBatch) {
          existingBatch.items.push(record);
        } else {
          timeline.push({
            id: `batch-${record.id}`,
            batchKey,
            entryType: 'BATCH_VACCINE',
            vaccineName: record.vaccineName,
            groupName,
            date: record.date,
            items: [record]
          });
        }
      } else {
        timeline.push(record);
      }
    });

    return timeline.filter(record => {
      const search = searchTerm.toLowerCase();
      if (record.entryType === 'BATCH_VACCINE') {
        return record.vaccineName.toLowerCase().includes(search) || 
               record.items.some((i: any) => i.animal.tagNumber.toLowerCase().includes(search));
      }
      return record.animal.tagNumber.toLowerCase().includes(search) || 
             (record.disease || '').toLowerCase().includes(search);
    });
  };

  const timelineData = getTimelineData();

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
             <div className="w-14 h-14 bg-red-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-red-600/20">
                <Activity className="w-8 h-8" />
             </div>
             Sağlamlıq <span className="text-red-600">Mərkəzi</span>
          </h1>
          <p className="text-gray-500 mt-3 font-medium flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-red-500" /> Sürü sağlamlığı, müalicələr və peyvənd proqramı
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setEditingRecord(null); setModalSearchTerm(''); setShowForm('health'); }}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-5 rounded-[24px] font-black transition-all shadow-xl shadow-red-600/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Yeni Müalicə
          </button>
          <button 
            onClick={() => { setEditingRecord(null); setExcludedAnimals([]); setShowForm('mass_vaccine'); }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-5 rounded-[24px] font-black transition-all shadow-xl shadow-purple-600/20 flex items-center gap-2"
          >
            <Users className="w-5 h-5" /> Toplu Vaksin
          </button>
        </div>
      </header>

      {/* QUICK STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel rounded-[40px] p-8 shadow-2xl shadow-red-500/5 border border-white/50 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 text-red-50 opacity-50 group-hover:scale-110 transition-transform">
             <Heart className="w-full h-full" />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Aktiv Müalicələr</p>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{healthRecords.length} <span className="text-lg text-gray-400 ml-1">Qeyd</span></h3>
          <div className="mt-6 flex items-center gap-2 text-red-600 font-bold text-xs bg-red-50 w-fit px-4 py-1.5 rounded-full border border-red-100">
             <AlertCircle className="w-3.5 h-3.5" /> Nəzarət tələb olunur
          </div>
        </div>

        <div className="glass-panel rounded-[40px] p-8 shadow-2xl shadow-blue-500/5 border border-white/50 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-50 opacity-50 group-hover:scale-110 transition-transform">
             <Syringe className="w-full h-full" />
          </div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Ümumi Vaksinasiya</p>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{vaccineRecords.length} <span className="text-lg text-gray-400 ml-1">Doz</span></h3>
          <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-100">
             <Check className="w-3.5 h-3.5" /> Proqram üzrə
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[40px] p-8 shadow-2xl shadow-emerald-600/20 text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform">
             <TrendingUp className="w-full h-full" />
          </div>
          <p className="text-emerald-100 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Sağlamlıq İndeksi</p>
          <h3 className="text-4xl font-black tracking-tighter">94%</h3>
          <p className="mt-6 text-emerald-100 text-xs font-bold bg-white/10 backdrop-blur-md w-fit px-4 py-1.5 rounded-full">Stabil vəziyyət</p>
        </div>
      </section>

      {/* MASTER LOG */}
      <section className="glass-panel rounded-[48px] overflow-hidden shadow-2xl shadow-red-500/5 border border-white/50 bg-white/30 backdrop-blur-md">
         <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tibbi Tarixçə</h2>
               <p className="text-gray-500 text-sm font-medium mt-1">Bütün sürü üzrə birləşdirilmiş loglar</p>
            </div>
            <div className="relative w-full md:w-96 group">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Bırka və ya xəstəlik adı..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-bold text-sm"
              />
            </div>
         </div>

         <div className="p-10 space-y-8 max-h-[800px] overflow-y-auto custom-scrollbar">
            {timelineData.map((record) => (
              <div key={record.id} className="relative flex gap-8 items-start group">
                 <div className={`absolute left-[-4px] top-6 w-3 h-3 rounded-full ring-4 ring-white z-10 transition-all shadow-md ${record.entryType === 'HEALTH' ? 'bg-red-500' : 'bg-purple-500'}`} />
                 
                 <div className="flex-1 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    {record.entryType === 'BATCH_VACCINE' ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleGroup(record.id)}>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                 <Users className="w-6 h-6"/>
                              </div>
                              <div>
                                 <p className="font-black text-gray-900 text-lg flex items-center gap-2">
                                    {record.groupName}: {record.vaccineName}
                                    {expandedGroups.includes(record.id) ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                 </p>
                                 <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-lg w-fit mt-1">{record.items.length} Heyvan</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-gray-900">{new Date(record.date).toLocaleDateString('az-AZ')}</p>
                              <div className="flex gap-2 mt-2 justify-end">
                                 <button onClick={(e) => { e.stopPropagation(); setEditingRecord(record.items[0]); setShowForm('vaccine'); }} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"><Edit className="w-4 h-4"/></button>
                                 <button onClick={async (e) => { e.stopPropagation(); if(confirm('Bütün qrup üzrə silinsin?')) await Promise.all(record.items.map((i:any) => deleteVaccineAction(i.id, targetUserId))); }} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-all"><Trash2 className="w-4 h-4"/></button>
                              </div>
                           </div>
                        </div>

                        {expandedGroups.includes(record.id) && (
                          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 animate-in slide-in-from-top-2 duration-300">
                             {record.items.map((item: any) => (
                               <div key={item.id} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between group/item">
                                  <span className="text-xs font-black text-gray-700">{item.animal.tagNumber}</span>
                                  <button onClick={() => deleteVaccineAction(item.id, targetUserId)} className="opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-600 transition-all"><X className="w-3 h-3"/></button>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.entryType === 'HEALTH' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                 {record.entryType === 'HEALTH' ? <Activity className="w-6 h-6"/> : <Syringe className="w-6 h-6"/>}
                              </div>
                              <div>
                                 <div className="flex items-center gap-3">
                                    <span className="font-black text-gray-900 text-lg">{record.animal.tagNumber}</span>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${record.entryType === 'HEALTH' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                       {record.entryType === 'HEALTH' ? 'Müalicə' : 'Peyvənd'}
                                    </span>
                                 </div>
                                 <p className="font-bold text-gray-500 mt-1">{record.disease || record.vaccineName}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingRecord(record);
                                  setShowForm(record.entryType === 'HEALTH' ? 'health' : 'vaccine');
                                }}
                                className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center justify-center"
                              >
                                 <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={async () => {
                                  if(confirm('Silinsin?')) {
                                    record.entryType === 'HEALTH' 
                                      ? await deleteHealthAction(record.id, targetUserId)
                                      : await deleteVaccineAction(record.id, targetUserId);
                                  }
                                }}
                                className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all flex items-center justify-center"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarix</p>
                              <p className="text-sm font-black text-gray-700">{new Date(record.date).toLocaleDateString('az-AZ')}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{record.entryType === 'HEALTH' ? 'Müalicə / Dərmanlar' : 'Dozaj'}</p>
                              <p className="text-sm font-bold text-gray-700">{record.entryType === 'HEALTH' ? record.treatment : record.dose || '2ml'}</p>
                           </div>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* HEALTH FORM */}
      {showForm === 'health' && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-start justify-center p-4 md:p-10 overflow-y-auto pt-10 md:pt-20">
          <form action={async (formData) => {
            editingRecord ? await updateHealthAction(editingRecord.id, formData, targetUserId) : await addHealthAction(formData, targetUserId);
            setShowForm('none');
          }} className="bg-white p-8 rounded-[48px] shadow-2xl w-full max-w-2xl space-y-8">
            <div className="flex justify-between items-center">
               <h4 className="font-black text-gray-900 text-2xl">{editingRecord ? 'Müalicə Redaktəsi' : 'Yeni Müalicə'}</h4>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center"><X/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!editingRecord && (
                <div className="col-span-full space-y-3">
                   <label className="text-[10px] font-black uppercase text-gray-400">Bırka Axtar</label>
                   <input type="text" value={modalSearchTerm} onChange={(e) => setModalSearchTerm(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="Bırka nömrəsi..."/>
                </div>
              )}
              <div className="col-span-full space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400">Heyvan</label>
                <select name="animalId" required defaultValue={editingRecord?.animalId || ''} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black appearance-none">
                  {animals.filter(a => a.tagNumber.includes(modalSearchTerm)).map(a => <option key={a.id} value={a.id}>{a.tagNumber}</option>)}
                </select>
              </div>
              <input name="disease" defaultValue={editingRecord?.disease} required placeholder="Xəstəlik" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black"/>
              <input type="date" name="date" defaultValue={editingRecord ? new Date(editingRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black"/>
              <input name="treatment" defaultValue={editingRecord?.treatment} placeholder="Müalicə" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black"/>
              <input type="number" step="0.01" name="cost" defaultValue={editingRecord?.cost} placeholder="Xərc (₼)" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black"/>
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-6 rounded-[32px] font-black shadow-xl shadow-red-600/20">Yadda Saxla</button>
          </form>
        </div>
      )}

      {/* VACCINE EDIT FORM (Fərdi və ya Toplu redaktə üçün) */}
      {showForm === 'vaccine' && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-start justify-center p-4 md:p-10 overflow-y-auto pt-10 md:pt-20">
          <form action={async (formData) => {
            await updateVaccineAction(editingRecord.id, formData, targetUserId);
            setShowForm('none');
          }} className="bg-white p-8 rounded-[48px] shadow-2xl w-full max-w-2xl space-y-8">
            <div className="flex justify-between items-center">
               <h4 className="font-black text-gray-900 text-2xl">Vaksin Redaktəsi</h4>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center"><X/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400">Vaksin Adı</label>
                <input name="vaccineName" defaultValue={editingRecord?.vaccineName} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black"/>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400">Tarix</label>
                <input type="date" name="date" defaultValue={new Date(editingRecord?.date).toISOString().split('T')[0]} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black"/>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400">Dozaj</label>
                <input name="dose" defaultValue={editingRecord?.dose || '2ml'} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-black"/>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black shadow-xl shadow-blue-600/20">Dəyişiklikləri Yadda Saxla</button>
          </form>
        </div>
      )}

      {/* MASS VACCINE FORM */}
      {showForm === 'mass_vaccine' && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-start justify-center p-4 md:p-10 overflow-y-auto pt-10 md:pt-20">
          <form action={async (formData) => {
            const animalsInGroup = animals.filter(a => getAnimalGroup(a) === massVaccineGroup && !excludedAnimals.includes(a.id));
            formData.set('animalIds', JSON.stringify(animalsInGroup.map(a => a.id)));
            await addMassVaccineAction(formData, targetUserId);
            setShowForm('none');
          }} className="bg-white p-8 rounded-[48px] shadow-2xl w-full max-w-2xl space-y-8 relative">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-600/20">
                     <Users className="w-7 h-7"/>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-2xl tracking-tight">Kütləvi Vaksinasiya</h4>
                    <p className="text-gray-500 text-sm font-bold">Bütün qrupa eyni anda vaksin tətbiq edin.</p>
                  </div>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6"/>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Qrup Seçin</label>
                <select value={massVaccineGroup} onChange={(e) => { setMassVaccineGroup(e.target.value); setExcludedAnimals([]); }} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-black appearance-none">
                  {['YENİ DOĞANLAR', 'SAĞMAL 1', 'SAĞMAL 2', 'QURUYA ÇIXANLAR', 'DOĞUMA 1 AY QALMIŞLAR', 'BUZOVLAR', 'DANALAR', 'DÜYƏLƏR'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Vaksin Adı</label>
                <input name="vaccineName" required placeholder="Məs: Şap" className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-black" />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tarix</label>
                <input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-black" />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Dozaj</label>
                <input name="dose" defaultValue="2ml" className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-black" />
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Seçilmiş Heyvanlar</label>
                  <p className="text-[10px] font-bold text-purple-600">
                    {animals.filter(a => getAnimalGroup(a) === massVaccineGroup).length} heyvan tapıldı
                  </p>
               </div>
               <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-[32px] p-6 border border-gray-100">
                  {animals.filter(a => getAnimalGroup(a) === massVaccineGroup).length === 0 ? (
                    <div className="py-6 text-center space-y-3">
                       <AlertCircle className="w-8 h-8 text-amber-500 mx-auto opacity-50" />
                       <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">Bu qrupda heyvan tapılmadı.<br/>Zəhmət olmasa heyvanların məlumatlarını (doğum tarixi, cins) yoxlayın.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {animals.filter(a => getAnimalGroup(a) === massVaccineGroup).map(animal => (
                        <div key={animal.id} onClick={() => excludedAnimals.includes(animal.id) ? setExcludedAnimals(prev => prev.filter(id => id !== animal.id)) : setExcludedAnimals(prev => [...prev, animal.id])} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${excludedAnimals.includes(animal.id) ? 'bg-white border-gray-100 opacity-40' : 'bg-purple-50 border-purple-100 shadow-sm'}`}>
                           <div className={`w-5 h-5 rounded-full flex items-center justify-center ${excludedAnimals.includes(animal.id) ? 'bg-gray-200' : 'bg-purple-600'}`}>{!excludedAnimals.includes(animal.id) && <Check className="w-3 h-3 text-white" />}</div>
                           <span className="text-xs font-black">{animal.tagNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-6 rounded-[32px] font-black shadow-xl shadow-purple-600/20">Yadda Saxla</button>
          </form>
        </div>
      )}
    </div>
  );
}
