import React from "react";
import { render, screen } from "@testing-library/react";
import { jest } from "@jest/globals";
import ToolbarErrorBoundary, { useErrorHandler } from "../ErrorBoundary";

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Test component that throws an error
const ErrorComponent = () => {
  throw new Error("Test error");
};

// Test component that uses useErrorHandler
const TestComponent = () => {
  const { handleError } = useErrorHandler();

  const triggerError = () => {
    try {
      throw new Error("Handled error");
    } catch (error) {
      handleError(error as Error);
    }
  };

  return (
    <div>
      <button onClick={triggerError}>Trigger Error</button>
      <span>Test Component</span>
    </div>
  );
};

describe("ToolbarErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ToolbarErrorBoundary>
        <div>Test Content</div>
      </ToolbarErrorBoundary>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders error fallback when error occurs", () => {
    render(
      <ToolbarErrorBoundary>
        <ErrorComponent />
      </ToolbarErrorBoundary>
    );

    expect(screen.getByText("Something went wrong with the toolbar.")).toBeInTheDocument();
    expect(screen.getByText("Please refresh the page or try again.")).toBeInTheDocument();
  });

  it("shows error details in development", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    render(
      <ToolbarErrorBoundary>
        <ErrorComponent />
      </ToolbarErrorBoundary>
    );

    expect(screen.getByText("Error: Test error")).toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it("does not show error details in production", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    render(
      <ToolbarErrorBoundary>
        <ErrorComponent />
      </ToolbarErrorBoundary>
    );

    expect(screen.queryByText("Error: Test error")).not.toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });
});

describe("useErrorHandler", () => {
  it("provides handleError function", () => {
    render(
      <ToolbarErrorBoundary>
        <TestComponent />
      </ToolbarErrorBoundary>
    );

    expect(screen.getByText("Test Component")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /trigger error/i })).toBeInTheDocument();
  });

  it("handles errors gracefully when used outside boundary", () => {
    // This should not crash the test
    expect(() => {
      render(<TestComponent />);
    }).not.toThrow();
  });
});
