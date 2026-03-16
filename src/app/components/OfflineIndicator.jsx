import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { isOnline, setupOfflineDetection } from '../utils/pwa';

export function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cleanup = setupOfflineDetection(
      () => {
        setOnline(true);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
      },
      () => {
        setOnline(false);
        setShowBanner(true);
      }
    );

    return cleanup;
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${
      online ? 'bg-green-600' : 'bg-red-600'
    } text-white py-2 px-4 text-center text-sm font-medium shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-center gap-2">
        {online ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>You're back online!</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>No internet connection. Some features may be limited.</span>
          </>
        )}
      </div>
    </div>
  );
}
