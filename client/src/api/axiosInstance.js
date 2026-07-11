// src/api/axiosInstance.js
import axios from "axios";

// Configuración para desarrollo
const isDevelopment = import.meta.env.DEV;

// URL base del backend
const BACKEND_URL = import.meta.env.VITE_API_URL || (isDevelopment ? "/api" : "http://localhost:3001/api");

// Instancia para el servidor backend (autenticación y seguridad)
export const backendAPI = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para cold start de Render (plan gratuito)
});

// Interceptor para agregar JWT token automáticamente
backendAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

backendAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Solo intentar refresh si:
    // 1. Es un error 401
    // 2. No es el endpoint de refresh-token
    // 3. La solicitud original tenía un token (es decir, era una solicitud autenticada)
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/refresh-token') &&
        originalRequest.headers?.Authorization) {
      if (isRefreshing) {
        // Si ya estamos refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return backendAPI(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar renovar el token usando el refresh token de la cookie
        const response = await backendAPI.post('/refresh-token');
        
        if (response.data.token) {
          const newToken = response.data.token;
          localStorage.setItem('token', newToken);
          
          // Actualizar el header de la solicitud original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Procesar la cola de solicitudes pendientes
          processQueue(null, newToken);
          
          // Reintentar la solicitud original
          return backendAPI(originalRequest);
        }
      } catch (refreshError) {
        // Error al renovar el token - limpiar estado
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirigir al home o login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (error.response?.status === 401 && !originalRequest.url?.includes('/login')) {
      // Es un 401 pero no podemos/debemos reintentar. Limpiar y redirigir.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; 
    }

    return Promise.reject(error);
  }
);

// Exportar backendAPI por defecto para asegurar que todos los imports
// usen la instancia con interceptores de seguridad
export default backendAPI;
