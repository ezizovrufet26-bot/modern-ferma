'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Activity, Bell, Calendar, Image as ImageIcon, Milk, Info, Check, X, Filter, Syringe, Users, ShieldCheck, Database } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Animal = {
  id: string;
  tagNumber: string;
  name: string | null;
  breed: string | null;
  stage: string;
  gender: string;
  birthDate: Date | null;
  motherId?: string | null;
  sireCode?: string | null;
  mother?: any;
  reproRecords?: any[];
  calvingRecords?: any[];
  healthRecords?: any[];
  vaccineRecords?: any[];
  children?: any[];
};

export default function HerdClient({ 
  animals, 
  deleteAction, 
  saveAIAction, 
  updateAIAction,
  deleteAIAction,
  saveCalvingAction,
  addHealthAction,
  updateHealthAction,
  deleteHealthAction,
  addVaccineAction,
  updateVaccineAction,
  deleteVaccineAction,
  addMassVaccineAction,
  staffList = [] 
}: { 
  animals: Animal[], 
  deleteAction: (id: string) => Promise<void>, 
  saveAIAction?: (formData: FormData) => Promise<void>, 
  updateAIAction?: (id: string, formData: FormData) => Promise<void>,
  deleteAIAction?: (id: string) => Promise<void>,
  saveCalvingAction?: (formData: FormData) => Promise<void>,
  addHealthAction?: (formData: FormData) => Promise<void>,
  updateHealthAction?: (id: string, formData: FormData) => Promise<void>,
  deleteHealthAction?: (id: string) => Promise<void>,
  addVaccineAction?: (formData: FormData) => Promise<void>,
  updateVaccineAction?: (id: string, formData: FormData) => Promise<void>,
  deleteVaccineAction?: (id: string) => Promise<void>,
  addMassVaccineAction?: (formData: FormData) => Promise<void>,
  staffList?: any[] 
}) {
  const searchParams = useSearchParams();
  const urlGroup = searchParams.get('group');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string | null>(urlGroup);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(animals.length > 0 ? animals[0].id : null);
  const [activeTab, setActiveTab] = useState<'repro' | 'health'>('repro');
  const [showForm, setShowForm] = useState<'none' | 'ai' | 'health' | 'vaccine' | 'mass_vaccine' | 'calving'>('none');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const [massVaccineGroup, setMassVaccineGroup] = useState<string>('SAĞMAL 1');
  const [excludedAnimals, setExcludedAnimals] = useState<string[]>([]);
  
  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) || (animals.length > 0 ? animals[0] : null);

  useEffect(() => {
    if (urlGroup) setFilterGroup(urlGroup);
  }, [urlGroup]);

  const getAnimalGroup = (animal: Animal) => {
    const today = new Date();
    const birthDate = animal.birthDate ? new Date(animal.birthDate) : null;
    const ageInDays = birthDate ? Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)) : 1000;
    
    if (animal.gender === 'MALE') {
      if (ageInDays < 180) return 'BUZOVLAR';
      if (ageInDays < 450) return 'DANALAR';
      return 'DANALAR/BUĞALAR';
    }

    const lastCalving = animal.calvingRecords && animal.calvingRecords[0];
    const lastAI = animal.reproRecords && animal.reproRecords.find((r: any) => r.eventType === 'INSEMINATION');
    
    if (ageInDays < 180) return 'BUZOVLAR'; 
    
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

    if (lastCalving) {
      const daysSinceCalving = Math.floor((today.getTime() - new Date(lastCalving.date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCalving <= 30) return 'YENİ DOĞANLAR';
      if (daysSinceCalving <= 150) return 'SAĞMAL 1';
      return 'SAĞMAL 2';
    }

    if (ageInDays < 450) return 'DANALAR';
    return 'DÜYƏLƏR';
  };

  const filteredAnimals = animals.filter(a => {
    const matchesSearch = a.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesGroup = !filterGroup;
    
    if (filterGroup) {
      const animalGroup = getAnimalGroup(a);
      const today = new Date();
      
      if (filterGroup === 'SICK') {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(today.getDate() - 14);
        matchesGroup = a.healthRecords?.some((r: any) => new Date(r.date) >= fourteenDaysAgo) || false;
      } else if (filterGroup === 'PREGNANT') {
        const lastAI = a.reproRecords?.find((r: any) => r.eventType === 'INSEMINATION');
        const lastCalving = a.calvingRecords?.[0];
        if (lastAI) {
          const aiDate = new Date(lastAI.date);
          const isNotCalvedAfterAI = !lastCalving || new Date(lastCalving.date) < aiDate;
          const daysSinceAI = Math.floor((today.getTime() - aiDate.getTime()) / (1000 * 60 * 60 * 24));
          matchesGroup = isNotCalvedAfterAI && daysSinceAI >= 30 && daysSinceAI < 285;
        } else {
          matchesGroup = false;
        }
      } else if (filterGroup === 'EMPTY') {
        const isAdultFemale = a.gender === 'FEMALE' && (today.getTime() - new Date(a.birthDate || 0).getTime()) / (1000 * 60 * 60 * 24) > 450;
        if (!isAdultFemale) {
          matchesGroup = false;
        } else {
          const lastAI = a.reproRecords?.find((r: any) => r.eventType === 'INSEMINATION');
          const lastCalving = a.calvingRecords?.[0];
          let isPregnant = false;
          if (lastAI) {
            const aiDate = new Date(lastAI.date);
            const isNotCalvedAfterAI = !lastCalving || new Date(lastCalving.date) < aiDate;
            const daysSinceAI = Math.floor((today.getTime() - aiDate.getTime()) / (1000 * 60 * 60 * 24));
            isPregnant = isNotCalvedAfterAI && daysSinceAI >= 30 && daysSinceAI < 285;
          }
          matchesGroup = !isPregnant;
        }
      } else if (filterGroup === 'MILKING') {
        matchesGroup = ['YENİ DOĞANLAR', 'SAĞMAL 1', 'SAĞMAL 2'].includes(animalGroup);
      } else if (filterGroup === 'DRY') {
        matchesGroup = animalGroup === 'QURUYA ÇIXANLAR';
      } else {
        matchesGroup = animalGroup === filterGroup;
      }
    }
    
    return matchesSearch && matchesGroup;
  });

  const getStageColor = (group: string) => {
    switch (group) {
      case 'YENİ DOĞANLAR': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'SAĞMAL 1': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SAĞMAL 2': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'QURUYA ÇIXANLAR': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'DOĞUMA 1 AY QALMIŞLAR': return 'bg-red-100 text-red-700 border-red-200';
      case 'BUZOVLAR': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'DANALAR': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'DÜYƏLƏR': return 'bg-violet-100 text-violet-700 border-violet-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAnimalImage = (group: string) => {
    if (group.includes('BUZOV')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Calf.jpg/800px-Calf.jpg';
    return 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Cow_female_black_white.jpg';
  };

  const calculateAge = (birthDate: Date | null) => {
    if (!birthDate) return 'Naməlum';
    const diff = new Date().getTime() - new Date(birthDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} gün`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ay`;
    return `${Math.floor(months / 12)} il ${months % 12} ay`;
  };

  return (
    <div className="flex h-[calc(100vh-1rem)] gap-8 p-8 animate-in">
      
      {/* LEFT PANE: Master List */}
      <div className="w-[420px] flex flex-col glass-panel rounded-[32px] shadow-2xl shadow-blue-500/5 overflow-hidden shrink-0 border border-white/50">
        <div className="p-6 border-b border-gray-100/50 bg-white/30 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-gray-900 text-2xl tracking-tight">Sürü <span className="text-blue-600">Siyahısı</span></h2>
            <Link href="/herd/new" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 transform hover:scale-110 active:scale-95">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Axtarış..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 mt-6 scrollbar-hide">
            <button 
              onClick={() => setFilterGroup(null)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${!filterGroup ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white/50 text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              Hamısı
            </button>
            {['YENİ DOĞANLAR', 'SAĞMAL 1', 'SAĞMAL 2', 'QURUYA ÇIXANLAR', 'DOĞUMA 1 AY QALMIŞLAR', 'BUZOVLAR', 'DANALAR'].map(g => (
              <button 
                key={g}
                onClick={() => setFilterGroup(g)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${filterGroup === g ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white/50 text-gray-500 border-gray-200 hover:border-gray-300'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
          {filteredAnimals.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-gray-500 font-bold">Məlumat tapılmadı</p>
            </div>
          ) : (
            filteredAnimals.map((animal) => (
              <div 
                key={animal.id} 
                onClick={() => setSelectedAnimalId(animal.id)}
                className={`group p-4 rounded-3xl cursor-pointer transition-all duration-300 border relative overflow-hidden ${
                  selectedAnimalId === animal.id 
                  ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-600/20 scale-[1.02] z-10' 
                  : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${
                    selectedAnimalId === animal.id ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}>
                    {animal.tagNumber.slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`font-black text-base truncate ${selectedAnimalId === animal.id ? 'text-white' : 'text-gray-900'}`}>
                        {animal.tagNumber}
                      </p>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                        selectedAnimalId === animal.id ? 'bg-white/20 border-white/30 text-white' : getStageColor(getAnimalGroup(animal))
                      }`}>
                        {getAnimalGroup(animal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className={`text-xs font-bold flex items-center gap-1.5 ${selectedAnimalId === animal.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        <Calendar className="w-3.5 h-3.5" /> {calculateAge(animal.birthDate)}
                      </p>
                      <div className={`w-1 h-1 rounded-full ${selectedAnimalId === animal.id ? 'bg-white/30' : 'bg-gray-200'}`} />
                      <p className={`text-xs font-bold ${selectedAnimalId === animal.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        {animal.breed || 'Cins yoxdur'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANE: Details */}
      <div className="flex-1 glass-panel rounded-[40px] shadow-2xl shadow-blue-500/5 overflow-hidden border border-white/50 relative flex flex-col">
        {!selectedAnimal ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in">
             <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center mb-8 relative">
               <div className="absolute inset-0 bg-blue-500 rounded-[40px] blur-2xl opacity-20 animate-pulse" />
               <Database className="w-10 h-10 text-blue-600 relative z-10" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 tracking-tight">Heyvan Seçin</h3>
             <p className="text-gray-500 mt-3 max-w-xs font-medium">Məlumatları görmək və idarə etmək üçün soldakı siyahıdan bir heyvan seçin.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* HERO HEADER */}
            <div className="relative h-[320px] overflow-hidden group">
               <img src={getAnimalImage(getAnimalGroup(selectedAnimal))} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" alt="Animal" />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
               
               <div className="absolute top-8 left-8 flex gap-3">
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                    {selectedAnimal.stage}
                  </span>
                  <span className="bg-blue-600 border border-blue-400 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-600/30">
                    {getAnimalGroup(selectedAnimal)}
                  </span>
               </div>

               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                 <div>
                    <h2 className="text-6xl font-black text-white tracking-tighter mb-2">{selectedAnimal.tagNumber}</h2>
                    <div className="flex items-center gap-4 text-blue-100 font-bold">
                       <p className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm">
                         <Info className="w-4 h-4" /> {selectedAnimal.name || 'Ad qoyulmayıb'}
                       </p>
                       <p className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm">
                         <ShieldCheck className="w-4 h-4 text-emerald-400" /> {selectedAnimal.breed || 'Cins Naməlum'}
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex gap-3 mb-1">
                    <Link href={`/herd/edit/${selectedAnimal.id}`} className="w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-blue-600 rounded-2xl border border-white/20 transition-all flex items-center justify-center group shadow-2xl">
                       <Edit className="w-6 h-6 group-active:scale-90" />
                    </Link>
                    <form action={async () => {
                      if(confirm('Əminsiniz?')) {
                         await deleteAction(selectedAnimal.id);
                         setSelectedAnimalId(null);
                      }
                    }}>
                      <button type="submit" className="w-14 h-14 bg-red-500/20 backdrop-blur-md hover:bg-red-500 text-white rounded-2xl border border-red-500/30 transition-all flex items-center justify-center group shadow-2xl">
                         <Trash2 className="w-6 h-6 group-active:scale-90" />
                      </button>
                    </form>
                 </div>
               </div>
            </div>

            <div className="p-10 space-y-10">
               {/* QUICK STATS */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-6 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Yaş</p>
                    <p className="text-xl font-black text-gray-900">{calculateAge(selectedAnimal.birthDate)}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-6 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cinsiyyət</p>
                    <p className="text-xl font-black text-gray-900">{selectedAnimal.gender === 'MALE' ? 'Erkək' : 'Dişi'}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-6 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Laktasiya</p>
                    <p className="text-xl font-black text-blue-600">{selectedAnimal.calvingRecords?.length || 0}</p>
                  </div>
               </div>

               {/* CONTENT GRID */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                  
                  {/* LEFT COLUMN: Basic Info & Actions */}
                  <div className="xl:col-span-1 space-y-8">
                     <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Əsas Məlumatlar</h4>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center group">
                              <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Doğum Tarixi</span>
                              <span className="text-sm font-black text-gray-900">{selectedAnimal.birthDate ? new Date(selectedAnimal.birthDate).toLocaleDateString('az-AZ') : '-'}</span>
                           </div>
                           <div className="flex justify-between items-center group">
                              <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Ana Bırka</span>
                              <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-xl">
                                 {selectedAnimal.mother ? selectedAnimal.mother.tagNumber : (selectedAnimal.motherId || 'Naməlum')}
                              </span>
                           </div>
                           {selectedAnimal.sireCode && (
                              <div className="flex justify-between items-center group">
                                 <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Ata (Toxum)</span>
                                 <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">{selectedAnimal.sireCode}</span>
                              </div>
                           )}
                        </div>

                        {selectedAnimal.children && selectedAnimal.children.length > 0 && (
                          <div className="mt-10 pt-8 border-t border-gray-50">
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Balaları ({selectedAnimal.children.length})</h4>
                             <div className="grid grid-cols-2 gap-3">
                                {selectedAnimal.children.map((child: any) => (
                                  <div 
                                    key={child.id} 
                                    onClick={() => setSelectedAnimalId(child.id)}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-blue-600 hover:text-white transition-all group border border-transparent hover:shadow-lg hover:shadow-blue-600/20"
                                  >
                                    <div className={`w-2 h-2 rounded-full ${child.gender === 'MALE' ? 'bg-blue-400' : 'bg-pink-400'} group-hover:bg-white`} />
                                    <span className="text-xs font-black">{child.tagNumber}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>

                     <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => setShowForm(showForm === 'ai' ? 'none' : 'ai')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-[24px] font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
                        >
                          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Mayalanma
                        </button>
                        <button 
                          onClick={() => setShowForm(showForm === 'calving' ? 'none' : 'calving')}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-[24px] font-black transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 group"
                        >
                          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Doğum
                        </button>
                     </div>
                  </div>

                  {/* RIGHT COLUMN: Timeline & History */}
                  <div className="xl:col-span-2 space-y-8">
                     
                     {/* PREGNANCY FORECAST */}
                     {(() => {
                        const lastAI = selectedAnimal.reproRecords && selectedAnimal.reproRecords.find((r: any) => r.eventType === 'INSEMINATION');
                        const lastCalving = selectedAnimal.calvingRecords && selectedAnimal.calvingRecords[0];
                        if (!lastAI) return null;
                        
                        const aiDate = new Date(lastAI.date);
                        if (lastCalving && new Date(lastCalving.date) > aiDate) return null;

                        const daysSinceAI = Math.floor((new Date().getTime() - aiDate.getTime()) / (1000 * 60 * 60 * 24));
                        const pregCheckDate = new Date(aiDate.getTime() + (35 * 24 * 60 * 60 * 1000));
                        const dryOffDate = new Date(aiDate.getTime() + (225 * 24 * 60 * 60 * 1000));
                        const expectedCalvingDate = new Date(aiDate.getTime() + (285 * 24 * 60 * 60 * 1000));

                        return (
                          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                               <Calendar className="w-40 h-40" />
                            </div>
                            <div className="relative z-10 flex justify-between items-start mb-8">
                               <div>
                                  <p className="text-blue-100 font-bold text-xs uppercase tracking-widest mb-1">Hamiləlik Proqnozu</p>
                                  <h4 className="text-3xl font-black">{daysSinceAI} Günlük</h4>
                               </div>
                               <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Aktiv</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                               <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
                                  <p className="text-[10px] font-bold text-blue-100 uppercase mb-1">Yoxlanış</p>
                                  <p className="text-lg font-black">{pregCheckDate.toLocaleDateString('az-AZ')}</p>
                               </div>
                               <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
                                  <p className="text-[10px] font-bold text-blue-100 uppercase mb-1">Quruya Çıxış</p>
                                  <p className="text-lg font-black">{dryOffDate.toLocaleDateString('az-AZ')}</p>
                               </div>
                               <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
                                  <p className="text-[10px] font-bold text-blue-100 uppercase mb-1">Doğum</p>
                                  <p className="text-lg font-black">{expectedCalvingDate.toLocaleDateString('az-AZ')}</p>
                               </div>
                            </div>
                          </div>
                        );
                     })()}

                     {/* HISTORY TABS */}
                     <div className="space-y-6">
                        <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-[24px] w-fit">
                           <button 
                             onClick={() => setActiveTab('repro')}
                             className={`px-6 py-2.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'repro' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                             Çoxalma
                           </button>
                           <button 
                             onClick={() => setActiveTab('health')}
                             className={`px-6 py-2.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'health' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                             Sağlamlıq
                           </button>
                        </div>

                        {/* DATA LISTS */}
                        <div className="relative pl-4 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-gray-100">
                           {activeTab === 'repro' && (
                             <>
                               {selectedAnimal.calvingRecords?.map((record: any) => (
                                 <div key={record.id} className="relative flex gap-8 items-start group">
                                   <div className="absolute left-[-15px] top-2 w-4 h-4 rounded-full bg-emerald-500 ring-8 ring-white z-10 group-hover:scale-125 transition-all shadow-lg" />
                                   <div className="flex-1 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                                     <div className="flex justify-between items-center mb-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                             <Milk className="w-5 h-5"/>
                                          </div>
                                          <div>
                                             <p className="font-black text-gray-900 text-base">{record.parity}-ci Doğum</p>
                                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('az-AZ')}</p>
                                          </div>
                                       </div>
                                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Tamamlanıb</span>
                                     </div>
                                   </div>
                                 </div>
                               ))}

                               {selectedAnimal.reproRecords?.map((record: any) => {
                                 let parsedNotes: any = {};
                                 try { if (record.notes) parsedNotes = JSON.parse(record.notes); } catch(e) {}
                                 return (
                                   <div key={record.id} className="relative flex gap-8 items-start group">
                                     <div className="absolute left-[-15px] top-2 w-4 h-4 rounded-full bg-blue-500 ring-8 ring-white z-10 group-hover:scale-125 transition-all shadow-lg" />
                                     <div className="flex-1 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                                       <div className="flex justify-between items-center mb-4">
                                         <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                               <Activity className="w-5 h-5"/>
                                            </div>
                                            <div>
                                               <p className="font-black text-gray-900 text-base">Süni Mayalanma</p>
                                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('az-AZ')}</p>
                                            </div>
                                         </div>
                                         <div className="flex gap-2">
                                            <button 
                                              onClick={() => { setEditingRecord(record); setShowForm('ai'); }}
                                              className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                            >
                                              <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                              onClick={async () => { if(confirm('Silsin?')) await deleteAIAction?.(record.id); }}
                                              className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                         </div>
                                       </div>
                                       <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                         <p className="text-xs font-bold text-gray-500">
                                           Toxum: <span className="text-gray-900 font-black">{parsedNotes.sireCode || '-'}</span> • Texnik: <span className="text-gray-900 font-black">{record.vet?.name || 'Məlum deyil'}</span>
                                         </p>
                                       </div>
                                     </div>
                                   </div>
                                 )
                               })}
                             </>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS / FORMS */}
      {showForm === 'ai' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form action={async (formData) => {
            if (editingRecord && updateAIAction) {
              await updateAIAction(editingRecord.id, formData);
            } else if (saveAIAction) {
              await saveAIAction(formData);
            }
            setShowForm('none');
            setEditingRecord(null);
          }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-xl space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                     <Activity className="w-6 h-6"/>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-xl tracking-tight">{editingRecord ? 'Mayalanmanı Yenilə' : 'Yeni Süni Mayalanma'}</h4>
                    <p className="text-gray-500 text-sm font-bold">Zəhmət olmasa məlumatları tam doldurun.</p>
                  </div>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5"/>
               </button>
            </div>
            
            <input type="hidden" name="animalId" value={selectedAnimal?.id} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mayalanma Tarixi</label>
                <input type="date" name="inseminationDate" defaultValue={editingRecord ? new Date(editingRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Toxum (Sire) Kodu</label>
                <input type="text" name="sireCode" defaultValue={editingRecord ? JSON.parse(editingRecord.notes || '{}').sireCode : ''} placeholder="Məs: DE094" required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Həkim / Texnik</label>
                <select name="vetId" defaultValue={editingRecord?.vetId || ''} className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none">
                  <option value="">Texnik seçin...</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-3xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">Yadda Saxla</button>
              <button type="button" onClick={() => setShowForm('none')} className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl text-sm font-black hover:bg-gray-100 transition-all border border-gray-100">Ləğv Et</button>
            </div>
          </form>
        </div>
      )}

      {showForm === 'calving' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form action={async (formData) => {
            if (saveCalvingAction) {
              await saveCalvingAction(formData);
              setShowForm('none');
            }
          }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-xl space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                     <Milk className="w-6 h-6"/>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-xl tracking-tight">Yeni Doğuş Qeydi</h4>
                    <p className="text-gray-500 text-sm font-bold">Buzovun məlumatlarını daxil edin.</p>
                  </div>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5"/>
               </button>
            </div>

            <input type="hidden" name="motherId" value={selectedAnimal?.id} />

            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Buzov Bırka</label>
                    <input name="calfTag" required placeholder="Məs: AZ1001" className="w-full text-sm px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Cinsiyyət</label>
                    <select name="calfGender" className="w-full text-sm px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold appearance-none">
                      <option value="FEMALE">Dişi (Düyə)</option>
                      <option value="MALE">Erkək (Dana)</option>
                    </select>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Doğuş Tarixi</label>
                <input type="date" name="calvingDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Buzov İrqi</label>
                <input name="calfBreed" defaultValue={selectedAnimal?.breed || ''} className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl text-sm font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">Doğuşu Təsdiqlə</button>
              <button type="button" onClick={() => setShowForm('none')} className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl text-sm font-black hover:bg-gray-100 transition-all border border-gray-100">Ləğv Et</button>
            </div>
          </form>
        </div>
      )}

      {showForm === 'health' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form action={async (formData) => {
            if (editingRecord && updateHealthAction) {
              await updateHealthAction(editingRecord.id, formData);
            } else if (addHealthAction) {
              await addHealthAction(formData);
            }
            setShowForm('none');
            setEditingRecord(null);
          }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-xl space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                     <Activity className="w-6 h-6"/>
                  </div>
                  <h4 className="font-black text-gray-900 text-xl tracking-tight">{editingRecord ? 'Müalicəni Yenilə' : 'Sağlamlıq Qeydi'}</h4>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <input type="hidden" name="animalId" value={selectedAnimal?.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Xəstəlik / Səbəb</label>
                <input name="disease" defaultValue={editingRecord?.disease || ''} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tarix</label>
                <input type="date" name="date" defaultValue={editingRecord ? new Date(editingRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Dərmanlar və Doza</label>
                <textarea name="medications" defaultValue={editingRecord?.medications || ''} rows={2} className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold"></textarea>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-red-600 text-white py-5 rounded-3xl text-sm font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20">Yadda Saxla</button>
              <button type="button" onClick={() => setShowForm('none')} className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl text-sm font-black hover:bg-gray-100 transition-all border border-gray-100">Ləğv Et</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
