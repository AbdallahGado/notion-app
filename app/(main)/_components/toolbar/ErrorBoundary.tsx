import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary class component for toolbar error handling
 */
class ToolbarErrorBoundary extends Component<Props, State> {
  /**
   * Initialize component state
   */
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Update state when an error is caught
   * This is called during the render phase, so it should be static and pure
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Handle caught errors and call optional error callback
   * This is called during the commit phase, so side effects are allowed
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Toolbar Error Boundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reset error state to retry rendering the toolbar
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Toolbar Error
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 text-center mb-4">
            Something went wrong with the toolbar. This might be due to a temporary issue.
          </p>
          {this.state.error && (
            <details className="mb-4 text-xs text-red-500 dark:text-red-400">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded text-xs overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <Button
            onClick={this.handleRetry}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Custom hook for error handling in functional components
 *
 * Provides a consistent way to handle errors within the toolbar component tree.
 * Can be used in functional components that need to handle errors gracefully.
 *
 * @returns An object with an error handler function
 *
 * @example
 * ```tsx
 * const MyToolbarComponent = () => {
 *   const { handleError } = useErrorHandler();
 *
 *   const riskyOperation = () => {
 *     try {
 *       // Some risky toolbar operation
 *     } catch (error) {
 *       handleError(error as Error);
 *     }
 *   };
 *
 *   return <button onClick={riskyOperation}>Click me</button>;
 * };
 * ```
 */
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error("Toolbar error:", error, errorInfo);
    // Here you could send error to monitoring service
  };

  return { handleError };
};

export default ToolbarErrorBoundary;
