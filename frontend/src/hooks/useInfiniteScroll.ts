import { useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void | Promise<void>;
  direction?: 'up' | 'down';
}

export function useInfiniteScroll({
  threshold = 0.1,
  rootMargin = '100px',
  hasMore,
  isLoading,
  onLoadMore,
  direction = 'down',
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<(() => void) | null>(null);
  
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
  });

  // Store the latest onLoadMore function
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Trigger load more when in view
  useEffect(() => {
    if (inView && hasMore && !isLoading && loadMoreRef.current) {
      loadMoreRef.current();
    }
  }, [inView, hasMore, isLoading]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (direction === 'down') {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [direction]);

  const scrollToTop = useCallback((smooth = true) => {
    if (direction === 'up') {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [direction]);

  return {
    ref,
    inView,
    scrollToBottom,
    scrollToTop,
  };
}