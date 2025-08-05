import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

interface ThemeToggleProps {
  showLabel?: boolean;
  variant?: 'simple' | 'dropdown' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ThemeToggle = ({ 
  showLabel = false, 
  variant = 'simple',
  size = 'md',
  className = '' 
}: ThemeToggleProps) => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (!mounted) {
    return null;
  }

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    setIsOpen(false);
    
    // Add transition class to prevent jarring theme switch
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 100);
  };

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  if (variant === 'simple') {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    const NextIcon = themes.find(t => t.value === nextTheme)?.icon || Sun;

    return (
      <button
        onClick={() => handleThemeChange(nextTheme)}
        className={`
          ${sizeClasses[size]} rounded-lg 
          bg-gray-100 dark:bg-gray-800 
          hover:bg-gray-200 dark:hover:bg-gray-700 
          text-gray-700 dark:text-gray-300
          transition-all duration-200
          ${className}
        `}
        aria-label="Toggle theme"
      >
        <NextIcon className={iconSizes[size]} />
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2
            ${sizeClasses[size]} rounded-lg 
            bg-gray-100 dark:bg-gray-800 
            hover:bg-gray-200 dark:hover:bg-gray-700 
            text-gray-700 dark:text-gray-300
            transition-all duration-200
          `}
          aria-label="Theme menu"
        >
          <currentTheme.icon className={iconSizes[size]} />
          {showLabel && (
            <span className="text-sm font-medium">{currentTheme.label}</span>
          )}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-20">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = theme === themeOption.value;

                return (
                  <button
                    key={themeOption.value}
                    onClick={() => handleThemeChange(themeOption.value)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2
                      text-sm transition-colors
                      ${isActive 
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{themeOption.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = theme === themeOption.value;

          return (
            <button
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md
                transition-all duration-200
                ${isActive 
                  ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
              aria-label={`${themeOption.label} theme`}
            >
              <Icon className={iconSizes[size]} />
              {showLabel && (
                <span className="text-sm font-medium">{themeOption.label}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
};

// Animated Theme Toggle (Alternative Design)
export const AnimatedThemeToggle = ({ className = '' }: { className?: string }) => {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full 
        transition-colors duration-300 ${className}
      `}
      aria-label="Toggle theme"
    >
      <div
        className={`
          absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
          transition-transform duration-300 flex items-center justify-center
          ${isDark ? 'translate-x-8' : 'translate-x-1'}
        `}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-gray-700" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 opacity-50">
        <Sun className="w-3 h-3 text-gray-500" />
        <Moon className="w-3 h-3 text-gray-400" />
      </div>
    </button>
  );
};

export default ThemeToggle;