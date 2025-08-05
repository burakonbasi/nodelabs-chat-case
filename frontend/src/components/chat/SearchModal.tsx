import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiMessageCircle } from 'react-icons/fi';
import { useChatStore } from '../../stores/chatStore';
import { useDebounce } from 'react-use';
import { formatDate, truncateText, cn } from '../../lib/utils';
import type { Message } from '../../types';

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchMessages, setActiveConversation, conversations } = useChatStore();

  useDebounce(
    async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchMessages(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    },
    500,
    [searchQuery]
  );

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSelectMessage = (message: Message) => {
    // Find and set the conversation
    const conversation = conversations.find(c => c._id === message.conversationId);
    if (conversation) {
      setActiveConversation(conversation);
    }
    onClose();
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 text-gray-900 dark:text-white px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FiSearch className="w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <FiX className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FiMessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No messages found' : 'Start typing to search messages'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((message) => (
                <motion.button
                  key={message._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleSelectMessage(message)}
                  className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiMessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {typeof message.senderId === 'object' ? message.senderId.username : 'Unknown'}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                        {highlightText(truncateText(message.content, 100), searchQuery)}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {searchResults.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Found {searchResults.length} message{searchResults.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
} 