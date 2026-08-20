import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Guard against customElements define duplication
if (typeof window !== 'undefined' && !window.customElements.get('model-viewer')) {
  import('@google/model-viewer').catch((err) => {
    console.warn("Dynamic model-viewer import fallback:", err);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
