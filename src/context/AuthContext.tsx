import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { ApiError, getCurrentUser, SESSION_EXPIRED_EVENT } from "../lib/api";
import type { User } from "../lib/types";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pages are also rendered at build time (scripts/prerender.mjs), where there's
// no browser storage, so every read is guarded.
function hasStoredToken() {
  return typeof window !== "undefined" && !!localStorage.getItem("token");
}

function readStoredUser(): User | null {
  if (!hasStoredToken()) return null;
  try {
    return JSON.parse(localStorage.getItem("user") ?? "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  // While a stored session is being re-checked against the server, protected
  // routes wait rather than trusting a possibly expired token.
  const [isLoading, setIsLoading] = useState(hasStoredToken);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    getCurrentUser()
      .then((fresh) => {
        localStorage.setItem("user", JSON.stringify(fresh));
        setUser(fresh);
      })
      .catch((err) => {
        // Only a definite rejection ends the session; a network blip or a
        // sleeping server keeps the stored user so the app stays usable.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) logout();
      })
      .finally(() => setIsLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  // Call after any endpoint that returns an updated user (e.g. editing the
  // profile), so the rest of the app sees the change without a re-login.
  const updateUser = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, isLoading, user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
