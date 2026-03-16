// PWA Utilities for V & G LecheFlan

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Register Service Worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
}

// Check if app is running as PWA
export function isPWA(): boolean {
  const nav = window.navigator as unknown as { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Install PWA Prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('💾 Install prompt ready');

    // Dispatch custom event that components can listen to
    window.dispatchEvent(new Event('pwa-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    deferredPrompt = null;
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);
  
  deferredPrompt = null;
  return outcome === 'accepted';
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Show local notification
export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        const notificationOptions = {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          ...options,
        } as NotificationOptions & { vibrate?: number[] };

        registration.showNotification(title, notificationOptions);
      });
    } else {
      new Notification(title, options);
    }
  }
}

// Check for platform
export function getPlatform(): 'ios' | 'android' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else {
    return 'desktop';
  }
}

// iOS specific install instructions
export function isIOSWithoutPWA(): boolean {
  const platform = getPlatform();
  return platform === 'ios' && !isPWA();
}

// Check if offline
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen to online/offline events
export function setupOfflineDetection(
  onOnline: () => void,
  onOffline: () => void
) {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// Get install instructions based on platform
export function getInstallInstructions(): string {
  const platform = getPlatform();
  
  switch (platform) {
    case 'ios':
      return 'Tap the Share button in Safari, then tap "Add to Home Screen"';
    case 'android':
      return 'Tap the menu button and select "Install App" or "Add to Home Screen"';
    case 'desktop':
      return 'Click the install button in the address bar or use the menu';
    default:
      return 'Use your browser\'s menu to install this app';
  }
}
