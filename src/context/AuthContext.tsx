"use client";

import { createContext, useEffect, useState, ReactNode } from "react";

interface Usuario {
  _id: string;
  username: string;
  email: string;
  fotoPerfil?: string;
  ciudad?: string;
  pais?: string;
  bio?: string;
  sitioWeb?: string;
  pronombres?: string;
  [key: string]: unknown; // permite extensibilidad sin romper TS
}

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  setUser: (user: Usuario | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
