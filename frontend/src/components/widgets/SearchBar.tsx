import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, Clock, TrendingUp } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'user' | 'message' | 'file';
  title: string;
  subtitle?: string;
  avatar?: string;
  timestamp?: Date;
  highlight?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  showRecent?: boolean;
  showTrending?: boolean;
  variant?: 'default' | 'compact' | 'expanded';
  className?: string;
}

const SearchBar = ({
  placeholder = 'Search messages, people, files...',
  onSearch,
  onResultClick,
  showRecent = true,
  showTrending = false,
  variant = 'default',
  className = '',
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'John Doe',
    'Project meeting notes',
    'vacation photos',
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Mock search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'user',
        title: 'John Doe',
        subtitle: 'Active now',
        avatar: '/avatar1.jpg',
      },
      {
        id: '2',
        type: 'message',
        title: 'Meeting tomorrow at 10am',
        subtitle: 'From: Jane Smith',
        timestamp: new Date(),
        highlight: searchQuery,
      },
      {
        id: '3',
        type: 'file',
        title: 'project-proposal.pdf',
        subtitle: '2.4 MB',
        timestamp: new Date(Date.now() - 86400000),
      },
    ];
    
    setResults(mockResults);
    setIsLoading(false);
  };

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
      onSearch?.(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return '👤';
      case 'message':
        return '💬';
      case 'file':
        return '📄';
    }
  };

  const renderResults = () => {
    if (!query && showRecent && recentSearches.length > 0) {
      return (
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Recent Searches
          </div>
          {recentSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => handleRecentSearch(search)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-left"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
            </button>
          ))}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      );
    }

    if (results.length === 0 && query) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No results found for "{query}"
          </p>
        </div>
      );
    }

    return (
      <div className="py-2">
        {results.map((result) => (
          <button
            key={result.id}
            onClick={() => handleResultClick(result)}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              <span className="text-lg">{getResultIcon(result.type)}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {result.highlight ? (
                  <span dangerouslySetInnerHTML={{
                    __html: result.title.replace(
                      new RegExp(result.highlight, 'gi'),
                      `<mark class="bg-yellow-200 dark:bg-yellow-800">$&</mark>`
                    )
                  }} />
                ) : result.title}
              </p>
              {result.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {result.subtitle}
                </p>
              )}
            </div>
            {result.timestamp && (
              <div className="flex-shrink-0 text-xs text-gray-400">
                {new Date(result.timestamp).toLocaleDateString()}
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  const baseClasses = "relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg transition-all duration-200";
  const variantClasses = {
    default: "px-4 py-2",
    compact: "px-3 py-1.5",
    expanded: "px-4 py-3",
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`${baseClasses} ${variantClasses[variant]} ${
        isFocused ? 'ring-2 ring-primary-500 bg-white dark:bg-gray-900' : ''
      }`}>
        <Search className={`${variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 mr-3`} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {!query && !isFocused && variant !== 'compact' && (
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || (showRecent && recentSearches.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 max-h-96 overflow-y-auto z-50">
          {showTrending && !query && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-3 h-3" />
                Trending
              </div>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  #project-alpha
                </button>
                <button className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  Q4 planning
                </button>
              </div>
            </div>
          )}
          
          {renderResults()}
        </div>
      )}
    </div>
  );
};

export default SearchBar;