'use client';

import Link from "next/link";
import { updateAnimal, getAnimal } from "@/app/actions/herd";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Suspense } from "react";

function EditAnimalForm({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUserId = searchParams.get('userId');
  
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      getAnimal(p.id, targetUserId || undefined).then(res => {
        if (!res) notFound();
        setAnimal(res);
        setLoading(false);
      });
    });
  }, [params, targetUserId]);

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Yüklənir...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-4">
        <Link href={targetUserId ? `/admin/users/${targetUserId}/view` : "/herd"} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Heyvana Düzəliş Et</h1>
          <p className="text-gray-500 mt-1">{animal.tagNumber} nömrəli heyvanın məlumatları</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={async (formData) => {
          await updateAnimal(animal.id, formData, targetUserId || undefined);
          router.push(targetUserId ? `/admin/users/${targetUserId}/view` : "/herd");
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bırka Nömrəsi (Tag) *</label>
              <input 
                type="text" 
                name="tagNumber" 
                defaultValue={animal.tagNumber}
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adı</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={animal.name || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cinsi</label>
              <input 
                type="text" 
                name="breed" 
                defaultValue={animal.breed || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doğulduğu Tarix</label>
              <input 
                type="date" 
                name="birthDate" 
                defaultValue={animal.birthDate ? new Date(animal.birthDate).toISOString().split('T')[0] : ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyyət</label>
              <select 
                name="gender" 
                defaultValue={animal.gender}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="FEMALE">Dişi</option>
                <option value="MALE">Erkək</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qrup</label>
              <select 
                name="groupName" 
                defaultValue={animal.groupName || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="SAĞMAL 1">SAĞMAL 1</option>
                <option value="SAĞMAL 2">SAĞMAL 2</option>
                <option value="QURUYA ÇIXANLAR">QURUYA ÇIXANLAR</option>
                <option value="BUZOVLAR">BUZOVLAR</option>
                <option value="DANALAR">DANALAR</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Save className="w-5 h-5" />
              Yadda Saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400">Yüklənir...</div>}>
      <EditAnimalForm params={params} />
    </Suspense>
  );
}
