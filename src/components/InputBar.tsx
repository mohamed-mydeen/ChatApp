import { Smile, Paperclip, Mic, Send, X, Timer, Image as ImageIcon, FileText, User, Wand2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Emoji Data ───────────────────────────────────────────────────────────────

const EMOJI_CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: 'Smileys',
    icon: '😀',
    emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','😷','🤒','🤕','🤢','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐'],
  },
  {
    label: 'Gestures',
    icon: '👋',
    emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦶','👂','🦻','👃','👣','👁','👀','🫦','🧠','🫀','🦷','🦴'],
  },
  {
    label: 'Hearts',
    icon: '❤️',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'],
  },
  {
    label: 'Animals',
    icon: '🐶',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀'],
  },
  {
    label: 'Food',
    icon: '🍕',
    emojis: ['🍕','🍔','🍟','🌭','🍿','🧂','🥓','🥚','🍳','🧇','🥞','🧈','🍞','🥐','🥨','🥯','🧀','🥗','🥙','🥪','🌮','🌯','🫔','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜'],
  },
  {
    label: 'Activities',
    icon: '⚽',
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🥅','⛳','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸','🥌','🎿','⛷','🏂','🪂','🏋','🤸','⛹️','🤺','🤾','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖'],
  },
  {
    label: 'Travel',
    icon: '✈️',
    emojis: ['✈️','🚀','🛸','🚁','🛶','⛵','🚤','🛥','🛳','⛴','🚢','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🏎','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜','🏍','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣','🏖'],
  },
  {
    label: 'Objects',
    icon: '💡',
    emojis: ['💡','🔦','🕯','🪔','🧱','💰','💴','💵','💶','💷','💸','💳','🪙','💹','📈','📉','📊','📋','📌','📍','📎','🖇','📏','📐','✂️','🗃','🗄','🗑','🔒','🔓','🔏','🔐','🔑','🗝','🔨','🪓','⛏','⚒','🛠','🗡','⚔️','🔫','🪃','🛡','🔧','🔩','⚙️','🗜','⚖️','🦯','🔗'],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function InputBar({
  onSendMessage,
  onSendFile,
  onTyping,
}: {
  onSendMessage: (msg: string, expiry: 'ONE_DAY' | 'SEVEN_DAYS' | 'NEVER') => void;
  onSendFile?: (file: { name: string; type: string; size: number; dataUrl: string }, caption: string, expiry: 'ONE_DAY' | 'SEVEN_DAYS' | 'NEVER') => void;
  onTyping?: () => void;
}) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [expiry, setExpiry] = useState<'ONE_DAY' | 'SEVEN_DAYS' | 'NEVER'>('NEVER');
  const [showExpiryMenu, setShowExpiryMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; type: string; size: number; dataUrl: string } | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const messageRef = useRef(message);

  // Keep ref in sync for event listeners
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // ── Initialize Speech Recognition ───────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setMessage(currentTranscript);
        onTyping?.();
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-send message when speaking stops!
        if (messageRef.current.trim()) {
          onSendMessage(messageRef.current.trim(), expiry);
          setMessage('');
          if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onSendMessage, onTyping, expiry]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setMessage(''); // Clear input before speaking
      recognitionRef.current?.start();
    }
  };

  // ── Auto-resize textarea ────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // ── Close menus when clicking outside ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
      // Assuming we could add attach menu ref, but for simplicity we'll just close it if clicking outside.
      // We can also close attach menu if clicking anywhere else
      setShowAttachMenu(false);
    };
    // Need to make sure we don't close attach menu immediately when clicking paperclip
    // A trick: only close if not clicking a button.
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (pendingFile) {
      onSendFile?.(pendingFile, message.trim(), expiry);
      setPendingFile(null);
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      return;
    }
    if (message.trim()) {
      onSendMessage(message.trim(), expiry);
      setMessage('');
      setShowEmojiPicker(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10 MB.');
      return;
    }
    setShowAttachMenu(false);
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-picked
    e.target.value = '';
  };

  const handleSendContact = () => {
    // Mock sending a contact for now
    setShowAttachMenu(false);
    onSendMessage("📞 Contact: John Doe (+1 234 567 890)", expiry);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setMessage(prev => prev + emoji);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newMsg = message.slice(0, start) + emoji + message.slice(end);
    setMessage(newMsg);
    // Restore cursor after emoji
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + emoji.length;
      ta.selectionEnd = start + emoji.length;
    });
  };

  const handleImproveText = () => {
    let improved = message.trim();
    if (!improved) return;
    
    const replacements: Record<string, string> = {
      'send me doc': 'Could you please send me the document?',
      'send doc': 'Could you please send the document?',
      'u': 'you',
      'ur': 'your',
      'r': 'are',
      'pls': 'please',
      'plz': 'please',
      'idk': "I don't know",
      'tbh': 'to be honest',
      'imo': 'in my opinion',
      'lmk': 'let me know',
      'omw': 'on my way',
      'np': 'no problem',
      'ty': 'thank you',
      'thx': 'thanks',
      'brb': 'be right back',
      'btw': 'by the way',
      'afaik': 'as far as I know',
      'gtg': 'got to go',
      'im': "I'm",
      'ive': "I've",
      'dont': "don't",
      'cant': "can't",
      'wont': "won't",
    };

    // Replace whole words
    Object.keys(replacements).forEach((key) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      improved = improved.replace(regex, replacements[key]);
    });

    // Auto capitalize first letter
    improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    
    // Auto punctuation
    if (!/[.!?]$/.test(improved)) {
      const firstWord = improved.split(' ')[0].toLowerCase();
      const questionWords = ['could', 'can', 'would', 'do', 'is', 'are', 'what', 'where', 'when', 'why', 'how'];
      if (questionWords.includes(firstWord)) {
         improved += '?';
      } else {
         improved += '.';
      }
    }

    setMessage(improved);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* ── Emoji Picker ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute bottom-full left-0 mb-2 w-full md:w-[380px] bg-white dark:bg-[#233138] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Category Tabs */}
            <div className="flex items-center gap-1 px-2 pt-2 pb-1 border-b border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
              {EMOJI_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(i)}
                  title={cat.label}
                  className={`flex-shrink-0 text-xl px-2 py-1 rounded-lg transition-colors ${
                    activeCategory === i
                      ? 'bg-emerald-100 dark:bg-emerald-900/40'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat.icon}
                </button>
              ))}
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category Label */}
            <div className="px-3 pt-2 pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {EMOJI_CATEGORIES[activeCategory].label}
              </p>
            </div>

            {/* Emoji Grid */}
            <div className="h-52 overflow-y-auto custom-scrollbar px-2 pb-2">
              <div className="grid grid-cols-8 gap-0.5">
                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => insertEmoji(emoji)}
                    className="text-2xl p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors leading-none"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── File Preview Strip ───────────────────────────────────────────── */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 pt-3 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 bg-white dark:bg-[#2a3942] rounded-xl px-3 py-2 mb-2">
              {pendingFile.type.startsWith('image/') ? (
                <img src={pendingFile.dataUrl} alt="preview" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                  <Paperclip size={20} className="text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">{pendingFile.name}</p>
                <p className="text-[11px] text-gray-500">{(pendingFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => setPendingFile(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Row ────────────────────────────────────────────────────── */}
      <div className="flex items-end gap-2 px-2 pt-2 pb-[calc(10px+env(safe-area-inset-bottom,0px))] bg-[#f0f2f5] dark:bg-[#202c33] w-full min-h-[60px]">
        {/* Left buttons */}
        <div className="flex gap-1 pb-1">
          <button
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className={`p-1.5 rounded-full transition-colors ${
              showEmojiPicker
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                : 'text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-[#e9edef]'
            }`}
            title="Emoji"
          >
            <Smile size={24} />
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowAttachMenu(p => !p); setShowEmojiPicker(false); }}
              className={`p-1.5 rounded-full transition-colors ${
                showAttachMenu
                  ? 'text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-[#e9edef]'
                  : 'text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-[#e9edef]'
              }`}
              title="Attach"
            >
              <Paperclip size={24} className={showAttachMenu ? 'transform -rotate-45 transition-transform' : 'transition-transform'} />
            </button>
            
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                className="absolute bottom-14 left-0 flex flex-col gap-4 bg-transparent z-50 w-max"
              >
                <div className="flex flex-col gap-4">
                  {/* Document */}
                  <button onClick={() => fileInputRef.current?.click()} className="group flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FileText size={24} className="text-white" />
                    </div>
                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-[14px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Document</span>
                  </button>
                  {/* Photos & Videos */}
                  <button onClick={() => mediaInputRef.current?.click()} className="group flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <ImageIcon size={24} className="text-white" />
                    </div>
                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-[14px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Photos & Videos</span>
                  </button>
                  {/* Contact */}
                  <button onClick={handleSendContact} className="group flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <User size={24} className="text-white" />
                    </div>
                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-[14px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Contact</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            onChange={handleFileChange}
          />
          <input
            ref={mediaInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          {/* Expiry picker */}
          <div className="relative">
            <button
              onClick={() => setShowExpiryMenu(p => !p)}
              title="Auto-delete"
              className={`p-1.5 rounded-full transition-colors ${
                expiry !== 'NEVER'
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                  : 'text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-[#e9edef]'
              }`}
            >
              <Timer size={20} />
            </button>
            {showExpiryMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="absolute bottom-10 left-0 bg-white dark:bg-[#233138] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 w-40 z-50"
              >
                {([['NEVER', '♾ Never'], ['ONE_DAY', '⏱ 1 Day'], ['SEVEN_DAYS', '📅 7 Days']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setExpiry(key); setShowExpiryMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                      expiry === key
                        ? 'text-amber-500 font-semibold'
                        : 'text-gray-700 dark:text-[#d1d7db] hover:bg-gray-50 dark:hover:bg-[#182229]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Textarea — pill style */}
        <div className="flex-1 relative flex items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => { setMessage(e.target.value); onTyping?.(); }}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
            className={`w-full bg-white dark:bg-[#2a3942] text-gray-900 dark:text-[#e9edef] rounded-[24px] pl-4 ${message.trim() ? 'pr-12' : 'pr-4'} py-[9px] text-[15px] focus:outline-none placeholder-gray-400 dark:placeholder-[#8696a0] custom-scrollbar resize-none max-h-[120px] shadow-sm border border-gray-200/80 dark:border-gray-700/50 leading-[1.45] transition-shadow duration-150 focus:shadow-md`}
            style={{ minHeight: 38 }}
          />
          {message.trim() && (
            <button
              onClick={handleImproveText}
              className="absolute right-2 bottom-[7px] p-1.5 text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors tap-scale bg-amber-50 dark:bg-amber-900/20 rounded-full"
              title="Improve message"
            >
              <Wand2 size={16} />
            </button>
          )}
        </div>

        {/* Right button */}
        <div className="pb-0.5 flex-shrink-0">
          {message.trim() || isListening ? (
            <button
              onClick={isListening ? toggleListening : handleSend}
              className={`w-10 h-10 flex items-center justify-center text-white rounded-full btn-ios send-glow transition-colors ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-[#00a884]'
              }`}
            >
              {isListening ? <Mic size={19} /> : <Send size={19} />}
            </button>
          ) : (
            <button
              onClick={toggleListening}
              className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-[#8696a0] hover:text-[#00a884] dark:hover:text-[#00a884] transition-colors tap-scale rounded-full"
              title="Speak to type"
            >
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
