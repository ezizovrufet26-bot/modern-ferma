'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, ChevronRight, Syringe, Baby, HeartPulse, Wheat, Activity } from 'lucide-react';
import type { TaskItem } from '@/lib/task-engine';
import Link from 'next/link';

export default function TaskWidget({ tasks }: { tasks: TaskItem[] }) {
  // Yalnız təcili və bu gün/sabah olan tapşırıqları göstərək
  const urgentTasks = tasks
    .filter(t => t.priority === 'HIGH' || t.dueDate <= new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000))
    .slice(0, 4);

  const getIcon = (type: string) => {
    switch (type) {
      case 'VACCINE': return <Syringe className="w-5 h-5 text-emerald-500" />;
      case 'CALVING': return <Baby className="w-5 h-5 text-purple-500" />;
      case 'REPRO': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'HEALTH': return <HeartPulse className="w-5 h-5 text-red-500" />;
      case 'FEED': return <Wheat className="w-5 h-5 text-amber-500" />;
      default: return <CalendarCheck className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 group-hover:rotate-45 transition-transform duration-700">
        <CalendarCheck className="w-40 h-40 text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Günün Tapşırıqları
            </h3>
            <p className="text-slate-400 text-sm mt-1 font-medium">Təcili diqqət tələb edən işlər</p>
          </div>
          {tasks.length > 0 && (
             <span className="bg-white/10 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest backdrop-blur-md">
               Cəmi {tasks.length}
             </span>
          )}
        </div>

        {urgentTasks.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-white font-bold text-lg">Əla xəbər!</p>
            <p className="text-slate-400 text-sm">Gözlənilən təcili tapşırıq yoxdur.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {urgentTasks.map(task => (
              <Link href={task.link || '#'} key={task.id}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-3xl p-6 transition-all cursor-pointer h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-white p-2.5 rounded-2xl shadow-lg">
                        {getIcon(task.type)}
                      </div>
                      {task.priority === 'HIGH' && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-red-500 text-white px-2 py-1 rounded-lg">
                          Təcili
                        </span>
                      )}
                    </div>
                    <h4 className="text-white font-bold text-sm leading-snug mb-2">{task.title}</h4>
                    <p className="text-slate-300 text-xs line-clamp-2">{task.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">
                      {task.dueDate.toLocaleDateString('az-AZ')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
