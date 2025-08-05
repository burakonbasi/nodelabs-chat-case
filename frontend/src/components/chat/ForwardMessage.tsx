import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Forward, Send, Users, CheckCircle } from 'lucide-react';
import { Message, Conversation, User } from '../../types';
import { UserAvatar } from '../user/UserAvatar';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Checkbox } from '../common/Switch';
import { useChatStore } from '../../stores/chatStore';
import userService from '../../services/userService';

interface ForwardMessageProps {
  message: Message | Message[];
  isOpen: boolean;
  onClose: () => void;
  onForward: (conversationIds: string[]) => void;
}

export const ForwardMessage: React.FC<ForwardMessageProps> = ({
  message,
  isOpen,
  onClose,
  onForward,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [isForwarding, setIsForwarding] = useState(false);
  const { conversations, contacts } = useChatStore();

  const messages = Array.isArray(message) ? message : [message];

  // Filter conversations and contacts based on search
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    const filteredConvos = conversations.filter(conv => {
      const name = conv.type === 'group' 
        ? conv.name 
        : conv.participants.find(p => p.id !== conv.id)?.fullName || 
          conv.participants.find(p => p.id !== conv.id)?.username || '';
      return name.toLowerCase().includes(query);
    });

    const filteredContacts = contacts.filter(contact => 
      (contact.fullName?.toLowerCase() || contact.username.toLowerCase()).includes(query)
    );

    return { conversations: filteredConvos, contacts: filteredContacts };
  }, [searchQuery, conversations, contacts]);

  const handleToggleSelection = (id: string) => {
    setSelectedConversations(prev =>
      prev.includes(id) 
        ? prev.filter(convId => convId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = [
      ...filteredItems.conversations.map(c => c.id),
      ...filteredItems.contacts.map(c => c.id),
    ];
    setSelectedConversations(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedConversations([]);
  };

  const handleForward = async () => {
    if (selectedConversations.length === 0) return;
    
    setIsForwarding(true);
    try {
      await onForward(selectedConversations);
      onClose();
    } finally {
      setIsForwarding(false);
    }
  };

  const getMessagePreview = (msg: Message) => {
    switch (msg.type) {
      case 'text':
        return msg.content || 'Message';
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎤 Voice message';
      case 'file':
        return `📎 ${msg.attachments?.[0]?.name || 'File'}`;
      default:
        return 'Message';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col h-full max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Forward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold">
              Forward {messages.length > 1 ? `${messages.length} messages` : 'message'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            {messages.slice(0, 3).map((msg) => (
              <div key={msg.id} className="flex items-center gap-2 text-sm">
                <UserAvatar user={msg.sender} size="xs" />
                <span className="font-medium">
                  {msg.sender.fullName || msg.sender.username}:
                </span>
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {getMessagePreview(msg)}
                </span>
              </div>
            ))}
            {messages.length > 3 && (
              <p className="text-sm text-gray-500">
                and {messages.length - 3} more...
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations and contacts..."
            leftIcon={<Search className="w-4 h-4" />}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Selection Actions */}
        {(filteredItems.conversations.length > 0 || filteredItems.contacts.length > 0) && (
          <div className="flex items-center justify-between px-4 mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedConversations.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Select all
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {/* Recent Conversations */}
          {filteredItems.conversations.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                Recent Chats
              </h3>
              {filteredItems.conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversations.includes(conversation.id)}
                  onToggle={() => handleToggleSelection(conversation.id)}
                />
              ))}
            </div>
          )}

          {/* Contacts */}
          {filteredItems.contacts.length > 0 && (
            <div>
              <h3 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                Contacts
              </h3>
              {filteredItems.contacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedConversations.includes(contact.id)}
                  onToggle={() => handleToggleSelection(contact.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredItems.conversations.length === 0 && filteredItems.contacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Search className="w-12 h-12 mb-2 text-gray-300" />
              <p>No results found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleForward}
            variant="primary"
            disabled={selectedConversations.length === 0 || isForwarding}
            loading={isForwarding}
            leftIcon={<Send className="w-4 h-4" />}
            className="flex-1"
          >
            Forward to {selectedConversations.length || 0}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Conversation Item Component
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onToggle: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onToggle,
}) => {
  const otherUser = conversation.type === 'direct' 
    ? conversation.participants.find(p => p.id !== conversation.id)
    : null;

  const getName = () => {
    if (conversation.type === 'group') return conversation.name;
    return otherUser?.fullName || otherUser?.username || 'Unknown';
  };

  const getAvatar = () => {
    if (conversation.type === 'group') {
      return conversation.avatar || undefined;
    }
    return otherUser?.avatar;
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onChange={onToggle}
        className="pointer-events-none"
      />
      
      <UserAvatar
        user={{ 
          id: conversation.id, 
          username: getName(), 
          avatar: getAvatar() 
        }}
        size="sm"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {conversation.type === 'group' && (
            <Users className="w-4 h-4 text-gray-400" />
          )}
          <p className="font-medium truncate">{getName()}</p>
        </div>
        {conversation.lastMessage && (
          <p className="text-sm text-gray-500 truncate">
            {conversation.lastMessage.content}
          </p>
        )}
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <CheckCircle className="w-5 h-5 text-primary-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Contact Item Component
interface ContactItemProps {
  contact: User;
  isSelected: boolean;
  onToggle: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  isSelected,
  onToggle,
}) => {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onChange={onToggle}
        className="pointer-events-none"
      />
      
      <UserAvatar user={contact} size="sm" />
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {contact.fullName || contact.username}
        </p>
        <p className="text-sm text-gray-500">
          {userService.formatLastSeen(contact.lastSeen)}
        </p>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <CheckCircle className="w-5 h-5 text-primary-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};