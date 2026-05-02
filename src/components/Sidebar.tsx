import { useState, useEffect, useRef } from 'react';
import { MoreVertical, MessageSquare, Search, CircleDashed, X, Edit3, UserPlus, QrCode } from 'lucide-react';
import ChatListItem from './ChatListItem';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 32 } }
};

export default function Sidebar({ onSelectChat, activeChatId, onTabChange }: {
  onSelectChat: (id: string, name: string) => void;
  activeChatId: string | null;
  onTabChange: (tab: 'chats' | 'settings' | 'status') => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatId, setNewChatId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [frequentUser, setFrequentUser] = useState<string | null>(null);
  const { token, logout, user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Parse chat frequency to suggest frequently contacted user
  useEffect(() => {
    const checkFreq = () => {
      try {
        const counts = JSON.parse(localStorage.getItem('chatFrequency') || '{}');
        let max = 0;
        let maxId = null;
        for (const [id, count] of Object.entries(counts)) {
           if ((count as number) > max) { max = count as number; maxId = id; }
        }
        if (maxId && users.length > 0) {
          const u = users.find(u => u._id === maxId);
          if (u) setFrequentUser(u.username);
        }
      } catch (e) {}
    };
    checkFreq();
    window.addEventListener('chatFrequencyUpdated', checkFreq);
    return () => window.removeEventListener('chatFrequencyUpdated', checkFreq);
  }, [users]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setUsers(data.users); })
      .catch(console.error);
  }, [token]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredChats = users.filter(u =>
    u._id !== user?._id &&  // ← exclude self
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = users.filter(u => u.isOnline).length;

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    const searchVal = newChatId.trim().toUpperCase();
    if (!searchVal) return;
    const foundUser = users.find(u =>
      (u.uniqueId && u.uniqueId.toUpperCase() === searchVal) ||
      u._id === newChatId.trim()
    );
    if (foundUser) {
      onSelectChat(foundUser._id, foundUser.username);
      setShowNewChatModal(false);
      setNewChatId('');
    } else {
      alert('User not found! Make sure they have registered an account.');
    }
  };

  const userInitial = (user?.username || 'U').charAt(0).toUpperCase();

  return (
    <aside className="w-full h-full flex flex-col bg-white dark:bg-[#111b21] relative overflow-hidden">

      {/* ── Premium Gradient Header ────────────────────────────────────── */}
      <div
        className="flex-shrink-0 relative z-20"
        style={{
          background: 'linear-gradient(135deg, #007a5e 0%, #00a884 50%, #00c49a 100%)',
          boxShadow: '0 4px 20px rgba(0,168,132,0.25)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 -right-2 w-14 h-14 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center justify-between px-4 h-[60px] relative">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-3">
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange('settings')}
              className="relative cursor-pointer"
              title="Go to settings"
            >
              <div
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 border-white/40 shadow-md"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <span className="text-[16px] font-bold text-white select-none">{userInitial}</span>
              </div>
              {/* Online pulse */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </motion.div>

            <div>
              <h1 className="text-white font-semibold text-[17px] leading-tight">Chats</h1>
              <p className="text-green-100 text-[11px] leading-tight">{onlineCount} online</p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-0.5 text-white relative" ref={menuRef}>
            <motion.button
              whileTap={{ scale: 0.85 }}
              className="p-2 rounded-full hover:bg-white/15 transition-colors"
              title="Status"
              onClick={() => onTabChange('status')}
            >
              <CircleDashed size={20} strokeWidth={2} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowNewChatModal(true)}
              className="p-2 rounded-full hover:bg-white/15 transition-colors"
              title="New Chat"
            >
              <Edit3 size={19} strokeWidth={2} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-white/15 transition-colors"
            >
              <MoreVertical size={20} strokeWidth={2} />
            </motion.button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: -6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-11 bg-white dark:bg-[#233138] shadow-2xl rounded-2xl py-2 w-52 z-50 overflow-hidden border border-gray-100 dark:border-gray-700/50"
                  style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}
                >
                  {[
                    { label: 'New group', icon: '👥' },
                    { label: 'Settings', icon: '⚙️', action: () => onTabChange('settings') },
                    { label: 'Log out', icon: '🚪', action: () => logout(), danger: true },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => { item.action?.(); setIsMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-[14px] flex items-center gap-3 transition-colors
                        ${item.danger
                          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-gray-800 dark:text-[#d1d7db] hover:bg-gray-50 dark:hover:bg-[#182229]'
                        }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Search Bar ─ inside header panel ────────────────────────── */}
        <div className="px-3 pb-3">
          <motion.div
            animate={{ scale: isSearchFocused ? 1.01 : 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: isSearchFocused ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'border 0.2s',
            }}
          >
            <Search size={16} className="text-white/70 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-transparent text-[14px] outline-none text-white placeholder-white/60"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-white/70 hover:text-white">
                <X size={14} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── AI Frequently Contacted Suggestion ─────────────────────────── */}
      {!searchQuery && frequentUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mt-3 mb-1 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center gap-3 shadow-sm"
        >
          <span className="text-xl">✨</span>
          <p className="text-[13px] text-amber-800 dark:text-amber-500 font-medium tracking-tight">
            You chat most with <span className="font-bold">{frequentUser}</span>
          </p>
        </motion.div>
      )}

      {/* ── Online Users Chips Strip ───────────────────────────────────── */}
      {users.filter(u => u.isOnline).length > 0 && (
        <div className="flex-shrink-0 px-3 py-2 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800/60 overflow-x-auto flex gap-3 custom-scrollbar-x">
          {users.filter(u => u.isOnline).slice(0, 10).map(u => {
            const initial = u.username.charAt(0).toUpperCase();
            return (
              <motion.button
                key={u._id}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelectChat(u._id, u.username)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center border-2 border-[#25d366]/60 shadow-sm" style={{ background: '#00a884' }}>
                    <span className="text-[18px] font-bold text-white select-none">{initial}</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] border-2 border-white dark:border-[#111b21] rounded-full" />
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 max-w-[48px] truncate">{u.username}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── Section header ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {searchQuery ? `Results (${filteredChats.length})` : 'All Contacts'}
        </span>
        <span className="text-[12px] text-gray-400 dark:text-gray-500">{filteredChats.length} people</span>
      </div>

      {/* ── Chat List ─────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-60 px-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#202c33] flex items-center justify-center">
              <MessageSquare size={28} className="text-gray-400" />
            </div>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 text-center">
              {searchQuery ? 'No users match your search' : 'No contacts yet. Start a new chat!'}
            </p>
          </div>
        ) : (
          filteredChats.map(u => (
            <motion.div key={u._id} variants={itemVariants}>
              <ChatListItem
                id={u._id}
                name={u.username}
                avatar={u.avatar}
                message={u.status || (u.isOnline ? '🟢 Online' : 'Last seen recently')}
                time=""
                unread={0}
                online={u.isOnline}
                isActive={activeChatId === u._id}
                onClick={() => onSelectChat(u._id, u.username)}
              />
            </motion.div>
          ))
        )}
      </motion.div>


      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewChatModal(false)}
          >
            <style>{`#bottom-nav-bar { display: none !important; }`}</style>
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-sm bg-white dark:bg-[#1f2c34] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="flex items-center justify-between px-5 py-4 text-white"
                style={{ background: 'linear-gradient(135deg, #007a5e, #00a884)' }}
              >
                <div className="flex items-center gap-2">
                  <UserPlus size={18} />
                  <h2 className="font-semibold text-[16px]">New Chat</h2>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleStartNewChat} className="p-5">
                {/* Your ID badge */}
                <div className="mb-5 p-3 bg-[#f0fdf4] dark:bg-[#0d2218] rounded-xl border border-[#00a884]/20 flex items-center gap-3">
                  <img src={avatarSrc} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Your Unique ID</p>
                    <p className="font-mono font-bold text-[15px] tracking-widest text-[#00a884]">
                      {user?.uniqueId || user?.id || user?._id}
                    </p>
                  </div>
                </div>

                <p className="text-[13px] text-gray-500 dark:text-[#8696a0] mb-3">
                  Enter your friend's Unique ID to start a conversation.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. A1B2C3"
                    value={newChatId}
                    onChange={e => setNewChatId(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl text-gray-900 dark:text-[#e9edef] outline-none focus:ring-2 focus:ring-[#00a884] text-[15px] font-mono tracking-widest uppercase"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => alert('Camera permissions required. Please use the Web App on a supported device.')}
                    className="p-3 bg-[#f0f2f5] dark:bg-[#111b21] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-300"
                    title="Scan QR Code"
                  >
                    <QrCode size={22} />
                  </button>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewChatModal(false)}
                    className="flex-1 py-3 text-[14px] font-medium text-gray-600 dark:text-[#8696a0] bg-gray-100 dark:bg-[#182229] rounded-xl hover:bg-gray-200 dark:hover:bg-[#202c33] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newChatId.trim()}
                    className="flex-1 py-3 text-[14px] font-semibold text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                    style={{ background: 'linear-gradient(135deg, #007a5e, #00a884)' }}
                  >
                    Start Chat
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
