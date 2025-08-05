import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ChevronRight, Check } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyPress } from '../../hooks/useKeyPress';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  submenu?: ContextMenuItem[];
  divider?: boolean;
  checked?: boolean;
  value?: any;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  onClose?: () => void;
  className?: string;
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

// Context for managing context menu state
interface ContextMenuContextValue {
  show: (e: React.MouseEvent, items: ContextMenuItem[]) => void;
  hide: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenuProvider');
  }
  return context;
};

// Provider component
export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  const show = (e: React.MouseEvent, menuItems: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    
    setItems(menuItems);
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const hide = () => {
    setIsOpen(false);
  };

  return (
    <ContextMenuContext.Provider value={{ show, hide }}>
      {children}
      {isOpen && (
        <ContextMenu
          items={items}
          position={position}
          onClose={hide}
        />
      )}
    </ContextMenuContext.Provider>
  );
};

// Main context menu component
const ContextMenu: React.FC<{
  items: ContextMenuItem[];
  position: ContextMenuPosition;
  onClose: () => void;
}> = ({ items, position, onClose }) => {
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const clickOutsideRef = useClickOutside<HTMLDivElement>(onClose);

  // Keyboard navigation
  useKeyPress('Escape', onClose);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let { x, y } = position;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth - 10) {
      x = viewportWidth - rect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight - 10) {
      y = viewportHeight - rect.height - 10;
    }
    if (y < 10) {
      y = 10;
    }

    setAdjustedPosition({ x, y });
  }, [position]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled || item.submenu) return;
    
    item.onClick?.();
    onClose();
  };

  const renderItems = (menuItems: ContextMenuItem[]) => {
    return menuItems.map((item, index) => {
      if (item.divider) {
        return (
          <div
            key={`divider-${index}`}
            className="my-1 h-px bg-gray-200 dark:bg-gray-700"
          />
        );
      }

      const isActive = activeSubmenu === item.id;
      const hasSubmenu = !!item.submenu;

      return (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => hasSubmenu && setActiveSubmenu(item.id)}
          onMouseLeave={() => hasSubmenu && setActiveSubmenu(null)}
        >
          <button
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-sm
              transition-colors duration-150 rounded
              ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : item.danger
                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              ${isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}
            `}
          >
            {item.icon && (
              <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
            )}
            <span className="flex-1 text-left">{item.label}</span>
            {item.checked && (
              <Check className="w-4 h-4 text-primary-500" />
            )}
            {item.shortcut && !hasSubmenu && (
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {item.shortcut}
              </span>
            )}
            {hasSubmenu && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>

          {/* Submenu */}
          {hasSubmenu && isActive && item.submenu && (
            <div
              className="absolute left-full top-0 ml-1"
              style={{ zIndex: 60 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="min-w-[180px] py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {renderItems(item.submenu)}
              </motion.div>
            </div>
          )}
        </div>
      );
    });
  };

  const content = (
    <div
      ref={clickOutsideRef}
      className="fixed z-50"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="min-w-[180px] py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {renderItems(items)}
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};

// Hook for creating context menu trigger
export const useContextMenuTrigger = (items: ContextMenuItem[]) => {
  const { show } = useContextMenu();

  const triggerProps = {
    onContextMenu: (e: React.MouseEvent) => show(e, items),
  };

  return triggerProps;
};

// Pre-built context menu items
export const contextMenuItems = {
  copy: (onClick?: () => void): ContextMenuItem => ({
    id: 'copy',
    label: 'Copy',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    shortcut: 'Ctrl+C',
    onClick,
  }),
  
  cut: (onClick?: () => void): ContextMenuItem => ({
    id: 'cut',
    label: 'Cut',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
    shortcut: 'Ctrl+X',
    onClick,
  }),
  
  paste: (onClick?: () => void): ContextMenuItem => ({
    id: 'paste',
    label: 'Paste',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    shortcut: 'Ctrl+V',
    onClick,
  }),
  
  delete: (onClick?: () => void): ContextMenuItem => ({
    id: 'delete',
    label: 'Delete',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    danger: true,
    onClick,
  }),
  
  divider: (): ContextMenuItem => ({
    id: `divider-${Date.now()}`,
    label: '',
    divider: true,
  }),
};

// Example usage component
export const ContextMenuExample: React.FC = () => {
  const items: ContextMenuItem[] = [
    contextMenuItems.copy(() => console.log('Copy')),
    contextMenuItems.cut(() => console.log('Cut')),
    contextMenuItems.paste(() => console.log('Paste')),
    contextMenuItems.divider(),
    {
      id: 'format',
      label: 'Format',
      submenu: [
        { id: 'bold', label: 'Bold', shortcut: 'Ctrl+B', onClick: () => console.log('Bold') },
        { id: 'italic', label: 'Italic', shortcut: 'Ctrl+I', onClick: () => console.log('Italic') },
        { id: 'underline', label: 'Underline', shortcut: 'Ctrl+U', onClick: () => console.log('Underline') },
      ],
    },
    contextMenuItems.divider(),
    contextMenuItems.delete(() => console.log('Delete')),
  ];

  const triggerProps = useContextMenuTrigger(items);

  return (
    <div
      {...triggerProps}
      className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center"
    >
      Right-click me to see context menu
    </div>
  );
};