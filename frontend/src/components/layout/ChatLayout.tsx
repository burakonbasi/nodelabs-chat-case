import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiSettings, FiSearch, FiPlus } from 'react-icons/fi';
import { useUIStore } from '@/stores/uiStore';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { UserProfile } from '@/components/user/UserProfile';
import { SearchModal } from '@/components/chat/SearchModal';
import { NewChatModal } from '@/components/modals/NewChatModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { cn } from '@/lib/utils';

export function ChatLayout() {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { activeTheme, toggleTheme, initTheme } = useThemeStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-500 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-400 border-b border-gray-200 dark:border-dark-300">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <FiX className="w-6 h-6 text-gray-700 dark:text-gray-200" /> : <FiMenu className="w-6 h-6 text-gray-700 dark:text-gray-200" />}
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
            >
              {activeTheme === 'dark' ? (
                <FiSun className="w-5 h-5 text-yellow-500" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <>
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'w-80 lg:w-96 bg-white dark:bg-dark-400 shadow-xl transform transition-transform duration-300 ease-in-out z-40',
                'fixed lg:relative h-full',
                'lg:border-r border-gray-200 dark:border-dark-300'
              )}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 dark:border-dark-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setShowProfile(true)}
                      className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <span className="text-white font-semibold">
                        {user?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Messages</h2>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowNewChat(true)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowSearch(true)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
                    >
                      <FiSearch className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors hidden lg:block"
                    >
                      <FiSettings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors hidden lg:block"
                    >
                      {activeTheme === 'dark' ? (
                        <FiSun className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <FiMoon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <ConversationList />
            </motion.aside>

            {/* Mobile overlay */}
            {isSidebarOpen && window.innerWidth < 1024 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                onClick={toggleSidebar}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex pt-16 lg:pt-0">
        <ChatWindow />
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showProfile && (
          <UserProfile onClose={() => setShowProfile(false)} />
        )}
        {showSearch && (
          <SearchModal onClose={() => setShowSearch(false)} />
        )}
        {showNewChat && (
          <NewChatModal onClose={() => setShowNewChat(false)} />
        )}
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}