import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { socketManager } from '@/lib/socket';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ChatLayout } from '@/components/layout/ChatLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const {
    addMessage,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    setUserStoppedTyping,
  } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;