const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "user";
const JUST_LOGGED_IN_KEY = "justLoggedIn";

export interface StoredAuthUser {
  _id: string;
  username?: string;
  name?: string;
  nombre?: string;
  email?: string;
  fotoPerfil?: string;
  photo?: string;
  profilePicture?: string;
  [key: string]: unknown;
}

/** Devuelve el mejor nombre de usuario disponible desde el objeto guardado */
export function getDisplayName(user: StoredAuthUser | null): string {
  if (!user) return "cervecero";

  // Intentar campos conocidos primero
  const fromKnown =
    (user.username as string) ||
    (user.name as string) ||
    (user.nombre as string) ||
    (user.email ? (user.email as string).split("@")[0] : "");

  if (fromKnown) return fromKnown;

  // Último recurso: buscar cualquier campo string corto que no sea un ID
  const ID_KEYS = new Set(["_id", "id", "fotoPerfil", "photo", "profilePicture", "email"]);
  for (const [key, val] of Object.entries(user)) {
    if (!ID_KEYS.has(key) && typeof val === "string" && val.length > 0 && val.length < 60) {
      return val;
    }
  }

  return "cervecero";
}

const isBrowser = (): boolean => typeof window !== "undefined";

export const getStoredToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getStoredUser = (): StoredAuthUser | null => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
};

export const persistAuthSession = ({
  token,
  user,
  justLoggedIn = false,
}: {
  token: string;
  user: StoredAuthUser;
  justLoggedIn?: boolean;
}): void => {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  if (justLoggedIn) {
    localStorage.setItem(JUST_LOGGED_IN_KEY, "true");
  } else {
    localStorage.removeItem(JUST_LOGGED_IN_KEY);
  }
};

export const clearAuthSession = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(JUST_LOGGED_IN_KEY);
};
