'use client'

import type { Stall } from "../../../types/stall"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth.store"
import { User } from "../../../types/auth"
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true)
  const accessToken = useAuthStore.getState().accessToken;
  const refreshToken = useAuthStore.getState().refreshToken;
  const user: User = useAuthStore.getState().user
  useEffect(() => {
    async function fetchStalls() {
      console.log('this is access token', accessToken);
      console.log('this is refresh token', refreshToken);
      console.log(user)
    }

    fetchStalls()
  }, [accessToken, refreshToken, user])
  const router = useRouter();

  const handleLogout = async () => {
  try {
    const refreshToken = useAuthStore.getState().refreshToken;
    const logoutStore = useAuthStore.getState().logout;

    if (!refreshToken) {
      logoutStore();
      router.push("/login");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    await res.json();

    logoutStore();

    // Redirect to login
    router.push("/login");
  } catch (err) {
    console.error("Logout failed:", err);

    // Still clear local state to avoid being stuck
    useAuthStore.getState().logout();
    router.push("/login");
  }
};

  return (
    <main className="p-2">
      <div>
        <h1>Hi runner {user.name}</h1>
        <Button onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </main>
  )
}