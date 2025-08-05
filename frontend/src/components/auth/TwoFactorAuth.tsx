import { useState, useRef, useEffect } from 'react';
import { Shield, Loader2, AlertCircle, Smartphone } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../common/Toast';

interface TwoFactorAuthProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  method?: '2fa' | 'sms' | 'email';
}

const TwoFactorAuth = ({ 
  onSuccess, 
  onCancel,
  method = '2fa' 
}: TwoFactorAuthProps) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyTwoFactor } = useAuthStore();
  const { success, error: showError } = useToast();

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 5 && newCode.every(digit => digit)) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePaste();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 6);
      
      if (digits.length === 6) {
        const newCode = digits.split('');
        setCode(newCode);
        inputRefs.current[5]?.focus();
        handleSubmit(digits);
      }
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const verificationCode = codeString || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyTwoFactor(verificationCode);
      success('Verification successful!');
      onSuccess?.();
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      showError('Verification failed', 'Invalid code entered');
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    try {
      // Call resend API
      // await resendTwoFactorCode();
      success('Verification code resent!');
      setResendTimer(60); // 60 second cooldown
    } catch (err) {
      showError('Resend failed', 'Unable to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodInfo = () => {
    switch (method) {
      case 'sms':
        return {
          icon: <Smartphone className="w-12 h-12 text-primary-500" />,
          title: 'SMS Verification',
          description: 'Enter the 6-digit code sent to your phone',
        };
      case 'email':
        return {
          icon: <Shield className="w-12 h-12 text-primary-500" />,
          title: 'Email Verification',
          description: 'Enter the 6-digit code sent to your email',
        };
      default:
        return {
          icon: <Shield className="w-12 h-12 text-primary-500" />,
          title: 'Two-Factor Authentication',
          description: 'Enter the 6-digit code from your authenticator app',
        };
    }
  };

  const methodInfo = getMethodInfo();

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          {methodInfo.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {methodInfo.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {methodInfo.description}
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Code Input */}
        <div className="flex justify-center gap-2 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-12 h-14 text-center text-xl font-semibold
                bg-white dark:bg-gray-800 
                border-2 rounded-lg
                transition-all duration-200
                ${error 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || code.some(d => !d)}
          className="w-full flex items-center justify-center px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
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

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{' '}
            {resendTimer > 0 ? (
              <span className="text-gray-500">
                Resend in {resendTimer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Resend code
              </button>
            )}
          </p>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full mt-4 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Tip:</strong> You can paste the code directly from your authenticator app or SMS.
        </p>
      </div>
    </div>
  );
};

export default TwoFactorAuth;