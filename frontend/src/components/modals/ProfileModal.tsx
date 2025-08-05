import { useState } from 'react';
import { 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe,
  Edit2,
  Save,
  X,
  Loader2
} from 'lucide-react';
import Modal from '../common/Modal';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../common/Toast';
import UserAvatar from '../user/UserAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, updateProfile } = useAuthStore();
  const { success, error: showError } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    website: user?.website || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      website: user?.website || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Upload avatar if changed
      let avatarUrl = user?.avatar;
      if (avatarFile) {
        // Upload to server
        // avatarUrl = await uploadAvatar(avatarFile);
      }
      
      // Update profile
      await updateProfile({
        ...profileData,
        avatar: avatarUrl,
      });
      
      success('Profile updated successfully');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      showError('Failed to update profile', 'Please try again');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('File too large', 'Please select an image under 5MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'Unknown';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="md">
      <div className="p-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <UserAvatar
              src={avatarPreview || user?.avatar}
              name={user?.name || ''}
              size="xl"
              className="w-32 h-32"
            />
            {isEditing && (
              <>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-8 h-8 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          {!isEditing && (
            <div className="text-center mt-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.status || 'Available'}
              </p>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{user?.name || 'Not set'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
                disabled
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Add phone number"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.phone || <span className="text-gray-500">Not set</span>}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                placeholder="Add location"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.location || <span className="text-gray-500">Not set</span>}
              </p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              <Globe className="w-4 h-4 inline mr-2" />
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.website ? (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    {user.website}
                  </a>
                ) : (
                  <span className="text-gray-500">Not set</span>
                )}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.bio || <span className="text-gray-500">No bio added</span>}
              </p>
            )}
          </div>

          {/* Member Since */}
          {!isEditing && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                <Calendar className="w-4 h-4 inline mr-2" />
                Member Since
              </label>
              <p className="text-gray-900 dark:text-white">{memberSince}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;