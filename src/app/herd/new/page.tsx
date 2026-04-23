'use client';

import Link from "next/link";
import { addAnimal } from "@/app/actions/herd";
import { ArrowLeft, Save } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Suspense } from "react";

function NewAnimalForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUserId = searchParams.get('userId');

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-4">
        <Link href={targetUserId ? `/admin/users/${targetUserId}/view` : "/herd"} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Heyvan Əlavə Et</h1>
          <p className="text-gray-500 mt-1">{targetUserId ? `Müştəri #${targetUserId} üçün qeydiyyat` : "Sistemə yeni heyvan qeydiyyatı"}</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={async (formData) => {
          await addAnimal(formData, targetUserId || undefined);
          router.push(targetUserId ? `/admin/users/${targetUserId}/view` : "/herd");
        }} className="space-y-6">
          
          <input type="hidden" name="targetUserId" value={targetUserId || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bırka Nömrəsi (Tag) *</label>
              <input 
                type="text" 
                name="tagNumber" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Məsələn: AZ-12345"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adı (İstəyə bağlı)</label>
              <input 
                type="text" 
                name="name" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Məsələn: Şokolad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cinsi</label>
              <input 
                type="text" 
                name="breed" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Məsələn: Holştayn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doğulduğu Tarix</label>
              <input 
                type="date" 
                name="birthDate" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyyət</label>
              <select 
                name="gender" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="FEMALE">Dişi (İnək / Düyə / Dişi Buzov)</option>
                <option value="MALE">Erkək (Tosun / Dana / Erkək Buzov)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qrup</label>
              <select 
                name="groupName" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="SAĞMAL 1">SAĞMAL 1</option>
                <option value="SAĞMAL 2">SAĞMAL 2</option>
                <option value="QURUYA ÇIXANLAR">QURUYA ÇIXANLAR</option>
                <option value="BUZOVLAR">BUZOVLAR</option>
                <option value="DANALAR">DANALAR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ana Nömrəsi (Könüllü)</label>
              <input 
                type="text" 
                name="motherId" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ata / Toxum Kodu</label>
              <input 
                type="text" 
                name="sireCode" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-gray-100">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Sonuncu Doğum Məlumatları (Opsional)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sonuncu Doğum Tarixi</label>
                    <input 
                      type="date" 
                      name="lastCalvingDate" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buzovun Bırka Nömrəsi</label>
                    <input 
                      type="text" 
                      name="calfTag" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Məsələn: AZ-54321"
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
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

export default function NewAnimalPage() {
  return (
    <Suspense fallback={<div>Yüklənir...</div>}>
      <NewAnimalForm />
    </Suspense>
  );
}
