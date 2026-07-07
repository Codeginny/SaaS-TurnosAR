import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import AppointmentProvider from './context/AppointmentContext.jsx';
import UserProvider from './context/UserContext.jsx';
import NotificationProvider from './context/NotificationContext.jsx';
import ThemeProvider from './utils/ThemeContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <NotificationProvider>
          <AppointmentProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </AppointmentProvider>
        </NotificationProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

