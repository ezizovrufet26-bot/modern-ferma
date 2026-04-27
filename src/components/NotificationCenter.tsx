'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Syringe, Baby, HeartPulse, Wheat, Activity, ArrowRight, X, CalendarCheck } from 'lucide-react';
import type { TaskItem } from '@/lib/task-engine';
import Link from 'next/link';

export default function NotificationCenter({ tasks }: { tasks: TaskItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = tasks.length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'VACCINE': return <Syringe className="w-4 h-4 text-emerald-500" />;
      case 'CALVING': return <Baby className="w-4 h-4 text-purple-500" />;
      case 'REPRO': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'HEALTH': return <HeartPulse className="w-4 h-4 text-red-500" />;
      case 'FEED': return <Wheat className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-l-red-500 bg-red-50/50';
      case 'MEDIUM': return 'border-l-amber-500 bg-amber-50/50';
      case 'LOW': return 'border-l-blue-500 bg-blue-50/50';
      default: return 'border-l-gray-200 bg-white';
    }
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl shadow-sm transition-all group"
      >
        <Bell className="w-6 h-6 text-gray-700 group-hover:text-amber-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:mt-4 sm:w-96 bg-white rounded-[32px] shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-amber-400" />
                    Tapşırıqlar
                  </h3>
                  <p className="text-slate-400 text-xs font-bold mt-1">Avtomatik bildiriş mərkəzi</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                {tasks.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="font-bold text-gray-900">Hər şey qaydasındadır!</p>
                    <p className="text-xs text-gray-500 mt-1">Yaxın günlərdə heç bir kritik tapşırıq yoxdur.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <Link href={task.link || '#'} key={task.id} onClick={() => setIsOpen(false)}>
                        <div className={`p-4 rounded-2xl border-l-4 transition-all hover:shadow-md cursor-pointer flex gap-4 items-start ${getPriorityColor(task.priority)}`}>
                          <div className="mt-1 bg-white p-2 rounded-xl shadow-sm">
                            {getIcon(task.type)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{task.title}</h4>
                            <p className="text-xs text-gray-600 font-medium mb-2 leading-relaxed">{task.description}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                              {task.dueDate.toLocaleDateString('az-AZ')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {tasks.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cəmi {tasks.length} aktiv tapşırıq</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
