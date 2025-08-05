import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';
import { 
  FiMoreVertical, FiCornerUpLeft, FiCopy, FiTrash2, 
  FiEdit2, FiCheck, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, cn } from '@/lib/utils';
import { Message } from '@/types';
import { MessageReactions } from './MessageReactions';
import { ImagePreview } from './ImagePreview';

interface MessageListProps {
  onMessageReceived?: () => void;
}

export function MessageList({ onMessageReceived }: MessageListProps) {
  const user = useAuthStore((state) => state.user);
  const { messages, isLoadingMessages, fetchOlderMessages, activeConversation } = useChatStore();
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Infinite scroll
  const { ref: topRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && !isLoadingMessages && activeConversation) {
      fetchOlderMessages?.(activeConversation._id);
    }
  }, [inView, isLoadingMessages, activeConversation, fetchOlderMessages]);

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
    scrollToFn: (offset, options) => {
      parentRef.current?.scrollTo({
        top: offset,
        behavior: options?.behavior || 'smooth',
      });
    },
  });

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (parentRef.current) {
      const { scrollHeight } = parentRef.current;
      virtualizer.scrollToIndex(messages.length - 1, { behavior: 'smooth' });
    }
  }, [messages.length, virtualizer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Play sound on new message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId !== user?._id && onMessageReceived) {
        onMessageReceived();
      }
    }
  }, [messages.length, user?._id, onMessageReceived]);

  const handleContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const getMessageStatus = (message: Message) => {
    const isOwn = message.senderId === user?._id || 
      (typeof message.senderId === 'object' && message.senderId._id === user?._id);
    
    if (!isOwn) return null;

    if (message.readAt) {
      return <FiCheckCircle className="w-4 h-4 text-blue-500" />;
    } else if (message.deliveredAt) {
      return (
        <div className="flex -space-x-1">
          <FiCheck className="w-4 h-4 text-gray-400" />
          <FiCheck className="w-4 h-4 text-gray-400" />
        </div>
      );
    } else if (message.createdAt) {
      return <FiCheck className="w-4 h-4 text-gray-400" />;
    }
    return <FiClock className="w-3 h-3 text-gray-400" />;
  };

  const renderMessage = (message: Message, virtualRow: any) => {
    const isOwn = message.senderId === user?._id || 
      (typeof message.senderId === 'object' && message.senderId._id === user?._id);
    
    const showDate = virtualRow.index === 0 || 
      new Date(messages[virtualRow.index - 1].createdAt).toDateString() !== 
      new Date(message.createdAt).toDateString();

    return (
      <div
        key={`${message._id}-${virtualRow.index}-${message.createdAt}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }}
      >
        {showDate && (
          <div className="flex items-center justify-center my-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-300 px-3 py-1 rounded-full">
              {formatDate(message.createdAt)}
            </span>
          </div>
        )}
        
        <div className={cn('flex mb-2 px-4', isOwn ? 'justify-end' : 'justify-start')}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onContextMenu={(e) => handleContextMenu(e, message._id)}
            className={cn(
              'group relative max-w-xs lg:max-w-md',
              selectedMessage === message._id && 'ring-2 ring-primary-500 rounded-lg'
            )}
          >
            {/* Message Bubble */}
            <div
              className={cn(
                'px-4 py-2 rounded-2xl shadow-sm',
                isOwn 
                  ? 'bg-primary-600 text-white rounded-br-sm' 
                  : 'bg-gray-100 dark:bg-dark-300 text-gray-900 dark:text-white rounded-bl-sm'
              )}
            >
              {/* Reply Preview */}
              {message.replyTo && (
                <div className={cn(
                  'mb-2 p-2 rounded-lg text-sm',
                  isOwn ? 'bg-primary-700/50' : 'bg-gray-200/50 dark:bg-dark-200/50'
                )}>
                  <p className="font-medium mb-1">Reply to:</p>
                  <p className="opacity-80 line-clamp-2">{message.replyTo.content}</p>
                </div>
              )}

              {/* Message Content */}
              {message.type === 'image' && message.media ? (
                <img 
                  src={message.media.url} 
                  alt="Shared image"
                  className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImagePreview(message.media!.url)}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                  {message.edited && (
                    <span className={cn(
                      'text-xs ml-2',
                      isOwn ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      (edited)
                    </span>
                  )}
                </p>
              )}

              {/* Time and Status */}
              <div className={cn(
                'flex items-center gap-1 mt-1',
                isOwn ? 'justify-end' : 'justify-start'
              )}>
                <p className={cn(
                  'text-xs',
                  isOwn ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
                )}>
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                {getMessageStatus(message)}
              </div>
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <MessageReactions 
                reactions={message.reactions}
                messageId={message._id}
                isOwn={isOwn}
              />
            )}

            {/* Quick Actions (visible on hover) */}
            <div className={cn(
              'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity',
              isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
            )}>
              <div className="flex items-center gap-1 bg-white dark:bg-dark-300 rounded-lg shadow-lg p-1">
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors">
                  <FiCornerUpLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors">
                  <FiMoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-500"
        onClick={closeContextMenu}
      >
        {/* Load more indicator */}
        <div ref={topRef} className="h-10 flex items-center justify-center">
          {isLoadingMessages && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 dark:border-primary-400" />
          )}
        </div>

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
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
              renderMessage(messages[virtualRow.index], virtualRow)
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-white dark:bg-dark-300 rounded-lg shadow-xl py-2 min-w-[160px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-200 text-sm text-gray-700 dark:text-gray-200">
              <FiCornerUpLeft className="w-4 h-4" />
              Reply
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-200 text-sm text-gray-700 dark:text-gray-200">
              <FiCopy className="w-4 h-4" />
              Copy
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-200 text-sm text-gray-700 dark:text-gray-200">
              <FiEdit2 className="w-4 h-4" />
              Edit
            </button>
            <hr className="my-1 border-gray-200 dark:border-dark-200" />
            <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
              <FiTrash2 className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {imagePreview && (
          <ImagePreview 
            src={imagePreview}
            onClose={() => setImagePreview(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}