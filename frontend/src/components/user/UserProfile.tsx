import { FiX, FiLogOut, FiEdit2, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, getInitials } from '@/lib/utils';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Avatar and Name */}
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-primary-700 font-semibold">
              {getInitials(user.username)}
            </span>
          </div>
          <h3 className="text-xl font-medium text-gray-900">{user.username}</h3>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-600">
            <FiUser className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm">{user.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <FiMail className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-600">
            <FiCalendar className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">Member since</p>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FiEdit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}