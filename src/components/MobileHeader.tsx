'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function MobileHeader() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on dashboard or login/register
  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null

  const getTitle = () => {
    if (pathname.includes('/herd')) return 'Sürü İdarəetmə'
    if (pathname.includes('/milk')) return 'Süd Verimi'
    if (pathname.includes('/feeding')) return 'Yemləmə'
    if (pathname.includes('/health')) return 'Sağlamlıq'
    if (pathname.includes('/finance')) return 'Maliyyə'
    if (pathname.includes('/staff')) return 'Heyət'
    if (pathname.includes('/settings')) return 'Ayarlar'
    return 'Geri Qayıt'
  }

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <button 
        onClick={() => router.back()}
        className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 border border-gray-100 active:scale-90 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest">{getTitle()}</h1>
      <div className="w-10" /> {/* Spacer */}
    </header>
  )
}
