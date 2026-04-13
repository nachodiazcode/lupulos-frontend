import type { StoredAuthUser } from "./auth-storage";

type UnknownRecord = Record<string, unknown>;

export interface ProfileStats {
  posts: number;
  beers: number;
  places: number;
  followers: number;
  following: number;
}

export interface NormalizedProfilePayload {
  user: StoredAuthUser | null;
  stats: ProfileStats;
}

export const DEFAULT_PROFILE_STATS: ProfileStats = {
  posts: 0,
  beers: 0,
  places: 0,
  followers: 0,
  following: 0,
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const pickFirstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const toCount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const extractApiData = <T>(payload: unknown): T | undefined => {
  if (isRecord(payload) && "data" in payload) {
    return payload.data as T;
  }

  return payload as T | undefined;
};

export const normalizeStoredAuthUser = (
  payload: unknown,
  fallbackUserId?: string,
): StoredAuthUser | null => {
  if (!isRecord(payload)) {
    if (!fallbackUserId) return null;
    return { _id: fallbackUserId, id: fallbackUserId };
  }

  const id = pickFirstString(payload._id, payload.id, fallbackUserId);
  if (!id) return null;

  const username = pickFirstString(payload.username, payload.name, payload.nombre);
  const name = pickFirstString(payload.name, payload.nombre, username);
  const email = pickFirstString(payload.email);
  const avatar = pickFirstString(
    payload.fotoPerfil,
    payload.photo,
    payload.profilePicture,
    payload.avatar,
  );
  const city = pickFirstString(payload.city, payload.ciudad);
  const country = pickFirstString(payload.country, payload.pais);

  return {
    _id: id,
    id,
    ...(username ? { username } : {}),
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(city ? { city, ciudad: city } : {}),
    ...(country ? { country, pais: country } : {}),
    ...(avatar
      ? {
          fotoPerfil: avatar,
          photo: avatar,
          profilePicture: avatar,
        }
      : {}),
  };
};

export const extractAuthSession = (payload: unknown) => {
  const data = extractApiData<UnknownRecord>(payload) ?? {};

  return {
    accessToken: pickFirstString(data.accessToken, data.token),
    refreshToken: pickFirstString(data.refreshToken),
    user: normalizeStoredAuthUser(data.user),
  };
};

export const normalizeProfilePayload = (
  payload: unknown,
  fallbackUserId?: string,
): NormalizedProfilePayload => {
  const data = extractApiData<UnknownRecord>(payload) ?? {};
  const statsSource = isRecord(data.stats) ? data.stats : {};

  return {
    user: normalizeStoredAuthUser(data.user, fallbackUserId),
    stats: {
      posts: toCount(statsSource.posts),
      beers: toCount(statsSource.beers),
      places: toCount(statsSource.places),
      followers: toCount(statsSource.followers),
      following: toCount(statsSource.following),
    },
  };
};
