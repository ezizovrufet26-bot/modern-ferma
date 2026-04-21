import { Wallet } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Maliyyə və Anbar</h1>
        <p className="text-gray-500 mt-2">Gəlir, xərc və yem ehtiyatlarının idarəedilməsi</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Maliyyə Modulu Tezliklə!</h2>
        <p className="text-gray-500 max-w-md">
          Burada fermanın büdcəsini, satılan süd gəlirlərini və baytar/yem xərclərini hesablaya biləcəksiniz.
        </p>
      </div>
    </div>
  );
}
