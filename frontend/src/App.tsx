import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useThemeStore } from '@/stores/themeStore';
import { socketManager } from '@/lib/socket';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ChatLayout } from '@/components/layout/ChatLayout';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { initTheme } = useThemeStore();
  const {
    addMessage,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    setUserStoppedTyping,
  } = useChatStore();

  useEffect(() => {
    // Initialize theme
    initTheme();
    
    // Check authentication
    checkAuth();

    // Connect to socket
    socketManager.connect();

    // Register service worker for PWA - DISABLED FOR NOW
    // if ('serviceWorker' in navigator) {
    //   window.addEventListener('load', () => {
    //     navigator.serviceWorker.register('/sw.js').then(
    //       (registration) => {
    //         console.log('SW registered:', registration);
    //       },
    //       (error) => {
    //         console.log('SW registration failed:', error);
    //       }
    //     );
    //   });
    // }
  }, [checkAuth, initTheme]);

  useEffect(() => {
    // Socket event listeners
    socketManager.on('message_received', ({ message, conversationId }) => {
      addMessage(message, conversationId);
    });

    socketManager.on('message_sent', ({ message, conversationId }) => {
      addMessage(message, conversationId);
    });

    socketManager.on('user_online', ({ userId }) => {
      setUserOnline(userId);
    });

    socketManager.on('user_offline', ({ userId }) => {
      setUserOffline(userId);
    });

    socketManager.on('user_typing', ({ userId, conversationId }) => {
      setUserTyping(userId, conversationId);
    });

    socketManager.on('user_stopped_typing', ({ userId, conversationId }) => {
      setUserStoppedTyping(userId, conversationId);
    });

    return () => {
      socketManager.off('message_received');
      socketManager.off('message_sent');
      socketManager.off('user_online');
      socketManager.off('user_offline');
      socketManager.off('user_typing');
      socketManager.off('user_stopped_typing');
    };
  }, [addMessage, setUserOnline, setUserOffline, setUserTyping, setUserStoppedTyping]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/login" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm />
                </motion.div>
              } 
            />
            <Route 
              path="/register" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm />
                </motion.div>
              } 
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-screen"
                  >
                    <ChatLayout />
                  </motion.div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;