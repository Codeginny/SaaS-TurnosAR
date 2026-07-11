// src/api/axiosInstance.js
import axios from "axios";

// URL base del backend
const BACKEND_URL = import.meta.env.VITE_API_URL || "https://api-turnosar.onrender.com";

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para cold start de Render (plan gratuito)
  withCredentials: true,
});

// Interceptor para agregar JWT token automáticamente
axiosInstance.interceptors.request.use(
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

export default axiosInstance;
