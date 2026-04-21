import Link from "next/link";
import { updateAnimal, getAnimal } from "@/app/actions/herd";
import { ArrowLeft, Save } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const animal = await getAnimal(resolvedParams.id);
  
  if (!animal) {
    notFound();
  }

  const updateAnimalWithId = updateAnimal.bind(null, animal.id);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-4">
        <Link href="/herd" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Heyvana Düzəliş Et</h1>
          <p className="text-gray-500 mt-1">{animal.tagNumber} nömrəli heyvanın məlumatları</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={updateAnimalWithId} className="space-y-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Doğulduğu Tarix (Ad günü)</label>
              <input 
                type="date" 
                name="birthDate" 
                defaultValue={animal.birthDate ? new Date(animal.birthDate).toISOString().split('T')[0] : ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Son Doğuş Tarixi (Könüllü)</label>
              <input 
                type="date" 
                name="lastCalvingDate" 
                defaultValue={(animal as any).calvingRecords && (animal as any).calvingRecords.length > 0 ? new Date((animal as any).calvingRecords[0].date).toISOString().split('T')[0] : ''}
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
                <option value="FEMALE">Dişi (İnək / Düyə / Dişi Buzov)</option>
                <option value="MALE">Erkək (Tosun / Dana / Erkək Buzov)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ana Nömrəsi (Könüllü)</label>
              <input 
                type="text" 
                name="motherId" 
                defaultValue={animal.motherId || ""}
                placeholder="Ananın Bırka nömrəsi və ya ID-si"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ata / Toxum Kodu (Könüllü)</label>
              <input 
                type="text" 
                name="sireCode" 
                defaultValue={animal.sireCode || ""}
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

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link 
              href="/herd" 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Ləğv Et
            </Link>
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
