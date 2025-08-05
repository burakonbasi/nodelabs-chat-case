import React, { useState, useCallback } from 'react';
import { X, Ban, AlertTriangle, Loader2 } from 'lucide-react';
import { UserAvatar } from '../user/UserAvatar';
import type { User } from '../../types';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onConfirm: (blockOptions: BlockOptions) => Promise<void>;
}

interface BlockOptions {
  deleteMessages: boolean;
  reportUser: boolean;
  reportReason?: string;
}

const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Inappropriate content',
  'Fake account',
  'Other'
];

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [deleteMessages, setDeleteMessages] = useState(false);
  const [reportUser, setReportUser] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const blockOptions: BlockOptions = {
        deleteMessages,
        reportUser,
        reportReason: reportUser ? (reportReason === 'Other' ? customReason : reportReason) : undefined
      };
      
      await onConfirm(blockOptions);
      onClose();
    } catch (error) {
      console.error('Failed to block user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteMessages, reportUser, reportReason, customReason, onConfirm, onClose]);

  const handleReportToggle = useCallback((checked: boolean) => {
    setReportUser(checked);
    if (checked) {
      setShowReportDetails(true);
    } else {
      setShowReportDetails(false);
      setReportReason('');
      setCustomReason('');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold flex-1">Block User</h2>
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
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <UserAvatar user={user} size="md" />
            <div>
              <p className="font-medium">{user.name}</p>
              {user.username && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{user.username}
                </p>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Are you sure you want to block {user.name}?</p>
              <ul className="space-y-1 text-amber-700 dark:text-amber-300">
                <li>• They won't be able to message or call you</li>
                <li>• You won't see their messages or status updates</li>
                <li>• They won't be notified that you blocked them</li>
              </ul>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Delete Messages Option */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteMessages}
                onChange={(e) => setDeleteMessages(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium">Delete chat history</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remove all messages from this user
                </p>
              </div>
            </label>

            {/* Report User Option */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reportUser}
                onChange={(e) => handleReportToggle(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium">Report this user</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Let us know if this user is violating our terms
                </p>
              </div>
            </label>

            {/* Report Details */}
            {showReportDetails && (
              <div className="ml-7 space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select a reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Choose a reason...</option>
                    {REPORT_REASONS.map(reason => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {reportReason === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Please specify
                    </label>
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Tell us more about why you're reporting this user"
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none dark:bg-gray-700 dark:border-gray-600"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {customReason.length}/500
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
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
            disabled={isLoading || (reportUser && !reportReason) || (reportReason === 'Other' && !customReason)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Blocking...
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" />
                Block User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};