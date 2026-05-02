import { Search, MoreVertical, Phone, Video, ArrowLeft, Sparkles, X } from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../hooks/useAuth.tsx';
import { analyzeMood } from '../utils/sentiment';
import type { Mood } from '../utils/sentiment';
import { generateSummary } from '../utils/summarizer';
import { motion, AnimatePresence } from 'framer-motion';
import ContactInfoPane from './ContactInfoPane';
import { API_BASE_URL } from '../config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

interface Message {
  id: string;
  content: string;
  time: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  file?: FileAttachment;
}

interface SocketMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  file?: FileAttachment;
}


// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWindow({
  chatId,
  chatName,
  onBack,
}: {
  chatId: string | null;
  chatName?: string;
  onBack: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { socket, userId, isConnected } = useSocket();
  const { token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [activeWallpaper, setActiveWallpaper] = useState(localStorage.getItem('chatWallpaper') || "WhatsApp Doodle");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contactName = chatName ?? `User ${chatId}`;

  // ── Compute overall chat mood based on recent messages ────────────────────
  const recentMessages = messages.slice(-5);
  let dominantMood: Mood = 'neutral';
  const moodScores = { happy: 0, angry: 0, calm: 0, neutral: 0 };
  
  recentMessages.forEach(msg => {
    const mood = analyzeMood(msg.content);
    moodScores[mood]++;
  });
  
  const maxScore = Math.max(moodScores.happy, moodScores.angry, moodScores.calm);
  if (maxScore > 0) {
    if (moodScores.happy === maxScore) dominantMood = 'happy';
    else if (moodScores.angry === maxScore) dominantMood = 'angry';
    else if (moodScores.calm === maxScore) dominantMood = 'calm';
  }

  const moodOverlays = {
    neutral: 'bg-transparent',
    happy: 'bg-yellow-400/20 dark:bg-yellow-500/10',
    angry: 'bg-red-500/20 dark:bg-red-500/10',
    calm: 'bg-blue-400/20 dark:bg-blue-500/10'
  };

  // ── Scroll to bottom when messages or typing state changes ───────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // ── Load history from MongoDB when chat opens ─────────────────────────────
  useEffect(() => {
    if (!chatId || !token || !userId) return;
    setMessages([]);
    setIsTyping(false);
    setHistoryLoading(true);

    fetch(`${API_BASE_URL}/messages/${userId}/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const loaded: Message[] = data.messages.map((m: any) => ({
            id: m._id,
            content: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: m.senderId === userId || m.senderId?._id === userId,
            status: m.status,
          }));
          setMessages(loaded);
        }
      })
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  }, [chatId, token, userId]);


  // ── Register Socket.IO listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!socket || !chatId || !isConnected) return;

    console.log('[ChatWindow] attaching listeners — chatId:', chatId, 'userId:', userId);

    const handleReceiveMessage = (msg: SocketMessage) => {
      console.log('[ChatWindow] receiveMessage:', msg);
      // Only process messages from the person we're currently chatting with
      if (msg.senderId !== chatId) return;

      const newMsg: Message = {
        id: msg.id,
        content: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        status: msg.status,
        file: msg.file,
      };
      setMessages(prev => [...prev, newMsg]);

      // Tell sender we have read it
      socket.emit('markRead', { senderId: chatId, receiverId: userId });
    };

    const handleUserTyping = ({ senderId }: { senderId: string }) => {
      if (senderId === chatId) setIsTyping(true);
    };

    const handleUserStoppedTyping = ({ senderId }: { senderId: string }) => {
      if (senderId === chatId) setIsTyping(false);
    };

    const handleMessagesRead = () => {
      // Mark the last sent message as read
      setMessages(prev =>
        prev.map((m, i) => (i === prev.length - 1 && m.isOwn ? { ...m, status: 'read' } : m))
      );
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      console.log('[ChatWindow] detaching listeners');
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, chatId, userId, isConnected]);

  useEffect(() => {
    const handleWallpaperChange = () => {
      setActiveWallpaper(localStorage.getItem('chatWallpaper') || "WhatsApp Doodle");
    };
    window.addEventListener('wallpaperChanged', handleWallpaperChange);
    return () => window.removeEventListener('wallpaperChanged', handleWallpaperChange);
  }, []);

  const getWallpaperStyle = () => {
    switch (activeWallpaper) {
      case "Solid Dark": return { backgroundColor: '#111b21', backgroundImage: 'none' };
      case "Solid Light": return { backgroundColor: '#efeae2', backgroundImage: 'none' };
      case "Ocean Blue": return { backgroundColor: '#005c4b', backgroundImage: 'none' };
      case "Forest Green": return { backgroundColor: '#004d40', backgroundImage: 'none' };
      case "Sunset Orange": return { backgroundColor: '#e65100', backgroundImage: 'none' };
      case "Midnight Black": return { backgroundColor: '#000000', backgroundImage: 'none' };
      case "Custom Image": return { backgroundColor: '#efeae2', backgroundImage: 'url(https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=800)', backgroundSize: 'cover', backgroundBlendMode: 'overlay' as any };
      default: return { // WhatsApp Doodle
        backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px',
        backgroundBlendMode: 'overlay' as any
      };
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    (content: string, expiry: 'ONE_DAY' | 'SEVEN_DAYS' | 'NEVER' = 'NEVER') => {
      if (!content.trim() || !chatId) return;

      const tempId = crypto.randomUUID();
      const optimistic: Message = {
        id: tempId,
        content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        status: 'sent',
      };
      setMessages(prev => [...prev, optimistic]);

      if (socket) {
        socket.emit('sendMessage', { senderId: userId, receiverId: chatId, content, expiry });
        socket.once('messageSent', (confirmed: SocketMessage) => {
          setMessages(prev =>
            prev.map(m => (m.id === tempId ? { ...m, id: confirmed.id, status: 'delivered' } : m))
          );
        });
        socket.emit('stopTyping', { senderId: userId, receiverId: chatId });
      }
    },
    [socket, chatId, userId]
  );

  // ── Send file ─────────────────────────────────────────────────────────────
  const handleSendFile = useCallback(
    (file: FileAttachment, caption: string, expiry: 'ONE_DAY' | 'SEVEN_DAYS' | 'NEVER' = 'NEVER') => {
      if (!chatId || !socket) return;
      const tempId = crypto.randomUUID();
      const optimistic: Message = {
        id: tempId,
        content: caption,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        status: 'sent',
        file,
      };
      setMessages(prev => [...prev, optimistic]);
      socket.emit('sendMessage', { senderId: userId, receiverId: chatId, content: caption, file, expiry });
      socket.once('messageSent', (confirmed: SocketMessage) => {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: confirmed.id, status: 'delivered' } : m));
      });
    },
    [socket, chatId, userId]
  );

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!socket || !chatId) return;

    socket.emit('typing', { senderId: userId, receiverId: chatId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { senderId: userId, receiverId: chatId });
    }, 2000);
  }, [socket, chatId, userId]);

  // ─────────────────────────────────────────────────────────────────────────

  if (!chatId) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#202c33]">
        <div className="text-center text-gray-500 dark:text-[#8696a0]">
          <h1 className="text-3xl font-light mb-4">Connect</h1>
          <p className="text-sm">Select a conversation to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full relative z-10 border-l border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className={`flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] transition-all duration-300 ${showContactInfo ? 'hidden lg:flex' : 'flex'}`}>
        {/* ── Chat Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800 h-[60px] shadow-sm z-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowContactInfo(!showContactInfo)}>
            <button
              onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="md:hidden p-1 -ml-2 text-gray-500 dark:text-[#aebac1] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <img src={`https://i.pravatar.cc/150?u=${chatId}`} alt="Chat" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="font-medium text-[16px] text-gray-900 dark:text-[#e9edef] leading-tight">{contactName}</h2>
            <p className="text-[13px] text-gray-500 dark:text-[#8696a0]">
              {isTyping ? (
                <span className="text-[#25D366] animate-pulse">typing…</span>
              ) : (
                'online'
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-gray-500 dark:text-[#aebac1]">
          <button 
            onClick={() => setShowSummaryModal(true)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-amber-500 dark:text-amber-400"
            title="Summarize Chat"
          >
            <Sparkles size={20} />
          </button>
          <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 my-auto hidden sm:block mx-1" />
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* ── Message List ─────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar relative transition-colors duration-1000 ${moodOverlays[dominantMood]}`}
        style={getWallpaperStyle()}
      >
        <div className="flex justify-center mb-4 mt-2">
          <span className="bg-white dark:bg-[#182229] px-3 py-1 rounded-lg text-xs text-gray-500 dark:text-[#8696a0] shadow-sm">
            TODAY
          </span>
        </div>
        <div className="flex justify-center mb-4">
          <span className="bg-[#ffeecd] dark:bg-[#182229] text-[#54656f] dark:text-[#ffd279] px-3 py-2 rounded-lg text-xs max-w-sm text-center shadow-sm">
            Messages are end-to-end encrypted. No one outside of this chat can read them.
          </span>
        </div>

        {historyLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
          </div>
        )}

        {!historyLoading && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-[#8696a0] bg-white/60 dark:bg-black/20 px-4 py-2 rounded-lg">
              No messages yet. Say hello! 👋
            </p>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} {...msg} />
        ))}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="flex justify-start px-4 mb-2">
            <div className="bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none px-4 py-2.5 shadow-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* ── Input Bar ────────────────────────────────────────────────────── */}
      <InputBar onSendMessage={handleSendMessage} onSendFile={handleSendFile} onTyping={handleTyping} />

      {/* ── Summary Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSummaryModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 bg-amber-50 dark:bg-[#2a3942] border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                  <Sparkles size={20} />
                  <h2>Chat Summary</h2>
                </div>
                <button onClick={() => setShowSummaryModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 text-[14.5px] leading-relaxed text-gray-700 dark:text-[#d1d7db] whitespace-pre-wrap">
                {generateSummary(messages.slice(-50))}
              </div>
              <div className="px-5 py-4 bg-gray-50 dark:bg-[#182229] border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>

      {/* ── Contact Info Pane ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showContactInfo && (
          <ContactInfoPane
            contactName={contactName}
            chatId={chatId}
            onClose={() => setShowContactInfo(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
