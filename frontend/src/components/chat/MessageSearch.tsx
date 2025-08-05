import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Calendar,
  User,
  Filter,
  FileText,
  Image,
  Paperclip
} from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDistanceToNow } from 'date-fns';

interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  sender?: string;
  hasAttachment?: boolean;
  messageType?: 'text' | 'image' | 'file' | 'all';
}

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (messageId: string) => void;
}

const MessageSearch = ({ isOpen, onClose, onResultClick }: MessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    messageType: 'all',
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchMessages, highlightMessage } = useChatStore();
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Mock search results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setCurrentIndex(0);
    }
  }, [debouncedQuery, filters]);

  const performSearch = async () => {
    setIsSearching(true);
    
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results = searchMessages(debouncedQuery, filters);
    setSearchResults(results);
    setIsSearching(false);
    
    if (results.length > 0) {
      setCurrentIndex(0);
      highlightMessage(results[0].id);
    }
  };

  const navigateResult = (direction: 'prev' | 'next') => {
    if (searchResults.length === 0) return;
    
    let newIndex = currentIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % searchResults.length;
    } else {
      newIndex = currentIndex === 0 ? searchResults.length - 1 : currentIndex - 1;
    }
    
    setCurrentIndex(newIndex);
    const result = searchResults[newIndex];
    highlightMessage(result.id);
    onResultClick?.(result.id);
  };

  const handleResultClick = (index: number) => {
    setCurrentIndex(index);
    const result = searchResults[index];
    highlightMessage(result.id);
    onResultClick?.(result.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        navigateResult('prev');
      } else {
        navigateResult('next');
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setCurrentIndex(0);
    highlightMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg z-30 animate-slideInDown">
      {/* Search Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search messages..."
              className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Navigation */}
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentIndex + 1} of {searchResults.length}
              </span>
              <button
                onClick={() => navigateResult('prev')}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Previous result (Shift+Enter)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateResult('next')}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Next result (Enter)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Date Range
                </label>
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Any time</span>
                </button>
              </div>

              {/* Sender */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  From
                </label>
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Anyone</span>
                </button>
              </div>

              {/* Message Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Type
                </label>
                <select
                  value={filters.messageType}
                  onChange={(e) => setFilters({ ...filters, messageType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  <option value="all">All messages</option>
                  <option value="text">Text only</option>
                  <option value="image">Images</option>
                  <option value="file">Files</option>
                </select>
              </div>

              {/* Has Attachment */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Attachments
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasAttachment || false}
                    onChange={(e) => setFilters({ ...filters, hasAttachment: e.target.checked })}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Has attachments
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="max-h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-800">
          {isSearching ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-primary-500 rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {searchResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(index)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50
                    transition-colors flex items-start gap-3
                    ${index === currentIndex ? 'bg-primary-50 dark:bg-primary-900/10' : ''}
                  `}
                >
                  {/* Message Type Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {result.type === 'image' ? (
                      <Image className="w-4 h-4 text-gray-400" />
                    ) : result.type === 'file' ? (
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.sender}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {result.preview}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No messages found for "{searchQuery}"
              </p>
              {showFilters && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try adjusting your filters
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;