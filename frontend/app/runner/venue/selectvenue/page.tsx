"use client";

import { BackButton } from "@/components/ui/button"
import { DisplayGrid } from "@/components/ui/displaygrid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Venue } from "../../../../../types/venue";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/venue`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.message || "Failed to fetch venues");
        }

        setVenues(json.payload.data ?? []);
      } catch (err: any) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Unexpected error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [API_URL]);


  return (
    <main className="p-2">
      <BackButton href="/" />

      <div>
        <h1 className="text-3xl font-bold">
          Hey <span className="text-green-600">Runner</span>
        </h1>
        <h2 className="text-xl font-semibold mt-2">
          Select your venue
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <DisplayGrid
            items={venues.map((venue) => ({
              id: venue.venue_id,
              name: venue.name,
              img: venue.image_url,
            }))}
            variant="venue"
            href={(id: string) => `/runner/venue/${id}/stall/selectstall`}
          />
        )}
      </div>
    </main>
  )
}