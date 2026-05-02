import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Edit2, Check, X } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } }
};

export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const { user, logout } = useAuth();
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState("Available • Battery saving mode");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Interactive settings states
  const [theme, setTheme] = useState("System Default");
  const [tonesEnabled, setTonesEnabled] = useState(true);
  const NOTIFICATION_TONES = [
    "Default (note.mp3)",
    "Aurora",
    "Bamboo",
    "Chord",
    "Circles",
    "Complete",
    "Hello",
    "Keys",
    "Popcorn",
    "Pulse"
  ];
  const [currentTone, setCurrentTone] = useState(NOTIFICATION_TONES[0]);

  const WALLPAPERS = [
    "WhatsApp Doodle",
    "Solid Dark",
    "Solid Light",
    "Ocean Blue",
    "Forest Green",
    "Sunset Orange",
    "Midnight Black",
    "Custom Image"
  ];
  const [currentWallpaper, setCurrentWallpaper] = useState(WALLPAPERS[0]);

  const handleSettingClick = (title: string) => {
    setActiveModal(title);
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case "Account":
        return (
          <div className="flex flex-col text-left">
            <div onClick={() => alert("Privacy settings are currently managed globally.")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">lock</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Privacy</p>
                <p className="text-xs text-gray-500">Last seen, profile photo, about</p>
              </div>
            </div>
            <div onClick={() => alert("Your chats are secured with end-to-end encryption.")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">security</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Security</p>
                <p className="text-xs text-gray-500">Show security notifications on this device</p>
              </div>
            </div>
            <div onClick={() => alert("Changing numbers requires verifying your new phone number via SMS.")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">sim_card</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Change Number</p>
              </div>
            </div>
          </div>
        );
      case "Chats":
        return (
          <div className="flex flex-col text-left">
            <div 
              onClick={() => {
                const themes = ["Light", "Dark", "System Default"];
                const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
                setTheme(nextTheme);
              }}
              className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-500">palette</span>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Theme</p>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{theme}</p>
            </div>
            <div 
              onClick={() => {
                const nextIndex = (WALLPAPERS.indexOf(currentWallpaper) + 1) % WALLPAPERS.length;
                const newWallpaper = WALLPAPERS[nextIndex];
                setCurrentWallpaper(newWallpaper);
                localStorage.setItem('chatWallpaper', newWallpaper);
                window.dispatchEvent(new Event('wallpaperChanged'));
              }} 
              className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-500">wallpaper</span>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Wallpaper</p>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{currentWallpaper}</p>
            </div>
            <div onClick={() => alert("Starting backup process to secure cloud storage...")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">cloud_upload</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Chat backup</p>
                <p className="text-xs text-gray-500">Last backup: Just now</p>
              </div>
            </div>
          </div>
        );
      case "Notifications":
        return (
          <div className="flex flex-col text-left">
            <div onClick={() => setTonesEnabled(!tonesEnabled)} className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-500">volume_up</span>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Conversation tones</p>
              </div>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${tonesEnabled ? 'bg-[#00a884]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <motion.div 
                  animate={{ x: tonesEnabled ? 16 : 2 }}
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm"
                />
              </div>
            </div>
            <div 
              onClick={() => {
                const nextIndex = (NOTIFICATION_TONES.indexOf(currentTone) + 1) % NOTIFICATION_TONES.length;
                setCurrentTone(NOTIFICATION_TONES[nextIndex]);
                
                // Play a synthesized tone so the user actually hears a difference!
                try {
                  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                  const ctx = new AudioContextClass();
                  const osc = ctx.createOscillator();
                  const gainNode = ctx.createGain();

                  osc.connect(gainNode);
                  gainNode.connect(ctx.destination);

                  // Create a unique sound profile based on the index
                  const baseFreq = 400 + (nextIndex * 80);
                  osc.type = nextIndex % 2 === 0 ? 'sine' : 'triangle';
                  
                  // Add a little melody for certain tones
                  osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
                  if (nextIndex % 3 === 0) {
                    osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.1);
                  }

                  // Fade out quickly for a "notification" style pop
                  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

                  osc.start(ctx.currentTime);
                  osc.stop(ctx.currentTime + 0.3);
                } catch (e) {
                  console.log("Audio not supported or blocked");
                }
              }} 
              className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-500">notifications</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Notification tone</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{currentTone}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "Storage and Data":
        return (
          <div className="flex flex-col text-left">
            <div onClick={() => alert("Cleaning up cached media...")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">folder_open</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Manage storage</p>
                <p className="text-xs text-gray-500">1.2 GB used</p>
              </div>
            </div>
            <div onClick={() => alert("Generating network usage report...")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">data_usage</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Network usage</p>
                <p className="text-xs text-gray-500">450 MB sent • 1.1 GB received</p>
              </div>
            </div>
          </div>
        );
      case "Help":
        return (
          <div className="flex flex-col text-left">
            <div onClick={() => window.open("https://github.com")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">help_center</span>
              <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Help Center</p>
            </div>
            <div onClick={() => alert("Please email support@feastatnight.com")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">group</span>
              <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">Contact Us</p>
            </div>
            <div onClick={() => alert("Feast At Night v1.0.0. All systems operational.")} className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] rounded transition-colors">
              <span className="material-symbols-outlined text-gray-500">info</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e9edef]">App info</p>
                <p className="text-xs text-gray-500">Version 1.0.0</p>
              </div>
            </div>
          </div>
        );
      case "QR Code":
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-48 h-48 bg-white border-4 border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center p-2 mb-4">
               <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center">
                 <span className="font-bold text-gray-400 tracking-widest">QR CODE</span>
               </div>
            </div>
            <p className="text-sm text-gray-900 dark:text-[#e9edef] font-medium">Scan this code to add me</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-background dark:bg-[#0a1014] text-on-background dark:text-[#e9edef] h-full overflow-y-auto pb-24 selection:bg-primary-container selection:text-on-primary-container custom-scrollbar">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-4 py-3 w-full sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </button>
        <h1 className="font-sans text-lg font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">Connect</h1>
        <button className="text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="max-w-3xl mx-auto px-container-padding pt-6">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
          
          {/* Profile Header Bento Card */}
          <motion.section variants={itemVariants} className="bg-surface-container-lowest dark:bg-[#111b21] rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-outline-variant/40 dark:border-gray-800 flex items-center gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative">
              <img 
                className="w-20 h-20 rounded-full object-cover border-4 border-surface dark:border-gray-800 shadow-sm" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaMuzFl0Q9iH84P_XGoFhNkc-MxvfRprBqP4DKFeYdePL9I-IhH44K4B8VcPkIla8BKlAw2q5ktOS989IzUNndjBcbp1UDvgUNWLXEnnV5aDCJqxUlysR3EFzgFJoIBXXvjcVt5UuUTbZNHdiWDXhxkik1X7hadRAMbqvCpeGSSohbPe9m7RpdbSoExu_GK0XZqQdaS4EaN3ZX06RiKmR4BAZE3tNL-4j4AywXLnEOfJXI17qd7bQiktEHbM-S1cjqAxARyKEMgp0" 
                alt="Profile" 
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#22C55E] rounded-full border-2 border-surface-container-lowest dark:border-[#111b21]"></div>
            </div>
            <div className="flex-1 z-10">
              <h2 className="font-h1 text-h1 text-on-surface dark:text-[#e9edef] mb-0.5">{user?.username || 'User'}</h2>
              
              <div className="flex items-center gap-2 mb-2 group/edit">
                {isEditingAbout ? (
                  <input 
                    autoFocus
                    className="w-full text-sm text-gray-900 dark:text-[#e9edef] bg-gray-50 dark:bg-[#202c33] border-b-2 border-emerald-500 outline-none px-2 py-1"
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingAbout(false)}
                  />
                ) : (
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-gray-400 line-clamp-1">{aboutText}</p>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingAbout(!isEditingAbout); }} 
                  className="text-gray-400 hover:text-emerald-600 transition-colors opacity-0 group-hover/edit:opacity-100"
                >
                  {isEditingAbout ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
              </div>

              <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md inline-block">
                ID: {user?.uniqueId || user?.id || user?._id}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container dark:bg-gray-800 flex items-center justify-center text-primary dark:text-emerald-400 z-10 hover:bg-surface-container-high transition-colors" onClick={(e) => { e.stopPropagation(); handleSettingClick("QR Code"); }}>
              <span className="material-symbols-outlined">qr_code</span>
            </div>
          </motion.section>

          {/* Settings Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <motion.button onClick={() => handleSettingClick("Account")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} variants={itemVariants} className="bg-surface-container-lowest dark:bg-[#111b21] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-outline-variant/30 dark:border-gray-800 flex items-start gap-4 text-left hover:bg-surface-container-low dark:hover:bg-[#202c33] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>key</span>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-h2 text-h2 text-on-surface dark:text-[#e9edef] mb-1">Account</h3>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-gray-400">Privacy, security, change number</p>
              </div>
            </motion.button>

            <motion.button onClick={() => handleSettingClick("Chats")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} variants={itemVariants} className="bg-surface-container-lowest dark:bg-[#111b21] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-outline-variant/30 dark:border-gray-800 flex items-start gap-4 text-left hover:bg-surface-container-low dark:hover:bg-[#202c33] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary dark:text-blue-400 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-h2 text-h2 text-on-surface dark:text-[#e9edef] mb-1">Chats</h3>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-gray-400">Theme, wallpapers, chat history</p>
              </div>
            </motion.button>

            <motion.button onClick={() => handleSettingClick("Notifications")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} variants={itemVariants} className="bg-surface-container-lowest dark:bg-[#111b21] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-outline-variant/30 dark:border-gray-800 flex items-start gap-4 text-left hover:bg-surface-container-low dark:hover:bg-[#202c33] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary dark:text-orange-400 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-h2 text-h2 text-on-surface dark:text-[#e9edef] mb-1">Notifications</h3>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-gray-400">Message, group & call tones</p>
              </div>
            </motion.button>

            <motion.button onClick={() => handleSettingClick("Storage and Data")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} variants={itemVariants} className="bg-surface-container-lowest dark:bg-[#111b21] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-outline-variant/30 dark:border-gray-800 flex items-start gap-4 text-left hover:bg-surface-container-low dark:hover:bg-[#202c33] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-surface-variant/50 dark:bg-gray-800 flex items-center justify-center text-on-surface-variant dark:text-gray-400 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>data_usage</span>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-h2 text-h2 text-on-surface dark:text-[#e9edef] mb-1">Storage and Data</h3>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-gray-400">Network usage, auto-download</p>
              </div>
            </motion.button>

            <motion.button onClick={() => handleSettingClick("Help")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} variants={itemVariants} className="bg-surface-container-lowest dark:bg-[#111b21] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-outline-variant/30 dark:border-gray-800 flex items-start gap-4 text-left hover:bg-surface-container-low dark:hover:bg-[#202c33] transition-colors group md:col-span-2">
              <div className="w-12 h-12 rounded-full bg-surface-dim/40 dark:bg-gray-800 flex items-center justify-center text-on-surface dark:text-[#e9edef] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
              </div>
              <div className="flex-1 pt-1 flex items-center justify-between">
                <div>
                  <h3 className="font-h2 text-h2 text-on-surface dark:text-[#e9edef] mb-1">Help</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-gray-400">Help center, contact us, privacy policy</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant dark:text-gray-500">chevron_right</span>
              </div>
            </motion.button>

          </div>

          {/* Meta Actions */}
          <motion.div variants={itemVariants} className="flex justify-center mt-4">
            <motion.button onClick={logout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="font-label-caps text-label-caps text-error hover:bg-error-container/20 dark:hover:bg-red-900/20 px-6 py-3 rounded-full transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              LOG OUT
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* ── Settings Modals ────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeModal && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#202c33] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 bg-emerald-600 dark:bg-[#202c33] text-white border-b border-white/10">
                <h2 className="font-medium text-[16px]">{activeModal}</h2>
                <button onClick={() => setActiveModal(null)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                {renderModalContent()}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
