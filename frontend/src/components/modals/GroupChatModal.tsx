import React, { useState, useCallback, useMemo } from 'react';
import { X, Camera, Users, Search, Check, Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { UserAvatar } from '../user/UserAvatar';
import { compressImage } from '../../lib/media';
import type { User } from '../../types';

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGroup?: {
    id: string;
    name: string;
    avatar?: string;
    description?: string;
    members: string[];
  };
}

export const GroupChatModal: React.FC<GroupChatModalProps> = ({
  isOpen,
  onClose,
  existingGroup
}) => {
  const { user } = useAuthStore();
  const { contacts } = useChatStore();
  
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState(existingGroup?.name || '');
  const [groupDescription, setGroupDescription] = useState(existingGroup?.description || '');
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState(existingGroup?.avatar || '');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(existingGroup?.members || [])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!existingGroup;

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.username?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress image
      const compressed = await compressImage(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.8
      });

      setGroupAvatar(compressed);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setGroupAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error('Failed to process avatar:', error);
    }
  }, []);

  const toggleMember = useCallback((userId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (step === 1 && groupName.trim()) {
      setStep(2);
    }
  }, [step, groupName]);

  const handleCreate = useCallback(async () => {
    if (!groupName.trim() || selectedMembers.size === 0) return;

    setIsLoading(true);

    try {
      // Here you would call your API to create/update the group
      const groupData = {
        name: groupName,
        description: groupDescription,
        members: Array.from(selectedMembers),
        avatar: groupAvatar
      };

      console.log('Creating/updating group:', groupData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Failed to create/update group:', error);
    } finally {
      setIsLoading(false);
    }
  }, [groupName, groupDescription, selectedMembers, groupAvatar, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {isEditMode ? 'Edit Group' : 'New Group'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 1 ? (
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <label className="relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {groupAvatarPreview ? (
                      <img
                        src={groupAvatarPreview}
                        alt="Group avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </label>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  maxLength={25}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {groupName.length}/25
                </p>
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Add a description"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none dark:bg-gray-700 dark:border-gray-600"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {groupDescription.length}/100
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Selected Members Count */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedMembers.size} members selected
                </span>
                <span className="text-gray-500">
                  <Users className="inline w-4 h-4 mr-1" />
                  {selectedMembers.size + 1} total (including you)
                </span>
              </div>

              {/* Contact List */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredContacts.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(contact.id)}
                      onChange={() => toggleMember(contact.id)}
                      className="sr-only"
                    />
                    <div className="relative">
                      <UserAvatar user={contact} size="sm" />
                      {selectedMembers.has(contact.id) && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium">{contact.name}</p>
                      {contact.username && (
                        <p className="text-sm text-gray-500">@{contact.username}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Back
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                onClick={handleNext}
                disabled={!groupName.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={selectedMembers.size === 0 || isLoading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {isEditMode ? 'Update' : 'Create'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};