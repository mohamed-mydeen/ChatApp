import { ArrowLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function StatusPage({ onBack }: { onBack: () => void }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const statuses = [
    { id: 1, name: 'Alice Smith', time: 'Today, 10:45 AM', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'John Doe', time: 'Today, 8:12 AM', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Charlie', time: 'Yesterday, 11:30 PM', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80', avatar: 'https://i.pravatar.cc/150?u=3' },
  ];

  // Auto-advance logic
  useEffect(() => {
    if (activeIndex === null) return;
    const timer = setTimeout(() => {
      if (activeIndex < statuses.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else {
        setActiveIndex(null); // Close viewer when done
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeIndex, statuses.length]);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#111b21]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 h-[108px] bg-[#008069] dark:bg-[#202c33] text-white flex-shrink-0 pt-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors -ml-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[19px] font-medium">Status</h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* ── My Status ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors mt-2">
          <div className="relative">
            <img src="https://i.pravatar.cc/150?img=68" alt="My Status" className="w-12 h-12 rounded-full object-cover" />
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
          {statuses.map((status, index) => (
            <motion.div
              key={status.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveIndex(index)}
              className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors"
            >
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 to-emerald-500">
                <img src={status.avatar} alt={status.name} className="w-full h-full rounded-full border-2 border-white dark:border-[#111b21] object-cover" />
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
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 w-full flex gap-1 p-2 pt-6 z-20 px-2">
              {statuses.map((_, i) => (
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
              <img src={statuses[activeIndex].avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h2 className="text-white font-medium shadow-black drop-shadow-md text-[16px]">{statuses[activeIndex].name}</h2>
                <p className="text-white/90 text-[13px] drop-shadow-md">{statuses[activeIndex].time}</p>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden bg-[#111]">
              <img 
                src={statuses[activeIndex].img} 
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
                onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev! < statuses.length - 1 ? prev! + 1 : null); }} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
