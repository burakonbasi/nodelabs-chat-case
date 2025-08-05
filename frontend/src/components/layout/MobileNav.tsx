import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Plus,
  Search,
  User
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import UserAvatar from '../user/UserAvatar';

const MobileNav = () => {
  const { isMobileMenuOpen, closeMobileMenu, openModal } = useUIStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Close menu on route change
  useEffect(() => {
    return () => closeMobileMenu();
  }, [closeMobileMenu]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (!isMobileMenuOpen) return null;

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={closeMobileMenu}
      />

      {/* Slide-out Menu */}
      <nav className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 lg:hidden overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* User Profile */}
          <Link
            to="/profile"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <UserAvatar 
              src={user?.avatar} 
              name={user?.name || ''} 
              size="md"
              isOnline={true}
            />
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              openModal('search');
              closeMobileMenu();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-base text-gray-700 dark:text-gray-300">Search messages</span>
          </button>
          
          <button
            onClick={() => {
              openModal('newChat');
              closeMobileMenu();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-base">New Chat</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-base">Chats</span>
          </Link>

          <Link
            to="/contacts"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="text-base">Contacts</span>
          </Link>

          <Link
            to="/settings"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-base">Settings</span>
          </Link>

          <Link
            to="/profile"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-base">Profile</span>
          </Link>
        </div>

        {/* Theme & Logout */}
        <div className="p-4 space-y-2 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              toggleTheme();
              closeMobileMenu();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="text-base">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;