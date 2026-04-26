"use client";

export type PostMediaType = "image" | "video";

export interface PostMedia {
  path: string;
  type?: PostMediaType;
  durationSeconds?: number | null;
}

interface PostMediaSource {
  media?: PostMedia[];
  multimedia?: PostMedia[];
  images?: string[];
  imagenes?: string[];
}

const videoPattern = /\.(mp4|mov|webm|m4v|ogg|ogv|avi|mkv)(\?.*)?$/i;

export const MAX_VIDEO_DURATION_SECONDS = 12 * 60;

export function inferMediaType(value?: string | null, explicitType?: string | null): PostMediaType {
  if (explicitType === "video" || explicitType === "image") return explicitType;
  return videoPattern.test(value || "") ? "video" : "image";
}

export function isVideoMedia(value?: string | null, explicitType?: string | null): boolean {
  return inferMediaType(value, explicitType) === "video";
}

export function getPostMediaList(post?: PostMediaSource | null): PostMedia[] {
  if (!post) return [];

  const rawMedia = [
    ...(Array.isArray(post.media) ? post.media : []),
    ...(Array.isArray(post.multimedia) ? post.multimedia : []),
  ];
  const rawPaths = [
    ...(Array.isArray(post.images) ? post.images : []),
    ...(Array.isArray(post.imagenes) ? post.imagenes : []),
  ];

  const result: PostMedia[] = [];
  const seen = new Set<string>();

  for (const item of rawMedia) {
    if (!item?.path || seen.has(item.path)) continue;
    seen.add(item.path);
    result.push({
      path: item.path,
      type: inferMediaType(item.path, item.type),
      durationSeconds: typeof item.durationSeconds === "number" ? item.durationSeconds : null,
    });
  }

  for (const path of rawPaths) {
    if (!path || seen.has(path)) continue;
    seen.add(path);
    result.push({
      path,
      type: inferMediaType(path),
      durationSeconds: null,
    });
  }

  return result;
}

export function getPrimaryPostMedia(post?: PostMediaSource | null): PostMedia | null {
  return getPostMediaList(post)[0] ?? null;
}

export function extractUploadedMedia(payload: unknown): PostMedia | null {
  if (!payload || typeof payload !== "object") return null;

  const source = payload as Record<string, unknown>;
  const nested =
    source.data && typeof source.data === "object"
      ? (source.data as Record<string, unknown>)
      : source;

  const path =
    typeof source.path === "string"
      ? source.path
      : typeof nested.path === "string"
        ? nested.path
        : "";

  if (!path) return null;

  const explicitType =
    typeof source.mediaType === "string"
      ? source.mediaType
      : typeof nested.type === "string"
        ? nested.type
        : null;

  const durationRaw =
    typeof source.durationSeconds === "number"
      ? source.durationSeconds
      : typeof nested.durationSeconds === "number"
        ? nested.durationSeconds
        : null;

  return {
    path,
    type: inferMediaType(path, explicitType),
    durationSeconds: durationRaw,
  };
}

export function extractUploadedMediaList(payload: unknown): PostMedia[] {
  if (!payload || typeof payload !== "object") return [];
  const source = payload as Record<string, unknown>;

  // Batch upload response: top-level `media` array
  if (Array.isArray(source.media) && source.media.length > 0) {
    const results = (source.media as unknown[])
      .map((item) => extractUploadedMedia(item))
      .filter((m): m is PostMedia => m !== null);
    if (results.length > 0) return results;
  }

  // Batch upload response: `data` array
  if (Array.isArray(source.data) && source.data.length > 0) {
    const results = (source.data as unknown[])
      .map((item) => extractUploadedMedia(item))
      .filter((m): m is PostMedia => m !== null);
    if (results.length > 0) return results;
  }

  const single = extractUploadedMedia(payload);
  return single ? [single] : [];
}

export function readVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("No pudimos leer la duración del video."));
        return;
      }

      resolve(Math.round(duration));
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("No pudimos leer la duración del video."));
    };

    video.src = objectUrl;
  });
}
