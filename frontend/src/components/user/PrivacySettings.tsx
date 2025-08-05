import React, { useState, useCallback } from 'react';
import { 
  Shield, Eye, EyeOff, Users, UserCheck, Clock, 
  Image, Phone, MessageCircle, Globe, Lock,
  ChevronRight, Info, AlertTriangle, Check
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';

interface PrivacySettingsProps {
  className?: string;
}

type PrivacyOption = 'everyone' | 'contacts' | 'nobody';
type LastSeenOption = 'everyone' | 'contacts' | 'nobody' | 'same';

interface PrivacyState {
  profilePhoto: PrivacyOption;
  lastSeen: LastSeenOption;
  status: PrivacyOption;
  readReceipts: boolean;
  typingIndicators: boolean;
  groups: 'everyone' | 'contacts';
  calls: PrivacyOption;
  blocked: string[];
  activeStatus: boolean;
  messageRequests: boolean;
  phoneNumber: PrivacyOption;
  email: PrivacyOption;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ className }) => {
  const { user } = useAuthStore();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  
  const [privacy, setPrivacy] = useState<PrivacyState>({
    profilePhoto: 'everyone',
    lastSeen: 'everyone',
    status: 'everyone',
    readReceipts: true,
    typingIndicators: true,
    groups: 'everyone',
    calls: 'everyone',
    blocked: [],
    activeStatus: true,
    messageRequests: true,
    phoneNumber: 'contacts',
    email: 'nobody'
  });

  const handlePrivacyChange = useCallback(<K extends keyof PrivacyState>(
    key: K,
    value: PrivacyState[K]
  ) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // API call to save privacy settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving privacy settings:', privacy);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [privacy]);

  return (
    <div className={cn('max-w-4xl mx-auto p-4 space-y-6', className)}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Privacy Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Control who can see your information and contact you
            </p>
          </div>
        </div>

        {hasChanges && (
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You have unsaved changes
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Privacy */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Profile Privacy</h3>
        </div>
        
        <div className="divide-y dark:divide-gray-700">
          <PrivacyOptionItem
            icon={Image}
            title="Profile Photo"
            description="Choose who can see your profile photo"
            value={privacy.profilePhoto}
            onChange={(value) => handlePrivacyChange('profilePhoto', value as PrivacyOption)}
            onInfo={() => setShowInfo('profilePhoto')}
            showInfo={showInfo === 'profilePhoto'}
            infoText="Your profile photo helps people recognize you. You can control who sees it."
          />
          
          <PrivacyOptionItem
            icon={Clock}
            title="Last Seen & Online"
            description="Choose who can see your online status"
            value={privacy.lastSeen}
            onChange={(value) => handlePrivacyChange('lastSeen', value as LastSeenOption)}
            options={[
              { value: 'everyone', label: 'Everyone' },
              { value: 'contacts', label: 'My Contacts' },
              { value: 'nobody', label: 'Nobody' },
              { value: 'same', label: 'Same as Last Seen' }
            ]}
            onInfo={() => setShowInfo('lastSeen')}
            showInfo={showInfo === 'lastSeen'}
            infoText="If you don't share your last seen, you won't be able to see other people's last seen."
          />
          
          <PrivacyOptionItem
            icon={MessageCircle}
            title="Status"
            description="Choose who can see your status updates"
            value={privacy.status}
            onChange={(value) => handlePrivacyChange('status', value as PrivacyOption)}
            onInfo={() => setShowInfo('status')}
            showInfo={showInfo === 'status'}
            infoText="Status updates disappear after 24 hours."
          />
        </div>
      </div>

      {/* Communication Privacy */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Communication</h3>
        </div>
        
        <div className="divide-y dark:divide-gray-700">
          <ToggleItem
            icon={Eye}
            title="Read Receipts"
            description="Let others know when you've read their messages"
            checked={privacy.readReceipts}
            onChange={(checked) => handlePrivacyChange('readReceipts', checked)}
            warning="If turned off, you won't see read receipts from others"
          />
          
          <ToggleItem
            icon={MessageCircle}
            title="Typing Indicators"
            description="Show when you're typing a message"
            checked={privacy.typingIndicators}
            onChange={(checked) => handlePrivacyChange('typingIndicators', checked)}
          />
          
          <PrivacyOptionItem
            icon={Users}
            title="Groups"
            description="Choose who can add you to groups"
            value={privacy.groups}
            onChange={(value) => handlePrivacyChange('groups', value as 'everyone' | 'contacts')}
            options={[
              { value: 'everyone', label: 'Everyone' },
              { value: 'contacts', label: 'My Contacts' }
            ]}
          />
          
          <PrivacyOptionItem
            icon={Phone}
            title="Calls"
            description="Choose who can call you"
            value={privacy.calls}
            onChange={(value) => handlePrivacyChange('calls', value as PrivacyOption)}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Contact Information</h3>
        </div>
        
        <div className="divide-y dark:divide-gray-700">
          <PrivacyOptionItem
            icon={Phone}
            title="Phone Number"
            description="Choose who can see your phone number"
            value={privacy.phoneNumber}
            onChange={(value) => handlePrivacyChange('phoneNumber', value as PrivacyOption)}
          />
          
          <PrivacyOptionItem
            icon={Globe}
            title="Email Address"
            description="Choose who can see your email address"
            value={privacy.email}
            onChange={(value) => handlePrivacyChange('email', value as PrivacyOption)}
          />
        </div>
      </div>

      {/* Additional Privacy */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Additional Privacy</h3>
        </div>
        
        <div className="divide-y dark:divide-gray-700">
          <ToggleItem
            icon={Eye}
            title="Active Status"
            description="Show when you're active or recently active"
            checked={privacy.activeStatus}
            onChange={(checked) => handlePrivacyChange('activeStatus', checked)}
          />
          
          <ToggleItem
            icon={UserCheck}
            title="Message Requests"
            description="Receive message requests from people not in your contacts"
            checked={privacy.messageRequests}
            onChange={(checked) => handlePrivacyChange('messageRequests', checked)}
          />
          
          <button className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium">Blocked Users</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {privacy.blocked.length} users blocked
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Privacy Option Component
interface PrivacyOptionItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  onInfo?: () => void;
  showInfo?: boolean;
  infoText?: string;
}

const PrivacyOptionItem: React.FC<PrivacyOptionItemProps> = ({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  options = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'contacts', label: 'My Contacts' },
    { value: 'nobody', label: 'Nobody' }
  ],
  onInfo,
  showInfo,
  infoText
}) => (
  <div className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {onInfo && (
        <button
          onClick={onInfo}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Info className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
    
    {showInfo && infoText && (
      <div className="mb-4 ml-14 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">{infoText}</p>
      </div>
    )}
    
    <div className="ml-14 flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

// Toggle Item Component
interface ToggleItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  warning?: string;
}

const ToggleItem: React.FC<ToggleItemProps> = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  warning
}) => (
  <div className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors',
          checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <div className={cn(
          'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0.5'
        )} />
      </button>
    </div>
    
    {warning && !checked && (
      <div className="mt-3 ml-14 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
        <p className="text-xs text-amber-800 dark:text-amber-200">{warning}</p>
      </div>
    )}
  </div>
);