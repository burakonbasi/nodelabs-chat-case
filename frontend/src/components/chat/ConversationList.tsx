import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiCheck, FiCheckSquare, FiSquare } from 'react-icons/fi';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, truncateText, getInitials, cn } from '@/lib/utils';
import { Conversation, User } from '@/types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function ConversationList() {
  const user = useAuthStore((state) => state.user);
  const {
    conversations,
    activeConversation,
    fetchConversations,
    setActiveConversation,
    onlineUsers,
    typingUsers,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'online'>('all');
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const getOtherParticipant = (conversation: Conversation): User | null => {
    if (!user) return null;
    return conversation.participants.find(p => 
      typeof p === 'object' && p._id !== user._id
    ) as User || null;
  };

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(conv => {
        const otherUser = getOtherParticipant(conv);
        return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(conv => {
        const unreadCount = user ? conv.unreadCount?.get(user._id) || 0 : 0;
        return unreadCount > 0;
      });
    } else if (filter === 'online') {
      filtered = filtered.filter(conv => {
        const otherUser = getOtherParticipant(conv);
        return otherUser && onlineUsers.has(otherUser._id);
      });
    }

    return filtered;
  }, [conversations, searchQuery, filter, user, onlineUsers]);

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: filteredConversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  const renderConversation = (conversation: Conversation, virtualRow: any) => {
    const otherUser = getOtherParticipant(conversation);
    if (!otherUser) return null;

    const isActive = activeConversation?._id === conversation._id;
    const isOnline = onlineUsers.has(otherUser._id);
    
    // unreadCount'u güvenli şekilde kontrol et
    let unreadCount = 0;
    if (user && conversation.unreadCount) {
      if (typeof conversation.unreadCount === 'object' && conversation.unreadCount !== null) {
        // Map veya obje olabilir
        if (conversation.unreadCount instanceof Map) {
          unreadCount = conversation.unreadCount.get(user._id) || 0;
        } else {
          // Obje olarak kontrol et
          unreadCount = (conversation.unreadCount as any)[user._id] || 0;
        }
      } else if (typeof conversation.unreadCount === 'number') {
        unreadCount = conversation.unreadCount;
      }
    }
    
    const isTyping = typingUsers.get(conversation._id)?.has(otherUser._id) || false;

    return (
      <motion.div
        key={conversation._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, delay: virtualRow.index * 0.02 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }}
      >
        <button
          onClick={() => setActiveConversation(conversation)}
          className={cn(
            'w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-dark-300 transition-all duration-200',
            isActive && 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          )}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-primary-400 to-primary-600",
                isActive && "from-primary-500 to-primary-700"
              )}
            >
              <span className="text-white font-semibold">
                {getInitials(otherUser.username)}
              </span>
            </motion.div>
            {isOnline && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-400 rounded-full"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "text-sm font-medium truncate",
                isActive ? "text-primary-700 dark:text-primary-300" : "text-gray-900 dark:text-white"
              )}>
                {otherUser.username}
              </h3>
              <div className="flex items-center gap-1">
                {conversation.lastMessage && (
                  <span className={cn(
                    "text-xs",
                    unreadCount > 0 ? "text-primary-600 dark:text-primary-400 font-medium" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {formatDate(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className={cn(
                "text-sm truncate flex-1",
                unreadCount > 0 ? "text-gray-800 dark:text-gray-200 font-medium" : "text-gray-600 dark:text-gray-400"
              )}>
                {isTyping ? (
                  <span className="text-primary-600 dark:text-primary-400 italic">typing...</span>
                ) : conversation.lastMessage ? (
                  <>
                    {conversation.lastMessage.senderId === user?._id && (
                      <span className="inline-flex mr-1">
                        <FiCheck className={cn(
                          "w-4 h-4",
                          conversation.lastMessage.readAt ? "text-blue-500" : "text-gray-400"
                        )} />
                      </span>
                    )}
                    {truncateText(conversation.lastMessage.content, 50)}
                  </>
                ) : (
                  <span className="italic">Start a conversation</span>
                )}
              </p>

              {/* Unread Badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0 ml-2"
                >
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-primary-600 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </button>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-dark-300">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className={cn(
              "w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-dark-300 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
              "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
              "transition-all duration-200"
            )}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2",
              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
              showFilters && "text-primary-600 dark:text-primary-400"
            )}
          >
            <FiFilter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {(['all', 'unread', 'online'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm",
                    "hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors",
                    filter === filterOption && "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  )}
                >
                  {filter === filterOption ? (
                    <FiCheckSquare className="w-4 h-4" />
                  ) : (
                    <FiSquare className="w-4 h-4" />
                  )}
                  <span className="capitalize">{filterOption} Chats</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversation List with Virtual Scrolling */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => 
              renderConversation(filteredConversations[virtualRow.index], virtualRow)
            )}
          </div>
        )}
      </div>
    </div>
  );
}