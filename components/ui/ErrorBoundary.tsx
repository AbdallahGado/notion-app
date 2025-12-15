"use client";

import React, { Component, ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "./button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
    toast.error("Something went wrong. Please try again.");
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle
            className="w-16 h-16 text-red-500 mb-4"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            We encountered an unexpected error. This might be a temporary issue.
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={this.handleRetry}
              variant="default"
              aria-label="Try again to recover from error"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              aria-label="Refresh the page"
            >
              Refresh Page
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-6 text-left max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
