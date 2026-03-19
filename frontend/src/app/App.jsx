import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { registerServiceWorker, initInstallPrompt } from './utils/pwa';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    initInstallPrompt();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
