import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, type AuthResponse, type User } from "../lib/api";

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: User | null;
  isBootstrapping: boolean;

  bootstrap: () => Promise<void>;
  register: (payload: {
    username: string;
    email?: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: "TENANT" | "LANDLORD";
  }) => Promise<void>;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

function applyAuth(
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  auth: AuthResponse
) {
  set({ access: auth.access, refresh: auth.refresh, user: auth.user });
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      access: null,
      refresh: null,
      user: null,
      isBootstrapping: true,

      bootstrap: async () => {
        const token = get().access;
        if (!token) {
          set({ isBootstrapping: false });
          return;
        }
        try {
          const user = await api.me(token);
          set({ user, isBootstrapping: false });
        } catch {
          set({ access: null, refresh: null, user: null, isBootstrapping: false });
        }
      },

      register: async (payload) => {
        const auth = await api.register(payload);
        applyAuth(set, auth);
      },

      login: async (payload) => {
        const auth = await api.login(payload);
        applyAuth(set, auth);
      },

      logout: () => set({ access: null, refresh: null, user: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: "proptrack-auth",
      partialize: (s) => ({ access: s.access, refresh: s.refresh, user: s.user }),
    }
  )
);
