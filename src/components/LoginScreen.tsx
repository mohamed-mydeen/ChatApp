import { useState } from 'react';
import { motion } from 'framer-motion';

const TEST_USERS = [
  { id: 'alice', name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 'bob',   name: 'Bob',   avatar: 'https://i.pravatar.cc/150?img=68' },
  { id: 'carol', name: 'Carol', avatar: 'https://i.pravatar.cc/150?img=44' },
  { id: 'dave',  name: 'Dave',  avatar: 'https://i.pravatar.cc/150?img=52' },
];

export default function LoginScreen({ onLogin }: { onLogin: (userId: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-[#0b141a] dark:to-[#111b21]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              chat
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e9edef]">Connect</h1>
          <p className="text-gray-500 dark:text-[#8696a0] text-sm mt-1">
            Choose your identity to test real-time chat
          </p>
        </div>

        {/* User selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {TEST_USERS.map(user => (
            <motion.button
              key={user.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(user.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                selected === user.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                {selected === user.id && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[12px]">check</span>
                  </div>
                )}
              </div>
              <span className={`font-semibold text-sm ${selected === user.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-[#e9edef]'}`}>
                {user.name}
              </span>
              <span className="text-[11px] text-gray-400 font-mono">@{user.id}</span>
            </motion.button>
          ))}
        </div>

        {/* Hint */}
        <div className="bg-amber-50 dark:bg-[#2a2100] border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2 mb-6">
          <p className="text-[12px] text-amber-700 dark:text-amber-400 text-center">
            💡 Open two tabs and pick different users to test live messaging
          </p>
        </div>

        {/* Connect button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selected && onLogin(selected)}
          disabled={!selected}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
            selected
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900'
              : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          }`}
        >
          {selected ? `Connect as ${TEST_USERS.find(u => u.id === selected)?.name}` : 'Select a user'}
        </motion.button>
      </motion.div>
    </div>
  );
}
