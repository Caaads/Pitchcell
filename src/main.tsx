import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully intercept and suppress benign development-only WebSocket / HMR failure errors
if (typeof window !== 'undefined') {
  const isWebsocketOrHmrError = (err: any): boolean => {
    if (!err) return false;
    const msg = String(err.message || err.reason || err).toLowerCase();
    return (
      msg.includes('websocket') || 
      msg.includes('vite') || 
      msg.includes('hmr') ||
      msg.includes('socket closed')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isWebsocketOrHmrError(event.reason)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    if (isWebsocketOrHmrError(event.error || event.message)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
