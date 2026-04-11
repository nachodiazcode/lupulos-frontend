"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  type StoredAuthUser,
} from "@/lib/auth-storage";


interface AuthContextValue {
  user: StoredAuthUser | null;
  token: string | null;
  isAuthReady: boolean;
  setUser: (user: StoredAuthUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthReady: false,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setUser(getStoredUser());
      setToken(getStoredToken());
      setIsAuthReady(true);
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);

    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
    setIsAuthReady(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthReady, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
