import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
    
    // Update state with error details
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
    
    // Log to error reporting service
    this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError) {
      // Reset on prop changes if enabled
      if (resetOnPropsChange && prevProps.children !== this.props.children) {
        this.resetErrorBoundary();
      }
      
      // Reset if resetKeys changed
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== prevProps.resetKeys![index]
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implement your error logging service here
    // Example: Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  renderErrorFallback = () => {
    const { fallback, level = 'component' } = this.props;
    const { error, errorInfo, errorCount, showDetails } = this.state;
    
    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Different layouts based on error level
    switch (level) {
      case 'page':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center">
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Button
                  onClick={this.resetErrorBoundary}
                  variant="primary"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Go Home
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8">
                  <button
                    onClick={this.toggleDetails}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show Details
                      </>
                    )}
                  </button>
                  
                  {showDetails && (
                    <div className="mt-4 text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-auto max-h-64">
                      <h3 className="font-mono text-sm font-bold text-red-600 dark:text-red-400 mb-2">
                        {error?.name}: {error?.message}
                      </h3>
                      <pre className="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {error?.stack}
                      </pre>
                      {errorInfo?.componentStack && (
                        <>
                          <h4 className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            Component Stack:
                          </h4>
                          <pre className="font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {errorCount > 2 && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  This error has occurred {errorCount} times. Consider refreshing the page.
                </p>
              )}
            </div>
          </div>
        );
        
      case 'section':
        return (
          <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Section Error
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This section couldn't be loaded due to an error.
                </p>
                <Button
                  onClick={this.resetErrorBoundary}
                  size="sm"
                  variant="outline"
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'component':
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Component error</span>
            <button
              onClick={this.resetErrorBoundary}
              className="ml-2 hover:text-red-900 dark:hover:text-red-300"
              aria-label="Retry"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        );
    }
  };

  render() {
    const { hasError } = this.state;
    const { children, isolate } = this.props;
    
    if (hasError) {
      if (isolate) {
        // In isolate mode, render both error and children
        return (
          <>
            {this.renderErrorFallback()}
            <div className="opacity-50 pointer-events-none">
              {children}
            </div>
          </>
        );
      }
      return this.renderErrorFallback();
    }
    
    return children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for triggering error boundary (for testing)
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends ErrorBoundary {
  componentDidMount() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }
  
  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }
  
  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = new Error(event.reason);
    error.name = 'UnhandledPromiseRejection';
    
    this.setState({
      hasError: true,
      error,
      errorInfo: {
        componentStack: `Unhandled Promise Rejection: ${event.reason}`,
      } as ErrorInfo,
    });
    
    event.preventDefault();
  };
}