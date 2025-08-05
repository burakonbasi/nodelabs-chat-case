import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Search,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import UserAvatar from '../user/UserAvatar';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { openModal } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: MessageSquare, label: 'Chats', path: '/', badge: 3 },
    { icon: Users, label: 'Contacts', path: '/contacts', badge: 0 },
    { icon: Settings, label: 'Settings', path: '/settings', badge: 0 },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={`${
      isCollapsed ? 'w-20' : 'w-64'
    } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col h-full`}>
      
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <UserAvatar 
            src={user?.avatar} 
            name={user?.name || ''} 
            size={isCollapsed ? 'sm' : 'md'}
            isOnline={true}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.status || 'Available'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 space-y-2">
          <button
            onClick={() => openModal('search')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Search messages</span>
          </button>
          
          <button
            onClick={() => openModal('newChat')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Chat</span>
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow"
      >
        <svg
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </aside>
  );
};

export default Sidebar;