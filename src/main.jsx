import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initStorage } from './services/storageService';
import { ThemeProvider } from './context/ThemeContext';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
const app = (
  <React.StrictMode>
    <ThemeProvider>
      <AppDataProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter><App /></BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </AppDataProvider>
    </ThemeProvider>
  </React.StrictMode>
);

initStorage()
  .then(() => root.render(app))
  .catch(() => root.render(<p style={{ padding: 32, fontFamily: 'sans-serif' }}>Cannot reach the data server. Start the app with <code>npm run dev</code> (or <code>npm run build && npm run preview</code>).</p>));
