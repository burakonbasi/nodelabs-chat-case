import React, { useState, useCallback } from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, Globe, 
  Key, Shield, Smartphone, LogOut, Trash2, 
  ChevronRight, Check, AlertTriangle, Loader2 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from './UserAvatar';
import { formatDate } from '../../utils/date';
import { cn } from '../../utils/cn';

interface AccountSettingsProps {
  className?: string;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ className }) => {
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Mock data for connected devices
  const connectedDevices = [
    {
      id: '1',
      name: 'Chrome on Windows',
      location: 'Istanbul, Turkey',
      lastActive: new Date(),
      isCurrent: true
    },
    {
      id: '2',
      name: 'Mobile App',
      location: 'Izmir, Turkey',
      lastActive: new Date(Date.now() - 3600000)
    }
  ];

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    setIsLoading(true);
    try {
      // API call to delete account
      console.log('Deleting account...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteConfirmText, logout]);

  const handleRemoveDevice = useCallback(async (deviceId: string) => {
    console.log('Removing device:', deviceId);
    // API call to remove device
  }, []);

  if (!user) return null;

  return (
    <div className={cn('max-w-4xl mx-auto p-4 space-y-6', className)}>
      {/* Profile Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
        
        <div className="flex items-start gap-6">
          <UserAvatar user={user} size="xl" editable onAvatarChange={async () => {}} />
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-medium">{user.name}</h3>
              {user.username && (
                <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={Mail} label="Email" value={user.email} />
              <InfoItem icon={Phone} label="Phone" value={user.phone || 'Not set'} />
              <InfoItem icon={MapPin} label="Location" value={user.location || 'Not set'} />
              <InfoItem icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Account Information</h3>
        </div>
        
        <div className="divide-y dark:divide-gray-700">
          <SettingItem
            icon={User}
            title="Username"
            description={user.username || 'Choose a unique username'}
            action="Edit"
            onClick={() => console.log('Edit username')}
          />
          
          <SettingItem
            icon={Mail}
            title="Email Address"
            description={user.email}
            action="Change"
            onClick={() => console.log('Change email')}
          />
          
          <SettingItem
            icon={Phone}
            title="Phone Number"
            description={user.phone || 'Add a phone number for security'}
            action={user.phone ? 'Change' : 'Add'}
            onClick={() => console.log('Change phone')}
          />
          
          <SettingItem
            icon={Globe}
            title="Language"
            description="English (US)"
            action="Change"
            onClick={() => console.log('Change language')}
          />
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Security</h3>
        </div>
        
        <div className="divide-y dark:divide-gray-700">
          <SettingItem
            icon={Key}
            title="Password"
            description="Last changed 3 months ago"
            action="Update"
            onClick={() => console.log('Change password')}
          />
          
          <SettingItem
            icon={Shield}
            title="Two-Factor Authentication"
            description={user.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
            action={user.twoFactorEnabled ? 'Manage' : 'Enable'}
            status={user.twoFactorEnabled ? 'success' : undefined}
            onClick={() => console.log('Manage 2FA')}
          />
          
          <SettingItem
            icon={Smartphone}
            title="Login Verification"
            description="Get alerts for unrecognized logins"
            action="Configure"
            onClick={() => console.log('Configure login verification')}
          />
        </div>
      </div>

      {/* Connected Devices */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Connected Devices</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage devices where you're logged in
          </p>
        </div>
        
        <div className="divide-y dark:divide-gray-700">
          {connectedDevices.map(device => (
            <div key={device.id} className="p-6 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">
                    {device.name}
                    {device.isCurrent && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        Current device
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {device.location} • {formatRelativeTime(device.lastActive)}
                  </p>
                </div>
              </div>
              
              {!device.isCurrent && (
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-red-200 dark:border-red-900/50">
        <div className="p-6">
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Log Out
            </button>
            
            <div>
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
              
              {showDeleteConfirm && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        This action is permanent and cannot be undone. All your data will be deleted.
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== 'DELETE' || isLoading}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Deleting...' : 'Delete My Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <Icon className="w-4 h-4 text-gray-400" />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

interface SettingItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  status?: 'success' | 'warning' | 'error';
  onClick: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  title,
  description,
  action,
  status,
  onClick
}) => (
  <button
    onClick={onClick}
    className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
  >
    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <p className="font-medium">{title}</p>
        {status === 'success' && (
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </button>
);

// Helper function for relative time
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return formatDate(date);
}