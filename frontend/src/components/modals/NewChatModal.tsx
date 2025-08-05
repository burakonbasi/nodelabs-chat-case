import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiUser, FiUsers, FiMessageCircle } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { cn, getInitials } from '../../lib/utils';
import type { User } from '../../types';

interface NewChatModalProps {
  onClose: () => void;
}

export function NewChatModal({ onClose }: NewChatModalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'group'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentUser = useAuthStore((state) => state.user);
  const { conversations, setActiveConversation } = useChatStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      const allUsers = response.data.data.users;
      // Filter out current user
      setUsers(allUsers.filter((u: User) => u._id !== currentUser?._id));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = async (user: User) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv =>
      conv.participants.some(p => typeof p === 'object' && p._id === user._id)
    );

    if (existingConversation) {
      setActiveConversation(existingConversation);
      onClose();
      return;
    }

    // Create new conversation
    try {
      const response = await api.post('/messages/conversations', {
        participantId: user._id,
      });
      const newConversation = response.data.data.conversation;
      setActiveConversation(newConversation);
      toast.success(`Started chat with ${user.username}`);
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleGroupCreate = async (data: any) => {
    if (selectedUsers.size < 2) {
      toast.error('Select at least 2 users for a group');
      return;
    }

    try {
      const response = await api.post('/messages/groups', {
        name: data.groupName,
        participants: Array.from(selectedUsers),
      });
      const newGroup = response.data.data.group;
      setActiveConversation(newGroup);
      toast.success('Group created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              New Chat
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200",
                activeTab === 'users'
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <FiUser className="w-4 h-4" />
              <span className="text-sm font-medium">Users</span>
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200",
                activeTab === 'group'
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <FiUsers className="w-4 h-4" />
              <span className="text-sm font-medium">Group</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className={cn(
                "w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              )}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {activeTab === 'users' ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <FiUser className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <motion.button
                    key={user._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUserSelect(user)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {getInitials(user.username)}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <FiMessageCircle className="w-5 h-5 text-gray-400" />
                  </motion.button>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleGroupCreate)}>
              {/* Group Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  {...register('groupName', { required: 'Group name is required' })}
                  type="text"
                  className={cn(
                    "w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                    "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  )}
                  placeholder="Enter group name..."
                />
                {errors.groupName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.groupName.message}
                  </p>
                )}
              </div>

              {/* User Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Members ({selectedUsers.size} selected)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  {filteredUsers.map((user) => (
                    <label
                      key={user._id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                        selectedUsers.has(user._id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-600"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                      />
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {getInitials(user.username)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Create Button */}
              <button
                type="submit"
                disabled={selectedUsers.size < 2}
                className={cn(
                  "w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200",
                  selectedUsers.size >= 2
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                )}
              >
                Create Group
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 