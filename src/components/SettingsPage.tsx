import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config';
import {
  ArrowLeft, Edit2, Check, X, Camera, ChevronRight, QrCode,
  Bell, Lock, Database, HelpCircle, LogOut, Key, User, Phone, FileText, Palette
} from 'lucide-react';

// ─── QR Code Generator (no external lib) ─────────────────────────────────────
function SimpleQR({ value }: { value: string }) {
  // Use a QR code API for reliable rendering
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=111111&margin=8`;
  return (
    <img src={url} alt="QR Code" className="w-[180px] h-[180px] rounded-lg shadow" />
  );
}

// ─── Status Options ───────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { emoji: '🟢', label: 'Available' },
  { emoji: '🔕', label: 'Do not disturb' },
  { emoji: '📚', label: 'Studying' },
  { emoji: '🏋️', label: 'At the gym' },
  { emoji: '🔋', label: 'Battery saving' },
  { emoji: '😴', label: 'Sleeping' },
  { emoji: '💼', label: 'At work' },
  { emoji: '🚗', label: 'Driving' },
  { emoji: '🎮', label: 'Gaming' },
];

// ─── SettingsRow Component ────────────────────────────────────────────────────
function SettingsRow({ icon, label, value, onClick, destructive = false }: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors active:bg-gray-100 dark:active:bg-[#202c33] ${destructive ? 'text-red-500' : ''}`}
    >
      <span className={`flex-shrink-0 w-5 h-5 ${destructive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
        {icon}
      </span>
      <span className={`flex-1 text-left text-[15px] ${destructive ? 'text-red-500' : 'text-gray-900 dark:text-[#e9edef]'}`}>
        {label}
      </span>
      {value && <span className="text-[13px] text-gray-400 dark:text-gray-500 truncate max-w-[130px]">{value}</span>}
      {!destructive && onClick && <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />}
    </button>
  );
}

// ─── Section Component ────────────────────────────────────────────────────────
function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111b21] border-y border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/60">
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const { user, token, logout, updateUser } = useAuth();

  // ── Profile edit state ────────────────────────────────────────────────────
  const [modal, setModal] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  const [editName, setEditName] = useState(user?.username || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editUniqueId, setEditUniqueId] = useState(user?.uniqueId || '');
  const [idStatus, setIdStatus] = useState<{ available: boolean; message: string } | null>(null);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [editStatus, setEditStatus] = useState(user?.status || 'Available');
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('Note (Default)');
  const fileRef = useRef<HTMLInputElement>(null);
  const checkIdTimeout = useRef<any>(null);

  // ── Sync state when user changes ─────────────────────────────────────────
  useEffect(() => {
    setEditName(user?.username || '');
    setEditPhone(user?.phone || '');
    setEditBio(user?.bio || '');
    setEditUniqueId(user?.uniqueId || '');
    setEditStatus(user?.status || 'Available');
    setAvatarPreview(user?.avatar || '');
  }, [user]);

  // ── Debounced unique ID check ─────────────────────────────────────────────
  const checkId = useCallback((id: string) => {
    clearTimeout(checkIdTimeout.current);
    setIdStatus(null);
    if (!id || id === user?.uniqueId) return;
    if (id.length < 4) { setIdStatus({ available: false, message: 'ID must be at least 4 characters.' }); return; }
    setIsCheckingId(true);
    checkIdTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/check-id?uniqueId=${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIdStatus(data);
      } catch {
        setIdStatus({ available: false, message: 'Could not verify.' });
      } finally {
        setIsCheckingId(false);
      }
    }, 600);
  }, [token, user?.uniqueId]);

  // ── Avatar change ─────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image too large. Max 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (idStatus && !idStatus.available && editUniqueId !== user?.uniqueId) {
      setSaveError('Please choose an available Unique ID first.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: editName,
          phone: editPhone,
          bio: editBio,
          status: editStatus,
          avatar: avatarPreview,
          uniqueId: editUniqueId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save.');
      updateUser(data.user);
      setModal(null);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save status ───────────────────────────────────────────────────────────
  const saveStatus = async (newStatus: string) => {
    setEditStatus(newStatus);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) updateUser(data.user);
    } catch { /* silently fail */ }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const userInitial = (user?.username || 'U').charAt(0).toUpperCase();

  return (
    <div className="h-full flex flex-col bg-[#f0f2f5] dark:bg-[#0b141a] overflow-y-auto custom-scrollbar">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 px-4 h-[60px]">
        <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">Settings</h1>
      </header>

      {/* ── Profile Card ────────────────────────────────────────────────── */}
      <button
        onClick={() => setModal('profile')}
        className="w-full flex items-center gap-4 px-4 py-4 bg-white dark:bg-[#111b21] hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors border-b border-gray-100 dark:border-gray-800 active:bg-gray-100"
      >
        <div className="relative flex-shrink-0">
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" className="w-[62px] h-[62px] rounded-full object-cover" />
          ) : (
            <div className="w-[62px] h-[62px] rounded-full flex items-center justify-center" style={{ background: '#00a884' }}>
              <span className="text-[24px] font-bold text-white select-none">{userInitial}</span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00a884] rounded-full border-2 border-white dark:border-[#111b21]" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[16px] font-semibold text-gray-900 dark:text-[#e9edef] truncate">{user?.username}</p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">{user?.bio || 'Hey there! I am using this app.'}</p>
          <p className="text-[11px] text-[#00a884] font-mono mt-0.5">ID: {user?.uniqueId}</p>
        </div>
        <Edit2 size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
      </button>

      {/* ── Status ──────────────────────────────────────────────────────── */}
      <div className="mt-3">
        <p className="text-[12px] font-semibold text-[#00a884] px-4 py-2 uppercase tracking-wider">Status</p>
        <Section>
          <SettingsRow
            icon={<span className="text-lg leading-none">💬</span>}
            label={user?.status || 'Available'}
            onClick={() => setModal('status')}
          />
        </Section>
      </div>

      {/* ── QR Code ─────────────────────────────────────────────────────── */}
      <div className="mt-3">
        <Section>
          <SettingsRow icon={<QrCode size={18} />} label="My QR Code" onClick={() => setModal('qr')} />
        </Section>
      </div>

      {/* ── General Settings ────────────────────────────────────────────── */}
      <div className="mt-3">
        <Section>
          <SettingsRow icon={<Palette size={18} />} label="Theme" value={theme === 'dark' ? 'Dark' : 'Light'} onClick={() => setModal('theme')} />
          <SettingsRow icon={<Bell size={18} />} label="Notifications" value="Message, group & call tones" onClick={() => setModal('notifications')} />
        </Section>
      </div>

      {/* ── Logout ──────────────────────────────────────────────────────── */}
      <div className="mt-3">
        <Section>
          <SettingsRow icon={<LogOut size={18} />} label="Log out" onClick={logout} destructive />
        </Section>
      </div>

      {/* ── Portfolio Credit ─────────────────────────────────────────────── */}
      <div className="mt-4 mb-8 px-4">
        <a
          href="https://mydeen.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-2xl transition-colors"
          style={{
            background: 'rgba(0,168,132,0.07)',
            border: '1px solid rgba(0,168,132,0.15)',
          }}
        >
          <span className="text-[13px] text-gray-500 dark:text-[#8696a0]">Built by</span>
          <span className="text-[13px] font-semibold text-[#00a884]">Mydeen</span>
          <span className="text-[11px] text-gray-400 dark:text-gray-600">↗ mydeen.vercel.app</span>
        </a>
      </div>

      {/* ── Modals (Rendered via Portal to sit on top of everything) ──────── */}
      {createPortal(
        <AnimatePresence>
          {modal && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center pb-0"
              onClick={() => setModal(null)}
            >
              <style>{`#bottom-nav-bar { display: none !important; }`}</style>
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-full sm:max-w-md bg-[#f0f2f5] dark:bg-[#0b141a] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
              {/* ── Profile Edit Modal ─────────────────────────────────── */}
              {modal === 'profile' && (
                <>
                  <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 shadow-sm z-10 relative">
                    <h2 className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">Profile</h2>
                    <button onClick={() => { setModal(null); setSaveError(null); }} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1 custom-scrollbar pb-6 relative z-0">
                    {/* Avatar */}
                    <div className="flex flex-col items-center pt-8 pb-6 bg-white dark:bg-[#111b21]">
                      <div className="relative cursor-pointer group" onClick={() => fileRef.current?.click()}>
                        {/* Show uploaded preview OR initials */}
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="avatar" className="w-36 h-36 rounded-full object-cover shadow-md" />
                        ) : (
                          <div className="w-36 h-36 rounded-full flex items-center justify-center shadow-md" style={{ background: '#00a884' }}>
                            <span className="text-[56px] font-bold text-white select-none">{userInitial}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={28} className="text-white mb-1" />
                          <span className="text-white text-[11px] font-medium uppercase tracking-wider">Change</span>
                        </div>
                        <div className="absolute bottom-0 right-3 w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center border-4 border-white dark:border-[#111b21] shadow-lg">
                          <Camera size={18} className="text-white" />
                        </div>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>

                    {/* Form Fields */}
                    <div className="mt-3 bg-white dark:bg-[#111b21] shadow-sm py-2">
                      {/* Name */}
                      <div className="flex items-start gap-4 px-6 py-4">
                        <User size={20} className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4">
                          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-1">Name</p>
                          <div className="flex items-center">
                            <input
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              maxLength={30}
                              className="w-full text-[16px] text-gray-900 dark:text-[#e9edef] bg-transparent outline-none placeholder-gray-300"
                              placeholder="Your name"
                            />
                            <p className="text-[11px] text-gray-400 font-mono flex-shrink-0">{editName.length}/30</p>
                          </div>
                          <p className="text-[12px] text-gray-400 mt-2">This is not your username or pin. This name will be visible to your contacts.</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-4 px-6 py-4">
                        <Phone size={20} className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4">
                          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                          <input
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            maxLength={20}
                            type="tel"
                            className="w-full text-[16px] text-gray-900 dark:text-[#e9edef] bg-transparent outline-none placeholder-gray-300"
                            placeholder="+1 234 567 890"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="flex items-start gap-4 px-6 py-4">
                        <FileText size={20} className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4">
                          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-1">About</p>
                          <textarea
                            value={editBio}
                            onChange={e => setEditBio(e.target.value)}
                            maxLength={139}
                            rows={2}
                            className="w-full text-[16px] text-gray-900 dark:text-[#e9edef] bg-transparent outline-none placeholder-gray-300 resize-none"
                            placeholder="Hey there! I am using this app."
                          />
                        </div>
                      </div>

                      {/* Unique ID */}
                      <div className="flex items-start gap-4 px-6 py-4">
                        <Key size={20} className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 pb-2">
                          <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-1">Unique ID</p>
                          <div className="flex items-center gap-2">
                            <input
                              value={editUniqueId}
                              onChange={e => { const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); setEditUniqueId(v); checkId(v); }}
                              maxLength={10}
                              className="flex-1 text-[16px] font-mono text-gray-900 dark:text-[#e9edef] bg-transparent outline-none uppercase placeholder-gray-300"
                              placeholder="YOUR ID"
                            />
                            {isCheckingId && <div className="w-4 h-4 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />}
                            {idStatus && !isCheckingId && (
                              idStatus.available
                                ? <Check size={18} className="text-green-500 flex-shrink-0" />
                                : <X size={18} className="text-red-500 flex-shrink-0" />
                            )}
                          </div>
                          {idStatus && !isCheckingId && (
                            <p className={`text-[12px] mt-1 ${idStatus.available ? 'text-green-500' : 'text-red-500'}`}>
                              {idStatus.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {saveError && (
                      <p className="text-red-500 text-[13px] px-6 py-3 text-center">{saveError}</p>
                    )}

                    {/* Save Button */}
                    <div className="px-6 py-6">
                      <button
                        onClick={saveProfile}
                        disabled={isSaving}
                        className="w-full py-3.5 bg-[#00a884] hover:bg-[#00956e] active:scale-[0.98] disabled:bg-gray-300 disabled:active:scale-100 text-white rounded-full font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={18} />}
                        {isSaving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── Status Modal ───────────────────────────────────────── */}
              {modal === 'status' && (
                <>
                  <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 shadow-sm z-10 relative">
                    <h2 className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">Set Status</h2>
                    <button onClick={() => setModal(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#f0f2f5] dark:bg-[#0b141a]">
                    {/* Custom status input */}
                    <div className="bg-white dark:bg-[#111b21] px-5 py-4 mt-2 shadow-sm">
                      <p className="text-[12px] font-semibold text-[#00a884] uppercase tracking-wider mb-2">Custom Status</p>
                      <div className="flex items-center gap-3">
                        <input
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                          maxLength={50}
                          className="flex-1 text-[15px] text-gray-900 dark:text-[#e9edef] bg-transparent border-b-2 border-[#00a884] outline-none pb-1 placeholder-gray-400"
                          placeholder="Write your own status..."
                        />
                        <button
                          onClick={() => { saveStatus(editStatus); setModal(null); }}
                          className="flex-shrink-0 px-4 py-2 bg-[#00a884] text-white rounded-full text-[13px] font-semibold hover:bg-[#00956e] transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    {/* Preset options */}
                    <p className="text-[12px] font-semibold text-[#00a884] uppercase tracking-wider px-5 pt-5 pb-2">Presets</p>
                    <div className="bg-white dark:bg-[#111b21] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                      {[
                        { emoji: '🟢', label: 'Available' },
                        { emoji: '🔴', label: 'Busy' },
                        { emoji: '🎒', label: 'At school' },
                        { emoji: '🎬', label: 'At the movies' },
                        { emoji: '💼', label: 'At work' },
                        { emoji: '🔋', label: 'Battery about to die' },
                        { emoji: '💬', label: "Can't talk, chat only" },
                        { emoji: '📅', label: 'In a meeting' },
                        { emoji: '🏋️', label: 'At the gym' },
                        { emoji: '😴', label: 'Sleeping' },
                        { emoji: '🚨', label: 'Urgent calls only' },
                      ].map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => { saveStatus(opt.label); setModal(null); }}
                          className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors text-left
                            ${(user?.status || 'Available') === opt.label ? 'bg-[#e8f7f2] dark:bg-[#0d2218]' : ''}`}
                        >
                          <span className="text-2xl leading-none w-8 text-center">{opt.emoji}</span>
                          <span className="flex-1 text-[15px] font-medium text-gray-900 dark:text-[#e9edef]">{opt.label}</span>
                          {(user?.status || 'Available') === opt.label && <Check size={18} className="text-[#00a884] flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Notifications Modal ─────────────────────────────────── */}
              {modal === 'notifications' && (
                <>
                  <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 shadow-sm z-10 relative">
                    <h2 className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">Notification Tone</h2>
                    <button onClick={() => setModal(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#f0f2f5] dark:bg-[#0b141a]">
                    <div className="mt-2 bg-white dark:bg-[#111b21] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                      {['Note (Default)', 'Aurora', 'Bamboo', 'Chord', 'Circles', 'Complete', 'Hello', 'Keys', 'Popcorn', 'Synth'].map((tone, idx) => (
                        <button
                          key={tone}
                          onClick={() => {
                            setSelectedTone(tone);
                            try {
                              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                              if (AudioContextClass) {
                                const ctx = new AudioContextClass();
                                const now = ctx.currentTime;
                                const playNote = (freq: number, type: OscillatorType, startTime: number, duration: number, vol: number = 0.3) => {
                                  const osc = ctx.createOscillator();
                                  const gain = ctx.createGain();
                                  osc.type = type;
                                  osc.frequency.setValueAtTime(freq, startTime);
                                  gain.gain.setValueAtTime(0, startTime);
                                  gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
                                  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                                  osc.connect(gain);
                                  gain.connect(ctx.destination);
                                  osc.start(startTime);
                                  osc.stop(startTime + duration);
                                };

                                switch (idx) {
                                  case 0: // Note
                                    playNote(600, 'sine', now, 0.3);
                                    playNote(800, 'sine', now + 0.1, 0.3);
                                    break;
                                  case 1: // Aurora
                                    playNote(440, 'triangle', now, 0.6);
                                    playNote(554, 'triangle', now, 0.6);
                                    playNote(659, 'triangle', now, 0.6);
                                    break;
                                  case 2: // Bamboo
                                    playNote(1200, 'square', now, 0.1, 0.1);
                                    playNote(800, 'square', now + 0.05, 0.1, 0.1);
                                    break;
                                  case 3: // Chord
                                    playNote(523.25, 'sawtooth', now, 0.4, 0.1);
                                    playNote(659.25, 'sawtooth', now, 0.4, 0.1);
                                    playNote(783.99, 'sawtooth', now, 0.4, 0.1);
                                    break;
                                  case 4: // Circles
                                    playNote(400, 'sine', now, 0.2);
                                    playNote(500, 'sine', now + 0.1, 0.2);
                                    playNote(600, 'sine', now + 0.2, 0.2);
                                    playNote(800, 'sine', now + 0.3, 0.4);
                                    break;
                                  case 5: // Complete
                                    playNote(523.25, 'sine', now, 0.2);
                                    playNote(1046.50, 'sine', now + 0.15, 0.4);
                                    break;
                                  case 6: // Hello
                                    playNote(659.25, 'triangle', now, 0.2);
                                    playNote(523.25, 'triangle', now + 0.15, 0.3);
                                    break;
                                  case 7: // Keys
                                    playNote(880, 'square', now, 0.15, 0.1);
                                    playNote(1108, 'square', now + 0.1, 0.15, 0.1);
                                    playNote(1318, 'square', now + 0.2, 0.3, 0.1);
                                    break;
                                  case 8: // Popcorn
                                    playNote(1000, 'square', now, 0.05, 0.1);
                                    playNote(1200, 'square', now + 0.1, 0.05, 0.1);
                                    playNote(800, 'square', now + 0.2, 0.05, 0.1);
                                    break;
                                  case 9: // Synth
                                    {
                                      const osc = ctx.createOscillator();
                                      const gain = ctx.createGain();
                                      osc.type = 'sawtooth';
                                      osc.frequency.setValueAtTime(200, now);
                                      osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                                      gain.gain.setValueAtTime(0, now);
                                      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
                                      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                                      osc.connect(gain);
                                      gain.connect(ctx.destination);
                                      osc.start(now);
                                      osc.stop(now + 0.4);
                                    }
                                    break;
                                }
                              }
                            } catch (e) {}
                          }}
                          className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors ${selectedTone === tone ? 'bg-[#e8f7f2] dark:bg-[#0d2218]' : ''}`}
                        >
                          <span className="text-[16px] text-gray-900 dark:text-[#e9edef] font-medium">{tone}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTone === tone ? 'border-[#00a884]' : 'border-gray-300 dark:border-gray-600'}`}>
                            {selectedTone === tone && <div className="w-2.5 h-2.5 bg-[#00a884] rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {/* ── Theme Modal ──────────────────────────────────────── */}
              {modal === 'theme' && (
                <>
                  <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 shadow-sm z-10 relative">
                    <h2 className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">Theme</h2>
                    <button onClick={() => setModal(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 bg-[#f0f2f5] dark:bg-[#0b141a] p-5">
                    <div className="bg-white dark:bg-[#111b21] rounded-2xl shadow-sm overflow-hidden">
                      <label className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229]">
                        <input
                          type="radio"
                          name="theme"
                          checked={theme === 'light'}
                          onChange={() => handleThemeChange('light')}
                          className="w-5 h-5 text-[#00a884] focus:ring-[#00a884] cursor-pointer"
                        />
                        <span className="text-[16px] font-medium text-gray-900 dark:text-[#e9edef]">Light</span>
                      </label>
                      <div className="h-[1px] bg-gray-100 dark:bg-gray-800 w-full" />
                      <label className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229]">
                        <input
                          type="radio"
                          name="theme"
                          checked={theme === 'dark'}
                          onChange={() => handleThemeChange('dark')}
                          className="w-5 h-5 text-[#00a884] focus:ring-[#00a884] cursor-pointer"
                        />
                        <span className="text-[16px] font-medium text-gray-900 dark:text-[#e9edef]">Dark</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* ── QR Code Modal ──────────────────────────────────────── */}
              {modal === 'qr' && (
                <>
                  <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">My QR Code</h2>
                    <button onClick={() => setModal(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#f0f2f5] dark:bg-[#0b141a] p-6 flex flex-col items-center">
                    <div className="p-4 bg-white rounded-2xl shadow-lg mt-4">
                      <SimpleQR value={`feastatnight://add?id=${user?.uniqueId}&name=${user?.username}`} />
                    </div>
                    <div className="text-center mt-6">
                      <p className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">{user?.username}</p>
                      <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Ask your friend to scan this code to start chatting</p>
                      <p className="text-[16px] font-mono text-[#00a884] mt-4 font-bold bg-[#e8f7f2] dark:bg-[#0d2218] px-6 py-3 rounded-xl border border-[#00a884]/20 shadow-sm">
                        ID: {user?.uniqueId}
                      </p>
                    </div>
                    <p className="text-[13px] text-gray-400 text-center mt-6">Or share your ID directly so friends can add you</p>
                  </div>
                </>
              )}



              {/* ── Help Modal ──────────────────────────────────────── */}
              {modal === 'help' && (
                <>
                  <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 shadow-sm z-10 relative">
                    <h2 className="text-[17px] font-semibold text-gray-900 dark:text-[#e9edef]">Help</h2>
                    <button onClick={() => setModal(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#f0f2f5] dark:bg-[#0b141a]">
                    <div className="mt-2 bg-white dark:bg-[#111b21] shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                      {[
                        { icon: <HelpCircle size={20} />, title: "Help Center", desc: "Get help, contact us" },
                        { icon: <FileText size={20} />, title: "Terms and Privacy Policy", desc: "" },
                        { icon: <div className="w-5 h-5 flex items-center justify-center font-bold text-[14px]">i</div>, title: "App info", desc: "v1.0.0 (Web)" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors">
                          <div className="text-gray-400 dark:text-gray-500">{item.icon}</div>
                          <div className="flex-1">
                            <p className="text-[16px] font-medium text-gray-900 dark:text-[#e9edef]">{item.title}</p>
                            {item.desc && <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-center justify-center mt-12 opacity-50">
                      <h3 className="font-bold text-[20px] tracking-tight text-gray-800 dark:text-gray-200">Feast At Night</h3>
                      <p className="text-[12px] font-medium text-gray-500">© 2026</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </div>
);
}
