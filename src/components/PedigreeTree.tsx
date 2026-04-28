'use client';

import React from 'react';
import { ChevronRight, ChevronDown, User, Users, Baby, ArrowRight } from 'lucide-react';
import { Animal } from '@/lib/herd-utils';
import { useI18n } from '@/lib/i18n';

interface PedigreeTreeProps {
  selectedAnimal: Animal;
  allAnimals: Animal[];
  onSelectAnimal: (id: string) => void;
}

export default function PedigreeTree({ selectedAnimal, allAnimals, onSelectAnimal }: PedigreeTreeProps) {
  const { t } = useI18n();
  
  // Find ancestors
  const mother = allAnimals.find(a => a.id === selectedAnimal.motherId) || null;
  const grandmother = mother ? allAnimals.find(a => a.id === (mother as any).motherId) || null : null;

  // Find descendants
  const children = allAnimals.filter(a => a.motherId === selectedAnimal.id);

  const AnimalNode = ({ animal, label, isTarget = false }: { animal: Animal | null | {tagNumber: string, id?: string}, label: string, isTarget?: boolean }) => {
    if (!animal) return (
      <div className="flex flex-col items-center gap-2 opacity-40">
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
          <User className="w-8 h-8 text-gray-300" />
        </div>
        <div className="text-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
           <p className="text-xs font-bold text-gray-400">{t.unknown}</p>
        </div>
      </div>
    );

    return (
      <div 
        onClick={() => animal.id && onSelectAnimal(animal.id)}
        className={`flex flex-col items-center gap-3 transition-all duration-500 cursor-pointer group ${isTarget ? 'scale-110' : 'hover:scale-105'}`}
      >
        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center relative transition-all duration-500 ${
          isTarget 
          ? 'bg-blue-600 shadow-2xl shadow-blue-600/30 text-white' 
          : 'bg-white border-2 border-gray-100 shadow-xl shadow-blue-500/5 text-gray-400 group-hover:border-blue-200 group-hover:text-blue-500'
        }`}>
          {isTarget && <div className="absolute inset-0 bg-blue-400 rounded-[32px] blur-xl opacity-20 animate-pulse" />}
          <Users className="w-10 h-10 relative z-10" />
          
          {!isTarget && (
             <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-blue-600" />
             </div>
          )}
        </div>
        <div className="text-center">
           <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isTarget ? 'text-blue-600' : 'text-gray-400'}`}>{label}</p>
           <p className={`text-sm font-black tracking-tight ${isTarget ? 'text-gray-900' : 'text-gray-700 group-hover:text-blue-600'}`}>{animal.tagNumber}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-[48px] p-12 border border-white shadow-2xl shadow-blue-500/5 overflow-hidden">
      <div className="flex flex-col items-center gap-16 relative">
        
        {/* CONNECTIONS (SVG Layer) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }}>
           {/* Grandmother to Mother */}
           {grandmother && mother && (
             <path d="M 50% 120 L 50% 200" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
           )}
           {/* Mother to Selected */}
           {mother && (
             <path d="M 50% 280 L 50% 360" stroke="#3b82f6" strokeWidth="2" />
           )}
        </svg>

        {/* ANCESTORS */}
        <div className="flex flex-col items-center gap-12 relative z-10">
           <AnimalNode animal={grandmother} label={t.grandmother} />
           <div className="w-px h-10 bg-gradient-to-b from-gray-200 to-transparent" />
           <AnimalNode animal={mother} label={t.mother} />
           <div className="w-px h-10 bg-gradient-to-b from-gray-200 to-transparent" />
        </div>

        {/* TARGET ANIMAL */}
        <div className="relative z-10">
           <AnimalNode animal={selectedAnimal} label={t.currentAnimal} isTarget={true} />
        </div>

        {/* DESCENDANTS */}
        <div className="flex flex-col items-center gap-10 w-full relative z-10">
           <div className="w-px h-10 bg-gradient-to-b from-blue-200 to-transparent" />
           <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50 px-6 py-2 rounded-full border border-blue-100">{t.children}</h4>
           
           <div className="flex flex-wrap justify-center gap-12 mt-4">
              {children.length > 0 ? (
                children.map(child => (
                  <AnimalNode key={child.id} animal={child} label={child.gender === 'MALE' ? t.son : t.daughter} />
                ))
              ) : (
                <p className="text-gray-400 font-bold text-xs italic">{t.noChildrenYet}</p>
              )}
           </div>
        </div>

        {/* SIRE INFO (Side Badge) */}
        {selectedAnimal.sireCode && (
           <div className="absolute top-0 right-0 bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-600/20 transform rotate-3 hover:rotate-0 transition-transform">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{t.sireCodeText}</p>
              <p className="text-xl font-black">{selectedAnimal.sireCode}</p>
           </div>
        )}
      </div>
    </div>
  );
}
