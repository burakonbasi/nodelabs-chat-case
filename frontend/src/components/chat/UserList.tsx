import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMessageCircle, FiUserPlus } from 'react-icons/fi';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { getInitials, cn } from '@/lib/utils';
import { User } from '@/types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { toast } from 'react-hot-toast';

export function UserList() {
  const user = useAuthStore((state) => state.user);
  const {
    users,
    isLoadingUsers,
    fetchUsers,
    onlineUsers,
    createConversation,
    setActiveConversation,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users (exclude current user and apply search)
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (u._id === user?._id) return false;
      if (searchQuery) {
        return u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
               u.email.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [users, searchQuery, user]);

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  const handleStartConversation = async (targetUserId: string) => {
    if (isCreatingConversation) return;
    
    setIsCreatingConversation(targetUserId);
    
    try {
      const targetUser = users.find(u => u._id === targetUserId);
      const initialMessage = `Merhaba ${targetUser?.username}! 👋`;
      
      const newConversation = await createConversation(targetUserId, initialMessage);
      
      // Yeni conversation'ı aktif hale getir
      setActiveConversation(newConversation);
      
      toast.success(`Conversation with ${targetUser?.username} started!`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    } finally {
      setIsCreatingConversation(null);
    }
  };

  const renderUser = (userItem: User, virtualRow: any) => {
    const isOnline = onlineUsers.has(userItem._id);
    const isCreating = isCreatingConversation === userItem._id;

    return (
      <motion.div
        key={userItem._id}
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
        <div className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-dark-300 transition-all duration-200">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600"
            >
              <span className="text-white font-semibold">
                {getInitials(userItem.username)}
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
              <h3 className="text-sm font-medium truncate text-gray-900 dark:text-white">
                {userItem.username}
              </h3>
              <div className="flex items-center gap-1">
                {isOnline && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Online
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm truncate flex-1 text-gray-600 dark:text-gray-400">
                {userItem.email}
              </p>

              {/* Start Conversation Button */}
              <button
                onClick={() => handleStartConversation(userItem._id)}
                disabled={isCreating}
                className={cn(
                  "flex-shrink-0 ml-2 p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors",
                  isCreating && "opacity-50 cursor-not-allowed"
                )}
                title="Start conversation"
              >
                {isCreating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                ) : (
                  <FiMessageCircle className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
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
            placeholder="Search users..."
            className={cn(
              "w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-dark-300 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
              "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
              "transition-all duration-200"
            )}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2",
              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
              showAddUser && "text-primary-600 dark:text-primary-400"
            )}
            title="Add new user"
          >
            <FiUserPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User List with Virtual Scrolling */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        {isLoadingUsers ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No users found' : 'No users available'}
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
              renderUser(filteredUsers[virtualRow.index], virtualRow)
            )}
          </div>
        )}
      </div>
    </div>
  );
} 