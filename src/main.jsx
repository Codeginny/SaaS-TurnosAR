import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import UserProvider from './context/UserContext.jsx';
import NotificationProvider from './context/NotificationContext.jsx';
import TurnosProvider from './context/TurnosContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <NotificationProvider>
          <TurnosProvider>
            <App />
          </TurnosProvider>
        </NotificationProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

