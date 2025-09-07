/**
 * Performance optimization utilities
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Custom hook for debouncing values to prevent excessive re-renders
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const lastCall = useRef<number>(0);
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callbackRef.current(...args);
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }

        lastCallTimer.current = setTimeout(
          () => {
            lastCall.current = Date.now();
            callbackRef.current(...args);
          },
          delay - (now - lastCall.current)
        );
      }
    }) as T,
    [delay]
  );
}

/**
 * Custom hook for memoizing expensive computations
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<T>(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback, ...deps]);

  return useCallback(((...args: Parameters<T>) => ref.current(...args)) as T, []);
}

/**
 * Utility to batch multiple state updates
 */
export function useBatchedUpdates() {
  const updates = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((update: () => void) => {
    updates.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updates.current.forEach(update => update());
      updates.current = [];
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
}

/**
 * Performance monitoring utility
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();

    console.log(`[Performance] ${componentName} rendered ${renderCount.current} times`);

    return () => {
      const endTime = performance.now();
      console.log(`[Performance] ${componentName} render took ${endTime - startTime.current}ms`);
    };
  });

  return {
    renderCount: renderCount.current,
    measureRender: (fn: () => void) => {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`[Performance] ${componentName} operation took ${end - start}ms`);
    },
  };
}

/**
 * Memory usage monitoring
 */
export function useMemoryMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log('[Memory] Used:', Math.round(memory.usedJSHeapSize / 1024 / 1024), 'MB');
      console.log('[Memory] Total:', Math.round(memory.totalJSHeapSize / 1024 / 1024), 'MB');
      console.log('[Memory] Limit:', Math.round(memory.jsHeapSizeLimit / 1024 / 1024), 'MB');
    }
  });
}

/**
 * Bundle size optimization utilities
 */
export const BundleOptimization = {
  // Lazy load components with error boundaries
  lazyLoad: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    const LazyComponent = React.lazy(importFn);

    return (props: React.ComponentProps<T>) => {
      const FallbackComponent = fallback || (() => React.createElement('div', null, 'Loading...'));

      return React.createElement(
        React.Suspense,
        { fallback: React.createElement(FallbackComponent) },
        React.createElement(LazyComponent, props)
      );
    };
  },

  // Preload critical components
  preload: (importFn: () => Promise<any>) => {
    if (typeof window !== 'undefined') {
      importFn();
    }
  },

  // Dynamic imports with retry
  dynamicImport: async (importFn: () => Promise<any>, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  },
};
