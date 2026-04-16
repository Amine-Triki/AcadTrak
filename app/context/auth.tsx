import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Role = "student" | "teacher" | "admin" | null;

export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  country?: string;
  email?: string;
  name?: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ دالة آمنة للقراءة من localStorage
function getStoredUser(): AuthUser | null {
  // typeof window !== "undefined" = نحن في المتصفح وليس السيرفر
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("acadtrak_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return getStoredUser(); // ✅ آمنة الآن
  });

  const handleSetUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    // ✅ نفس الحماية عند الكتابة
    if (typeof window === "undefined") return;
    if (newUser) {
      localStorage.setItem("acadtrak_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("acadtrak_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        isAuthenticated: !!user,
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