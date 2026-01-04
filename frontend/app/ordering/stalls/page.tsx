"use client";

import { useState, useEffect } from "react"; 
import { Search, Filter } from "lucide-react";
import { api } from "@/lib/api"; 
import { Stall } from "../../../../types";

// Components
import { StallGridCard } from "@/components/ui/StallGridCard";
import { FilterButton } from "@/components/ui/FilterButton";
import { BackButton } from "@/components/ui/BackButton";

export default function StallSelectionPage() {
  const [stalls, setStalls] = useState<Stall[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("");

  useEffect(() => {
    async function fetchStalls() {
      try {
        setLoading(true);
        const data = await api.getStallsByVenue(1); 
        setStalls(data || []); 
      } catch (err: any) {
        console.error(err);
        setError("Failed to load stalls");
      } finally {
        setLoading(false);
      }
    }
    fetchStalls();
  }, []);

  const filteredStalls = stalls
    .filter((stall) => stall.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Name (A-Z)") return a.name.localeCompare(b.name);
      if (sortBy === "Name (Z-A)") return b.name.localeCompare(a.name);
      if (sortBy === "Wait Time") return a.waiting_time - b.waiting_time;
      return 0;
    });

  return (
    // MAIN CONTAINER=-
    <div className="min-h-screen bg-white font-sans text-slate-600 w-full flex flex-col">
      
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-20 no-scrollbar">

        {/* --- TOP SECTION --- */}
        <div className="space-y-6 mb-10 max-w-7xl mx-auto w-full">
          
          {/* Title Row */}
          <div className="flex items-center gap-4">
              <BackButton href="/ordering/table" />
              <h1 className="text-3xl font-bold text-slate-800">Search</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Craving Something?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 placeholder:text-slate-400 bg-white shadow-sm transition-all"
            />
          </div>

          {/* Filter Row */}
          <div className="flex gap-3 flex-wrap relative z-20">
            <FilterButton 
                icon={Filter} 
                className="w-9 px-0 shrink-0" 
            />
            
            <FilterButton 
                label="Sort By" 
                options={["Name (A-Z)", "Name (Z-A)", "Wait Time"]}
                value={sortBy}
                onChange={setSortBy} 
            />

            <FilterButton 
                label="Cuisines" 
                options={["Chinese", "Western", "Malay"]}
                value={cuisine}
                onChange={setCuisine} 
            />

             <FilterButton 
                label="Dietary" 
                options={["Halal", "Vegetarian"]}
                value={diet}
                onChange={setDiet} 
            />
          </div>
        </div>

        {/* --- GRID SECTION --- */}
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
                <StallGridCard key={stall.stall_id} stall={stall} />
            ))}
            </div>
        </div>

      </div>
    </div>
  );
}