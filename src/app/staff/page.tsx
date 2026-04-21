import { getStaff, deleteStaff, createStaff } from "@/app/actions/staff";
import { UserPlus, Trash2, Phone, Briefcase, User } from "lucide-react";
import Link from "next/link";

export default async function StaffPage() {
  const staffMembers = await getStaff();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Heyət və Həkimlər</h1>
          <p className="text-gray-500 mt-1 font-medium">Süni mayalanma, baytarlıq və digər personal</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
          Geri Qayıt
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ADD STAFF FORM */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" /> Yeni İşçi Əlavə Et
          </h2>
          <form action={createStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input type="text" name="name" required placeholder="Məs: Əli Rzayev" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vəzifə</label>
              <select name="role" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                <option value="BAS_HEKIM">Baş Həkim</option>
                <option value="HEKIM">Həkim</option>
                <option value="TEXNIK">Süni Mayalanma Texniki</option>
                <option value="ISCI">Fəhlə / İşçi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (Könüllü)</label>
              <input type="text" name="phone" placeholder="+994 50 000 00 00" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
              Əlavə Et
            </button>
          </form>
        </div>

        {/* STAFF LIST */}
        <div className="md:col-span-2 space-y-4">
          {staffMembers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center text-gray-400">
              <User className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-500">Hələ heç bir işçi əlavə edilməyib.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staffMembers.map(staff => (
                <div key={staff.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{staff.name}</h3>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                          {staff.role === 'BAS_HEKIM' ? 'Baş Həkim' : 
                           staff.role === 'HEKIM' ? 'Həkim' : 
                           staff.role === 'TEXNIK' ? 'Mayalanma Texniki' : 'İşçi'}
                        </span>
                      </div>
                    </div>
                    <form action={async () => {
                      "use server";
                      await deleteStaff(staff.id);
                    }}>
                      <button type="submit" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                  {staff.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-gray-50 pt-3">
                      <Phone className="w-4 h-4" /> {staff.phone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
