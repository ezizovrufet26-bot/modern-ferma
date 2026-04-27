'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2, Edit, Activity, Bell, Calendar, Image as ImageIcon, Milk, Info, Check, X, Filter, Syringe, QrCode, ShieldCheck, Database, Upload, FileDown, Loader2, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { getAnimalGroup, calculateAge, type Animal } from '@/lib/herd-utils';
import PedigreeTree from './PedigreeTree';
import { addWeightRecord, deleteWeightRecord } from '@/app/actions/weight';
import { importAnimalsFromData } from '@/app/actions/herd';
import { QRCodeSVG } from 'qrcode.react';


export default function HerdClient({ 
  animals, 
  deleteAction, 
  saveAIAction, 
  updateAIAction,
  deleteAIAction,
  saveCalvingAction,
  savePDAction,
  saveDryAction,
  addHealthAction,
  updateHealthAction,
  deleteHealthAction,
  addVaccineAction,
  updateVaccineAction,
  deleteVaccineAction,
  addMassVaccineAction,
  seedDemoDataAction,
  updateGroupAction,
  initialGroup,
  staffList = [],
  targetFarmId 
}: { 
  animals: Animal[], 
  deleteAction: (id: string, targetFarmId?: string) => Promise<void>, 
  saveAIAction?: (formData: FormData, targetFarmId?: string) => Promise<void>, 
  updateAIAction?: (id: string, formData: FormData, targetFarmId?: string) => Promise<void>,
  deleteAIAction?: (id: string, targetFarmId?: string) => Promise<void>,
  saveCalvingAction?: (formData: FormData, targetFarmId?: string) => Promise<void>,
  addHealthAction?: (formData: FormData, targetFarmId?: string) => Promise<void>,
  updateHealthAction?: (id: string, formData: FormData, targetFarmId?: string) => Promise<void>,
  deleteHealthAction?: (id: string, targetFarmId?: string) => Promise<void>,
  addVaccineAction?: (formData: FormData, targetFarmId?: string) => Promise<void>,
  updateVaccineAction?: (id: string, formData: FormData, targetFarmId?: string) => Promise<void>,
  deleteVaccineAction?: (id: string, targetFarmId?: string) => Promise<void>,
  addMassVaccineAction?: (formData: FormData, targetFarmId?: string) => Promise<void>,
  seedDemoDataAction?: (targetFarmId?: string) => Promise<{ success: boolean, count?: number, message?: string }>,
  updateGroupAction?: (id: string, groupName: string, targetFarmId?: string) => Promise<void>,
  initialGroup?: string | null,
  staffList?: any[],
  targetFarmId?: string,
  savePDAction?: (formData: FormData, targetFarmId?: string) => Promise<void>,
  saveDryAction?: (formData: FormData, targetFarmId?: string) => Promise<void>,
}) {
  const searchParams = useSearchParams();
  const urlGroup = searchParams.get('group');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string | null>(urlGroup);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'repro' | 'health' | 'pedigree' | 'weight' | 'children'>('repro');
  const [showForm, setShowForm] = useState<'none' | 'ai' | 'health' | 'vaccine' | 'mass_vaccine' | 'calving' | 'pd' | 'dry'>('none');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const [massVaccineGroup, setMassVaccineGroup] = useState<string>('SAĞMAL 1');
  const [excludedAnimals, setExcludedAnimals] = useState<string[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [herdPage, setHerdPage] = useState(1);
  const itemsPerPage = 8;
  
  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) || (animals.length > 0 ? animals[0] : null);

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
           if (!lastAI) matchesGroup = true;
           else {
             const aiDate = new Date(lastAI.date);
             const isNotCalvedAfterAI = !lastCalving || new Date(lastCalving.date) < aiDate;
             const daysSinceAI = Math.floor((today.getTime() - aiDate.getTime()) / (1000 * 60 * 60 * 24));
             matchesGroup = !(isNotCalvedAfterAI && daysSinceAI >= 30 && daysSinceAI < 285);
           }
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

  useEffect(() => {
    if (urlGroup) setFilterGroup(urlGroup);
  }, [urlGroup]);

  useEffect(() => {
    setHerdPage(1);
  }, [filterGroup, searchTerm]);

  // Auto-select first animal if none selected
  useEffect(() => {
    if (!selectedAnimalId && filteredAnimals.length > 0) {
      setSelectedAnimalId(filteredAnimals[0].id);
    }
  }, [filteredAnimals, selectedAnimalId]);

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onerror = () => {
        alert("Fayl oxunarkən xəta baş verdi.");
        setIsImporting(false);
      };
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          console.log("Excel data parsed:", data);

          if (data.length > 0) {
            const res = await importAnimalsFromData(data, targetFarmId || undefined);
            if (res.success) {
              alert(`${res.importedCount} heyvan uğurla əlavə edildi/yeniləndi.`);
              window.location.reload(); 
            } else {
              alert("Server tərəfində xəta baş verdi.");
            }
          } else {
            alert("Excel faylında məlumat tapılmadı. Sütun başlıqlarını yoxlayın.");
          }
        } catch (err) {
          console.error("Import error details:", err);
          alert("Fayl emal edilərkən xəta baş verdi: " + (err instanceof Error ? err.message : "Bilinməyən xəta"));
        } finally {
           setIsImporting(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error("FileReader setup error:", err);
      alert("Fayl oxuyucusu başlatıla bilmədi.");
      setIsImporting(false);
    }
  };



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

  const groups = ['YENİ DOĞANLAR', 'SAĞMAL 1', 'SAĞMAL 2', 'QURUYA ÇIXANLAR', 'DOĞUMA 1 AY QALMIŞLAR', 'BUZOVLAR', 'DANALAR', 'DÜYƏLƏR'];

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-[calc(100vh-2rem)] gap-4 lg:gap-8 p-4 pb-24 lg:pb-8 lg:p-8 animate-in overflow-hidden relative">
      
      {/* MOBILE PERSISTENT TOP ACTIONS & GROUPS */}
      <div className="lg:hidden flex flex-col gap-4 mb-2 shrink-0">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-black text-gray-900 text-2xl tracking-tight">Sürü <span className="text-blue-600">İdarəetmə</span></h2>
          <div className="flex items-center gap-2">
            <label className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-all border border-emerald-100">
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleExcelImport} disabled={isImporting} />
              <FileDown className={`w-5 h-5 ${isImporting ? 'animate-bounce' : ''}`} />
            </label>
            <button 
              onClick={async () => {
                if(confirm('75 heyvanlıq demo məlumat yüklənsin?')) {
                  const res = await seedDemoDataAction?.(targetFarmId);
                  if (res?.success) alert(`${res.count} heyvan uğurla yükləndi!`);
                  else alert(res?.message || 'Xəta baş verdi');
                }
              }}
              className="bg-amber-500 text-white p-3 rounded-2xl shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
              title="Demo Yüklə"
            >
              <Database className="w-5 h-5" />
            </button>
            <Link 
              href={targetFarmId ? `/herd/new?userId=${targetFarmId}` : "/herd/new"}
              className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Horizontal Scroll Groups for Mobile */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-1 px-1">
          <button 
            onClick={() => setFilterGroup(null)}
            className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${!filterGroup ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-4 ring-blue-50' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
          >
            Hamsı
          </button>
          {[...groups, 'PREGNANT', 'EMPTY', 'SICK'].map(group => (
            <button 
              key={group}
              onClick={() => setFilterGroup(group)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filterGroup === group ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-4 ring-blue-50' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
            >
              {group === 'PREGNANT' ? 'Hamilələr' : group === 'EMPTY' ? 'Boşlar' : group === 'SICK' ? 'Xəstələr' : group}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Button for Mobile - Keep for quick access when scrolling list */}
      {!showForm && (
        <div className="lg:hidden fixed bottom-24 right-6 z-[60]">
          <Link 
            href={targetFarmId ? `/herd/new?userId=${targetFarmId}` : "/herd/new"}
            className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transform active:scale-95 transition-transform border-4 border-white"
          >
            <Plus className="w-8 h-8" />
          </Link>
        </div>
      )}
      
      {/* LEFT PANE: Master List */}
      <div className={`w-full lg:w-[420px] flex-col glass-panel rounded-[32px] shadow-2xl shadow-blue-500/5 overflow-hidden shrink-0 border border-white/50 ${selectedAnimalId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-gray-100/50 bg-white/30 backdrop-blur-md">
          <div className="hidden lg:flex justify-between items-center mb-6 lg:mb-6">
            <h2 className="font-black text-gray-900 text-xl lg:text-2xl tracking-tight">Sürü <span className="text-blue-600">Siyahısı</span></h2>
            <div className="lg:hidden w-10" /> {/* Spacer for back button on mobile */}
            <div className="flex items-center gap-2">
               <label className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-all border border-emerald-100">
                 {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                 <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleExcelImport} disabled={isImporting} />
               </label>
               <button 
                 onClick={() => { setMassVaccineGroup('SAĞMAL 1'); setShowForm('mass_vaccine'); }}
                 className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-2xl transition-all shadow-lg shadow-purple-600/20 transform hover:scale-105 active:scale-95"
                 title="Kütləvi Vaksinasiya"
               >
                 <Syringe className="w-5 h-5" />
               </button>
               <Link href={targetFarmId ? `/herd/new?userId=${targetFarmId}` : "/herd/new"} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 transform hover:scale-105 active:scale-95">
                 <Plus className="w-5 h-5" />
               </Link>
            </div>
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
          <div className="hidden lg:flex gap-2 overflow-x-auto pb-2 mt-6 scrollbar-hide">
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
            <>
              {filteredAnimals.slice((herdPage - 1) * itemsPerPage, herdPage * itemsPerPage).map((animal) => (
                <div 
                  key={animal.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnimalId(animal.id);
                  }}
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
              ))}
              
              {/* PAGINATION CONTROLS */}
              {Math.ceil(filteredAnimals.length / itemsPerPage) > 1 && (
                <div className="flex justify-center items-center gap-2 py-4">
                  {Array.from({ length: Math.ceil(filteredAnimals.length / itemsPerPage) }, (_, i) => i + 1).map(p => (
                    <button 
                      key={p} 
                      onClick={() => setHerdPage(p)}
                      className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all ${herdPage === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Details */}
      <div className={`flex-1 glass-panel rounded-[32px] lg:rounded-[40px] shadow-2xl shadow-blue-500/5 overflow-hidden border border-white/50 relative flex-col ${selectedAnimalId ? 'flex' : 'hidden lg:flex'}`}>
        {/* Mobile Header for Detail View */}
        {selectedAnimalId && (
          <div className="lg:hidden p-4 bg-white border-b flex items-center justify-between z-[50]">
            <button 
              onClick={() => setSelectedAnimalId(null)}
              className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest"
            >
              <ArrowLeft className="w-5 h-5" /> Geri
            </button>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Seçilən</p>
              <p className="text-sm font-black text-gray-900">{selectedAnimal?.tagNumber}</p>
            </div>
          </div>
        )}
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
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
            {/* HERO HEADER */}
            <div className="relative h-[220px] lg:h-[320px] overflow-hidden group">
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

               <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
                 <div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">{selectedAnimal.tagNumber}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-blue-100 font-bold">
                       <p className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm">
                         <Info className="w-4 h-4" /> {selectedAnimal.name || 'Ad qoyulmayıb'}
                       </p>
                       <p className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm">
                         <ShieldCheck className="w-4 h-4 text-emerald-400" /> {selectedAnimal.breed || 'Cins Naməlum'}
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex gap-4 mb-1">
                     <button 
                       onClick={() => setShowQR(true)}
                       className="w-16 h-16 bg-white hover:bg-slate-800 text-slate-800 hover:text-white rounded-2xl border border-white/20 transition-all flex items-center justify-center group shadow-2xl"
                       title="QR Passport"
                     >
                        <QrCode className="w-7 h-7 group-active:scale-90" />
                     </button>
                    <Link 
                      href={targetFarmId ? `/herd/edit/${selectedAnimal.id}?userId=${targetFarmId}` : `/herd/edit/${selectedAnimal.id}`} 
                      className="w-16 h-16 bg-white hover:bg-blue-600 text-blue-600 hover:text-white rounded-2xl border border-white/20 transition-all flex items-center justify-center group shadow-2xl"
                      title="Düzəliş et"
                    >
                       <Edit className="w-7 h-7 group-active:scale-90" />
                    </Link>
                    <form action={async () => {
                      if(confirm('Əminsiniz?')) {
                         await deleteAction(selectedAnimal.id, targetFarmId);
                         setSelectedAnimalId(null);
                      }
                    }}>
                      <button 
                        type="submit" 
                        className="w-16 h-16 bg-white/10 backdrop-blur-md hover:bg-red-600 text-white rounded-2xl border border-red-500/30 transition-all flex items-center justify-center group shadow-2xl"
                        title="Sil"
                      >
                         <Trash2 className="w-7 h-7 group-active:scale-90" />
                      </button>
                    </form>
                 </div>
               </div>
            </div>

             <div className="p-6 lg:p-10 space-y-8 lg:space-y-10">
               {/* QUICK STATS */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
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

                     {getAnimalGroup(selectedAnimal) !== 'BUZOVLAR' && getAnimalGroup(selectedAnimal) !== 'DANALAR' && (
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
                     )}
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
                      <div className="space-y-4 lg:space-y-6">
                        <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-[24px] w-fit overflow-x-auto max-w-full no-scrollbar">
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
                           <button 
                             onClick={() => setActiveTab('pedigree')}
                             className={`px-6 py-2.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pedigree' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                             Şəcərə
                           </button>
                           {(getAnimalGroup(selectedAnimal) === 'BUZOVLAR' || getAnimalGroup(selectedAnimal) === 'DANALAR') && (
                             <button 
                               onClick={() => setActiveTab('weight')}
                               className={`px-6 py-2.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'weight' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                             >
                               Çəki
                             </button>
                           )}
                           {selectedAnimal.children && selectedAnimal.children.length > 0 && (
                             <button 
                               onClick={() => setActiveTab('children')}
                               className={`px-6 py-2.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'children' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                             >
                               Balalar
                             </button>
                           )}
                        </div>

                        {/* DATA LISTS */}
                        <div className="relative pl-4 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-gray-100">
                           {activeTab === 'weight' && (
                              <div className="space-y-6">
                                <form action={async (formData) => {
                                  const weight = parseFloat(formData.get('weight') as string);
                                  const note = formData.get('note') as string;
                                  if (selectedAnimal) await addWeightRecord(selectedAnimal.id, weight, note, targetFarmId);
                                }} className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex flex-col md:flex-row gap-4 items-end">
                                   <div className="flex-1 space-y-2 w-full">
                                      <label className="text-[10px] font-black text-amber-600 uppercase ml-1">Yeni Çəki (kq)</label>
                                      <input name="weight" type="number" step="0.1" required className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Məs: 45.5" />
                                   </div>
                                   <div className="flex-1 space-y-2 w-full">
                                      <label className="text-[10px] font-black text-amber-600 uppercase ml-1">Qeyd</label>
                                      <input name="note" type="text" className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Məs: Normal böyümə" />
                                   </div>
                                   <button type="submit" className="bg-amber-500 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all w-full md:w-auto">Qeyd Et</button>
                                </form>

                                <div className="space-y-4">
                                  {selectedAnimal.weightRecords?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record: any) => (
                                    <div key={record.id} className="relative flex gap-8 items-start group">
                                      <div className="absolute left-[-15px] top-2 w-4 h-4 rounded-full bg-amber-500 ring-8 ring-white z-10 group-hover:scale-125 transition-all shadow-lg" />
                                      <div className="flex-1 bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex justify-between items-center group-hover:border-amber-300 transition-all">
                                        <div>
                                          <p className="text-2xl font-black text-gray-900">{record.weight} <span className="text-xs text-gray-400">kq</span></p>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('az-AZ')}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          {record.note && <span className="text-[10px] font-bold text-gray-500 italic bg-gray-50 px-3 py-1 rounded-lg">"{record.note}"</span>}
                                          <button 
                                            onClick={async () => { if(confirm('Silsin?')) await deleteWeightRecord(record.id, targetFarmId); }}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {(!selectedAnimal.weightRecords || selectedAnimal.weightRecords.length === 0) && (
                                    <p className="text-center py-10 text-gray-400 font-bold italic">Hələ heç bir çəki ölçümü yoxdur.</p>
                                  )}
                                </div>
                              </div>
                           )}
                            {activeTab === 'repro' && (
                              <div className="space-y-8">
                                {/* GESTATION DASHBOARD */}
                                {selectedAnimal.gender === 'FEMALE' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                    {/* Hamiləlik Statusu */}
                                    <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-w-0">
                                      <div className={`absolute -right-2 -bottom-2 w-14 h-14 ${selectedAnimal.isPregnant ? 'text-pink-50' : 'text-gray-50'} opacity-50`}>
                                        <ShieldCheck className="w-full h-full" />
                                      </div>
                                      <div className="relative z-10 flex flex-col h-full">
                                        <div className={`w-9 h-9 ${selectedAnimal.isPregnant ? 'bg-pink-50 text-pink-600' : 'bg-gray-50 text-gray-400'} rounded-2xl flex items-center justify-center mb-3 shrink-0`}>
                                          <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 leading-tight">Hamiləlik Statusu</p>
                                        <p className={`text-lg font-black leading-tight ${selectedAnimal.isPregnant ? 'text-pink-600' : 'text-gray-400'}`}>
                                          {selectedAnimal.isPregnant ? 'HAMİLƏDİR' : 'BOŞDUR'}
                                        </p>
                                        {selectedAnimal.isPregnant && selectedAnimal.lastBreedingDate && (
                                          <p className="text-[10px] font-bold text-gray-500 mt-1">
                                            {Math.floor((new Date().getTime() - new Date(selectedAnimal.lastBreedingDate).getTime()) / (1000 * 3600 * 24 * 30))} aylıq
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Təxmini Doğuş */}
                                    <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-w-0">
                                      <div className="absolute -right-2 -bottom-2 w-14 h-14 text-blue-50 opacity-50">
                                        <Calendar className="w-full h-full" />
                                      </div>
                                      <div className="relative z-10 flex flex-col h-full">
                                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3 shrink-0">
                                          <Calendar className="w-4 h-4" />
                                        </div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 leading-tight">Təxmini Doğuş</p>
                                        <p className="text-lg font-black text-blue-600 leading-tight">
                                          {selectedAnimal.expectedCalvingDate ? new Date(selectedAnimal.expectedCalvingDate).toLocaleDateString('az-AZ') : '-'}
                                        </p>
                                        {selectedAnimal.expectedCalvingDate && (
                                          <p className="text-[10px] font-bold text-gray-500 mt-1">
                                            {Math.max(0, Math.ceil((new Date(selectedAnimal.expectedCalvingDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} gün qalıb
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Vəziyyət */}
                                    <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all min-w-0">
                                      <div className={`absolute -right-2 -bottom-2 w-14 h-14 ${selectedAnimal.isDry ? 'text-amber-50' : 'text-emerald-50'} opacity-50`}>
                                        <Milk className="w-full h-full" />
                                      </div>
                                      <div className="relative z-10 flex flex-col h-full">
                                        <div className={`w-9 h-9 ${selectedAnimal.isDry ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} rounded-2xl flex items-center justify-center mb-3 shrink-0`}>
                                          <Milk className="w-4 h-4" />
                                        </div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 leading-tight">Vəziyyət</p>
                                        <p className={`text-lg font-black leading-tight ${selectedAnimal.isDry ? 'text-amber-600' : 'text-emerald-600'}`}>
                                          {selectedAnimal.isDry ? 'QURUDA' : 'SAĞILIR'}
                                        </p>
                                        {selectedAnimal.isDry && selectedAnimal.dryDate ? (
                                          <p className="text-[10px] font-bold text-gray-500 mt-1 truncate">
                                            {new Date(selectedAnimal.dryDate).toLocaleDateString('az-AZ')}
                                          </p>
                                        ) : (
                                           <p className="text-[10px] font-bold text-gray-500 mt-1">Süd verimi aktiv</p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Əməliyyatlar */}
                                    <div className="bg-gray-50 p-4 rounded-[32px] border border-gray-100 flex flex-col gap-2 shrink-0">
                                       <div className="flex flex-col gap-2 h-full">
                                          <button 
                                            onClick={() => setShowForm('ai')}
                                            className="w-full bg-blue-600 text-white rounded-2xl flex items-center gap-3 p-3 hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98] border-b-4 border-blue-800"
                                          >
                                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                              <Plus className="w-5 h-5"/>
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-wider">Süni Mayalanma</span>
                                          </button>
                                          
                                          <button 
                                            onClick={() => setShowForm('pd')}
                                            className="w-full bg-pink-600 text-white rounded-2xl flex items-center gap-3 p-3 hover:bg-pink-700 transition-all shadow-sm active:scale-[0.98] border-b-4 border-pink-800"
                                          >
                                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                              <ShieldCheck className="w-5 h-5"/>
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-wider">Hamiləlik Yoxlanışı</span>
                                          </button>

                                          <button 
                                            onClick={() => setShowForm('dry')}
                                            className="w-full bg-amber-500 text-white rounded-2xl flex items-center gap-3 p-3 hover:bg-amber-600 transition-all shadow-sm active:scale-[0.98] border-b-4 border-amber-700"
                                          >
                                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                              <Milk className="w-5 h-5"/>
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-wider">Quruya Çıxarma</span>
                                          </button>

                                          <button 
                                            onClick={() => setShowForm('calving')}
                                            className="w-full bg-emerald-600 text-white rounded-2xl flex items-center gap-3 p-3 hover:bg-emerald-700 transition-all shadow-sm active:scale-[0.98] border-b-4 border-emerald-800"
                                          >
                                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                              <Milk className="w-5 h-5"/>
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-wider">Doğuş Qeydi</span>
                                          </button>
                                       </div>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-6">

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
                                               <p className="font-black text-gray-900 text-base">{record.eventType === 'INSEMINATION' ? 'Süni Mayalanma' : record.eventType === 'PREGNANCY_CONFIRMED' ? 'Hamiləlik Təsdiqi' : record.eventType === 'DRY_OFF' ? 'Quruya Çıxarma' : record.eventType}</p>
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
                                              onClick={async () => { if(confirm('Silsin?')) await deleteAIAction?.(record.id, targetFarmId); }}
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
                                                             </div>
                              </div>

                           )}

                           {activeTab === 'children' && (
                             <div className="space-y-6">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 {selectedAnimal.children?.map((child: any) => (
                                   <div 
                                     key={child.id}
                                     onClick={() => setSelectedAnimalId(child.id)}
                                     className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
                                   >
                                     <div className="flex justify-between items-start">
                                       <div className="flex items-center gap-4">
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${child.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                            {child.tagNumber.slice(-2)}
                                          </div>
                                          <div>
                                            <p className="font-black text-gray-900">{child.tagNumber}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{calculateAge(child.birthDate)}</p>
                                          </div>
                                       </div>
                                       <span className="text-[10px] font-black bg-gray-50 px-3 py-1 rounded-full uppercase">{child.gender === 'MALE' ? 'Erkək' : 'Dişi'}</span>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}

                           {activeTab === 'health' && (
                             <div className="space-y-8">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <button 
                                   onClick={() => { setEditingRecord(null); setShowForm('health'); }}
                                   className="w-full border-2 border-dashed border-red-200 text-red-600 py-6 rounded-[32px] font-black text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                                 >
                                    <Activity className="w-5 h-5" /> Yeni Müalicə
                                 </button>
                                 <button 
                                   onClick={() => { setEditingRecord(null); setShowForm('vaccine'); }}
                                   className="w-full border-2 border-dashed border-blue-200 text-blue-600 py-6 rounded-[32px] font-black text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-3"
                                 >
                                   <Syringe className="w-5 h-5" /> Peyvənd
                                 </button>
                               </div>
                               {selectedAnimal.healthRecords?.map((record: any) => (
                                 <div key={record.id} className="relative flex gap-8 items-start group">
                                   <div className="absolute left-[-15px] top-2 w-4 h-4 rounded-full bg-red-500 ring-8 ring-white z-10 group-hover:scale-125 transition-all shadow-lg" />
                                   <div className="flex-1 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                                     <div className="flex justify-between items-center mb-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                                             <Activity className="w-5 h-5"/>
                                          </div>
                                          <div>
                                             <p className="font-black text-gray-900 text-base">{record.disease || 'Müalicə'}</p>
                                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('az-AZ')}</p>
                                          </div>
                                       </div>
                                       <div className="flex gap-2">
                                          <button onClick={() => { setEditingRecord(record); setShowForm('health'); }} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"><Edit className="w-3.5 h-3.5" /></button>
                                          <button onClick={async () => { if(confirm('Silsin?')) await deleteHealthAction?.(record.id, targetFarmId); }} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                       </div>
                                     </div>
                                     <p className="text-xs font-bold text-gray-500 mt-2">Dərmanlar: <span className="text-gray-900 font-black">{record.medications || '-'}</span></p>
                                   </div>
                                 </div>
                               ))}
                               {selectedAnimal.vaccineRecords?.map((record: any) => (
                                 <div key={record.id} className="relative flex gap-8 items-start group">
                                   <div className="absolute left-[-15px] top-2 w-4 h-4 rounded-full bg-blue-400 ring-8 ring-white z-10 group-hover:scale-125 transition-all shadow-lg" />
                                   <div className="flex-1 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                                       <div className="flex justify-between items-center mb-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                <Syringe className="w-5 h-5"/>
                                             </div>
                                             <div>
                                                <p className="font-black text-gray-900 text-base">{record.vaccineName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('az-AZ')}</p>
                                             </div>
                                          </div>
                                          <div className="flex gap-2">
                                             <button onClick={() => { setEditingRecord(record); setShowForm('vaccine'); }} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"><Edit className="w-3.5 h-3.5" /></button>
                                             <button onClick={async () => { if(confirm('Silsin?')) await deleteVaccineAction?.(record.id, targetFarmId); }} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                          </div>
                                       </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}

                           {activeTab === 'pedigree' && (
                             <div className="pt-4">
                               <PedigreeTree 
                                 selectedAnimal={selectedAnimal} 
                                 allAnimals={animals} 
                                 onSelectAnimal={(id) => setSelectedAnimalId(id)}
                               />
                             </div>
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
              await updateAIAction(editingRecord.id, formData, targetFarmId);
            } else if (saveAIAction) {
              await saveAIAction(formData, targetFarmId);
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
              await saveCalvingAction(formData, targetFarmId);
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 md:p-10 overflow-y-auto pt-10 md:pt-20">
          <form action={async (formData) => {
            if (editingRecord) {
              await updateHealthAction?.(editingRecord.id, formData, targetFarmId);
            } else {
              await addHealthAction?.(formData, targetFarmId);
            }
            setShowForm('none');
          }} className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-2xl space-y-6 md:space-y-8 relative">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                     <Activity className="w-6 h-6"/>
                  </div>
                  <h4 className="font-black text-gray-900 text-xl tracking-tight">{editingRecord ? 'Müalicəni Yenilə' : 'Yeni Sağlamlıq Qeydi'}</h4>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <input type="hidden" name="animalId" value={selectedAnimal?.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Xəstəlik / Problem</label>
                <input name="disease" defaultValue={editingRecord?.disease || ''} required placeholder="Məs: Mastit" className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tarix</label>
                <input type="date" name="date" defaultValue={editingRecord ? new Date(editingRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Müalicə Üsulu</label>
                <input name="treatment" defaultValue={editingRecord?.treatment || ''} placeholder="Məs: İnyeksiya" className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Dərmanlar</label>
                <input name="medications" defaultValue={editingRecord?.medications || ''} placeholder="Məs: Penicillin" className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Baytar Adı</label>
                <input name="vetName" defaultValue={editingRecord?.vetName || ''} placeholder="Məs: Dr. Əli" className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Xərc (₼)</label>
                <input type="number" step="0.01" name="cost" defaultValue={editingRecord?.cost || ''} placeholder="0.00" className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Simptomlar və Qeydlər</label>
                <textarea name="description" rows={3} defaultValue={editingRecord?.description || ''} className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-bold"></textarea>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-red-600 text-white py-5 rounded-3xl text-sm font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20">Yadda Saxla</button>
              <button type="button" onClick={() => setShowForm('none')} className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl text-sm font-black hover:bg-gray-100 transition-all border border-gray-100">Ləğv Et</button>
            </div>
          </form>
        </div>
      )}

      {showForm === 'vaccine' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 md:p-10 overflow-y-auto pt-10 md:pt-20">
          <form action={async (formData) => {
            if (editingRecord && updateVaccineAction) {
              await updateVaccineAction(editingRecord.id, formData, targetFarmId);
            } else if (addVaccineAction) {
              await addVaccineAction(formData, targetFarmId);
            }
            setShowForm('none');
            setEditingRecord(null);
          }} className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-xl space-y-6 md:space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                     <Syringe className="w-6 h-6"/>
                  </div>
                  <h4 className="font-black text-gray-900 text-xl tracking-tight">{editingRecord ? 'Vaksini Yenilə' : 'Yeni Vaksinasiya'}</h4>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <input type="hidden" name="animalId" value={selectedAnimal?.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Vaksin Adı</label>
                <input name="vaccineName" defaultValue={editingRecord?.vaccineName || ''} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tarix</label>
                <input type="date" name="date" defaultValue={editingRecord ? new Date(editingRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Növbəti Tarix</label>
                 <input type="date" name="nextDueDate" defaultValue={editingRecord?.nextDueDate ? new Date(editingRecord.nextDueDate).toISOString().split('T')[0] : ''} className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Dozaj</label>
                <input name="dose" defaultValue={editingRecord?.dose || '2ml'} className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Qeyd</label>
                <input name="notes" defaultValue={editingRecord?.notes || ''} className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-3xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">Yadda Saxla</button>
              <button type="button" onClick={() => setShowForm('none')} className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl text-sm font-black hover:bg-gray-100 transition-all border border-gray-100">Ləğv Et</button>
            </div>
          </form>
        </div>
      )}

      {showForm === 'pd' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form action={async (formData) => {
            await savePDAction?.(formData, targetFarmId);
            setShowForm('none');
          }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-xl space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-600/20">
                     <ShieldCheck className="w-6 h-6"/>
                  </div>
                  <h4 className="font-black text-gray-900 text-xl tracking-tight">Hamiləlik Yoxlanışı (PD)</h4>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5"/>
               </button>
            </div>
            <input type="hidden" name="animalId" value={selectedAnimal?.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nəticə</label>
                <select name="result" required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-pink-500/10 transition-all font-bold appearance-none">
                  <option value="PREGNANT">MÜSBƏT (HAMİLƏDİR)</option>
                  <option value="NEGATIVE">MƏNFİ (BOŞDUR)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Yoxlanış Tarixi</label>
                <input type="date" name="checkDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-pink-500/10 transition-all font-bold" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Qeydlər</label>
                <textarea name="notes" rows={2} placeholder="Məs: Uşaqlıq vəziyyəti normaldır..." className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-pink-500/10 transition-all font-bold"></textarea>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-pink-600 text-white py-5 rounded-3xl text-sm font-black hover:bg-pink-700 transition-all shadow-xl shadow-pink-600/20">Yadda Saxla</button>
              <button type="button" onClick={() => setShowForm('none')} className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl text-sm font-black hover:bg-gray-100 transition-all border border-gray-100">Ləğv Et</button>
            </div>
          </form>
        </div>
      )}

      {showForm === 'dry' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form action={async (formData) => {
            await saveDryAction?.(formData, targetFarmId);
            setShowForm('none');
          }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-xl space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                     <Database className="w-6 h-6"/>
                  </div>
                  <h4 className="font-black text-gray-900 text-xl tracking-tight">Quruya Çıxarma</h4>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5"/>
               </button>
            </div>
            <input type="hidden" name="animalId" value={selectedAnimal?.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tarix</label>
                <input type="date" name="dryDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Qeydlər</label>
                <textarea name="notes" rows={2} placeholder="Süd verimi kəsildi..." className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold"></textarea>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-amber-600 text-white py-5 rounded-3xl text-sm font-black hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20">Təsdiqlə</button>
              <button type="button" onClick={() => setShowForm('none')} className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl text-sm font-black hover:bg-gray-100 transition-all border border-gray-100">Ləğv Et</button>
            </div>
          </form>
        </div>
      )}


      {showForm === 'mass_vaccine' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form action={async (formData) => {
            const animalsInGroup = animals.filter(a => getAnimalGroup(a) === massVaccineGroup && !excludedAnimals.includes(a.id));
            formData.set('animalIds', JSON.stringify(animalsInGroup.map(a => a.id)));
            await addMassVaccineAction?.(formData, targetFarmId);
            setShowForm('none');
          }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-2xl space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                     <Users className="w-6 h-6"/>
                  </div>
                  <h4 className="font-black text-gray-900 text-xl tracking-tight">Kütləvi Vaksinasiya</h4>
               </div>
               <button type="button" onClick={() => setShowForm('none')} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Qrup Seçin</label>
                <select 
                  value={massVaccineGroup} 
                  onChange={(e) => { setMassVaccineGroup(e.target.value); setExcludedAnimals([]); }}
                  className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-bold appearance-none"
                >
                  {['YENİ DOĞANLAR', 'SAĞMAL 1', 'SAĞMAL 2', 'QURUYA ÇIXANLAR', 'DOĞUMA 1 AY QALMIŞLAR', 'BUZOVLAR', 'DANALAR', 'DÜYƏLƏR'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Vaksin Adı</label>
                <input name="vaccineName" required placeholder="Məs: Şap" className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tarix</label>
                <input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Dozaj</label>
                <input name="dose" defaultValue="2ml" className="w-full text-sm px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-bold" />
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                    Heyvanlar ({animals.filter(a => getAnimalGroup(a) === massVaccineGroup).length} nəfər)
                  </label>
                  <p className="text-[10px] font-bold text-purple-600">{excludedAnimals.length} heyvan çıxarılıb</p>
               </div>
               <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-2xl p-4 border border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {animals.filter(a => getAnimalGroup(a) === massVaccineGroup).map(animal => (
                    <div 
                      key={animal.id} 
                      onClick={() => {
                        if (excludedAnimals.includes(animal.id)) {
                          setExcludedAnimals(excludedAnimals.filter(id => id !== animal.id));
                        } else {
                          setExcludedAnimals([...excludedAnimals, animal.id]);
                        }
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all border ${excludedAnimals.includes(animal.id) ? 'bg-white border-gray-200 opacity-40' : 'bg-purple-50 border-purple-100'}`}
                    >
                       <div className={`w-4 h-4 rounded-full flex items-center justify-center ${excludedAnimals.includes(animal.id) ? 'bg-gray-200' : 'bg-purple-600'}`}>
                          {!excludedAnimals.includes(animal.id) && <Check className="w-2 h-2 text-white" />}
                       </div>
                       <span className="text-xs font-black">{animal.tagNumber}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-purple-600 text-white py-5 rounded-3xl text-sm font-black hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20">Yadda Saxla</button>
              <button type="button" onClick={() => setShowForm('none')} className="px-10 py-5 bg-gray-50 text-gray-500 rounded-3xl text-sm font-black hover:bg-gray-100 transition-all border border-gray-100">Ləğv Et</button>
            </div>
          </form>
        </div>
      )}

      {/* QR PASSPORT MODAL - PREMIUM DESIGN */}
      {showQR && selectedAnimal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[48px] shadow-2xl w-full max-w-sm overflow-hidden relative border border-white/20"
          >
            {/* Header with Pattern */}
            <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-10 pb-10 -mt-12 relative z-10 text-center">
              <div className="inline-flex p-4 bg-white rounded-3xl shadow-2xl mb-6 ring-8 ring-gray-50/50">
                <QRCodeSVG 
                  value={`${window.location.origin}/herd/${selectedAnimal.id}`} 
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              <div className="space-y-1 mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedAnimal.tagNumber}</h3>
                <p className="text-blue-600 text-xs font-black uppercase tracking-widest">{selectedAnimal.name || 'RƏQƏMSAL PASPORT'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cins</p>
                   <p className="text-xs font-bold text-gray-900 truncate">{selectedAnimal.breed || '-'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Doğum</p>
                   <p className="text-xs font-bold text-gray-900">{selectedAnimal.birthDate ? new Date(selectedAnimal.birthDate).toLocaleDateString('az-AZ') : '-'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                  <FileDown className="w-5 h-5" /> Pasportu Çap Et
                </button>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Heyvanın tam tarixçəsi üçün skan edin</p>
              </div>
            </div>

            {/* PRINT ONLY SECTION - Optimized for physical card */}
            <div className="hidden print:block fixed inset-0 bg-white z-[999] p-10">
               <div className="border-4 border-slate-900 rounded-[40px] p-10 flex flex-col items-center text-center max-w-sm mx-auto">
                  <h1 className="text-3xl font-black mb-2">MODERN FERMA</h1>
                  <p className="text-xs font-bold text-gray-500 mb-8 uppercase tracking-widest">Heyvan Pasportu</p>
                  
                  <div className="border-2 border-gray-100 p-6 rounded-3xl mb-8">
                    <QRCodeSVG value={`${window.location.origin}/herd/${selectedAnimal.id}`} size={200} />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Bırka Nömrəsi</p>
                      <p className="text-3xl font-black">{selectedAnimal.tagNumber}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Cins</p>
                        <p className="text-base font-bold">{selectedAnimal.breed}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Doğum Tarixi</p>
                        <p className="text-base font-bold">{selectedAnimal.birthDate ? new Date(selectedAnimal.birthDate).toLocaleDateString('az-AZ') : '-'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-12 text-[10px] font-bold text-gray-300">Bu heyvan Modern Ferma sistemi tərəfindən qeydiyyata alınıb.</p>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
