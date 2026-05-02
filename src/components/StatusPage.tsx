import { ArrowLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function StatusPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const userInitial = (user?.username || 'Me').charAt(0).toUpperCase();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [localStatuses, setLocalStatuses] = useState<any[]>([]);

  // Auto-advance logic
  useEffect(() => {
    if (activeIndex === null) return;
    const timer = setTimeout(() => {
      if (activeIndex < localStatuses.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else {
        setActiveIndex(null); // Close viewer when done
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeIndex, localStatuses.length]);

  return (
    <div className="h-full flex flex-col bg-[#f0f2f5] dark:bg-[#0b141a]">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-4 px-4 h-[60px] bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#182229] rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">Status</h1>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* ── My Status ──────────────────────────────────────────────────── */}
        <div 
          className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors mt-2"
          onClick={() => document.getElementById('status-upload')?.click()}
        >
          <input 
            type="file" 
            id="status-upload" 
            hidden 
            accept="image/*" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    // Prepend to statuses
                    setLocalStatuses(prev => [
                      {
                        id: Date.now(),
                        name: 'My Status',
                        time: 'Just now',
                        img: event.target!.result as string,
                        initial: 'M'
                      },
                      ...prev
                    ]);
                  }
                };
                reader.readAsDataURL(e.target.files[0]);
              }
            }} 
          />
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#25d366]/60"
              style={{ background: '#00a884' }}
            >
              <span className="text-[18px] font-bold text-white select-none">{userInitial}</span>
            </div>
            <div className="absolute bottom-0 right-0 bg-[#00a884] rounded-full border-2 border-white dark:border-[#111b21] p-0.5">
              <Plus size={14} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-medium text-gray-900 dark:text-[#e9edef]">My status</h2>
            <p className="text-[14px] text-gray-500 dark:text-[#8696a0]">Click to add status update</p>
          </div>
        </div>

        <div className="px-4 py-2 mt-2">
          <h3 className="text-[14px] font-medium text-[#008069] dark:text-[#00a884] uppercase tracking-wide">Recent updates</h3>
        </div>

        <div className="flex flex-col">
          {localStatuses.map((status, index) => (
            <motion.div
              key={status.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveIndex(index)}
              className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors"
            >
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 to-emerald-500">
                {status.img ? (
                  <img src={status.img} alt={status.name} className="w-full h-full rounded-full border-2 border-white dark:border-[#111b21] object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-white dark:border-[#111b21] flex items-center justify-center" style={{ background: '#00a884' }}>
                    <span className="text-[16px] font-bold text-white select-none">{(status.name || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-3">
                <h2 className="text-[16px] font-medium text-gray-900 dark:text-[#e9edef] mt-2">{status.name}</h2>
                <p className="text-[14px] text-gray-500 dark:text-[#8696a0]">{status.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Fullscreen Status Viewer ──────────────────────────────────────── */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <style>{`#bottom-nav-bar { display: none !important; }`}</style>
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 w-full flex gap-1 p-2 pt-6 z-20 px-2">
              {localStatuses.map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  {i === activeIndex && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      className="h-full bg-white"
                    />
                  )}
                  {i < activeIndex && <div className="h-full bg-white w-full" />}
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-10 left-0 w-full flex items-center gap-3 px-4 z-20 drop-shadow-md">
              <button onClick={() => setActiveIndex(null)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors -ml-2">
                <ArrowLeft size={24} />
              </button>
              <img src={localStatuses[activeIndex].avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h2 className="text-white font-medium shadow-black drop-shadow-md text-[16px]">{localStatuses[activeIndex].name}</h2>
                <p className="text-white/90 text-[13px] drop-shadow-md">{localStatuses[activeIndex].time}</p>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden bg-[#111]">
              <img 
                src={localStatuses[activeIndex].img} 
                className="w-full h-full object-contain" 
                alt="Status Content" 
              />
            </div>
            
            {/* Invisible Tap Zones for Navigation */}
            <div className="absolute inset-0 flex z-10 pt-24">
              <div 
                className="flex-[1] cursor-pointer" 
                onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev! > 0 ? prev! - 1 : prev); }} 
              />
              <div 
                className="flex-[2] cursor-pointer" 
                onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev! < localStatuses.length - 1 ? prev! + 1 : null); }} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
