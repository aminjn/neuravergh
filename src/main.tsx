import React from 'react';
import { createRoot } from 'react-dom/client';
// Font Awesome bundled locally (no runtime CDN — works offline / behind filters)
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import './runtime-theme.css';
import App from './app/App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
