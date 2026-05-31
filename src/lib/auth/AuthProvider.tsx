"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  getSessionRequest,
  loginRequest,
  logoutRequest,
} from "@/lib/auth/api";
import { ROLE_HOME } from "@/lib/constants";
import type { AuthUser } from "@/types/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const session = await getSessionRequest();
    setUser(session.user);
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    if (!data.user?.role) {
      throw new Error("Login succeeded but user profile is missing.");
    }

    setUser(data.user);

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const home = ROLE_HOME[data.user.role] ?? "/";
    const destination =
      next && next.startsWith("/") && !next.startsWith("//") ? next : home;

    toast.success("Signed in successfully");
    // Full navigation avoids "Router action dispatched before initialization" during dev HMR
    window.location.assign(destination);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    window.location.assign("/login");
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshSession }),
    [user, loading, login, logout, refreshSession],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
