import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const location = useLocation();
  // ✅ نمنع استدعاء /api/users/me أكثر من مرة واحدة
  const hasFetchedRef = useRef(false);

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

  const shouldProbeAuth =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/payment/");

  useEffect(() => {
    if (!shouldProbeAuth) {
      setIsAuthLoading(false);
      return;
    }

    // ✅ نجلب بيانات المستخدم مرة واحدة فقط عند تحميل التطبيق
    // بدل ما نستدعيها في كل component على حدة → يمنع 401 spam
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void refreshUser();
  }, [refreshUser, shouldProbeAuth]);

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