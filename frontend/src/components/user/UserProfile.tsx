import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiLogOut, FiEdit2, FiUser, FiMail, FiCalendar,
  FiCamera, FiCheck, FiAtSign, FiInfo, FiShield
} from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, getInitials, cn } from '@/lib/utils';
import api from '@/lib/api';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, logout, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'privacy'>('profile');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
      status: user?.status || '',
    },
  });

  if (!user) return null;

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await logout();
    }
  };

  const handleUpdateProfile = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.patch('/users/profile', data);
      updateUser(response.data.data.user);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(response.data.data.user);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: FiUser },
    { id: 'account' as const, label: 'Account', icon: FiShield },
    { id: 'privacy' as const, label: 'Privacy', icon: FiInfo },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-80 lg:w-96 bg-white dark:bg-dark-400 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-300 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Picture and Name */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600"></div>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 bg-white dark:bg-dark-400 rounded-full p-1"
            >
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white font-semibold">
                  {getInitials(user.username)}
                </span>
              </div>
            </motion.div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <FiCamera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="text-center mt-14 mb-4">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          {user.username}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {user.email}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 transition-all duration-200",
                activeTab === tab.id
                  ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {isEditing ? (
                <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      {...register('username', { required: 'Username is required' })}
                      className={cn(
                        "w-full px-4 py-2 bg-gray-100 dark:bg-dark-300 rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500",
                        "text-gray-900 dark:text-white"
                      )}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={3}
                      className={cn(
                        "w-full px-4 py-2 bg-gray-100 dark:bg-dark-300 rounded-lg resize-none",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500",
                        "text-gray-900 dark:text-white"
                      )}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <input
                      {...register('status')}
                      className={cn(
                        "w-full px-4 py-2 bg-gray-100 dark:bg-dark-300 rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500",
                        "text-gray-900 dark:text-white"
                      )}
                      placeholder="What's on your mind?"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                      }}
                      className="flex-1 bg-gray-200 dark:bg-dark-300 hover:bg-gray-300 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-200 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Information
                    </h4>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FiAtSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiInfo className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bio</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {user.bio || 'No bio yet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Member since</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>

                <button className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-200 rounded-lg transition-colors">
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Change Password
                  </span>
                  <FiShield className="w-4 h-4 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-200 rounded-lg transition-colors">
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Two-Factor Authentication
                  </span>
                  <FiShield className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-dark-300">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Your privacy is important to us. All your messages are end-to-end encrypted.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-100 dark:bg-dark-300 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Data Usage
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    We only collect essential data to provide our services
                  </p>
                </div>

                <div className="p-3 bg-gray-100 dark:bg-dark-300 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Message Retention
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Messages are stored securely and can be deleted anytime
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}