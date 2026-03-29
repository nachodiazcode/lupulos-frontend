import axios, { type AxiosError } from "axios";
import { clearAuthSession, getStoredToken } from "./auth-storage";
import { ApiError, getDefaultStatusMessage } from "./errors";

/* ═══════════════════════════════════
   Base URL
   ═══════════════════════════════════ */

const DEFAULT_API_ORIGIN =
  process.env.NODE_ENV === "development" ? "http://localhost:3940" : "https://lupulos.app";

const rawPublicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
const usesRelativeProxy = rawPublicApiUrl === "/api";
const normalizedPublicApiUrl = rawPublicApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
const cleanBaseUrl = usesRelativeProxy
  ? ""
  : normalizedPublicApiUrl || DEFAULT_API_ORIGIN;
const requestBaseUrl = usesRelativeProxy ? "/api" : `${cleanBaseUrl}/api`;

/* ═══════════════════════════════════
   Instancia de Axios
   ═══════════════════════════════════ */

export const api = axios.create({
  baseURL: requestBaseUrl,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ═══════════════════════════════════
   Request interceptor — inyectar token
   ═══════════════════════════════════ */

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ═══════════════════════════════════
   Response interceptor — error handling centralizado
   ═══════════════════════════════════ */

/**
 * Extrae el mensaje de error más específico que devuelva el backend.
 * Soporta variantes comunes: `{ message }`, `{ error }`, `{ errors[] }`.
 */
function extractServerMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const payload = data as Record<string, unknown>;

  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;
  if (Array.isArray(payload.errors) && typeof payload.errors[0]?.message === "string") {
    return payload.errors[0].message;
  }

  return undefined;
}

api.interceptors.response.use(
  // Respuestas exitosas (2xx) pasan sin modificar
  (response) => response,

  // Cualquier otro status se transforma en un `ApiError`
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const serverMessage = extractServerMessage(error.response?.data);
    const code =
      typeof (error.response?.data as Record<string, unknown>)?.code === "string"
        ? ((error.response?.data as Record<string, unknown>).code as string)
        : undefined;

    const message = serverMessage || getDefaultStatusMessage(status);

    // Logging centralizado — solo en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${status}: ${message}`,
      );
    }

    // 401 — sesión expirada: limpiar storage y redirigir
    if (status === 401 && typeof window !== "undefined") {
      clearAuthSession();
      window.location.href = "/auth/login";
    }

    return Promise.reject(new ApiError(message, status, code));
  },
);

/* ═══════════════════════════════════
   Exports
   ═══════════════════════════════════ */

export const API_BASE_URL = cleanBaseUrl;
export const API_URL = requestBaseUrl;

export default api;
