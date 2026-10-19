"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loginTraveler, logoutTraveler } from "@/lib/api/auth";
import {
  getAccessToken,
  getStoredProfile,
  setStoredProfile,
  type TravelerProfile,
} from "@/lib/auth/session";

type AuthContextValue = {
  ready: boolean;
  isAuthenticated: boolean;
  profile: TravelerProfile | null;
  login: (displayName: string, email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<TravelerProfile>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<TravelerProfile | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredProfile();
    if (token && stored) {
      setProfile(stored);
    }
    setReady(true);
  }, []);

  const login = useCallback(async (displayName: string, email: string) => {
    const next = await loginTraveler({ displayName, email });
    setProfile(next);
  }, []);

  const logout = useCallback(() => {
    logoutTraveler();
    setProfile(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<TravelerProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      setStoredProfile(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      isAuthenticated: Boolean(profile),
      profile,
      login,
      logout,
      updateProfile,
    }),
    [ready, profile, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
