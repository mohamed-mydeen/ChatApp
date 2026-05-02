import { motion } from 'framer-motion';

const TABS = [
  {
    id: 'chats' as const,
    label: 'Chats',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[23px] h-[23px]" fill="currentColor">
        <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    ),
  },
  {
    id: 'status' as const,
    label: 'Status',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[23px] h-[23px]" fill="currentColor">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>
    ),
  },
  {
    id: 'settings' as const,
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" className="w-[23px] h-[23px]" fill="currentColor">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
      </svg>
    ),
  },
];

type TabId = 'chats' | 'settings' | 'status';

export default function BottomNavBar({
  currentTab,
  onTabChange,
}: {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 w-full z-50 md:hidden flex justify-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Floating frosted-glass pill */}
      <div
        className="mx-4 mb-3 flex items-center justify-around rounded-[28px] overflow-hidden w-full max-w-sm"
        style={{
          background: 'rgba(18, 18, 20, 0.82)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          boxShadow:
            '0 12px 40px rgba(0,0,0,0.38), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(255,255,255,0.04) inset',
        }}
      >
        {TABS.map(tab => {
          const isActive = tab.id === currentTab;
          const canPress = tab.id === 'chats' || tab.id === 'settings' || tab.id === 'status';

          return (
            <motion.button
              key={tab.id}
              onClick={() => canPress && onTabChange(tab.id as TabId)}
              disabled={!canPress}
              whileTap={{ scale: 0.82 }}
              transition={{ type: 'spring', stiffness: 600, damping: 28 }}
              className="flex flex-col items-center justify-center gap-[3px] py-3 flex-1 focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Icon — stays same size, only color changes */}
              <motion.span
                animate={{ color: isActive ? '#25d366' : 'rgba(255,255,255,0.38)' }}
                transition={{ duration: 0.18 }}
              >
                {tab.icon}
              </motion.span>

              {/* Label */}
              <motion.span
                animate={{
                  color: isActive ? '#25d366' : 'rgba(255,255,255,0.38)',
                  fontWeight: isActive ? 700 : 400,
                }}
                transition={{ duration: 0.18 }}
                className="text-[10px] tracking-wide leading-none"
              >
                {tab.label}
              </motion.span>

              {/* Active indicator dot */}
              <div className="h-[3px] flex justify-center">
                {isActive && (
                  <motion.div
                    layoutId="navDot"
                    className="w-4 h-[3px] rounded-full bg-[#25d366]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
