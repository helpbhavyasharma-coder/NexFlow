import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Loading NexFlow...</div>}>
        <App />
        <Toaster position="top-right" />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
);
