import { X, Bell, Image as ImageIcon, ChevronRight, Ban, ThumbsDown, Edit2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ContactInfoPaneProps {
  contactName: string;
  chatId: string;
  onClose: () => void;
}

export default function ContactInfoPane({ contactName, chatId, onClose }: ContactInfoPaneProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState("Hey there! I am using this secure chat app.");

  const handleBlock = () => {
    if (window.confirm(`Are you sure you want to block ${contactName}? They will no longer be able to message you.`)) {
      alert(`${contactName} has been blocked.`);
    }
  };

  const handleReport = () => {
    if (window.confirm(`Report ${contactName} to the admins? This action cannot be undone.`)) {
      alert(`${contactName} has been reported.`);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 w-full md:w-[350px] lg:w-[400px] h-full bg-[#f0f2f5] dark:bg-[#111b21] z-40 flex flex-col border-l border-gray-200 dark:border-gray-800 shadow-2xl md:shadow-none"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 px-5 h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800 flex-shrink-0 text-gray-600 dark:text-[#aebac1]">
        <button onClick={onClose} className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors -ml-2">
          <X size={24} />
        </button>
        <h2 className="font-medium text-[16px] text-gray-900 dark:text-[#e9edef]">Contact info</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* ── Profile Section ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#111b21] flex flex-col items-center py-8 shadow-sm">
          {/* Initials avatar – no dummy image */}
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center border-4 border-white dark:border-[#202c33] shadow-md"
            style={{ background: '#00a884' }}
          >
            <span className="text-[64px] font-bold text-white uppercase select-none">
              {contactName?.charAt(0)}
            </span>
          </div>
          <h2 className="mt-4 text-[22px] font-medium text-gray-900 dark:text-[#e9edef]">{contactName}</h2>
          <p className="text-[15px] text-gray-500 dark:text-[#8696a0] mt-1">Available</p>
        </div>

        {/* ── About Section ──────────────────────────────────────────────── */}
        <div className="mt-2 bg-white dark:bg-[#111b21] py-4 px-6 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[14px] text-emerald-600 dark:text-emerald-400">About</h3>
            <button 
              onClick={() => setIsEditingAbout(!isEditingAbout)} 
              className="text-gray-400 hover:text-emerald-600 transition-colors"
            >
              {isEditingAbout ? <Check size={18} /> : <Edit2 size={18} />}
            </button>
          </div>
          {isEditingAbout ? (
            <input 
              autoFocus
              className="w-full text-[16px] text-gray-900 dark:text-[#e9edef] bg-gray-50 dark:bg-[#202c33] border-b-2 border-emerald-500 outline-none px-2 py-1"
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingAbout(false)}
            />
          ) : (
            <p className="text-[16px] text-gray-900 dark:text-[#e9edef]">{aboutText}</p>
          )}
        </div>

        {/* ── Media, Links, and Docs ─────────────────────────────────────── */}
        <div className="mt-2 bg-white dark:bg-[#111b21] py-4 px-6 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors flex items-center justify-between group">
          <div>
            <h3 className="text-[15px] text-gray-900 dark:text-[#e9edef] mb-1">Media, links, and docs</h3>
            <div className="flex gap-2 mt-3">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center text-gray-400">
                <ImageIcon size={24} />
              </div>
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center text-gray-400">
                <ImageIcon size={24} />
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600" />
        </div>

        {/* ── Options ────────────────────────────────────────────────────── */}
        <div className="mt-2 bg-white dark:bg-[#111b21] shadow-sm flex flex-col py-2">
          <div 
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors"
          >
            <div className="flex items-center gap-4 text-gray-900 dark:text-[#e9edef]">
              <Bell size={20} className="text-gray-500 dark:text-[#8696a0]" />
              <span className="text-[16px]">Mute notifications</span>
            </div>
            {/* Toggle switch */}
            <div className={`w-9 h-5 rounded-full relative transition-colors ${isMuted ? 'bg-[#00a884]' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <motion.div 
                animate={{ x: isMuted ? 16 : 2 }}
                className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Danger Zone ────────────────────────────────────────────────── */}
        <div className="mt-2 bg-white dark:bg-[#111b21] shadow-sm flex flex-col py-2 mb-8">
          <div onClick={handleBlock} className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors text-red-500">
            <Ban size={20} />
            <span className="text-[16px]">Block {contactName}</span>
          </div>
          <div onClick={handleReport} className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors text-red-500">
            <ThumbsDown size={20} />
            <span className="text-[16px]">Report {contactName}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
