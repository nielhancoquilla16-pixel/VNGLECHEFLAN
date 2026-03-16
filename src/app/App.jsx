import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { registerServiceWorker, initInstallPrompt } from './utils/pwa';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
// relative path to the shared supabase helper – avoids alias issues
import { supabase } from '../../supabase/supabase';

function App() {
  const [instruments, setInstruments] = useState([]); // always an array

  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    initInstallPrompt();
    getInstruments().catch(err => console.error('getInstruments failed', err));
  }, []);

  async function getInstruments() {
    const { data, error } = await supabase.from('instruments').select();
    if (error) {
      console.error('supabase error fetching instruments', error);
      setInstruments([]);
      return;
    }
    setInstruments(data || []);
  }

  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <ul>
          {Array.isArray(instruments)
            ? instruments.map((instrument) => (
                <li key={instrument.name}>{instrument.name}</li>
              ))
            : null}
        </ul>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
