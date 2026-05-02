import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User as UserIcon, ArrowRight, MessageSquareCode } from 'lucide-react';

export default function AuthScreen({ onLoginSuccess }: { onLoginSuccess: (userId: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let user;
      if (isLogin) {
        user = await login(email, password);
      } else {
        user = await register(username, email, password);
      }
      if (user && user._id) {
        onLoginSuccess(user._id);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* ── Background Elements ───────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated gradients */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-teal-500/20 blur-[120px] mix-blend-screen"
        />
      </div>

      {/* ── Auth Card ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[2rem] p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 rotate-3"
            >
              <MessageSquareCode className="w-8 h-8 text-white -rotate-3" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-emerald-100/70 text-sm">
              {isLogin ? 'Enter your details to access your chats.' : 'Sign up to start messaging instantly.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-4 flex items-center gap-3 backdrop-blur-md"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-black/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none sm:text-sm"
                      placeholder="Username"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-black/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-black/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none sm:text-sm"
                placeholder="Password"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="relative w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {/* Button sheen effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                clearError();
              }}
              className="text-sm text-emerald-200/60 hover:text-emerald-300 transition-colors focus:outline-none"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold text-emerald-400 hover:underline underline-offset-4 decoration-2">
                {isLogin ? 'Sign up' : 'Log in'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
