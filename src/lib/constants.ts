// Constantes centralizadas para la aplicación
// Importar desde aquí en lugar de definir API_URL en cada archivo

import { API_URL, API_BASE_URL } from "./api";

// Re-exportar para compatibilidad con código existente
export { API_URL, API_BASE_URL };

// URL completa para Google OAuth (sin duplicar /api)
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/api/auth/google`;

// URL para imágenes (si necesitas construir URLs de imágenes)
export const getImageUrl = (path: string): string => {
  if (!path) return "";
  // Si ya es una URL completa, retornarla
  if (path.startsWith("http")) return path;
  // Si empieza con /, usar API_BASE_URL
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  // Si no, asumir que es relativo a /api
  return `${API_URL}/${path}`;
};
