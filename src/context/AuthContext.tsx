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
  setUser: (user: StoredAuthUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());
  }, []);

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
