import Link from "next/link";
import { createAnimal } from "@/app/actions/herd";
import { ArrowLeft, Save } from "lucide-react";

export default function NewAnimalPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-4">
        <Link href="/herd" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Heyvan Əlavə Et</h1>
          <p className="text-gray-500 mt-1">Sistemə yeni heyvan qeydiyyatı</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={createAnimal} className="space-y-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Doğulduğu Tarix (Ad günü)</label>
              <input 
                type="date" 
                name="birthDate" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Son Doğuş Tarixi (Könüllü)</label>
              <input 
                type="date" 
                name="lastCalvingDate" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Son Doğulan Buzovun Məlumatları (Könüllü)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buzovun Bırka Nömrəsi</label>
                  <input 
                    type="text" 
                    name="calfTag" 
                    placeholder="Məs: AZ1001"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buzovun Cinsiyyəti</label>
                  <select 
                    name="calfGender" 
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="FEMALE">Dişi (Düyə)</option>
                    <option value="MALE">Erkək (Dana)</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-blue-600">Qeyd: Əgər buzov bırka nömrəsini yazsanız, sistem həmin buzovu da avtomatik yaradacaq.</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Ana Nömrəsi (Könüllü)</label>
              <input 
                type="text" 
                name="motherId" 
                placeholder="Ananın Bırka nömrəsi və ya ID-si"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ata / Toxum Kodu (Könüllü)</label>
              <input 
                type="text" 
                name="sireCode" 
                placeholder="Məs: DE09400"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Həyat Mərhələsi</label>
              <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500">
                Sistem daxil etdiyiniz <strong>Doğum Tarixinə</strong> əsasən heyvanın buzov, düyə və ya inək olduğunu avtomatik təyin edəcək.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
