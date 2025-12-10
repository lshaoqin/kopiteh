"use client";

import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/backbutton"
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();
  const venueId = params.venueId;

  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/stalls/venue/${venueId}`);
        if (!res.ok) throw new Error("Failed to fetch stalls");
        const data = await res.json();
        setStalls(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [API_URL, venueId]);


  return (
    <main className="p-2">
      <BackButton href="/runner" />

      <div>
        <h1 className="text-3xl font-bold">
          Hey <span className="text-green-600">Runner</span>
        </h1>
        <h2 className="text-xl font-semibold mt-2">
          Select your stall
        </h2>

        {loading && <p>Loading...</p>}

        <ul>
          {!loading && stalls.length > 0 && stalls.map((stall: any) => (
            <li key={stall.id}>
              <Button
                className="bg-primary1 h-11 rounded-md"
                onClick={() => router.push(`/runner/${stall.id}/selectstall`)}
              >
                {stall.name}
              </Button>
            </li>
          ))}

          {!loading && stalls.length === 0 && <li>No stalls found</li>}
        </ul>
      </div>
    </main>
  )
}