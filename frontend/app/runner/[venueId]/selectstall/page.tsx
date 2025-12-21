"use client";

import { BackButton } from "@/components/ui/backbutton"
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Stall } from "../../../../../types/stall";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();
  const venueId = params.venueId;

  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/stalls/venue/${venueId}`);
        if (!res.ok) throw new Error("Failed to fetch stalls");

        const json = await res.json();
        if (!json.success) {
          setStalls([]);
          return;
        }
        setStalls(json.payload.data ?? []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [API_URL, venueId]);


  return (
    <main className="p-2">
      <BackButton href="/runner/selectvenue" />

      <div>
        <h1 className="text-3xl font-bold">
          Hey <span className="text-green-600">Runner</span>
        </h1>
        <h2 className="text-xl font-semibold mt-2">
          Select your stall
        </h2>

        {loading && <p>Loading...</p>}

        <ul className="mt-4 space-y-3">
          {!loading && stalls.length > 0 && stalls.map((stall: any) => (
            <li key={stall.stall_id}>
              <div 
              className="flex items-center gap-3 rounded-xl bg-white shadow-sm px-3 py-3 active:scale-[0.98] transition"
              onClick={() => router.push(`/runner/${stall.stall_id}/selectstall`)}>
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
                    {stall.unit_number}
                  </span>
                </div>
              </div>
            </li>
          ))}

          {!loading && stalls.length === 0 && <li>No stalls found</li>}
        </ul>
      </div>
    </main>
  )
}