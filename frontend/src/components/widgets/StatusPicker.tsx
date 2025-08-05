import { useState, useRef, useEffect } from 'react';
import { Circle, Clock, X, Coffee, Briefcase, Home, Plane, Heart, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface Status {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  duration?: number; // in minutes
}

interface StatusPickerProps {
  onStatusChange?: (status: Status) => void;
  showCustom?: boolean;
  className?: string;
}

const defaultStatuses: Status[] = [
  {
    id: 'online',
    icon: <Circle className="w-4 h-4" />,
    label: 'Online',
    color: 'text-green-500',
  },
  {
    id: 'away',
    icon: <Clock className="w-4 h-4" />,
    label: 'Away',
    color: 'text-yellow-500',
  },
  {
    id: 'busy',
    icon: <Circle className="w-4 h-4" />,
    label: 'Do not disturb',
    color: 'text-red-500',
  },
  {
    id: 'offline',
    icon: <Circle className="w-4 h-4" />,
    label: 'Appear offline',
    color: 'text-gray-400',
  },
];

const quickStatuses: Status[] = [
  {
    id: 'meeting',
    icon: <Briefcase className="w-4 h-4" />,
    label: 'In a meeting',
    color: 'text-red-500',
    duration: 60,
  },
  {
    id: 'lunch',
    icon: <Coffee className="w-4 h-4" />,
    label: 'Out for lunch',
    color: 'text-orange-500',
    duration: 30,
  },
  {
    id: 'wfh',
    icon: <Home className="w-4 h-4" />,
    label: 'Working from home',
    color: 'text-blue-500',
  },
  {
    id: 'vacation',
    icon: <Plane className="w-4 h-4" />,
    label: 'On vacation',
    color: 'text-purple-500',
  },
  {
    id: 'focus',
    icon: <Zap className="w-4 h-4" />,
    label: 'Focus time',
    color: 'text-indigo-500',
    duration: 120,
  },
];

const StatusPicker = ({ 
  onStatusChange, 
  showCustom = true,
  className = '' 
}: StatusPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStatus, setCustomStatus] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [clearAfter, setClearAfter] = useState<number | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, updateStatus } = useAuthStore();
  
  const currentStatus = user?.status || 'online';
  const currentStatusObj = [...defaultStatuses, ...quickStatuses].find(s => s.id === currentStatus) || defaultStatuses[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusSelect = (status: Status) => {
    updateStatus(status.id);
    onStatusChange?.(status);
    
    if (status.duration) {
      setClearAfter(status.duration);
      // Set timer to clear status
      setTimeout(() => {
        updateStatus('online');
        setClearAfter(null);
      }, status.duration * 60 * 1000);
    }
    
    setIsOpen(false);
  };

  const handleCustomStatus = () => {
    if (!customStatus.trim()) return;
    
    const status: Status = {
      id: 'custom',
      icon: <span>{selectedEmoji}</span>,
      label: customStatus,
      color: 'text-gray-700 dark:text-gray-300',
    };
    
    handleStatusSelect(status);
    setCustomStatus('');
    setShowCustomInput(false);
  };

  const clearStatus = () => {
    updateStatus('online');
    setClearAfter(null);
    setIsOpen(false);
  };

  const commonEmojis = ['😊', '🏠', '🚀', '📱', '💻', '☕', '🏖️', '🎯', '📚', '🎮'];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className={currentStatusObj.color}>
          {currentStatus === 'custom' && user?.customStatusEmoji ? (
            <span>{user.customStatusEmoji}</span>
          ) : (
            currentStatusObj.icon
          )}
        </span>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {currentStatus === 'custom' && user?.customStatusText 
            ? user.customStatusText 
            : currentStatusObj.label
          }
        </span>
        {clearAfter && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            • Clears in {clearAfter}m
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
          {/* Default Statuses */}
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              STATUS
            </div>
            {defaultStatuses.map((status) => (
              <button
                key={status.id}
                onClick={() => handleStatusSelect(status)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-md
                  transition-colors text-left
                  ${currentStatus === status.id 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                `}
              >
                <span className={status.color}>{status.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {status.label}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800" />

          {/* Quick Statuses */}
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              QUICK STATUS
            </div>
            {quickStatuses.map((status) => (
              <button
                key={status.id}
                onClick={() => handleStatusSelect(status)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <span className={status.color}>{status.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {status.label}
                </span>
                {status.duration && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {status.duration}m
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Custom Status */}
          {showCustom && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800" />
              <div className="p-2">
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Set custom status
                    </span>
                  </button>
                ) : (
                  <div className="p-3">
                    {/* Emoji Picker */}
                    <div className="flex gap-2 mb-3">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setSelectedEmoji(emoji)}
                          className={`
                            p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800
                            ${selectedEmoji === emoji ? 'bg-gray-100 dark:bg-gray-800' : ''}
                          `}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    
                    {/* Custom Status Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customStatus}
                        onChange={(e) => setCustomStatus(e.target.value)}
                        placeholder="What's your status?"
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCustomStatus();
                          }
                        }}
                      />
                      <button
                        onClick={handleCustomStatus}
                        disabled={!customStatus.trim()}
                        className="px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Clear Status */}
          {currentStatus !== 'online' && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800" />
              <div className="p-2">
                <button
                  onClick={clearStatus}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <X className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Clear status
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusPicker;