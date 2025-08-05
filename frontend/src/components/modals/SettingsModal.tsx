import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiSun, FiMoon, FiMonitor, FiBell, FiLock, 
  FiVolume2, FiGlobe, FiInfo, FiChevronRight,
  FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingTab = 'general' | 'notifications' | 'privacy' | 'about';

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingTab>('general');
  const { theme, setTheme } = useThemeStore();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      message: true,
      sound: true,
      desktop: true,
      showPreview: true,
    },
    privacy: {
      lastSeen: true,
      profilePhoto: 'everyone',
      readReceipts: true,
      typing: true,
    },
    general: {
      language: 'en',
      fontSize: 'medium',
      enterToSend: true,
    },
  });

  const toggleSetting = (category: keyof typeof settings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: FiMonitor },
    { id: 'notifications' as const, label: 'Notifications', icon: FiBell },
    { id: 'privacy' as const, label: 'Privacy', icon: FiLock },
    { id: 'about' as const, label: 'About', icon: FiInfo },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Theme */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200",
                      theme === themeOption
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "border-gray-200 dark:border-dark-300 hover:border-gray-300 dark:hover:border-dark-200"
                    )}
                  >
                    {themeOption === 'light' && <FiSun className="w-4 h-4" />}
                    {themeOption === 'dark' && <FiMoon className="w-4 h-4" />}
                    {themeOption === 'system' && <FiMonitor className="w-4 h-4" />}
                    <span className="text-sm capitalize">{themeOption}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <div className="relative">
                <select
                  value={settings.general.language}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, language: e.target.value }
                  }))}
                  className={cn(
                    "w-full px-4 py-2.5 pr-10 bg-gray-100 dark:bg-dark-300 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
                    "text-gray-900 dark:text-white appearance-none cursor-pointer"
                  )}
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
                <FiGlobe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, fontSize: size }
                    }))}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg border transition-all duration-200",
                      settings.general.fontSize === size
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "border-gray-200 dark:border-dark-300 hover:border-gray-300 dark:hover:border-dark-200"
                    )}
                  >
                    <span className={cn(
                      "capitalize",
                      size === 'small' && "text-sm",
                      size === 'medium' && "text-base",
                      size === 'large' && "text-lg"
                    )}>
                      {size}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enter to Send */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Enter to Send
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Press Enter to send messages
                </p>
              </div>
              <button
                onClick={() => toggleSetting('general', 'enterToSend')}
                className="text-primary-600 dark:text-primary-400"
              >
                {settings.general.enterToSend ? (
                  <FiToggleRight className="w-8 h-8" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {/* Message Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Message Notifications
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Show notifications for new messages
                </p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'message')}
                className="text-primary-600 dark:text-primary-400"
              >
                {settings.notifications.message ? (
                  <FiToggleRight className="w-8 h-8" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiVolume2 className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Notification Sound
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Play sound for notifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'sound')}
                className="text-primary-600 dark:text-primary-400"
              >
                {settings.notifications.sound ? (
                  <FiToggleRight className="w-8 h-8" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            {/* Desktop Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Desktop Notifications
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Show desktop notifications
                </p>
              </div>
              <button
                onClick={() => {
                  if (!settings.notifications.desktop && 'Notification' in window) {
                    Notification.requestPermission();
                  }
                  toggleSetting('notifications', 'desktop');
                }}
                className="text-primary-600 dark:text-primary-400"
              >
                {settings.notifications.desktop ? (
                  <FiToggleRight className="w-8 h-8" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            {/* Show Preview */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Show Message Preview
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Show message content in notifications
                </p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'showPreview')}
                className="text-primary-600 dark:text-primary-400"
              >
                {settings.notifications.showPreview ? (
                  <FiToggleRight className="w-8 h-8" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            {/* Last Seen */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Last Seen
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Show your last seen time to others
                </p>
              </div>
              <button
                onClick={() => toggleSetting('privacy', 'lastSeen')}
                className="text-primary-600 dark:text-primary-400"
              >
                {settings.privacy.lastSeen ? (
                  <FiToggleRight className="w-8 h-8" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Photo
              </label>
              <select
                value={settings.privacy.profilePhoto}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, profilePhoto: e.target.value }
                }))}
                className={cn(
                  "w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-300 rounded-lg",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
                  "text-gray-900 dark:text-white appearance-none cursor-pointer"
                )}
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            {/* Read Receipts */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Read Receipts
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Show when you've read messages
                </p>
              </div>
              <button
                onClick={() => toggleSetting('privacy', 'readReceipts')}
                className="text-primary-600 dark:text-primary-400"
              >
                {settings.privacy.readReceipts ? (
                  <FiToggleRight className="w-8 h-8" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            {/* Typing Indicators */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Typing Indicators
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Show when you're typing
                </p>
              </div>
              <button
                onClick={() => toggleSetting('privacy', 'typing')}
                className="text-primary-600 dark:text-primary-400"
              >
                {settings.privacy.typing ? (
                  <FiToggleRight className="w-8 h-8" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">C</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chat App
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Version 1.0.0
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">Terms of Service</span>
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">Privacy Policy</span>
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">Open Source Licenses</span>
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4">
              <p>Built with ❤️ using React and Node.js</p>
              <p className="mt-1">© 2025 Chat App. All rights reserved.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-white dark:bg-dark-400 rounded-lg shadow-2xl flex overflow-hidden"
        style={{ height: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-56 bg-gray-50 dark:bg-dark-500 border-r border-gray-200 dark:border-dark-300 p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Settings
          </h2>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-300">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
              {activeTab}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}