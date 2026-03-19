import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (!dismissed) {
      setShowPrompt(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="rounded-xl border bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Install V &amp; G Leche Flan</h3>
            <p className="text-sm text-gray-600">
              Install this app for quick access and offline use.
            </p>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={handleDismiss}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
