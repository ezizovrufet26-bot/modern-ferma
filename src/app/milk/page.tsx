import { Droplets } from "lucide-react";

export default function MilkPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Süd İstehsalı</h1>
        <p className="text-gray-500 mt-2">Gündəlik sağım və süd verimi qeydiyyatı</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Droplets className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Süd İzləmə Modulu Tezliklə!</h2>
        <p className="text-gray-500 max-w-md">
          Siz inəklərinizin səhər və axşam sağım nəticələrini burada qeyd edib ümumi performansı qrafiklərlə görə biləcəksiniz.
        </p>
        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          + Yeni Qeydiyyat (Test)
        </button>
      </div>
    </div>
  );
}
