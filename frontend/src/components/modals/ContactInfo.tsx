import React, { useState, useCallback } from 'react';
import { 
  X, Phone, Video, MessageCircle, Info, Bell, BellOff, 
  Ban, Trash2, Image, FileText, Link2, Star, Clock,
  Mail, MapPin, Calendar, Shield, ChevronRight
} from 'lucide-react';
import { UserAvatar } from '../user/UserAvatar';
import { UserStatus } from '../user/UserStatus';
import { formatDate } from '../../utils/date';
import { formatFileSize } from '../../lib/media';
import type { User, Chat } from '../../types';

interface ContactInfoProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  chat?: Chat;
  onStartCall?: (type: 'audio' | 'video') => void;
  onDeleteChat?: () => void;
  onBlockUser?: () => void;
  onOpenMediaGallery?: () => void;
}

interface SharedMedia {
  images: number;
  videos: number;
  documents: number;
  links: number;
  totalSize: number;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  isOpen,
  onClose,
  user,
  chat,
  onStartCall,
  onDeleteChat,
  onBlockUser,
  onOpenMediaGallery
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isStarred, setIsStarred] = useState(false);

  // Mock shared media data - in real app, this would come from props or API
  const sharedMedia: SharedMedia = {
    images: 128,
    videos: 24,
    documents: 15,
    links: 89,
    totalSize: 1024 * 1024 * 256 // 256 MB
  };

  const handleToggleNotifications = useCallback(() => {
    setNotificationsEnabled(!notificationsEnabled);
  }, [notificationsEnabled]);

  const handleToggleStar = useCallback(() => {
    setIsStarred(!isStarred);
  }, [isStarred]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-10">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Contact Info</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6 text-center border-b dark:border-gray-700">
        <UserAvatar user={user} size="xl" className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
        {user.username && (
          <p className="text-gray-500 dark:text-gray-400 mb-2">@{user.username}</p>
        )}
        <UserStatus status={user.status} showLabel className="justify-center" />
        
        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => onStartCall?.('audio')}
            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Voice call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStartCall?.('video')}
            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Message"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* About Section */}
      {user.bio && (
        <div className="p-4 border-b dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            About
          </h4>
          <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
        </div>
      )}

      {/* Details Section */}
      <div className="border-b dark:border-gray-700">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-400" />
            <span className="font-medium">Details</span>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
            showDetails ? 'rotate-90' : ''
          }`} />
        </button>
        
        {showDetails && (
          <div className="px-4 pb-4 space-y-3">
            {user.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
            )}
            
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm">{user.phone}</p>
                </div>
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm">{user.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shared Media Section */}
      <div className="p-4 border-b dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Shared Media
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenMediaGallery}
            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">{sharedMedia.images}</p>
                <p className="text-xs text-gray-500">Images</p>
              </div>
            </div>
          </button>
          
          <button className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">{sharedMedia.videos}</p>
                <p className="text-xs text-gray-500">Videos</p>
              </div>
            </div>
          </button>
          
          <button className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">{sharedMedia.documents}</p>
                <p className="text-xs text-gray-500">Documents</p>
              </div>
            </div>
          </button>
          
          <button className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">{sharedMedia.links}</p>
                <p className="text-xs text-gray-500">Links</p>
              </div>
            </div>
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Total: {formatFileSize(sharedMedia.totalSize)}
        </p>
      </div>

      {/* Settings Section */}
      <div className="p-4 space-y-1">
        <button
          onClick={handleToggleStar}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Star className={`w-5 h-5 ${isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
            <span>Starred Messages</span>
          </div>
        </button>
        
        <button
          onClick={handleToggleNotifications}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            {notificationsEnabled ? (
              <Bell className="w-5 h-5 text-gray-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <span>Notifications</span>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors ${
            notificationsEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
            } mt-0.5`} />
          </div>
        </button>
        
        <button className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
          <Clock className="w-5 h-5 text-gray-400" />
          <span>Disappearing Messages</span>
        </button>
        
        <button className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
          <Shield className="w-5 h-5 text-gray-400" />
          <span>Encryption</span>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="p-4 space-y-1 border-t dark:border-gray-700">
        <button
          onClick={onBlockUser}
          className="w-full p-3 flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Ban className="w-5 h-5" />
          <span>Block {user.name}</span>
        </button>
        
        <button
          onClick={onDeleteChat}
          className="w-full p-3 flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          <span>Delete Chat</span>
        </button>
      </div>
    </div>
  );
};