const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "user";
const JUST_LOGGED_IN_KEY = "justLoggedIn";

export interface StoredAuthUser {
  _id: string;
  username?: string;
  email?: string;
  fotoPerfil?: string;
  [key: string]: unknown;
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
