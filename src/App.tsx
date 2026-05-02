import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsPage from './components/SettingsPage';
import StatusPage from './components/StatusPage';
import BottomNavBar from './components/BottomNavBar';
import { AnimatePresence, motion } from 'framer-motion';
import { useSocket } from './context/SocketContext';

function App() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<'chats' | 'settings' | 'status'>('chats');

  const handleTabChange = (tab: 'chats' | 'settings' | 'status') => {
    setCurrentTab(tab);
    setActiveChatId(null);
  };

  const handleSelectChat = (id: string, name: string) => {
    setActiveChatId(id);
    setActiveChatName(name);
  };

  const { socket } = useSocket();

  // ── Smart Notifications (Global) ────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        // Safe to call, but might be blocked if not user-initiated
        Notification.requestPermission().catch(() => {});
      }
    } catch (err) {
      console.warn("Notification API error:", err);
    }

    const handleGlobalMessage = (msg: any) => {
      // Prevent notification if we are actively viewing this chat
      if (activeChatId === msg.chatId && document.visibilityState === 'visible') return;

      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          // Smart Notification: Shows "Sender: message content"
          const title = msg.senderName || 'New Message';
          const bodyText = msg.content || (msg.file ? '📎 Sent an attachment' : 'New message');
          
          new Notification(title, {
            body: bodyText,
            icon: '/vite.svg',
            silent: false
          });
        }
      } catch (err) {
        console.warn("Could not show notification:", err);
      }
    };

    socket.on('receiveMessage', handleGlobalMessage);
    return () => {
      socket.off('receiveMessage', handleGlobalMessage);
    };
  }, [socket, activeChatId]);

  return (
    <div className="h-full w-full flex overflow-hidden bg-[#e5ddd5] dark:bg-[#0a1014]">
      {/* Desktop Wrapper (Optional green header background) */}
      <div className="absolute top-0 left-0 w-full h-[127px] bg-[#00a884] hidden md:block z-0"></div>

      {/* Main App Container */}
      <div className="relative z-10 w-full h-full md:w-[calc(100%-38px)] md:max-w-[1600px] md:h-[calc(100%-38px)] md:m-auto flex shadow-lg md:rounded-sm overflow-hidden bg-[#efeae2] dark:bg-[#111b21]">
        
        {/* Mobile: Sidebar or Settings takes full width when no chat is active */}
        <div className={`w-full md:w-[350px] lg:w-[400px] h-full flex-shrink-0 flex flex-col bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-gray-800 relative overflow-hidden z-10 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:!translate-x-0 md:!opacity-100 ${activeChatId ? '-translate-x-[30%] opacity-40' : 'translate-x-0 opacity-100'}`}>
          <AnimatePresence mode="wait">
            {currentTab === 'chats' ? (
              <motion.div
                key="chats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full absolute inset-0"
              >
                <Sidebar onSelectChat={handleSelectChat} activeChatId={activeChatId} onTabChange={handleTabChange} />
              </motion.div>
            ) : currentTab === 'settings' ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full absolute inset-0"
              >
                <SettingsPage onBack={() => setCurrentTab('chats')} />
              </motion.div>
            ) : (
              <motion.div
                key="status"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full absolute inset-0"
              >
                <StatusPage onBack={() => setCurrentTab('chats')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile: Chat Window takes full width when active, otherwise hidden */}
        <div className="absolute inset-0 md:relative md:flex-1 h-full flex-col overflow-hidden z-20 md:z-10 pointer-events-none md:pointer-events-auto flex">
          <AnimatePresence>
            {activeChatId ? (
              <motion.div
                key="chat"
                initial={{ x: '100%', boxShadow: '-20px 0 40px rgba(0,0,0,0)' }}
                animate={{ x: 0, boxShadow: '-20px 0 40px rgba(0,0,0,0.15)' }}
                exit={{ x: '100%', boxShadow: '-20px 0 40px rgba(0,0,0,0)' }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="w-full h-full flex flex-col bg-[#efeae2] dark:bg-[#0b141a] pointer-events-auto md:shadow-none"
              >
                <ChatWindow chatId={activeChatId} chatName={activeChatName} onBack={() => setActiveChatId(null)} />
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden md:flex w-full h-full items-center justify-center bg-[#f0f2f5] dark:bg-[#202c33] flex-col border-l border-gray-200 dark:border-gray-800"
              >
                <div className="text-center">
                  <h2 className="text-gray-500 text-3xl font-light mb-4">Connect</h2>
                  <p className="text-gray-400">Select a chat to start messaging.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Bottom Navigation for Mobile (hidden on desktop) */}
      {!activeChatId && (
        <BottomNavBar currentTab={currentTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}

export default App;
