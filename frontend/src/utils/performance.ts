// Performance monitoring types
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
  }
  
  export interface PerformanceReport {
    metrics: PerformanceMetric[];
    timestamp: number;
    userAgent: string;
    url: string;
  }
  
  // Performance observer wrapper
  export class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric[]> = new Map();
    private observers: PerformanceObserver[] = [];
  
    constructor() {
      this.initializeObservers();
    }
  
    private initializeObservers() {
      // Observe navigation timing
      if ('PerformanceObserver' in window) {
        try {
          // Paint timing
          const paintObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              this.recordMetric('paint', {
                name: entry.name,
                value: entry.startTime,
                unit: 'ms',
                timestamp: Date.now()
              });
            }
          });
          paintObserver.observe({ entryTypes: ['paint'] });
          this.observers.push(paintObserver);
  
          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.recordMetric('lcp', {
              name: 'largest-contentful-paint',
              value: lastEntry.startTime,
              unit: 'ms',
              timestamp: Date.now()
            });
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          this.observers.push(lcpObserver);
  
          // Layout shifts
          const clsObserver = new PerformanceObserver((list) => {
            let clsScore = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsScore += (entry as any).value;
              }
            }
            this.recordMetric('cls', {
              name: 'cumulative-layout-shift',
              value: clsScore,
              unit: 'score',
              timestamp: Date.now()
            });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          this.observers.push(clsObserver);
        } catch (error) {
          console.error('Failed to initialize performance observers:', error);
        }
      }
    }
  
    recordMetric(category: string, metric: PerformanceMetric) {
      if (!this.metrics.has(category)) {
        this.metrics.set(category, []);
      }
      this.metrics.get(category)!.push(metric);
    }
  
    getMetrics(category?: string): PerformanceMetric[] {
      if (category) {
        return this.metrics.get(category) || [];
      }
      
      const allMetrics: PerformanceMetric[] = [];
      for (const metrics of this.metrics.values()) {
        allMetrics.push(...metrics);
      }
      return allMetrics;
    }
  
    generateReport(): PerformanceReport {
      return {
        metrics: this.getMetrics(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
    }
  
    cleanup() {
      for (const observer of this.observers) {
        observer.disconnect();
      }
      this.observers = [];
      this.metrics.clear();
    }
  }
  
  // Measure function execution time
  export function measureExecutionTime<T extends (...args: any[]) => any>(
    fn: T,
    name: string = fn.name
  ): T {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`);
      
      return result;
    }) as T;
  }
  
  // Async function execution time
  export function measureAsyncExecutionTime<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name: string = fn.name
  ): T {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const end = performance.now();
        
        console.log(`${name} async execution time: ${(end - start).toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        const end = performance.now();
        console.log(`${name} async execution time (failed): ${(end - start).toFixed(2)}ms`);
        throw error;
      }
    }) as T;
  }
  
  // Debounce with performance tracking
  export function debounceWithTracking<T extends (...args: any[]) => any>(
    fn: T,
    delay: number,
    name: string = fn.name
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    let callCount = 0;
    let executionCount = 0;
  
    return (...args: Parameters<T>) => {
      callCount++;
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        executionCount++;
        console.log(`${name} debounced: ${callCount} calls, ${executionCount} executions`);
        fn(...args);
        callCount = 0;
      }, delay);
    };
  }
  
  // Throttle with performance tracking
  export function throttleWithTracking<T extends (...args: any[]) => any>(
    fn: T,
    limit: number,
    name: string = fn.name
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    let callCount = 0;
    let executionCount = 0;
  
    return (...args: Parameters<T>) => {
      callCount++;
      
      if (!inThrottle) {
        executionCount++;
        console.log(`${name} throttled: ${callCount} calls, ${executionCount} executions`);
        fn(...args);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
          callCount = 0;
        }, limit);
      }
    };
  }
  
  // Memory usage tracking
  export function getMemoryUsage(): {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    percentUsed: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }
  
  // FPS counter
  export class FPSCounter {
    private lastTime = performance.now();
    private frames = 0;
    private fps = 0;
    private callback?: (fps: number) => void;
    private rafId?: number;
  
    start(callback?: (fps: number) => void) {
      this.callback = callback;
      this.measure();
    }
  
    stop() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
    }
  
    private measure = () => {
      const currentTime = performance.now();
      this.frames++;
  
      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
        this.frames = 0;
        this.lastTime = currentTime;
  
        if (this.callback) {
          this.callback(this.fps);
        }
      }
  
      this.rafId = requestAnimationFrame(this.measure);
    };
  
    getFPS(): number {
      return this.fps;
    }
  }
  
  // Web Vitals measurements
  export function measureWebVitals(): Promise<{
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};
  
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        vitals.FCP = fcp.startTime;
      }
  
      // Time to First Byte
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        vitals.TTFB = nav.responseStart - nav.fetchStart;
      }
  
      // For other metrics, we'd need observers (handled in PerformanceMonitor)
      resolve(vitals);
    });
  }
  
  // Resource timing analysis
  export function analyzeResourceLoading(): {
    totalResources: number;
    totalSize: number;
    totalDuration: number;
    resourcesByType: Map<string, number>;
    slowestResources: Array<{ name: string; duration: number }>;
  } {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const analysis = {
      totalResources: resources.length,
      totalSize: 0,
      totalDuration: 0,
      resourcesByType: new Map<string, number>(),
      slowestResources: [] as Array<{ name: string; duration: number }>
    };
  
    resources.forEach(resource => {
      const duration = resource.responseEnd - resource.fetchStart;
      analysis.totalDuration += duration;
      
      if (resource.transferSize) {
        analysis.totalSize += resource.transferSize;
      }
  
      // Count by type
      const type = resource.initiatorType;
      analysis.resourcesByType.set(
        type,
        (analysis.resourcesByType.get(type) || 0) + 1
      );
  
      // Track slowest resources
      analysis.slowestResources.push({
        name: resource.name,
        duration
      });
    });
  
    // Sort and keep top 10 slowest
    analysis.slowestResources.sort((a, b) => b.duration - a.duration);
    analysis.slowestResources = analysis.slowestResources.slice(0, 10);
  
    return analysis;
  }
  
  // Lazy loading helper
  export function lazyLoad<T>(
    loader: () => Promise<T>,
    name: string = 'Component'
  ): () => Promise<T> {
    let promise: Promise<T> | null = null;
  
    return () => {
      if (!promise) {
        const start = performance.now();
        promise = loader().then(result => {
          const end = performance.now();
          console.log(`Lazy loaded ${name} in ${(end - start).toFixed(2)}ms`);
          return result;
        });
      }
      return promise;
    };
  }
  
  // Performance budget checker
  export interface PerformanceBudget {
    FCP?: number;
    LCP?: number;
    TTI?: number;
    TBT?: number;
    CLS?: number;
    bundleSize?: number;
  }
  
  export async function checkPerformanceBudget(
    budget: PerformanceBudget
  ): Promise<{ passed: boolean; violations: string[] }> {
    const violations: string[] = [];
    const vitals = await measureWebVitals();
  
    if (budget.FCP && vitals.FCP && vitals.FCP > budget.FCP) {
      violations.push(`FCP: ${vitals.FCP.toFixed(2)}ms exceeds budget of ${budget.FCP}ms`);
    }
  
    if (budget.LCP && vitals.LCP && vitals.LCP > budget.LCP) {
      violations.push(`LCP: ${vitals.LCP.toFixed(2)}ms exceeds budget of ${budget.LCP}ms`);
    }
  
    if (budget.CLS && vitals.CLS && vitals.CLS > budget.CLS) {
      violations.push(`CLS: ${vitals.CLS.toFixed(3)} exceeds budget of ${budget.CLS}`);
    }
  
    return {
      passed: violations.length === 0,
      violations
    };
  }