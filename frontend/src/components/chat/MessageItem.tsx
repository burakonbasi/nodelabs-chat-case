// src/components/chat/MessageItem.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreVertical, 
  Reply, 
  Forward, 
  Copy, 
  Pin, 
  Trash2, 
  Edit2,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Download,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { Message, MessageStatus } from '../../types';
import { UserAvatar } from '../user/UserAvatar';
import { MessageReactions } from './MessageReactions';
import { Dropdown } from '../common/Dropdown';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useContextMenu } from '../common/ContextMenu';
import { SimpleTooltip } from '../common/Tooltip';

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
  showUsername?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onForward?: () => void;
  onReact?: (emoji: string) => void;
  onImageClick?: (url: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  showAvatar = true,
  showUsername = true,
  isFirstInGroup = false,
  isLastInGroup = false,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onReact,
  onImageClick,
}) => {
  const { user: currentUser } = useAuthStore();
  const { editingMessageId, setEditingMessage } = useChatStore();
  const [showActions, setShowActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { show: showContextMenu } = useContextMenu();

  const isOwn = message.sender.id === currentUser?.id;
  const isEditing = editingMessageId === message.id;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const items = [
      {
        id: 'reply',
        label: 'Reply',
        icon: <Reply className="w-4 h-4" />,
        onClick: onReply,
      },
      {
        id: 'forward',
        label: 'Forward',
        icon: <Forward className="w-4 h-4" />,
        onClick: onForward,
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: <Copy className="w-4 h-4" />,
        onClick: () => {
          if (message.content) {
            navigator.clipboard.writeText(message.content);
          }
        },
      },
      ...(isOwn
        ? [
            {
              id: 'edit',
              label: 'Edit',
              icon: <Edit2 className="w-4 h-4" />,
              onClick: onEdit,
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: <Trash2 className="w-4 h-4" />,
              onClick: onDelete,
              danger: true,
            },
          ]
        : []),
    ];
    showContextMenu(e, items);
  };

  const renderStatus = () => {
    if (!isOwn) return null;

    const statusIcons = {
      sending: <Clock className="w-4 h-4 text-gray-400" />,
      sent: <Check className="w-4 h-4 text-gray-400" />,
      delivered: <CheckCheck className="w-4 h-4 text-gray-400" />,
      read: <CheckCheck className="w-4 h-4 text-blue-500" />,
      failed: <AlertCircle className="w-4 h-4 text-red-500" />,
    };

    return statusIcons[message.status] || null;
  };

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="break-words whitespace-pre-wrap">
            {message.content}
          </div>
        );

      case 'image':
        return (
          <div className="relative group cursor-pointer">
            <img
              src={message.attachments?.[0]?.url}
              alt="Shared image"
              className="max-w-sm rounded-lg"
              onClick={() => onImageClick?.(message.attachments?.[0]?.url || '')}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <video
              src={message.attachments?.[0]?.url}
              controls
              className="max-w-sm rounded-lg"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) {
                    audioRef.current.pause();
                  } else {
                    audioRef.current.play();
                  }
                  setIsPlaying(!isPlaying);
                }
              }}
              className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded-full" />
            </div>
            <Volume2 className="w-5 h-5 text-gray-500" />
            <audio
              ref={audioRef}
              src={message.attachments?.[0]?.url}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium truncate">
                {message.attachments?.[0]?.name}
              </div>
              <div className="text-sm text-gray-500">
                {message.attachments?.[0]?.size}
              </div>
            </div>
            <a
              href={message.attachments?.[0]?.url}
              download
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        group relative flex gap-3 px-4 py-2
        ${isOwn ? 'flex-row-reverse' : ''}
        ${isFirstInGroup ? 'mt-4' : 'mt-1'}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onContextMenu={handleContextMenu}
    >
      {/* Avatar */}
      {showAvatar && !isOwn ? (
        <div className="flex-shrink-0">
          {isLastInGroup ? (
            <UserAvatar user={message.sender} size="sm" />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      ) : (
        !isOwn && <div className="w-8 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Username */}
        {showUsername && !isOwn && isFirstInGroup && (
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-3">
            {message.sender.fullName || message.sender.username}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`
            relative inline-block rounded-2xl px-4 py-2
            ${
              isOwn
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }
            ${message.replyTo ? 'min-w-[200px]' : ''}
          `}
        >
          {/* Reply Preview */}
          {message.replyTo && (
            <div
              className={`
                mb-2 p-2 rounded-lg text-sm
                ${
                  isOwn
                    ? 'bg-primary-600/50 border-l-2 border-primary-300'
                    : 'bg-gray-200 dark:bg-gray-600 border-l-2 border-gray-400'
                }
              `}
            >
              <div className="font-medium opacity-75">
                {message.replyTo.sender.fullName || message.replyTo.sender.username}
              </div>
              <div className="opacity-75 truncate">
                {message.replyTo.content}
              </div>
            </div>
          )}

          {/* Message Content */}
          {renderContent()}

          {/* Edited Label */}
          {message.edited && (
            <span className="text-xs opacity-60 ml-2">(edited)</span>
          )}

          {/* Time & Status */}
          <div className="flex items-center gap-1 justify-end mt-1">
            <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {renderStatus()}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions
              reactions={message.reactions}
              onReact={onReact}
              position={isOwn ? 'left' : 'right'}
            />
          )}
        </div>

        {/* Message Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`
                absolute top-0 flex items-center gap-1
                ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}
              `}
            >
              <SimpleTooltip text="React">
                <button
                  onClick={() => onReact?.('👍')}
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  <span className="text-sm">😊</span>
                </button>
              </SimpleTooltip>
              
              <SimpleTooltip text="Reply">
                <button
                  onClick={onReply}
                  className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  <Reply className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </SimpleTooltip>

              <Dropdown
                options={[
                  {
                    value: 'forward',
                    label: 'Forward',
                    icon: <Forward className="w-4 h-4" />,
                  },
                  {
                    value: 'copy',
                    label: 'Copy',
                    icon: <Copy className="w-4 h-4" />,
                  },
                  {
                    value: 'pin',
                    label: 'Pin',
                    icon: <Pin className="w-4 h-4" />,
                  },
                  ...(isOwn
                    ? [
                        {
                          value: 'edit',
                          label: 'Edit',
                          icon: <Edit2 className="w-4 h-4" />,
                        },
                        {
                          value: 'delete',
                          label: 'Delete',
                          icon: <Trash2 className="w-4 h-4" />,
                          danger: true,
                        },
                      ]
                    : []),
                ]}
                onChange={(value) => {
                  switch (value) {
                    case 'forward':
                      onForward?.();
                      break;
                    case 'copy':
                      if (message.content) {
                        navigator.clipboard.writeText(message.content);
                      }
                      break;
                    case 'edit':
                      onEdit?.();
                      break;
                    case 'delete':
                      onDelete?.();
                      break;
                  }
                }}
                renderValue={() => (
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              >
                <button className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all">
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </Dropdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};