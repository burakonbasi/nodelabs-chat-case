import React from 'react';
import { motion } from 'framer-motion';
import { X, Reply, Image, FileText, Mic, Film } from 'lucide-react';
import { Message } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface ReplyPreviewProps {
  message: Message;
  onClose: () => void;
  compact?: boolean;
  className?: string;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  message,
  onClose,
  compact = false,
  className = '',
}) => {
  const { user: currentUser } = useAuthStore();
  const isOwnMessage = message.sender.id === currentUser?.id;

  const getMessagePreview = () => {
    switch (message.type) {
      case 'text':
        return message.content || 'Message';
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎤 Voice message';
      case 'file':
        return `📎 ${message.attachments?.[0]?.name || 'File'}`;
      default:
        return 'Message';
    }
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Film className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${className}`}>
        <Reply className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isOwnMessage ? 'You' : message.sender.fullName || message.sender.username}
          </span>
          <p className="text-sm truncate">{getMessagePreview()}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`px-4 py-3 bg-gray-50 dark:bg-gray-900 border-l-4 border-primary-500 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Reply className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Replying to {isOwnMessage ? 'yourself' : message.sender.fullName || message.sender.username}
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            {getMessageIcon()}
            {message.type === 'image' && message.attachments?.[0]?.thumbnail && (
              <img
                src={message.attachments[0].thumbnail}
                alt="Reply preview"
                className="w-10 h-10 rounded object-cover"
              />
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {getMessagePreview()}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Cancel reply"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </motion.div>
  );
};

// Edit Preview Component (similar to reply but for editing)
interface EditPreviewProps {
  message: Message;
  onClose: () => void;
  className?: string;
}

export const EditPreview: React.FC<EditPreviewProps> = ({
  message,
  onClose,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-yellow-700 dark:text-yellow-300">
              Editing message
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {message.content}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-yellow-200 dark:hover:bg-yellow-800/30 rounded transition-colors"
          aria-label="Cancel edit"
        >
          <X className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        </button>
      </div>
    </motion.div>
  );
};