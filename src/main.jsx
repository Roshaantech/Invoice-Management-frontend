import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // 👈 AuthProvider Import Karo
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* 👈 App ko is se wrap kar do */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);