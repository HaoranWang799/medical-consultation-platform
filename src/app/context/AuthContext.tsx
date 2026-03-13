import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setToken, clearToken } from "../../lib/api";

export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  birthDate?: string;
  gender?: string;
  allergies?: string;
  medicalHistory?: string;
  hospital?: string;
  department?: string;
  title?: string;
  bio?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (account: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, account: string, password: string, role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: Partial<User> & { name: string }) => Promise<User>;
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

  const refreshUser = async (): Promise<void> => {
    const nextUser = await api.get<User>("/auth/me");
    setUser(nextUser);
  };

  const login = async (account: string, password: string, role: UserRole): Promise<void> => {
    const { token, user } = await api.post<{ token: string; user: User }>(
      "/auth/login",
      { account, password, role }
    );
    setToken(token);
    setUser(user);
  };

  const register = async (
    name: string,
    account: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    const { token, user } = await api.post<{ token: string; user: User }>(
      "/auth/register",
      { name, email: account.trim().toLowerCase(), password, role }
    );
    setToken(token);
    setUser(user);
  };

  const updateProfile = async (payload: Partial<User> & { name: string }): Promise<User> => {
    const updated = await api.patch<User>("/auth/me", payload);
    setUser(updated);
    return updated;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, refreshUser, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
