import { useState, useEffect } from 'react';
import { MoreVertical, MessageSquare, Search, Filter, CircleDashed, X } from 'lucide-react';
import ChatListItem from './ChatListItem';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export default function Sidebar({ onSelectChat, activeChatId, onTabChange }: {
  onSelectChat: (id: string, name: string) => void;
  activeChatId: string | null;
  onTabChange: (tab: 'chats' | 'settings' | 'status') => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatId, setNewChatId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const { token, logout, user } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
      })
      .catch(console.error);
  }, [token]);

  const filteredChats = users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    const searchVal = newChatId.trim().toUpperCase();
    if (!searchVal) return;

    // Find user by short uniqueId (or fallback to _id)
    const foundUser = users.find(u => 
      (u.uniqueId && u.uniqueId.toUpperCase() === searchVal) || 
      u._id === newChatId.trim()
    );

    if (foundUser) {
      onSelectChat(foundUser._id, foundUser.username);
      setShowNewChatModal(false);
      setNewChatId('');
    } else {
      alert("User not found! Make sure they have registered an account.");
    }
  };

  return (
    <aside className="w-full h-full flex flex-col bg-white dark:bg-[#111b21]">
      {/* ── WhatsApp-style Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[56px] flex-shrink-0 bg-[#008069] dark:bg-[#202c33]">
        {/* Left: avatar + title */}
        <div className="flex items-center gap-3">
          <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={() => onTabChange('settings')}
            className="w-[38px] h-[38px] rounded-full overflow-hidden cursor-pointer ring-2 ring-white/30"
            title="Settings"
          >
            <img src="https://i.pravatar.cc/150?img=68" alt="Profile" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Right: action icons */}
        <div className="flex items-center gap-1 text-white relative">
          <button 
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Status"
            onClick={() => onTabChange('status')}
          >
            <CircleDashed size={21} strokeWidth={2} />
          </button>
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors" 
            title="New Chat by UserID"
          >
            <MessageSquare size={21} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <MoreVertical size={21} strokeWidth={1.8} />
          </button>

          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-11 bg-white dark:bg-[#233138] shadow-xl rounded-xl py-1 w-52 z-50 overflow-hidden"
            >
              {[
                { label: 'New group', action: () => setIsMenuOpen(false) },
                { label: 'New broadcast', action: () => setIsMenuOpen(false) },
                { label: 'Linked devices', action: () => setIsMenuOpen(false) },
                { label: 'Settings', action: () => { setIsMenuOpen(false); onTabChange('settings'); } },
                { label: 'Log out', action: () => { setIsMenuOpen(false); logout(); } },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full text-left px-4 py-3 text-[14px] text-gray-800 dark:text-[#d1d7db] hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2.5 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <div className="flex-1 bg-[#f0f2f5] dark:bg-[#202c33] rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Search size={18} className="text-gray-400 dark:text-[#8696a0] flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[14px] outline-none text-gray-900 dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0]"
          />
        </div>
        <button className="p-2 text-gray-400 dark:text-[#8696a0] hover:text-gray-600 dark:hover:text-[#e9edef] transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* Chat List */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.map(user => (
          <motion.div key={user._id} variants={itemVariants}>
            <ChatListItem
              id={user._id}
              name={user.username}
              message={user.isOnline ? "Online now" : "Offline"}
              time=""
              unread={0}
              online={user.isOnline}
              isActive={activeChatId === user._id}
              onClick={() => onSelectChat(user._id, user.username)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ── New Chat by UserID Modal ────────────────────────────────────── */}
      {showNewChatModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#202c33] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 bg-[#008069] dark:bg-[#202c33] text-white">
              <h2 className="font-medium text-[16px]">New Chat</h2>
              <button onClick={() => setShowNewChatModal(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleStartNewChat} className="p-5">
              <p className="text-sm text-gray-600 dark:text-[#8696a0] mb-4">
                Enter your friend's 6-character User ID. (Your ID is: <span className="font-mono text-[15px] font-bold tracking-widest bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded">{user?.uniqueId || user?.id || user?._id}</span>)
              </p>
              <input
                type="text"
                placeholder="e.g. A1B2C3"
                value={newChatId}
                onChange={(e) => setNewChatId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111b21] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-[#e9edef] outline-none focus:ring-2 focus:ring-[#008069]"
                autoFocus
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#8696a0] hover:bg-gray-100 dark:hover:bg-[#182229] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChatId.trim()}
                  className="px-4 py-2 text-sm font-medium bg-[#008069] hover:bg-[#01705b] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </aside>
  );
}
