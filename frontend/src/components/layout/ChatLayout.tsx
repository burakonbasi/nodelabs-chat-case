import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useUIStore } from '@/stores/uiStore';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { UserProfile } from '@/components/user/UserProfile';
import { cn } from '@/lib/utils';

export function ChatLayout() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isSidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'w-80 lg:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40',
          'fixed lg:relative h-full',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <ConversationList />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex">
        <ChatWindow />
      </main>

      {/* User Profile Sidebar */}
      {showProfile && (
        <aside className="w-80 bg-white shadow-lg">
          <UserProfile onClose={() => setShowProfile(false)} />
        </aside>
      )}

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}