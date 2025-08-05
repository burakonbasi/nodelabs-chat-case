import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLayout from '../components/layout/ChatLayout';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { useChatStore } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';

const Home = () => {
  const navigate = useNavigate();
  const { selectedChat, conversations } = useChatStore();
  const { isMobile } = useUIStore();

  // Handle mobile navigation
  useEffect(() => {
    if (isMobile && selectedChat) {
      navigate(`/chat/${selectedChat.id}`);
    }
  }, [isMobile, selectedChat, navigate]);

  return (
    <ChatLayout>
      <div className="flex h-full">
        {/* Conversation List - Always visible on desktop, hidden on mobile when chat is selected */}
        <div className={`${
          isMobile && selectedChat ? 'hidden' : 'block'
        } w-full md:w-96 border-r border-gray-200 dark:border-gray-800`}>
          <ConversationList />
        </div>

        {/* Chat Window - Hidden on mobile (separate route), visible on desktop */}
        <div className={`${
          isMobile ? 'hidden' : 'flex-1'
        } relative`}>
          {selectedChat ? (
            <ChatWindow />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
              <div className="text-center px-4">
                <img
                  src="/assets/images/empty-chat.svg"
                  alt="No chat selected"
                  className="w-64 h-64 mx-auto mb-6 opacity-50"
                />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Welcome to Chat App
                </h3>
                <p className="text-gray-500 dark:text-gray-500 max-w-sm mx-auto">
                  Select a conversation from the list to start chatting or create a new one.
                </p>
                <button
                  onClick={() => useUIStore.getState().openModal('newChat')}
                  className="mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChatLayout>
  );
};

export default Home;