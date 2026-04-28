'use client'

import { UserPlus, Trash2, Phone, User, Loader2, Banknote } from "lucide-react";
import { useState } from "react";
import { useI18n } from '@/lib/i18n';

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  salary?: number | null;
}

export default function StaffClient({ 
  initialStaff, 
  createAction, 
  deleteAction,
  targetFarmId 
}: { 
  initialStaff: Staff[],
  createAction: (formData: FormData, targetFarmId?: string) => Promise<void>,
  deleteAction: (id: string, targetFarmId?: string) => Promise<void>,
  targetFarmId?: string
}) {
  const { t } = useI18n();
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD STAFF FORM */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-blue-500/5 border border-gray-100 p-8 h-fit">
          <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            {t.add} {t.staff}
          </h2>
          <form 
            action={async (formData) => {
              setIsPending(true);
              try {
                await createAction(formData, targetFarmId);
              } finally {
                setIsPending(false);
              }
            }} 
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.name}</label>
              <input type="text" name="name" required placeholder={t.exampleName} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.position}</label>
              <select name="role" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm appearance-none">
                <option value="BAS_HEKIM">{t.headVet}</option>
                <option value="HEKIM">{t.vet}</option>
                <option value="TEXNIK">{t.aiTech}</option>
                <option value="ISCI">{t.worker}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.phone}</label>
              <input type="text" name="phone" placeholder="+994 50 000 00 00" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.salary}</label>
              <input type="number" step="0.01" name="salary" placeholder={t.exampleSalary} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm" />
            </div>
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t.add}
            </button>
          </form>
        </div>

        {/* STAFF LIST */}
        <div className="lg:col-span-2 space-y-4">
          {initialStaff.length === 0 ? (
            <div className="bg-white rounded-[32px] shadow-sm border border-dashed border-gray-200 p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center mb-6">
                <User className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{t.noData}</h3>
              <p className="text-gray-500 mt-2 font-medium">{t.noStaffAdded}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {initialStaff.map(staff => (
                <div key={staff.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 flex flex-col relative group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 leading-tight text-lg">{staff.name}</h3>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 inline-block uppercase tracking-wider">
                          {staff.role === 'BAS_HEKIM' ? t.headVet : 
                           staff.role === 'HEKIM' ? t.vet : 
                           staff.role === 'TEXNIK' ? t.aiTech : t.worker}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (confirm(t.deleteConfirm)) {
                           await deleteAction(staff.id, targetFarmId);
                        }
                      }}
                      className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {staff.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-500 border-t border-gray-50 pt-4 mt-2 font-bold">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      {staff.phone}
                    </div>
                  )}
                  {staff.salary !== undefined && staff.salary !== null && (
                    <div className="flex items-center gap-3 text-sm text-emerald-600 border-t border-gray-50 pt-3 mt-2 font-black">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                      {t.salaryText} ₼ {staff.salary.toLocaleString()}
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
