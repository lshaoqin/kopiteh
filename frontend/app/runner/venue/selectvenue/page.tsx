"use client";

import { BackButton } from "@/components/ui/backbutton"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Venue } from "../../../../../types/venue";

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
      <BackButton href="/" />

      <div>
        <h1 className="text-3xl font-bold">
          Hey <span className="text-green-600">Runner</span>
        </h1>
        <h2 className="text-xl font-semibold mt-2">
          Select your venue
        </h2>

        {loading && <p>Loading...</p>}

        <ul className="mt-4 space-y-3">
          {!loading && venues.length > 0 && venues.map((venue: any) => (
            <li key={venue.venue_id}>
              <div 
              className="flex items-center gap-3 rounded-xl bg-white shadow-sm px-3 py-3 active:scale-[0.98] transition"
              onClick={() => router.push(`/runner/venue/${venue.venue_id}/stall/selectstall`)}>
                {/* Shop image */}
                <img
                  src={venue.image_url}
                  alt={venue.name}
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                />

                {/* Text content */}
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px] text-black leading-tight">
                    {venue.name}
                  </span>
                  <span className="text-sm text-gray-500 leading-tight">
                    {venue.unit_number}
                  </span>
                </div>
              </div>
            </li>
          ))}

          {!loading && venues.length === 0 && <li>No venues found</li>}
        </ul>
      </div>
    </main>
  )
}