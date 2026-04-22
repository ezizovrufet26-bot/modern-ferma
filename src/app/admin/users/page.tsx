import { getUsers, toggleUserStatus, deleteUser } from '@/app/actions/admin';
import { UserCheck, UserX, Trash2, Shield, Calendar, Mail, Eye } from 'lucide-react';
import Link from 'next/link';

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">İstifadəçilərin İdarə Edilməsi</h1>
        <p className="text-gray-500 mt-2 font-medium">Qeydiyyatdan keçən müştəriləri buradan təsdiqləyə və ya ləğv edə bilərsiniz.</p>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">İstifadəçi</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qeydiyyat Tarixi</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{user.name || 'Adsız İstifadəçi'}</span>
                          {user.role === 'ADMIN' && (
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                              <Shield className="w-2.5 h-2.5" /> ADMIN
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                        <UserCheck className="w-3.5 h-3.5" /> Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                        <UserX className="w-3.5 h-3.5" /> Gözləyir
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(user.createdAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/users/${user.id}/view`}
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all shadow-sm"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>

                      <form action={async () => {
                        'use server'
                        await toggleUserStatus(user.id, user.isActive)
                      }}>
                        <button className={`p-2.5 rounded-xl transition-all shadow-sm border ${
                          user.isActive 
                            ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                        }`}>
                          {user.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </button>
                      </form>
                      
                      {user.role !== 'ADMIN' && (
                        <form action={async () => {
                          'use server'
                          await deleteUser(user.id)
                        }}>
                          <button className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all shadow-sm">
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
