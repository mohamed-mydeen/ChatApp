import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SocketProvider } from './context/SocketContext.tsx'
import AuthScreen from './components/AuthScreen.tsx'
import { AuthProvider, useAuth } from './hooks/useAuth.tsx'
import { E2EProvider } from './context/E2EContext.tsx'

// ── Apply saved theme immediately to avoid FOUC ───────────────────────────────
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0b141a]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00a884] border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !user._id) {
    return <AuthScreen onLoginSuccess={() => {}} />;
  }

  return (
    <SocketProvider userId={user._id}>
      <App />
    </SocketProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <E2EProvider>
        <Root />
      </E2EProvider>
    </AuthProvider>
  </StrictMode>,
)
