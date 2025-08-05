import { Bell, Search, Menu, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useNotificationStore } from '../../stores/notificationStore';
import UserAvatar from '../user/UserAvatar';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ title = 'Chat App', showBackButton = false, onBack }: HeaderProps) => {
  const { user } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu, openModal } = useUIStore();
  const { unreadCount } = useNotificationStore();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
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
          )}

          {/* Title */}
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Search Button */}
          <button
            onClick={() => openModal('search')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => openModal('notifications')}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <button
            onClick={() => openModal('profile')}
            className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <UserAvatar 
              src={user?.avatar} 
              name={user?.name || ''} 
              size="sm"
              isOnline={true}
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;