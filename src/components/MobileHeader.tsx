'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function MobileHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()

  // Don't show on dashboard or login/register
  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null

  const getTitle = () => {
    if (pathname.includes('/herd')) return t.herdManagement
    if (pathname.includes('/milk')) return t.milkYield || t.milk
    if (pathname.includes('/feeding')) return t.feeding
    if (pathname.includes('/health')) return t.health
    if (pathname.includes('/finance')) return t.finance
    if (pathname.includes('/staff')) return t.staff
    if (pathname.includes('/settings')) return t.settings
    return t.back
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
