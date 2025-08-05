import React, { useState, useCallback } from 'react';
import { Save, X, Camera, Loader2, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from './UserAvatar';
import { compressImage } from '../../lib/media';
import { checkPasswordStrength } from '../../utils/crypto';
import { cn } from '../../utils/cn';

interface EditProfileProps {
  onClose?: () => void;
  className?: string;
}

interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export const EditProfile: React.FC<EditProfileProps> = ({ onClose, className }) => {
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handlePasswordChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAvatarChange = useCallback(async (file: File) => {
    try {
      const compressed = await compressImage(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.8
      });
      
      setAvatar(compressed);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error('Failed to process avatar:', error);
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Username validation
    if (formData.username) {
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Website validation
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    // Bio length validation
    if (formData.bio.length > 150) {
      newErrors.bio = 'Bio must be 150 characters or less';
    }

    // Password validation
    if (showPasswordChange) {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (!passwordData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else {
        const strength = checkPasswordStrength(passwordData.newPassword);
        if (!strength.isStrong) {
          newErrors.newPassword = strength.feedback[0] || 'Password is too weak';
        }
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, passwordData, showPasswordChange]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const updateData: any = { ...formData };
      
      if (avatar) {
        // Upload avatar
        const formData = new FormData();
        formData.append('avatar', avatar);
        // const avatarUrl = await uploadAvatar(formData);
        // updateData.avatar = avatarUrl;
      }
      
      if (showPasswordChange && passwordData.newPassword) {
        updateData.password = passwordData.newPassword;
        updateData.currentPassword = passwordData.currentPassword;
      }
      
      await updateProfile(updateData);
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      // Reset password fields
      if (showPasswordChange) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordChange(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [formData, avatar, passwordData, showPasswordChange, validateForm, updateProfile]);

  const passwordStrength = passwordData.newPassword 
    ? checkPasswordStrength(passwordData.newPassword) 
    : null;

  return (
    <div className={cn('max-w-2xl mx-auto p-4', className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <div className="flex items-center gap-2">
            {isSaved && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="text-sm">Saved</span>
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <UserAvatar 
                user={{ ...user!, avatar: avatarPreview }} 
                size="xl" 
                editable 
                onAvatarChange={handleAvatarChange}
              />
              <div>
                <h3 className="font-medium mb-1">Profile Photo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  JPG, GIF or PNG. Max size of 5MB.
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
              />
              
              <FormField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                placeholder="@username"
              />
              
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
              />
              
              <FormField
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
              />
              
              <FormField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
              />
              
              <FormField
                label="Website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                error={errors.website}
                placeholder="https://example.com"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg resize-none',
                  'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'dark:bg-gray-700 dark:border-gray-600',
                  errors.bio && 'border-red-500'
                )}
                placeholder="Tell us about yourself"
                maxLength={150}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {formData.bio.length}/150
                </p>
                {errors.bio && (
                  <p className="text-xs text-red-500">{errors.bio}</p>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            <div className="border-t dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
              >
                {showPasswordChange ? 'Cancel password change' : 'Change password'}
              </button>
              
              {showPasswordChange && (
                <div className="mt-4 space-y-4">
                  <FormField
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={errors.currentPassword}
                  />
                  
                  <div>
                    <FormField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      error={errors.newPassword}
                    />
                    
                    {passwordStrength && passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[0, 1, 2, 3].map(i => (
                            <div
                              key={i}
                              className={cn(
                                'h-1 flex-1 rounded-full',
                                i < passwordStrength.score
                                  ? passwordStrength.score <= 1 ? 'bg-red-500'
                                  : passwordStrength.score === 2 ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              )}
                            />
                          ))}
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {passwordStrength.feedback[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <FormField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={errors.confirmPassword}
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={() => window.location.reload()}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
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
          </div>
        </form>
      </div>
    </div>
  );
};

// Form Field Component
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2 border rounded-lg',
        'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'dark:bg-gray-700 dark:border-gray-600',
        error && 'border-red-500'
      )}
    />
    {error && (
      <p className="text-xs text-red-500 mt-1">{error}</p>
    )}
  </div>
);