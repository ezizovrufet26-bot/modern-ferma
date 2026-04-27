import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Settings, User, Bell, Shield, Smartphone, HardDrive, HelpCircle, HeartPulse, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Settings className="w-10 h-10 text-blue-600" />
          Daha Çox
        </h1>
        <p className="text-gray-500 mt-2 font-bold text-lg">Əsas menyuya sığmayan modullar və parametrlər.</p>
      </header>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Profile Section */}
        <div className="p-8 border-b border-gray-100 flex items-center gap-6 bg-slate-50">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-600/30">
            {session.user?.name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{session.user?.name || 'İstifadəçi'}</h2>
            <p className="text-gray-500 font-medium">{session.user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">
              {session.user?.role}
            </span>
          </div>
        </div>

        {/* Modules Section */}
        <div className="p-6 bg-amber-50/50 border-b border-amber-100/50">
           <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest ml-4 mb-4">Əlavə Modullar</h3>
           <div className="divide-y divide-gray-50 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <SettingItem icon={<DollarSign />} title="Maliyyə" description="Gəlir, xərc və büdcə analizi" href="/finance" color="text-emerald-600" bg="bg-emerald-50" />
             <SettingItem icon={<HeartPulse />} title="Sağlamlıq" description="Heyvan xəstəlikləri və müalicə qeydləri" href="/health" color="text-red-600" bg="bg-red-50" />
             <SettingItem icon={<Users />} title="Heyət" description="İşçi heyəti və vəzifələr" href="/staff" color="text-purple-600" bg="bg-purple-50" />
           </div>
        </div>

        {/* Settings Options */}
        <div className="p-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4 mb-4">Sistem Parametrləri</h3>
          <div className="divide-y divide-gray-50 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <SettingItem icon={<User />} title="Şəxsi Məlumatlar" description="Ad, soyad və profil şəklini yenilə" />
            <SettingItem icon={<Bell />} title="Bildirişlər" description="Tapşırıq və xəbərdarlıq tənzimləmələri" />
            <SettingItem icon={<Shield />} title="Təhlükəsizlik" description="Şifrəni dəyiş və iki mərhələli təsdiq" />
            <SettingItem icon={<Smartphone />} title="Cihazlar" description="Aktiv sessiyalar və daxil olan cihazlar" />
            <SettingItem icon={<HardDrive />} title="Məlumat Baza" description="Yedəkləmə (Backup) və export" />
            <SettingItem icon={<HelpCircle />} title="Dəstək" description="Sistem haqqında və istifadə qaydaları" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ icon, title, description, href, color, bg }: { icon: any, title: string, description: string, href?: string, color?: string, bg?: string }) {
  const content = (
    <div className="p-5 flex items-center gap-5 hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className={`p-4 rounded-2xl transition-colors ${color || 'text-gray-400 group-hover:text-blue-600'} ${bg || 'bg-gray-50 group-hover:bg-blue-100'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-black text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm font-medium">{description}</p>
      </div>
      <div className="text-gray-300 group-hover:text-blue-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}
