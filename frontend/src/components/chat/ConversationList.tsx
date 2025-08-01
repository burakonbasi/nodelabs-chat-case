import { useEffect } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, truncateText, getInitials, cn } from '@/lib/utils';
import { Conversation, User } from '@/types';

export function ConversationList() {
  const user = useAuthStore((state) => state.user);
  const {
    conversations,
    activeConversation,
    fetchConversations,
    setActiveConversation,
    onlineUsers,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const getOtherParticipant = (conversation: Conversation): User | null => {
    if (!user) return null;
    return conversation.participants.find(p => 
      typeof p === 'object' && p._id !== user._id
    ) as User || null;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            if (!otherUser) return null;

            const isActive = activeConversation?._id === conversation._id;
            const isOnline = onlineUsers.has(otherUser._id);
            const unreadCount = user ? conversation.unreadCount?.get(user._id) || 0 : 0;

            return (
              <button
                key={conversation._id}
                onClick={() => setActiveConversation(conversation)}
                className={cn(
                  'w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors',
                  isActive && 'bg-primary-50 hover:bg-primary-50'
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold">
                      {getInitials(otherUser.username)}
                    </span>
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {otherUser.username}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessage && formatDate(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage 
                      ? truncateText(conversation.lastMessage.content, 50)
                      : 'Start a conversation'}
                  </p>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                      {unreadCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}