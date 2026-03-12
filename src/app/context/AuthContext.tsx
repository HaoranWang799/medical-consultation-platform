import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setToken, clearToken } from "../../lib/api";

export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (account: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, account: string, password: string, role: UserRole) => Promise<void>;
  sendPhoneCode: (phone: string, role: UserRole) => Promise<{ debugCode?: string }>;
  registerByPhone: (
    name: string,
    phone: string,
    code: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
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
    const normalizedAccount = account.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedAccount);
    const { token, user } = await api.post<{ token: string; user: User }>(
      "/auth/register",
      {
        name,
        email: isEmail ? normalizedAccount : "",
        phone: isEmail ? "" : normalizedAccount,
        password,
        role,
      }
    );
    setToken(token);
    setUser(user);
  };

  const sendPhoneCode = async (
    phone: string,
    role: UserRole
  ): Promise<{ debugCode?: string }> => {
    return api.post<{ message: string; debugCode?: string }>("/auth/send-phone-code", {
      phone,
      role,
    });
  };

  const registerByPhone = async (
    name: string,
    phone: string,
    code: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    const { token, user } = await api.post<{ token: string; user: User }>(
      "/auth/register-by-phone",
      { name, phone, code, password, role }
    );
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, sendPhoneCode, registerByPhone, logout }}
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
