import { API_BASE } from "../config";

export type UserRole = "LANDLORD" | "TENANT" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  timezone?: string;
  bio?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export const api = {
  register: (payload: {
    username: string;
    email?: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: "TENANT" | "LANDLORD";
  }) => request<AuthResponse>(`/api/auth/register/`, { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: { username: string; password: string }) =>
    request<AuthResponse>(`/api/auth/login/`, { method: "POST", body: JSON.stringify(payload) }),

  me: (accessToken: string) =>
    request<User>(`/api/auth/me/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  updateMe: (
    accessToken: string,
    payload: Partial<Pick<User, "first_name" | "last_name" | "phone" | "timezone" | "bio">>
  ) =>
    request<User>(`/api/auth/me/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    }),
};
