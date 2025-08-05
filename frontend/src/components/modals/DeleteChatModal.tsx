import React, { useState, useCallback } from 'react';
import { X, Trash2, AlertTriangle, Loader2, Archive, MessageCircle } from 'lucide-react';
import { UserAvatar } from '../user/UserAvatar';
import type { Chat } from '../../types';

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
  onConfirm: (options: DeleteOptions) => Promise<void>;
}

interface DeleteOptions {
  action: 'delete' | 'archive' | 'clear';
  deleteForEveryone?: boolean;
  keepStarredMessages?: boolean;
}

export const DeleteChatModal: React.FC<DeleteChatModalProps> = ({
  isOpen,
  onClose,
  chat,
  onConfirm
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<DeleteOptions['action']>('archive');
  const [deleteForEveryone, setDeleteForEveryone] = useState(false);
  const [keepStarredMessages, setKeepStarredMessages] = useState(true);

  const isGroup = chat.type === 'group';
  const messageCount = chat.messages?.length || 0;
  const hasMedia = chat.messages?.some(m => m.media && m.media.length > 0) || false;

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const options: DeleteOptions = {
        action: selectedAction,
        deleteForEveryone: selectedAction === 'delete' ? deleteForEveryone : undefined,
        keepStarredMessages: selectedAction === 'clear' ? keepStarredMessages : undefined
      };
      
      await onConfirm(options);
      onClose();
    } catch (error) {
      console.error('Failed to process chat action:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAction, deleteForEveryone, keepStarredMessages, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700">
          <div className={`p-2 rounded-lg ${
            selectedAction === 'delete' 
              ? 'bg-red-100 dark:bg-red-900/30' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {selectedAction === 'delete' ? (
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            ) : selectedAction === 'archive' ? (
              <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <h2 className="text-lg font-semibold flex-1">
            {selectedAction === 'delete' ? 'Delete Chat' : 
             selectedAction === 'archive' ? 'Archive Chat' : 'Clear Messages'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Chat Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <UserAvatar 
              user={isGroup ? { 
                id: chat.id, 
                name: chat.name || 'Group', 
                avatar: chat.avatar 
              } : chat.participants[0]} 
              size="md" 
            />
            <div className="flex-1">
              <p className="font-medium">{chat.name || chat.participants[0].name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {messageCount} messages {hasMedia && '• Contains media'}
              </p>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose an action:
            </p>
            
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="action"
                value="archive"
                checked={selectedAction === 'archive'}
                onChange={(e) => setSelectedAction(e.target.value as DeleteOptions['action'])}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium">Archive this chat</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hide chat from your chat list. You can unarchive it anytime.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="action"
                value="clear"
                checked={selectedAction === 'clear'}
                onChange={(e) => setSelectedAction(e.target.value as DeleteOptions['action'])}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium">Clear messages</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Delete all messages but keep the chat
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="action"
                value="delete"
                checked={selectedAction === 'delete'}
                onChange={(e) => setSelectedAction(e.target.value as DeleteOptions['action'])}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-red-600 dark:text-red-400">Delete chat</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete this chat and all its messages
                </p>
              </div>
            </label>
          </div>

          {/* Additional Options */}
          {selectedAction === 'delete' && !isGroup && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  This action cannot be undone. All messages, media, and files will be permanently deleted.
                </p>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteForEveryone}
                  onChange={(e) => setDeleteForEveryone(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Delete for everyone</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Also delete this chat for {chat.participants[0].name}
                  </p>
                </div>
              </label>
            </div>
          )}

          {selectedAction === 'clear' && (
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={keepStarredMessages}
                onChange={(e) => setKeepStarredMessages(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Keep starred messages</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Don't delete messages you've starred
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
              selectedAction === 'delete'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {selectedAction === 'delete' ? (
                  <Trash2 className="w-4 h-4" />
                ) : selectedAction === 'archive' ? (
                  <Archive className="w-4 h-4" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                {selectedAction === 'delete' ? 'Delete' : 
                 selectedAction === 'archive' ? 'Archive' : 'Clear'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};