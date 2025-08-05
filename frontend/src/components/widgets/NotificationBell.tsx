import { useState, useRef, useEffect } from 'react';
import { Bell, BellOff, Check, Trash2, Settings } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from '../user/UserAvatar';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell = ({ className = '' }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll 
  } = useNotificationStore();

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

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    // Handle navigation based on notification type
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'mention':
        return '@';
      case 'like':
        return '❤️';
      case 'follow':
        return '👤';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const hasNotifications = notifications.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        {hasNotifications ? (
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400 dark:text-gray-600" />
        )}
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full animate-ping w-5 h-5 opacity-75" />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => {/* Open settings */}}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {hasNotifications ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`
                      px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer
                      transition-colors relative group
                      ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                    `}
                  >
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                    )}

                    <div className="flex gap-3">
                      {/* Avatar or Icon */}
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <UserAvatar 
                            src={notification.avatar} 
                            name={notification.title} 
                            size="sm"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">{notification.title}</span>
                          {notification.message && (
                            <span className="text-gray-600 dark:text-gray-400">
                              {' '}{notification.message}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <BellOff className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  We'll notify you when something new happens
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {hasNotifications && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;