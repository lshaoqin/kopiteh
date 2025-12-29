'use client'

import type { Venue } from "../../../../../types/venue"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation";
import { CardHolder } from "@/components/ui/cardholder"
import Link from "next/link";

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isHydrated, logout } = useAuthStore();
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter();

  useEffect(() => {
    const loadVenues = async () => {
      try {
        if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

        const res = await fetch(`${API_URL}/venue`);
        const data = await res.json();

        if (!res.ok || data.success === false) {
          throw new Error(data?.payload?.message ?? "Failed to fetch venues");
        }
        setVenues(data.payload?.data ?? []);
      } catch (err: any) {
        setError(err.message ?? "There is an error in our server, please try again later.");
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, [API_URL]);

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

      router.push("/admin/auth/login");
    } catch (err) {
      useAuthStore.getState().logout();
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 flex">
      <div className="flex-1 w-full ">
        <h1 className="font-bold text-2xl">Venues</h1>
        {loading && <div className="flex-1 grid place-items-center">
          <p className="text-primary1">Loading…</p>
        </div>}

        {!loading && !error && venues.length === 0 && (
          <p className="mt-4">No venues found.</p>
        )}

        {!loading && !error && venues.length > 0 && (
          <ul className="mt-4 grid grid-cols-3 gap-8">
            {venues.map((v) => (
              <li key={v.venue_id}>
                <Link href={`/admin/main/venues/${v.venue_id}/stalls`}>
                  <CardHolder name={v.name} img={v.image_url} variant="venue" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}