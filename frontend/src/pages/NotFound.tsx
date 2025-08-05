import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</h1>
          <div className="relative -mt-20">
            <img
              src="/assets/images/error-404.svg"
              alt="Page not found"
              className="w-64 h-64 mx-auto"
            />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Page not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          Need help? {' '}
          <Link to="/support" className="text-primary-500 hover:text-primary-600 underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;