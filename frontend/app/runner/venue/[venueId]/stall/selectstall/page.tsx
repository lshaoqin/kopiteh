"use client";

import { BackButton } from "@/components/ui/button"
import { DisplayGrid } from "@/components/ui/displaygrid";
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
          <DisplayGrid
            items={stalls.map((stall) => ({
              id: stall.stall_id,
              name: stall.name,
              img: stall.stall_image,
              isActive: stall.is_open,
            }))}
            variant="stall"
            href={(id: string) => `/runner/venue/${venueId}/stall/${id}/orders`}
          />
        )}
      </div>
    </main>
  )
}