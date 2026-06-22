// Constantes centralizadas para la aplicación
// Importar desde aquí en lugar de definir API_URL en cada archivo

import { API_URL, API_BASE_URL } from "./api";

// Re-exportar para compatibilidad con código existente
export { API_URL, API_BASE_URL };

// URL completa para Google OAuth (sin duplicar /api)
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/api/auth/google`;

const uploadPathPattern = /(?:^|\/)(?:api\/)?(?:public\/)?(uploads\/.+)$/i;

const splitPathSuffix = (value: string): { pathname: string; suffix: string } => {
  const markerIndex = value.search(/[?#]/);
  if (markerIndex === -1) {
    return { pathname: value, suffix: "" };
  }

  return {
    pathname: value.slice(0, markerIndex),
    suffix: value.slice(markerIndex),
  };
};

const normalizeUploadPath = (value: string): string | null => {
  if (!value) return null;

  const normalizedValue = value.trim().replace(/\\/g, "/").replace(/^\.\//, "");
  const { pathname, suffix } = splitPathSuffix(normalizedValue);
  const match = pathname.match(uploadPathPattern);

  if (!match) return null;

  return `/${match[1].replace(/^\/+/, "")}${suffix}`;
};

const buildApiAssetUrl = (path: string): string => (API_BASE_URL ? `${API_BASE_URL}${path}` : path);

// URL para imágenes y media. Si viene una ruta legacy con host/puerto viejo,
// la reescribimos al backend actual usando solo el pathname de /uploads.
export const getImageUrl = (path: string): string => {
  if (!path) return "";

  const normalizedPath = path.trim().replace(/\\/g, "/");

  if (normalizedPath.startsWith("blob:") || normalizedPath.startsWith("data:")) {
    return normalizedPath;
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    try {
      const parsed = new URL(normalizedPath);
      const canonicalUploadPath = normalizeUploadPath(
        `${parsed.pathname}${parsed.search}${parsed.hash}`,
      );

      if (canonicalUploadPath) {
        return buildApiAssetUrl(canonicalUploadPath);
      }

      return normalizedPath;
    } catch {
      return normalizedPath;
    }
  }

  const canonicalUploadPath = normalizeUploadPath(normalizedPath);
  if (canonicalUploadPath) {
    return buildApiAssetUrl(canonicalUploadPath);
  }

  if (normalizedPath.startsWith("/")) {
    return buildApiAssetUrl(normalizedPath);
  }

  return buildApiAssetUrl(`/${normalizedPath.replace(/^\/+/, "")}`);
};

/* ═══════════════════════════════════════════════════════════
   Media upload limits — shorts-first
   ═══════════════════════════════════════════════════════════
   Single source of truth for video duration caps. The same values
   must be enforced server-side in lupulos-api/MediaUploadModule
   to reject oversize files before they touch disk.

   Why 60s: shorts format favors high engagement, low storage cost
   (~15 MB per clip at 720p), and easy moderation. Long-form vlogs
   can be added later behind a creator-verification gate. */

export const MAX_SHORT_DURATION_SECONDS = 60;           // 60s — Cervezagramas
export const MAX_SHORT_FILE_SIZE_MB = 25;               // ~15 MB real, 25 buffer for high-bitrate
export const ACCEPTED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

/** Formats seconds → "M:SS" (e.g. 60 → "1:00", 45 → "0:45"). Used in upload UI hints. */
export const formatDuration = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};
