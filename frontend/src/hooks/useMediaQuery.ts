import { useState, useEffect, useCallback, useMemo } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

// Predefined breakpoints (Tailwind CSS defaults)
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

type Breakpoint = keyof typeof breakpoints;

// Hook for common breakpoints
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`);
}

// Hook for checking if screen is smaller than breakpoint
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(max-width: ${breakpoints[breakpoint]})`);
}

// Hook for checking if screen is between two breakpoints
export function useBreakpointBetween(min: Breakpoint, max: Breakpoint): boolean {
  return useMediaQuery(
    `(min-width: ${breakpoints[min]}) and (max-width: ${breakpoints[max]})`
  );
}

// Hook for getting current breakpoint
export function useCurrentBreakpoint(): Breakpoint | 'xs' {
  const sm = useBreakpoint('sm');
  const md = useBreakpoint('md');
  const lg = useBreakpoint('lg');
  const xl = useBreakpoint('xl');
  const xxl = useBreakpoint('2xl');

  if (xxl) return '2xl';
  if (xl) return 'xl';
  if (lg) return 'lg';
  if (md) return 'md';
  if (sm) return 'sm';
  return 'xs';
}

// Common media queries
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsLargeDesktop(): boolean {
  return useMediaQuery('(min-width: 1536px)');
}

// Orientation hooks
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

// Feature detection hooks
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

export function useIsHoverAvailable(): boolean {
  return useMediaQuery('(hover: hover)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)');
}

// Device pixel ratio
export function useIsRetina(): boolean {
  return useMediaQuery('(min-device-pixel-ratio: 2), (min-resolution: 192dpi)');
}

// Multiple queries hook
export function useMediaQueries<T extends Record<string, string>>(
  queries: T
): Record<keyof T, boolean> {
  const [results, setResults] = useState<Record<keyof T, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (typeof window !== 'undefined') {
      Object.entries(queries).forEach(([key, query]) => {
        initial[key] = window.matchMedia(query).matches;
      });
    }
    return initial as Record<keyof T, boolean>;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries: Array<{
      key: string;
      mq: MediaQueryList;
      handler: (e: MediaQueryListEvent) => void;
    }> = [];

    Object.entries(queries).forEach(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setResults((prev) => ({ ...prev, [key]: e.matches }));
      };

      if (mq.addEventListener) {
        mq.addEventListener('change', handler);
      } else {
        mq.addListener(handler);
      }

      mediaQueries.push({ key, mq, handler });
      setResults((prev) => ({ ...prev, [key]: mq.matches }));
    });

    return () => {
      mediaQueries.forEach(({ mq, handler }) => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', handler);
        } else {
          mq.removeListener(handler);
        }
      });
    };
  }, [queries]);

  return results;
}

// Responsive value hook
export function useResponsiveValue<T>(
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    '2xl'?: T;
  },
  defaultValue: T
): T {
  const breakpoint = useCurrentBreakpoint();

  return useMemo(() => {
    const breakpointOrder: Array<Breakpoint | 'xs'> = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);

    // Find the value for current or nearest smaller breakpoint
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (bp in values && values[bp as keyof typeof values] !== undefined) {
        return values[bp as keyof typeof values]!;
      }
    }

    return defaultValue;
  }, [breakpoint, values, defaultValue]);
}

// Hook for responsive columns
export function useResponsiveColumns(
  defaultColumns = 1,
  overrides?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  }
): number {
  return useResponsiveValue(
    {
      xs: defaultColumns,
      ...overrides,
    },
    defaultColumns
  );
}