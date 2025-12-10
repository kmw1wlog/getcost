import { useEffect, useState } from "react";
import type { User } from "@shared/schema";

const STORAGE_KEY = "mockUser_v2";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    try {
      // Cleanup legacy key to avoid stale login
      localStorage.removeItem("mockUser");
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("storage", handler);
    window.addEventListener("auth-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth-changed", handler);
    };
  }, []);

  return {
    user: user ?? undefined,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    storageKey: STORAGE_KEY,
  };
}
