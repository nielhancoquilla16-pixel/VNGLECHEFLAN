import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';
import { storage } from './app/utils/storage';

console.log('main.jsx loaded');

// Prepare demo/store data (products, users, cart, etc.)
try {
  storage.init();
} catch (e) {
  console.error('storage.init() failed', e);
}

// Mount the app
const root = document.getElementById('root');
if (root) {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error('render failed', e);
    root.innerHTML = `<pre style="color:red; padding:20px;">Application error:\n${e.message}</pre>`;
  }
} else {
  console.error('root element not found');
}

// Handle app updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('New service worker activated');
  });
}
