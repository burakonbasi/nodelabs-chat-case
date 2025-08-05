import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

interface IntersectionResult {
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): IntersectionResult {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
    initialIsIntersecting = false,
  } = options;

  const [intersection, setIntersection] = useState<IntersectionResult>({
    isIntersecting: initialIsIntersecting,
  });

  const frozen = useRef(false);

  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    // If frozen and already visible, don't observe
    if (frozen.current && intersection.isIntersecting) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        setIntersection({
          isIntersecting,
          entry,
        });

        // Freeze observer once visible
        if (isIntersecting && freezeOnceVisible) {
          frozen.current = true;
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible, intersection.isIntersecting]);

  return intersection;
}

// Helper hook for lazy loading images
export function useLazyLoadImage(
  imageRef: RefObject<HTMLImageElement>,
  src: string,
  placeholder?: string
) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const { isIntersecting } = useIntersectionObserver(imageRef, {
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
    }
  }, [isIntersecting, src]);

  return { imageSrc, isLoaded };
}

// Helper hook for infinite scroll
export function useInfiniteScroll(
  callback: () => void,
  options?: UseIntersectionObserverOptions
) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver(triggerRef, {
    threshold: 0.1,
    rootMargin: '100px',
    ...options,
  });

  useEffect(() => {
    if (isIntersecting) {
      callback();
    }
  }, [isIntersecting, callback]);

  return triggerRef;
}