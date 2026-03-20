/**
 * Capa centralizada de errores de la aplicación.
 *
 * Principios:
 * 1. Cada error de red se transforma en un `ApiError` tipado.
 * 2. Ningún componente debería hacer `console.error` directamente;
 *    el interceptor de Axios se encarga del logging en desarrollo.
 * 3. `getErrorMessage` extrae un texto amigable para mostrar al usuario.
 */

/* ═══════════════════════════════════
   Error class
   ═══════════════════════════════════ */

export class ApiError extends Error {
  /** Código HTTP (ej. 400, 404, 500) — `0` si no hubo respuesta del servidor */
  readonly status: number;

  /** Código interno del backend, si lo envía (ej. "INVALID_TOKEN") */
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/* ═══════════════════════════════════
   Mensajes por defecto según status
   ═══════════════════════════════════ */

const STATUS_MESSAGES: Record<number, string> = {
  400: "Solicitud inválida. Revisa los datos enviados.",
  401: "Tu sesión ha expirado. Inicia sesión nuevamente.",
  403: "No tienes permisos para realizar esta acción.",
  404: "El recurso solicitado no fue encontrado.",
  409: "Hubo un conflicto con la operación solicitada.",
  422: "Los datos enviados no son válidos.",
  429: "Demasiadas solicitudes. Espera un momento e intenta de nuevo.",
  500: "Error interno del servidor. Intenta más tarde.",
  502: "El servidor no está disponible en este momento.",
  503: "El servicio está temporalmente fuera de línea.",
};

/* ═══════════════════════════════════
   Utilidades públicas
   ═══════════════════════════════════ */

/**
 * Extrae un mensaje de error legible para el usuario a partir de un
 * error desconocido (`unknown`).  Funciona con `ApiError`, `Error`
 * genérico, strings, y objetos arbitrarios.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Errores de red de Axios que no tuvieron respuesta
    if (error.message === "Network Error") {
      return "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    }
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

/**
 * Dado un status HTTP, devuelve un mensaje por defecto amigable para el
 * usuario. Si no hay mapeo conocido devuelve un genérico.
 */
export function getDefaultStatusMessage(status: number): string {
  return STATUS_MESSAGES[status] ?? `Error del servidor (código ${status}).`;
}
