import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isUpdateAvailable: boolean;
  isPWACapable: boolean;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    isStandalone: false,
    isIOS: false,
    isAndroid: false,
    isUpdateAvailable: false,
    isPWACapable: false,
  });

  // Detect platform
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    const isPWACapable = 'serviceWorker' in navigator;

    setStatus((prev) => ({
      ...prev,
      isIOS,
      isAndroid,
      isStandalone,
      isPWACapable,
      isInstalled: isStandalone,
    }));
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setStatus((prev) => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setStatus((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check for updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setStatus((prev) => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkForUpdates();
  }, []);

  // Install PWA
  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setStatus((prev) => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
        }));
        setInstallPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [installPrompt]);

  // Update PWA
  const update = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      // Skip waiting and activate new service worker
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating PWA:', error);
    }
  }, []);

  // Get install instructions based on platform
  const getInstallInstructions = useCallback((): string => {
    if (status.isIOS) {
      return 'Tap the share button and then "Add to Home Screen"';
    }
    if (status.isAndroid) {
      return 'Tap the menu button and then "Install App"';
    }
    return 'Click the install button in your browser\'s address bar';
  }, [status.isIOS, status.isAndroid]);

  return {
    status,
    install,
    update,
    getInstallInstructions,
    canInstall: status.isInstallable && !status.isInstalled,
  };
}

// Hook for PWA features
export function usePWAFeatures() {
  const [features, setFeatures] = useState({
    share: false,
    contacts: false,
    bluetooth: false,
    camera: false,
    microphone: false,
    geolocation: false,
    notifications: false,
    badge: false,
    backgroundSync: false,
    periodicBackgroundSync: false,
    backgroundFetch: false,
    paymentRequest: false,
    idle: false,
    fileSystem: false,
    clipboard: false,
    wakeLock: false,
  });

  useEffect(() => {
    setFeatures({
      share: 'share' in navigator,
      contacts: 'contacts' in navigator,
      bluetooth: 'bluetooth' in navigator,
      camera: 'mediaDevices' in navigator,
      microphone: 'mediaDevices' in navigator,
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      badge: 'setAppBadge' in navigator,
      backgroundSync: 'sync' in ServiceWorkerRegistration.prototype,
      periodicBackgroundSync: 'periodicSync' in ServiceWorkerRegistration.prototype,
      backgroundFetch: 'BackgroundFetchManager' in window,
      paymentRequest: 'PaymentRequest' in window,
      idle: 'IdleDetector' in window,
      fileSystem: 'showOpenFilePicker' in window,
      clipboard: 'clipboard' in navigator,
      wakeLock: 'wakeLock' in navigator,
    });
  }, []);

  return features;
}

// Hook for app badge
export function useAppBadge() {
  const [count, setCount] = useState(0);
  const [isSupported] = useState('setAppBadge' in navigator);

  // Set badge
  const setBadge = useCallback(
    async (newCount: number) => {
      if (!isSupported) return;

      try {
        if (newCount > 0) {
          await (navigator as any).setAppBadge(newCount);
          setCount(newCount);
        } else {
          await (navigator as any).clearAppBadge();
          setCount(0);
        }
      } catch (error) {
        console.error('Error setting app badge:', error);
      }
    },
    [isSupported]
  );

  // Clear badge
  const clearBadge = useCallback(async () => {
    if (!isSupported) return;

    try {
      await (navigator as any).clearAppBadge();
      setCount(0);
    } catch (error) {
      console.error('Error clearing app badge:', error);
    }
  }, [isSupported]);

  return {
    count,
    setBadge,
    clearBadge,
    isSupported,
  };
}

// Hook for web share
export function useWebShare() {
  const [isSupported] = useState('share' in navigator);

  const share = useCallback(
    async (data: {
      title?: string;
      text?: string;
      url?: string;
      files?: File[];
    }): Promise<boolean> => {
      if (!isSupported) {
        console.warn('Web Share API not supported');
        return false;
      }

      try {
        // Check if can share files
        if (data.files && !navigator.canShare?.({ files: data.files })) {
          console.warn('Cannot share files');
          delete data.files;
        }

        await navigator.share(data);
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        return false;
      }
    },
    [isSupported]
  );

  return {
    share,
    isSupported,
  };
}

// Hook for wake lock
export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [isSupported] = useState('wakeLock' in navigator);
  const [isActive, setIsActive] = useState(false);

  const request = useCallback(async () => {
    if (!isSupported) {
      console.warn('Wake Lock API not supported');
      return;
    }

    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      setWakeLock(lock);
      setIsActive(true);

      lock.addEventListener('release', () => {
        setIsActive(false);
        setWakeLock(null);
      });
    } catch (error) {
      console.error('Error requesting wake lock:', error);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsActive(false);
      } catch (error) {
        console.error('Error releasing wake lock:', error);
      }
    }
  }, [wakeLock]);

  // Re-acquire wake lock on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wakeLock) {
        request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock, request]);

  return {
    request,
    release,
    isActive,
    isSupported,
  };
}