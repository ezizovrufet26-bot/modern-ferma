'use client';
import { useState } from 'react';

const GROUPS = [
  { key: 'YENI_DOGAN', label: 'Yeni Doğanlar', color: 'bg-pink-500' },
  { key: 'SAGMAL_1', label: 'Sağmal Qrup 1', color: 'bg-red-500' },
  { key: 'SAGMAL_2', label: 'Sağmal Qrup 2', color: 'bg-orange-500' },
  { key: 'DUYE_QRUPU', label: 'Düyə Qrupu', color: 'bg-purple-500' },
  { key: 'ERKEK_QRUPU', label: 'Erkək Qrupu', color: 'bg-teal-500' },
  { key: 'BUZOV_QRUPU', label: 'Buzov Qrupu', color: 'bg-blue-500' },
  { key: 'QURU_DONEM', label: 'Quru Dönəm', color: 'bg-amber-500' },
  { key: 'XESTEXANA', label: 'Xəstəxana', color: 'bg-gray-700' },
];

export { GROUPS };

export default function GroupPanel({ animals, selectedGroup, onSelectGroup }: {
  animals: any[];
  selectedGroup: string | null;
  onSelectGroup: (g: string | null) => void;
}) {
  const counts: Record<string, number> = {};
  GROUPS.forEach(g => { counts[g.key] = animals.filter(a => a.groupName === g.key).length; });

  return (
    <div className="space-y-1">
      <button onClick={() => onSelectGroup(null)}
        className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedGroup ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
        <span>Hamısı</span><span className="font-bold">{animals.length}</span>
      </button>
      {GROUPS.map(g => (
        <button key={g.key} onClick={() => onSelectGroup(g.key)}
          className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedGroup === g.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <span className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${g.color}`} />{g.label}
          </span>
          <span className="font-bold">{counts[g.key] || 0}</span>
        </button>
      ))}
    </div>
  );
}
