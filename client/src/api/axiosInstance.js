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

// Rutas donde un 401 es una respuesta ESPERADA (login fallido, registro, etc.)
// y NO debe disparar el refresh-token ni redirigir al Home.
const PUBLIC_AUTH_ENDPOINTS = [
  "/patient-login",
  "/patient-register",
  "/login",
  "/register"
];

function isPublicAuthEndpoint(url = "") {
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

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
    const status = error.response?.status;

    // Si es 401 en login/register, dejamos pasar el error tal cual,
    // sin refresh, sin redirect. El componente lo maneja normal.
    if (status === 401 && isPublicAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // --- Lógica normal de refresh token para el resto de rutas ---
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return backendAPI(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await backendAPI.post('/refresh-token');
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        backendAPI.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        
        processQueue(null, token);
        return backendAPI(originalRequest);
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
    } else if (status === 401) {
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
