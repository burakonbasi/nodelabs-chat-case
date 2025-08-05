import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Users,
  Bell,
  BellOff,
  Pin,
  Archive,
  Trash2,
  Info
} from 'lucide-react';
import { Conversation, User } from '../../types';
import { UserAvatar } from '../user/UserAvatar';
import { OnlineIndicator } from './OnlineIndicator';
import { Dropdown } from '../common/Dropdown';
import { IconTooltip } from '../common/Tooltip';
import { useChatStore } from '../../stores/chatStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import userService from '../../services/userService';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
  onSearch?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onShowInfo?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onBack,
  onSearch,
  onVoiceCall,
  onVideoCall,
  onShowInfo,
}) => {
  const [isMuted, setIsMuted] = useState(conversation.isMuted || false);
  const [isPinned, setIsPinned] = useState(conversation.isPinned || false);
  const { setCurrentConversation, archiveConversation, deleteConversation } = useChatStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const isGroup = conversation.type === 'group';
  const otherUser = !isGroup ? conversation.participants.find(p => p.id !== conversation.id) : null;

  const handleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Call API to update mute status
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
    // TODO: Call API to update pin status
  };

  const handleArchive = () => {
    archiveConversation(conversation.id);
    if (isMobile) {
      onBack?.();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversation.id);
      if (isMobile) {
        onBack?.();
      }
    }
  };

  const menuOptions = [
    {
      value: 'mute',
      label: isMuted ? 'Unmute' : 'Mute',
      icon: isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />,
    },
    {
      value: 'pin',
      label: isPinned ? 'Unpin' : 'Pin',
      icon: <Pin className="w-4 h-4" />,
    },
    {
      value: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
    },
    {
      value: 'info',
      label: isGroup ? 'Group Info' : 'Contact Info',
      icon: <Info className="w-4 h-4" />,
    },
    {
      value: 'delete',
      label: 'Delete Chat',
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
    },
  ];

  const getSubtitle = () => {
    if (isGroup) {
      return `${conversation.participants.length} members`;
    }
    
    if (otherUser) {
      if (otherUser.isOnline) {
        return 'Online';
      }
      return userService.formatLastSeen(otherUser.lastSeen);
    }
    
    return '';
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
    >
      {/* Back Button (Mobile) */}
      {isMobile && (
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Avatar & Info */}
      <div 
        className="flex items-center gap-3 flex-1 cursor-pointer"
        onClick={onShowInfo}
      >
        <div className="relative">
          <UserAvatar
            user={otherUser || { 
              id: conversation.id,
              username: conversation.name || 'Group',
              avatar: conversation.avatar,
            }}
            size="md"
          />
          {otherUser && <OnlineIndicator user={otherUser} />}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {isGroup ? conversation.name : (otherUser?.fullName || otherUser?.username)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {getSubtitle()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <IconTooltip text="Search">
          <button
            onClick={onSearch}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </IconTooltip>

        {/* Voice Call */}
        {!isGroup && (
          <IconTooltip text="Voice Call">
            <button
              onClick={onVoiceCall}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </IconTooltip>
        )}

        {/* Video Call */}
        <IconTooltip text={isGroup ? 'Start Group Call' : 'Video Call'}>
          <button
            onClick={onVideoCall}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </IconTooltip>

        {/* Menu */}
        <Dropdown
          options={menuOptions}
          onChange={(value) => {
            switch (value) {
              case 'mute':
                handleMute();
                break;
              case 'pin':
                handlePin();
                break;
              case 'archive':
                handleArchive();
                break;
              case 'info':
                onShowInfo?.();
                break;
              case 'delete':
                handleDelete();
                break;
            }
          }}
        >
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </Dropdown>
      </div>

      {/* Status Indicators */}
      <div className="absolute top-0 right-0 flex items-center gap-1 p-1">
        {isPinned && (
          <div className="p-1 bg-primary-100 dark:bg-primary-900 rounded">
            <Pin className="w-3 h-3 text-primary-600 dark:text-primary-400" />
          </div>
        )}
        {isMuted && (
          <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
            <BellOff className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </div>
        )}
      </div>
    </motion.header>
  );
};

// Group Chat Header Variant
interface GroupChatHeaderProps extends ChatHeaderProps {
  onAddMembers?: () => void;
  onShowMembers?: () => void;
}

export const GroupChatHeader: React.FC<GroupChatHeaderProps> = ({
  conversation,
  onAddMembers,
  onShowMembers,
  ...props
}) => {
  const onlineCount = conversation.participants.filter(p => p.isOnline).length;

  return (
    <ChatHeader 
      conversation={conversation}
      {...props}
    >
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button
          onClick={onShowMembers}
          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Users className="w-4 h-4" />
          <span>{conversation.participants.length}</span>
        </button>
        {onlineCount > 0 && (
          <span className="text-green-500">
            • {onlineCount} online
          </span>
        )}
      </div>
    </ChatHeader>
  );
};