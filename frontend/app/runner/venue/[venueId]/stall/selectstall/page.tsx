"use client";

import { DisplayGrid } from "@/components/ui/displaygrid";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api"; 
import { useCartStore } from "@/stores/cart.store";
import { Stall } from "../../../../../../../types/stall";

// Components
import { StallGridCard } from "@/components/ui/StallGridCard";
import { FilterButton } from "@/components/ui/FilterButton";
import { BackButton } from "@/components/ui/BackButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { FloatingCartButton } from "@/components/ui/FloatingCartButton";

function StallSelectionContent() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { venueId, setVenueId} = useCartStore();

  const [stalls, setStalls] = useState<Stall[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  // 1. Sync URL Params to Store
  useEffect(() => {
    const vParam = searchParams.get("venue");
    const tParam = searchParams.get("table");

    if (vParam) setVenueId(Number(vParam));
  }, [searchParams, setVenueId]);

  // 2. Fetch Stalls based on dynamic venueId
  useEffect(() => {
    async function fetchStalls() {
      // If we don't have a venueId yet (from store or URL), don't fetch
      if (!venueId) return;

      try {
        setLoading(true);
        const data = await api.getStallsByVenue(venueId); 
        setStalls(data || []); 
      } catch (err: any) {
        console.error(err);
        setError("Failed to load stalls");
      } finally {
        setLoading(false);
      }
    }
    fetchStalls();
  }, [venueId]);

  useEffect(() => {
    if (loading) return;

    // Check for Venue first
    if (!venueId && !searchParams.get("venue")) {
      router.push(`/runner/venue/selectvenue`);
    } 
  }, [loading, venueId, searchParams, router]);

  const filteredStalls = stalls
    .filter((stall) => stall.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Name (A-Z)") return a.name.localeCompare(b.name);
      if (sortBy === "Name (Z-A)") return b.name.localeCompare(a.name);
      if (sortBy === "Wait Time") return a.waiting_time - b.waiting_time;
      return 0;
    });

  // Prevent flash of content if redirecting
  if (!loading && (!venueId) && !searchParams.get("venue")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 w-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-20 no-scrollbar">

        <div className="space-y-6 mb-10 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
              <BackButton href="/runner/venue/selectvenue" />
              <h1 className="text-3xl font-bold text-slate-800">Search</h1>
          </div>
          
          <div className="max-w-2xl">
            <SearchBar 
              placeholder="Craving Something?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 flex-wrap relative z-20">
            <FilterButton 
                label="Sort By" 
                options={["Name (A-Z)", "Name (Z-A)", "Wait Time"]}
                value={sortBy}
                onChange={setSortBy} 
            />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
            {loading && (
            <div className="flex flex-col items-center justify-center mt-20 gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
            </div>
            )}
            
            {!loading && !error && filteredStalls.length === 0 && (
                <div className="flex justify-center mt-20 text-slate-400 text-lg">No stalls found</div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {!loading && filteredStalls.map((stall) => (
                <StallGridCard key={stall.stall_id} stall={stall} module="runner" />
            ))}
            </div>
        </div>
        <FloatingCartButton />
      </div>
    </div>
  );
}
export default function StallSelectionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StallSelectionContent />
        </Suspense>
    );
}