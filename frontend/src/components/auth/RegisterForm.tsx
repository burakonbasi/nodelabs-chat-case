import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  User, Mail, Lock, Eye, EyeOff, UserPlus, Loader2,
  Sparkles, Github, Chrome, Check
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { RegisterForm as RegisterFormType } from '@/types';
import { cn } from '@/utils/cn';

export function RegisterForm() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormType>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormType) => {
    setIsLoading(true);
    try {
      await registerUser(data.username, data.email, data.password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    toast.info(`${provider} signup coming soon!`);
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join us today</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'At least 3 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: 'Only letters, numbers, - and _',
                    },
                  })}
                  type="text"
                  className={cn(
                    "block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                    errors.username 
                      ? "border-red-300 bg-red-50" 
                      : "border-gray-300"
                  )}
                  placeholder="johndoe"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className={cn(
                    "block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                    errors.email 
                      ? "border-red-300 bg-red-50" 
                      : "border-gray-300"
                  )}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'At least 8 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={cn(
                    "block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                    errors.password 
                      ? "border-red-300 bg-red-50" 
                      : "border-gray-300"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          i < passwordStrength
                            ? passwordStrength <= 2 ? "bg-red-500"
                            : passwordStrength === 3 ? "bg-yellow-500"
                            : "bg-green-500"
                            : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {passwordStrength <= 2 ? "Weak" : passwordStrength === 3 ? "Good" : "Strong"} password
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={cn(
                    "block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                    errors.confirmPassword 
                      ? "border-red-300 bg-red-50" 
                      : "border-gray-300"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-600 hover:text-purple-500">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-purple-600 hover:text-purple-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg text-white font-medium transition-all",
                "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transform hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialSignup('Google')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </button>
              <button
                onClick={() => handleSocialSignup('GitHub')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </button>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}