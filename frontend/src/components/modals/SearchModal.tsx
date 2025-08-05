import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  MessageSquare, 
  User, 
  FileText, 
  Image, 
  Calendar,
  Filter,
  Clock,
  Loader2
} from 'lucide-react';
import Modal from '../common/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDistanceToNow } from 'date-fns';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'message' | 'user' | 'file' | 'image';
  title: string;
  subtitle?: string;
  timestamp?: Date;
  avatar?: string;
  preview?: string;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'people' | 'files'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Project documentation',
    'John Doe',
    'Meeting notes',
  ]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery, activeTab]);

  const performSearch = async () => {
    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock results based on tab
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'message',
        title: 'Discussion about project timeline',
        subtitle: 'From: Sarah Chen',
        timestamp: new Date(Date.now() - 3600000),
        preview: 'We need to adjust the timeline for the next sprint...',
      },
      {
        id: '2',
        type: 'user',
        title: 'John Doe',
        subtitle: 'Product Manager',
        avatar: '/avatar1.jpg',
      },
      {
        id: '3',
        type: 'file',
        title: 'Q4_Report_2024.pdf',
        subtitle: '2.4 MB • Shared by Alex',
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: '4',
        type: 'image',
        title: 'Design_Mockup_v3.png',
        subtitle: '1.8 MB • In #design',
        timestamp: new Date(Date.now() - 172800000),
      },
    ];

    // Filter by tab
    let filtered = mockResults;
    if (activeTab !== 'all') {
      const typeMap = {
        messages: 'message',
        people: 'user',
        files: ['file', 'image'],
      };
      
      filtered = mockResults.filter(result => {
        const allowedTypes = typeMap[activeTab];
        return Array.isArray(allowedTypes) 
          ? allowedTypes.includes(result.type)
          : result.type === allowedTypes;
      });
    }
    
    setResults(filtered);
    setIsSearching(false);
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate based on result type
    console.log('Navigating to:', result);
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
    }
    
    onClose();
  };

  const handleRecentSearch = (search: string) => {
    setSearchQuery(search);
    searchInputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'user':
        return <User className="w-5 h-5 text-green-500" />;
      case 'file':
        return <FileText className="w-5 h-5 text-orange-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-purple-500" />;
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: results.length },
    { id: 'messages', label: 'Messages', count: 0 },
    { id: 'people', label: 'People', count: 0 },
    { id: 'files', label: 'Files', count: 0 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={false}>
      <div className="flex flex-col h-[600px]">
        {/* Search Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything..."
                className="w-full pl-12 pr-12 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-gray-200 dark:border-gray-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-primary-500'
                    : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto px-6">
          {!searchQuery && recentSearches.length > 0 ? (
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Recent searches
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Searching...</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-4 space-y-2">
              {results.map(result => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors"
                >
                  {/* Icon or Avatar */}
                  <div className="flex-shrink-0 mt-0.5">
                    {result.avatar ? (
                      <img
                        src={result.avatar}
                        alt={result.title}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      getResultIcon(result.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {result.title}
                    </h4>
                    {result.subtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.subtitle}
                      </p>
                    )}
                    {result.preview && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {result.preview}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  {result.timestamp && (
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      {formatDistanceToNow(result.timestamp, { addSuffix: true })}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="py-20 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No results found for "{searchQuery}"
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try searching with different keywords
              </p>
            </div>
          ) : null}
        </div>

        {/* Search Tips */}
        {!searchQuery && recentSearches.length === 0 && (
          <div className="px-6 py-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Search tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                <span>Use quotes for exact phrases: "project deadline"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                <span>Filter by sender: from:john@example.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                <span>Search by date: after:2024-01-01</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                <span>Find files by type: type:pdf or type:image</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SearchModal;