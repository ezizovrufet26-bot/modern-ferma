import { Stethoscope } from "lucide-react";

export default function HealthPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sağlamlıq və Çoxalma</h1>
        <p className="text-gray-500 mt-2">Süni mayalanma, doğuş və müalicə qeydləri</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
          <Stethoscope className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sağlamlıq Modulu Tezliklə!</h2>
        <p className="text-gray-500 max-w-md">
          Baytar yoxlamaları, peyvənd tarixləri və inəklərin çoxalma dövrlərini burada izləyin.
        </p>
      </div>
    </div>
  );
}
