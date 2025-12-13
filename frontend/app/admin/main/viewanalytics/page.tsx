'use client'

import type { Stall } from "../../../../../types/stall"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth.store"
import { User } from "../../../../../types/auth"
import { useRouter } from "next/navigation";

export default function Home() {
  const [stalls, setStalls] = useState<Stall[]>([])
  const { user, isHydrated, logout } = useAuthStore();
  const router = useRouter();

  if (!isHydrated || !user) {
    return null;
  }
  const handleLogout = async () => {
  try {
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      logout();
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

    logout();

    // Redirect to login
    router.push("/admin/auth/login");
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
        <h1>Hi view analytics {user.name}</h1>
        <Button onClick={handleLogout}>
          Logout
        </Button>
        <h1>Stalls:</h1>
        {stalls.length > 0 ? (
          <ul>
            {stalls.map((stall) => (
              <li key={stall.stall_id}>{stall.name}</li>
            ))}
          </ul>
        ) : (
          <p>No stalls found.</p>
        )}
      </div>
    </main>
  )
}