import { getUsers, toggleUserStatus, deleteUser, updateFarmSubscription } from '@/app/actions/admin';
import { UserCheck, UserX, Trash2, Shield, Calendar, Mail, Eye, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect("/");
  }
  const users = await getUsers();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">SaaS İdarəetmə Paneli</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Bütün fərmaları, istifadəçiləri və abunəlikləri buradan idarə edin.</p>
        </div>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
           Cəmi Fərma: {new Set(users.map(u => u.farmId).filter(Boolean)).size}
        </div>
      </header>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">İstifadəçi & Fərma</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Giriş Statusu</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Abunəlik</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarix</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users
                .filter(u => u.role === 'FARM_ADMIN' || u.role === 'SUPER_ADMIN')
                .map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${
                        user.role === 'SUPER_ADMIN' ? 'bg-slate-900 text-white' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-gray-900 text-lg">{user.name || 'Adsız'}</span>
                          {user.role === 'SUPER_ADMIN' && (
                            <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase tracking-widest">
                              <Shield className="w-2.5 h-2.5" /> SUPER
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                            <Mail className="w-3.5 h-3.5" /> {user.email}
                          </div>
                          {user.farm && (
                            <div className="flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-tight bg-blue-50 w-fit px-3 py-1 rounded-xl border border-blue-100">
                               🚜 {user.farm.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <form action={async () => {
                      'use server'
                      await toggleUserStatus(user.id, user.isActive)
                    }}>
                      <button type="submit" className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all border ${
                        user.isActive 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                      }`}>
                        {user.isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        {user.isActive ? 'AKTİV' : 'GÖZLƏYİR'}
                      </button>
                    </form>
                  </td>
                  <td className="px-8 py-6">
                    {user.farm ? (
                      <div className="flex flex-col gap-2">
                        <form action={async () => {
                          'use server'
                          const nextStatus = user.farm!.subscriptionStatus === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE';
                          await updateFarmSubscription(user.farmId!, nextStatus);
                        }}>
                          <button type="submit" className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-widest ${
                            user.farm.subscriptionStatus === 'ACTIVE' 
                            ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-600/20' 
                            : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            <CreditCard className="w-3.5 h-3.5" />
                            {user.farm.subscriptionStatus}
                          </button>
                        </form>
                        {user.farm.subscriptionExpires && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                            <Clock className="w-3 h-3" /> {new Date(user.farm.subscriptionExpires).toLocaleDateString('az-AZ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 font-bold italic">Fərma yoxdur</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-tighter">
                      <Calendar className="w-4 h-4 text-gray-300" />
                      {new Date(user.createdAt).toLocaleDateString('az-AZ')}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/admin/users/${user.id}/view`}
                        className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-gray-100"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>

                      {user.role !== 'SUPER_ADMIN' && (
                        <form action={async () => {
                          'use server'
                          await deleteUser(user.id)
                        }}>
                          <button type="submit" className="p-3 rounded-2xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
