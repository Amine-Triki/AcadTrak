import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { apiFetch } from "~/utils/api";

type Role = "student" | "teacher" | "admin" | null;

export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  country?: string;
  email?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const handleSetUser = (newUser: AuthUser | null) => {
    setUser(newUser);
  };

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiFetch("/api/users/me");
      const payload = (await response.json().catch(() => null)) as
        | {
            user?: AuthUser;
          }
        | null;

      if (response.ok && payload?.user) {
        handleSetUser(payload.user);
      } else {
        handleSetUser(null);
      }
    } catch {
      handleSetUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const isProtectedPath = location.pathname.startsWith("/dashboard");

    if (!isProtectedPath) {
      setIsAuthLoading(false);
      return;
    }

    void refreshUser();
  }, [location.pathname, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        isAuthenticated: !!user,
        isAuthLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}