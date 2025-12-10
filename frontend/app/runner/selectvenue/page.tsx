"use client";

import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/backbutton"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Venue } from "../../../../types/venue";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/venue`);
        if (!res.ok) throw new Error("Failed to fetch venues");

        const json = await res.json();
        if (!json.success) {
          setVenues([]);
          return;
        }
        setVenues(json.payload.data ?? []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    load();
  }, [API_URL]);


  return (
    <main className="p-2">
      <BackButton href="/runner" />

      <div>
        <h1 className="text-3xl font-bold">
          Hey <span className="text-green-600">Runner</span>
        </h1>
        <h2 className="text-xl font-semibold mt-2">
          Select your venue
        </h2>

        {loading && <p>Loading...</p>}

        <ul>
          {!loading && venues.length > 0 && venues.map((venue: any) => (
            <li key={venue.venue_id}>
              <Button
                className="bg-primary1 h-11 rounded-md"
                onClick={() => router.push(`/runner/${venue.venue_id}/selectstall`)}
              >
                {venue.name}
              </Button>
            </li>
          ))}

          {!loading && venues.length === 0 && <li>No venues found</li>}
        </ul>
      </div>
    </main>
  )
}