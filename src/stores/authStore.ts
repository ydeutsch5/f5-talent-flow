import { create } from "zustand";

export type UserRole = "admin" | "recruiter" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isDemoMode: boolean;
  setUser: (user: User) => void;
  setDemoMode: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isDemoMode: false,
  setUser: (user) => set({ user }),
  setDemoMode: (v) => set({ isDemoMode: v }),
  logout: () => set({ user: null, isDemoMode: false }),
}));
