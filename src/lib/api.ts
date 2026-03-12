/** 统一的后端请求工具（通过 Vite 代理至 http://localhost:3001） */
const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "请求失败" }));
    throw new Error((body as { message?: string }).message ?? "请求失败");
  }

  return res.json() as Promise<T>;
}

export const api = {
  get:   <T>(path: string)                  => request<T>(path),
  post:  <T>(path: string, body: unknown)   => request<T>(path, { method: "POST",  body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown)   => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}
