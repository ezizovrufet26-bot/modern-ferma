'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, Database } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email və ya şifrə yanlışdır.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Gözlənilməz bir xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 relative mx-auto mb-6 shadow-2xl shadow-blue-600/30 rotate-3 transform hover:rotate-0 transition-transform duration-500">
             <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 animate-pulse" />
             <img src="/app_icon.png" className="w-full h-full rounded-3xl object-cover relative z-10 border border-white/10" alt="Logo" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Modern<span className="text-blue-500">Ferma</span>
          </h1>
          <p className="text-slate-400 font-medium">Fermerlər üçün gələcəyin idarəetmə sistemi</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Ünvanı</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ferma@nümunə.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Şifrə</label>
                <a href="#" className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">Şifrəni unutmusuz?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Daxil Ol <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-4">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Hesabınız yoxdur?</p>
            <button 
              onClick={() => router.push('/register')}
              className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-[20px] font-black text-xs border border-white/10 transition-all active:scale-95"
            >
              YENİ HESAB YARAT
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          &copy; 2026 ModernFerma SaaS Solution
        </p>
      </div>
    </div>
  );
}
