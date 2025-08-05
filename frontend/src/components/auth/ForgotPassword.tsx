import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../common/Toast';

type Step = 'email' | 'verify' | 'reset' | 'success';

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { resetPassword } = useAuthStore();
  const { success, error: showError } = useToast();

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    try {
      // Call API to send reset code
      // await sendResetCode(email);
      success('Reset code sent!', 'Check your email for the verification code');
      setStep('verify');
    } catch (err) {
      showError('Failed to send code', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (code.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }

    setIsLoading(true);
    try {
      // Verify the code
      // await verifyResetCode(email, code);
      success('Code verified!', 'You can now reset your password');
      setStep('reset');
    } catch (err) {
      setErrors({ code: 'Invalid or expired code' });
      showError('Verification failed', 'Please check the code and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors({ password: `Password must have: ${passwordErrors.join(', ')}` });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, code, password);
      success('Password reset successful!');
      setStep('success');
    } catch (err) {
      showError('Reset failed', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4">
                <Mail className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSendEmail}>
              <div className="mb-6">
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  autoFocus
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center mt-6 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Link>
            </form>
          </div>
        );

      case 'verify':
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4">
                <Mail className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We sent a verification code to<br />
                <span className="font-medium text-gray-900 dark:text-white">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyCode}>
              <div className="mb-6">
                <label htmlFor="code" className="label">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className={`input text-center text-xl font-semibold tracking-wider ${
                    errors.code ? 'border-red-500' : ''
                  }`}
                  disabled={isLoading}
                  autoFocus
                  maxLength={6}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.code}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Try again
                  </button>
                </p>
              </div>
            </form>
          </div>
        );

      case 'reset':
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4">
                <Lock className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Set New Password
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your new password must be different from previous passwords.
              </p>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label htmlFor="password" className="label">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={`input ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  autoFocus
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        );

      case 'success':
        return (
          <div className="w-full max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Password Reset!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;