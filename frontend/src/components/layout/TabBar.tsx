import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings, User } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';

const TabBar = () => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();

  const tabs = [
    { 
      icon: MessageSquare, 
      label: 'Chats', 
      path: '/', 
      badge: unreadCount 
    },
    { 
      icon: Users, 
      label: 'Contacts', 
      path: '/contacts', 
      badge: 0 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings', 
      badge: 0 
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile', 
      badge: 0 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;