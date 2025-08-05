import { useState, useRef, useEffect } from 'react';
import { Globe, Check, Search } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  rtl?: boolean;
}

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (language: Language) => void;
  showFlags?: boolean;
  showNativeName?: boolean;
  variant?: 'dropdown' | 'inline' | 'modal';
  className?: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
];

const LanguageSelector = ({
  currentLanguage = 'en',
  onLanguageChange,
  showFlags = true,
  showNativeName = true,
  variant = 'dropdown',
  className = '',
}: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // Filter languages based on search
  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Popular languages (show at top)
  const popularLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ar', 'hi', 'pt'];
  const sortedLanguages = [
    ...filteredLanguages.filter(lang => popularLanguages.includes(lang.code)),
    ...filteredLanguages.filter(lang => !popularLanguages.includes(lang.code)),
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange?.(language);
    setIsOpen(false);
    setSearchQuery('');
    
    // Apply RTL if needed
    if (language.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 ${className}`}>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageSelect(language)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
              ${currentLanguage === language.code
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            {showFlags && language.flag && (
              <span className="text-lg">{language.flag}</span>
            )}
            <div className="text-left">
              <p className="text-sm font-medium">{language.name}</p>
              {showNativeName && language.nativeName !== language.name && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language.nativeName}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {showFlags && currentLang.flag ? (
          <span className="text-lg">{currentLang.flag}</span>
        ) : (
          <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {currentLang.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Language List */}
          <div className="max-h-80 overflow-y-auto">
            {sortedLanguages.length > 0 ? (
              <div className="py-2">
                {sortedLanguages.map((language, index) => {
                  const isPopular = popularLanguages.includes(language.code);
                  const showDivider = isPopular && 
                    index < sortedLanguages.length - 1 && 
                    !popularLanguages.includes(sortedLanguages[index + 1].code);

                  return (
                    <div key={language.code}>
                      <button
                        onClick={() => handleLanguageSelect(language)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5
                          transition-colors text-left
                          ${currentLanguage === language.code
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                          }
                        `}
                        dir={language.rtl ? 'rtl' : 'ltr'}
                      >
                        {showFlags && language.flag && (
                          <span className="text-xl flex-shrink-0">{language.flag}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {language.name}
                            {showNativeName && language.nativeName !== language.name && (
                              <span className="text-gray-500 dark:text-gray-400 ml-2">
                                {language.nativeName}
                              </span>
                            )}
                          </p>
                        </div>
                        {currentLanguage === language.code && (
                          <Check className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                      {showDivider && (
                        <div className="my-2 mx-4 border-t border-gray-200 dark:border-gray-800" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No languages found
                </p>
              </div>
            )}
          </div>

          {/* Auto-translate Option */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-500 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-translate messages
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;