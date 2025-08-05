import { useState, useEffect, useRef } from 'react';
import { 
  Reply, 
  Forward, 
  Copy, 
  Edit2, 
  Trash2, 
  Star, 
  Pin, 
  Download,
  Info,
  Flag,
  Volume2
} from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useToast } from '../common/Toast';

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface MessageContextMenuProps {
  messageId: string;
  message: string;
  isOwn: boolean;
  hasFile?: boolean;
  isStarred?: boolean;
  isPinned?: boolean;
  position: ContextMenuPosition;
  onClose: () => void;
  onReply?: () => void;
  onEdit?: () => void;
  onForward?: () => void;
}

const MessageContextMenu = ({
  messageId,
  message,
  isOwn,
  hasFile = false,
  isStarred = false,
  isPinned = false,
  position,
  onClose,
  onReply,
  onEdit,
  onForward,
}: MessageContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteMessage, starMessage, pinMessage } = useChatStore();
  const { success, info } = useToast();
  const [menuPosition, setMenuPosition] = useState(position);

  // Adjust menu position to stay within viewport
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Adjust horizontal position
      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }
      if (rect.left < 0) {
        adjustedX = 10;
      }

      // Adjust vertical position
      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }
      if (rect.top < 0) {
        adjustedY = 10;
      }

      setMenuPosition({ x: adjustedX, y: adjustedY });
    }
  }, [position]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      success('Message copied to clipboard');
      onClose();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = () => {
    deleteMessage(messageId);
    success('Message deleted');
    onClose();
  };

  const handleStar = () => {
    starMessage(messageId, !isStarred);
    success(isStarred ? 'Message unstarred' : 'Message starred');
    onClose();
  };

  const handlePin = () => {
    pinMessage(messageId, !isPinned);
    success(isPinned ? 'Message unpinned' : 'Message pinned');
    onClose();
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      speechSynthesis.speak(utterance);
      info('Reading message...');
    }
    onClose();
  };

  const menuItems = [
    {
      icon: Reply,
      label: 'Reply',
      onClick: () => {
        onReply?.();
        onClose();
      },
      show: true,
    },
    {
      icon: Forward,
      label: 'Forward',
      onClick: () => {
        onForward?.();
        onClose();
      },
      show: true,
    },
    {
      icon: Copy,
      label: 'Copy',
      onClick: handleCopy,
      show: true,
    },
    {
      icon: Edit2,
      label: 'Edit',
      onClick: () => {
        onEdit?.();
        onClose();
      },
      show: isOwn,
    },
    {
      icon: Star,
      label: isStarred ? 'Unstar' : 'Star',
      onClick: handleStar,
      show: true,
    },
    {
      icon: Pin,
      label: isPinned ? 'Unpin' : 'Pin',
      onClick: handlePin,
      show: true,
    },
    {
      icon: Volume2,
      label: 'Speak',
      onClick: handleSpeak,
      show: 'speechSynthesis' in window,
    },
    {
      icon: Download,
      label: 'Download',
      onClick: () => {
        // Handle download
        onClose();
      },
      show: hasFile,
    },
    {
      icon: Info,
      label: 'Message info',
      onClick: () => {
        // Show message info modal
        onClose();
      },
      show: true,
    },
    {
      icon: Flag,
      label: 'Report',
      onClick: () => {
        // Handle report
        onClose();
      },
      show: !isOwn,
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: handleDelete,
      show: isOwn,
      danger: true,
    },
  ].filter(item => item.show);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 min-w-[180px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 animate-scaleIn"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
        }}
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === menuItems.length - 1;
          const isDanger = item.danger;

          return (
            <div key={item.label}>
              {isDanger && index > 0 && (
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
              )}
              <button
                onClick={item.onClick}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5
                  text-sm transition-colors text-left
                  ${isDanger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
              {isDanger && !isLast && (
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// Hook to manage context menu
export const useMessageContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    messageId: string;
    message: string;
    isOwn: boolean;
    hasFile?: boolean;
    isStarred?: boolean;
    isPinned?: boolean;
    position: ContextMenuPosition;
  } | null>(null);

  const openContextMenu = (event: React.MouseEvent, menuData: typeof contextMenu) => {
    event.preventDefault();
    setContextMenu({
      ...menuData!,
      position: { x: event.clientX, y: event.clientY },
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
};

export default MessageContextMenu;