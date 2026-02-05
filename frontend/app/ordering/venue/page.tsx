"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { api } from "@/lib/api";
import { Venue } from "@/../types";
import { BackButton } from "@/components/ui/BackButton";
import { VenueCard } from "@/components/ui/VenueCard";

export default function VenueSelectionPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const { setVenueId, setTableNumber } = useCartStore(); 

  useEffect(() => {
    async function fetchVenues() {
      try {
        const data = await api.getVenues();
        setVenues(data);
      } catch (err) {
        console.error("Failed to fetch venues", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  const handleSelectVenue = (id: number) => {
    setVenueId(id);
    setTableNumber(null); 
    router.push("/ordering/table");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col px-6 pt-6 pb-10 font-sans">
      <header className="pb-6">
        <BackButton href="/" />
      </header>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-700 leading-tight">
          Welcome, <br />
          Pick a Location
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="mt-4 text-slate-400 text-sm">Finding nearby courts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map((venue) => (
            <VenueCard 
              key={venue.venue_id} 
              venue={venue} 
              onClick={handleSelectVenue} 
            />
          ))}
        </div>
      )}
    </div>
  );
}