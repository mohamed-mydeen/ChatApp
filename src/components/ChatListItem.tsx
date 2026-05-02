import { motion } from 'framer-motion';

export default function ChatListItem({
  id, name, message, time, unread, online, isActive, onClick, avatar
}: {
  id: string; name: string; message: string; time: string; unread: number;
  online: boolean; isActive: boolean; onClick: () => void; avatar?: string;
}) {
  const initial = name.charAt(0).toUpperCase();

  // Pick a subtle accent color from name for avatar ring
  const colors = ['#00a884', '#7c6af7', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
  const accentColor = colors[name.charCodeAt(0) % colors.length];

  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={`flex items-center px-4 py-3 gap-3.5 cursor-pointer transition-all duration-150 relative
        ${isActive
          ? 'bg-[#e8f7f2] dark:bg-[#2a3942]'
          : 'hover:bg-[#f5f7f9] dark:hover:bg-[#1e2d35]'
        }`}
    >
      {/* Active left indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full" style={{ background: accentColor }} />
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
          style={{
            background: accentColor,
            boxShadow: `0 0 0 2px ${isActive ? accentColor + '50' : 'transparent'}`,
            transition: 'box-shadow 0.2s',
          }}
        >
          <span className="text-[20px] font-bold text-white select-none">{initial}</span>
        </div>
        {online && (
          <span
            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#111b21]"
            style={{ background: '#25d366' }}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 border-b border-gray-100/80 dark:border-gray-800/50 pb-3">
        <div className="flex justify-between items-center mb-0.5">
          <h3 className="font-semibold text-[15.5px] text-gray-900 dark:text-[#e9edef] truncate">
            {name}
          </h3>
          <span className={`text-[11.5px] whitespace-nowrap ml-2 font-medium
            ${unread > 0 ? 'text-[#25D366]' : 'text-gray-400 dark:text-[#8696a0]'}`}>
            {time}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[13px] text-gray-500 dark:text-[#8696a0] truncate pr-2 leading-snug">
            {message}
          </p>
          {unread > 0 && (
            <div className="bg-[#25D366] text-white text-[11px] font-bold rounded-full h-[20px] min-w-[20px] px-1.5 flex items-center justify-center flex-shrink-0 shadow-sm">
              {unread}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
