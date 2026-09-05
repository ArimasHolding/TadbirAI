import { create } from "zustand";

export interface User {
  id: string | number;
  email: string;
  nom: string;
  role: string;
  company?: string;
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken?: string, refreshToken?: string) => void;
  logout: () => void;
  verifyEmail: () => void;
  setRole: (role: string) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  login: (user, accessToken = "demo_access_token", refreshToken = "demo_refresh_token") => {
    const updatedUser = {
      ...user,
      emailVerified: user.emailVerified ?? true,
    };
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  verifyEmail: () => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, emailVerified: true };
    localStorage.setItem("user", JSON.stringify(updated));
    set({ user: updated });
  },

  setRole: (newRole: string) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, role: newRole };
    localStorage.setItem("user", JSON.stringify(updated));
    set({ user: updated });
  },

  hydrate: () => {
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        set({
          accessToken: token || "demo_access_token",
          refreshToken: refresh || "demo_refresh_token",
          user: parsed,
          isAuthenticated: true,
        });
      } catch (e) {
        console.error("Hydration error:", e);
      }
    }
  },
}));