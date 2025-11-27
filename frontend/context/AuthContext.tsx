"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth.store"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function AuthContext({ children }: { children: React.ReactNode }) {
  const {
    isHydrated,
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
    setUser,
    logout,
  } = useAuthStore();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (!isHydrated || bootstrapped) return;

    const init = async () => {
      // No refresh token => user is effectively logged out
      if (!refreshToken) {
        setBootstrapped(true);
        return;
      }


      // No access token but have refresh token (auto-login)
      if (!accessToken) {
        try {
          const res = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          const data = await res.json();

          if (!res.ok || data?.success === false) {
            logout();
          } else {
            const payload = data.payload?.data ?? {};
            setAccessToken(payload.access_token || null);
            setRefreshToken(payload.refresh_token || null);
            if (payload.user) setUser(payload.user);
          }
        } catch (e) {
          console.error("Auto refresh failed:", e);
          logout();
        }
      }

      setBootstrapped(true);
    };

    void init();
  }, [isHydrated, bootstrapped, refreshToken, accessToken, logout, setAccessToken, setRefreshToken, setUser]);

  if (!bootstrapped) {
    // Initial splash/loading while we decide if user is logged in
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}