import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface ErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const ErrorPage = ({ error, resetErrorBoundary }: ErrorPageProps) => {
  const errorMessage = error?.message || 'Something went wrong';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're sorry for the inconvenience. An unexpected error has occurred.
        </p>

        {/* Error Details (Development only) */}
        {isDevelopment && error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
              Error Details:
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 font-mono break-all">
              {errorMessage}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                  Stack trace
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            If this problem persists, please try:
          </p>
          <ul className="mt-2 text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>• Clearing your browser cache</li>
            <li>• Checking your internet connection</li>
            <li>• Contacting our support team</li>
          </ul>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          Need help? {' '}
          <Link to="/support" className="text-primary-500 hover:text-primary-600 underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;