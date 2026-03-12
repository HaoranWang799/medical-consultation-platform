import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setToken, clearToken } from "../../lib/api";

export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 启动时尝试恢复已登录的会话
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get<User>("/auth/me")
        .then(setUser)
        .catch(() => clearToken())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    const { token, user } = await api.post<{ token: string; user: User }>(
      "/auth/login",
      { email, password, role }
    );
    setToken(token);
    setUser(user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    const { token, user } = await api.post<{ token: string; user: User }>(
      "/auth/register",
      { name, email, password, role }
    );
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
