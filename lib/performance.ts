 /**
 * Performance utilities for optimizing React applications
 */

/**
 * Debounce function calls to prevent excessive executions
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function calls to limit execution rate
 * @param func Function to throttle
 * @param limit Time limit in milliseconds
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load a component with optional delay
 * @param importFunc Dynamic import function
 * @param delay Optional delay in milliseconds
 */
export function lazyLoad<T extends React.ComponentType>(
  importFunc: () => Promise<{ default: T }>,
  delay: number = 0
): React.LazyExoticComponent<T> {
  return React.lazy(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        importFunc().then(resolve);
      }, delay);
    });
  });
}

/**
 * Batch state updates to reduce re-renders
 */
export function batchUpdates(callback: () => void) {
  // React 18+ automatically batches updates
  // This is kept for backward compatibility
  callback();
}

/**
 * Create a stable reference that only changes when deep equality fails
 * Useful for dependency arrays in useEffect/useCallback
 */
export function useDeepMemo<T>(value: T): T {
  const ref = React.useRef<T>(value);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
      ref.current = value;
      forceUpdate();
    }
  }, [value]);

  return ref.current;
}

/**
 * Hook to track component render count (useful for debugging)
 */
export function useRenderCount(componentName: string = 'Component'): number {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });

  return renderCount.current;
}

/**
 * Hook to detect slow renders
 */
export function useSlowRenderDetection(threshold: number = 16): void {
  const startTime = React.useRef(Date.now());

  React.useEffect(() => {
    const renderTime = Date.now() - startTime.current;
    if (renderTime > threshold && process.env.NODE_ENV === 'development') {
      console.warn(`Slow render detected: ${renderTime}ms`);
    }
    startTime.current = Date.now();
  });
}

// React import for hooks
import React from 'react';
