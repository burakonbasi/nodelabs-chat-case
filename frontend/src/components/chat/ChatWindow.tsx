import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, FiMoreVertical, FiPhone, FiVideo, FiPaperclip, 
  FiMic, FiX, FiImage, FiFile, FiSmile, FiArrowLeft,
  FiSearch, FiInfo
} from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
import { EmojiPicker } from './EmojiPicker';
import { VoiceRecorder } from './VoiceRecorder';
import { FileUpload } from './FileUpload';
import { cn, getInitials } from '@/lib/utils';
import { socketManager } from '@/lib/socket';
import { MessageForm } from '@/types';
import useSound from 'use-sound';
import { useDropzone } from 'react-dropzone';

export function ChatWindow() {
  const user = useAuthStore((state) => state.user);
  const { toggleSidebar } = useUIStore();
  const {
    activeConversation,
    sendMessage,
    onlineUsers,
    typingUsers,
  } = useChatStore();
  
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  
  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm<MessageForm>();
  const [messageContent, setMessageContent] = useState('');

  // Sound effects
  const [playMessageSent] = useSound('/sounds/message-sent.mp3', { volume: 0.5 });
  const [playMessageReceived] = useSound('/sounds/message-received.mp3', { volume: 0.5 });

  const otherUser = activeConversation?.participants.find(
    p => typeof p === 'object' && p._id !== user?._id
  );

  const isOnline = otherUser && typeof otherUser === 'object' 
    ? onlineUsers.has(otherUser._id) 
    : false;

  const isTyping = activeConversation 
    ? typingUsers.get(activeConversation._id)?.has(otherUser?._id || '') 
    : false;

  // File drop zone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle file upload
    console.log('Files dropped:', acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  // Handle typing indicators
  useEffect(() => {
    if (!messageContent || !activeConversation || !otherUser || typeof otherUser !== 'object') {
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketManager.startTyping(activeConversation._id, otherUser._id);

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
    if (!data.content || !data.content.trim() || !otherUser || typeof otherUser !== 'object') {
      return;
    }

    setIsSending(true);
    try {
      await sendMessage(otherUser._id, data.content.trim());
      playMessageSent();
      reset();
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const currentContent = messageContent || '';
    const newContent = currentContent + emoji;
    setMessageContent(newContent);
    setValue('content', newContent);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentContent = getValues('content');
      if (currentContent && currentContent.trim()) {
        onSubmit({ content: currentContent });
      }
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-500">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-200 dark:bg-dark-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSmile className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Welcome to Chat
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (!otherUser || typeof otherUser !== 'object') {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-dark-400" {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Header */}
      <div className="px-4 lg:px-6 py-3 border-b border-gray-200 dark:border-dark-300 flex items-center justify-between bg-white dark:bg-dark-400">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => setShowInfo(!showInfo)}
            >
              <span className="text-white font-semibold">
                {getInitials(otherUser.username)}
              </span>
            </motion.div>
            {isOnline && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-400 rounded-full"
              />
            )}
          </div>
          
          <div 
            className="cursor-pointer"
            onClick={() => setShowInfo(!showInfo)}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {otherUser.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? (
                <span className="text-primary-600 dark:text-primary-400">typing...</span>
              ) : (
                isOnline ? 'Online' : 'Offline'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors">
            <FiSearch className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors">
            <FiPhone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors">
            <FiVideo className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            <FiInfo className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList onMessageReceived={playMessageReceived} />

      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && <TypingIndicator username={otherUser.username} />}
      </AnimatePresence>

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary-500/10 dark:bg-primary-400/10 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-dark-300 rounded-lg shadow-xl p-8 text-center">
              <FiFile className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop files here to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 lg:px-6 py-3 border-t border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-400">
        {/* Attachments Menu */}
        <AnimatePresence>
          {showAttachments && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 left-4 bg-white dark:bg-dark-300 rounded-lg shadow-xl p-2 z-50"
            >
              <button
                type="button"
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
              >
                <FiImage className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Photo & Video</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
              >
                <FiFile className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Document</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <EmojiPicker 
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex items-end space-x-2">
          <button
            type="button"
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              {...register('content', { required: true })}
              ref={messageInputRef}
              rows={1}
              placeholder="Type a message..."
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
                setValue('content', e.target.value);
              }}
              className={cn(
                "w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-300 rounded-lg resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
                "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                "transition-all duration-200 max-h-32"
              )}
              disabled={isSending}
              onKeyPress={handleKeyPress}
              style={{ minHeight: '44px' }}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            <FiSmile className="w-5 h-5" />
          </button>

          {messageContent && messageContent.trim() ? (
            <motion.button
              type="button"
              onClick={() => {
                const currentContent = getValues('content');
                if (currentContent && currentContent.trim()) {
                  onSubmit({ content: currentContent });
                }
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              disabled={isSending}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                isSending
                  ? 'bg-gray-200 dark:bg-dark-300 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
              )}
            >
              <FiSend className="w-5 h-5" />
            </motion.button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
            >
              <FiMic className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}