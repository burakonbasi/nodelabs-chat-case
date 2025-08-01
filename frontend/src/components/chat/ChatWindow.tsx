import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMoreVertical, FiPhone, FiVideo } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
import { cn, getInitials } from '@/lib/utils';
import { socketManager } from '@/lib/socket';
import { MessageForm } from '@/types';

export function ChatWindow() {
  const user = useAuthStore((state) => state.user);
  const {
    activeConversation,
    sendMessage,
    onlineUsers,
    typingUsers,
  } = useChatStore();
  
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { register, handleSubmit, reset, watch } = useForm<MessageForm>();
  const messageContent = watch('content');

  const otherUser = activeConversation?.participants.find(
    p => typeof p === 'object' && p._id !== user?._id
  );

  const isOnline = otherUser && typeof otherUser === 'object' 
    ? onlineUsers.has(otherUser._id) 
    : false;

  const isTyping = activeConversation 
    ? typingUsers.get(activeConversation._id)?.has(otherUser?._id || '') 
    : false;

  // Handle typing indicators
  useEffect(() => {
    if (!messageContent || !activeConversation || !otherUser || typeof otherUser !== 'object') {
      return;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start
    socketManager.startTyping(activeConversation._id, otherUser._id);

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socketManager.stopTyping(activeConversation._id, otherUser._id);
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (activeConversation && otherUser && typeof otherUser === 'object') {
        socketManager.stopTyping(activeConversation._id, otherUser._id);
      }
    };
  }, [messageContent, activeConversation, otherUser]);

  const onSubmit = async (data: MessageForm) => {
    if (!data.content.trim() || !otherUser || typeof otherUser !== 'object') return;

    setIsSending(true);
    try {
      await sendMessage(otherUser._id, data.content.trim());
      reset();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-600">
            Choose a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (!otherUser || typeof otherUser !== 'object') {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold">
                {getInitials(otherUser.username)}
              </span>
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{otherUser.username}</h3>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiPhone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiVideo className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList />

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator username={otherUser.username} />}

      {/* Message Input */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <input
            {...register('content', { required: true })}
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !messageContent?.trim()}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isSending || !messageContent?.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}