import axios from "axios";

// Base URL sin /api al final
// En local: http://localhost:3940
// En producción: https://lupulos.app
const DEFAULT_BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:3940" : "https://lupulos.app";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL;

// Remover /api si está al final para evitar duplicación
const cleanBaseUrl = BASE_URL.replace(/\/api\/?$/, "");

// Crear instancia de axios con baseURL que incluye /api
export const api = axios.create({
  baseURL: `${cleanBaseUrl}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    // Solo funciona en cliente (navegador)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo funciona en cliente
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

// Exportar también la URL base limpia para casos especiales (como Google OAuth)
export const API_BASE_URL = cleanBaseUrl;
export const API_URL = `${cleanBaseUrl}/api`;

export default api;
