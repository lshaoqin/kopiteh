"use client";

import { BackButton } from "@/components/ui/backbutton"
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Stall } from "../../../../../../../types/stall";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();
  const venueId = params.venueId;

  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/stalls/venue/${venueId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.message || "Failed to fetch stalls");
        }

        setStalls(json.payload.data ?? []);
      } catch (err: any) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Unexpected error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [API_URL, venueId]);


  return (
    <main className="p-2">
      <BackButton href="/runner/venue/selectvenue" />

      <div>
        <h1 className="text-3xl font-bold">
          Hey <span className="text-green-600">Runner</span>
        </h1>
        <h2 className="text-xl font-semibold mt-2">
          Select your stall
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {stalls.length > 0 ? (
              stalls.map((stall) => (
                <li key={stall.stall_id}>
                  <div 
                  className="flex items-center gap-3 rounded-xl bg-white shadow-sm px-3 py-3 active:scale-[0.98] transition"
                  onClick={() => router.push(`/runner/venue/${venueId}/stall/${stall.stall_id}/orders`)}>
                    {/* Shop image */}
                    <img
                      src={stall.stall_image}
                      alt={stall.name}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                    />

                    {/* Text content */}
                    <div className="flex flex-col">
                      <span className="font-semibold text-[15px] text-black leading-tight">
                        {stall.name}
                      </span>
                      <span className="text-sm text-gray-500 leading-tight">
                        {stall.description}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li>No stalls found</li>
            )}
          </ul>
        )}
      </div>
    </main>
  )
}