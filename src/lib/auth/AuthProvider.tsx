"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const session = await getSessionRequest();
    setUser(session.user);
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password);
      setUser(data.user);
      router.push(ROLE_HOME[data.user.role] ?? "/");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    router.push("/login");
  }, [router]);

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
