'use client'

import { useState } from 'react'
import { UserCheck, UserX, Trash2, Mail, Plus, X, Shield, Lock, User } from 'lucide-react'
import { addTeamUser, deleteTeamUser, toggleTeamUserStatus } from '@/app/actions/team'

interface TeamMember {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  createdAt: Date
}

export default function TeamClient({ 
  initialTeam, 
  targetFarmId,
  isReadOnly = false 
}: { 
  initialTeam: TeamMember[], 
  targetFarmId?: string,
  isReadOnly?: boolean 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Fərma Komandası</h1>
          <p className="text-gray-500 mt-2 font-medium">İşçiləriniz üçün giriş hesablarını buradan idarə edin.</p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Yeni Üzv Əlavə Et
          </button>
        )}
      </header>

      <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">İstifadəçi</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                {!isReadOnly && <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Əməliyyatlar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialTeam.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                        {member.name?.[0] || member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{member.name || 'Adsız'}</div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-0.5">
                          <Mail className="w-3 h-3" /> {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      member.role === 'FARM_ADMIN' ? 'bg-blue-100 text-blue-600' : 
                      member.role === 'SUPER_ADMIN' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Shield className="w-3 h-3" /> {member.role === 'FARM_ADMIN' ? 'ADMIN' : member.role === 'SUPER_ADMIN' ? 'SUPER' : 'İŞÇİ'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {member.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                        <UserCheck className="w-3.5 h-3.5" /> Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                        <UserX className="w-3.5 h-3.5" /> Deaktiv
                      </span>
                    )}
                  </td>
                  {!isReadOnly && (
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleTeamUserStatus(member.id, member.isActive, targetFarmId)}
                          className={`p-2.5 rounded-xl transition-all shadow-sm border ${
                            member.isActive 
                              ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                          }`}
                        >
                          {member.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </button>
                        {member.role !== 'SUPER_ADMIN' && (
                          <button 
                            onClick={() => {
                              if (confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) {
                                deleteTeamUser(member.id, targetFarmId)
                              }
                            }}
                            className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all shadow-sm"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 relative overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Yeni Üzv</h3>
              <p className="text-gray-500 text-sm font-medium mt-1">İşçiniz üçün yeni giriş hesabı yaradın</p>
            </div>

            <form action={async (fd) => {
              setLoading(true)
              try {
                await addTeamUser(fd, targetFarmId)
                setIsModalOpen(false)
              } catch (e: any) {
                alert(e.message)
              } finally {
                setLoading(false)
              }
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ad Soyad</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input name="name" required placeholder="Məs: Murad Əliyev" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Ünvanı</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input name="email" type="email" required placeholder="misal@ferma.com" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Giriş Şifrəsi</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input name="password" type="password" required placeholder="********" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Rolu Seçin</label>
                <select name="role" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-gray-700">
                  <option value="FARM_USER">İşçi (Məhdud Giriş)</option>
                  <option value="FARM_ADMIN">Admin (Tam İcazə)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                {loading ? 'Yaradılır...' : 'Hesabı Yarat'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
