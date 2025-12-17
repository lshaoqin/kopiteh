"use client";

import { Search, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react"; // Add useEffect to imports if uncommenting API
import { cn } from "@/lib/utils";
// import { api } from "@/lib/api"; // 1. API Import
import { Stall } from "../../../../types";
import { MOCK_STALLS } from "@/lib/mock-data"; 

const categories = ["All", "Chinese", "Western", "Malay", "Indian", "Thai", "Italian"];

export default function StallSelectionPage() {
  // Initialize with MOCK_STALLS directly
  const [stalls, setStalls] = useState<Stall[]>(MOCK_STALLS);
  const [loading, setLoading] = useState(false); // Set to false since we have data
  // const [error, setError] = useState<string | null>(null); // For API errors
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  /* 
  // 2. API FETCHING LOGIC (Commented Out)
  useEffect(() => {
    async function fetchStalls() {
      try {
        setLoading(true);
        // Hardcoded Venue ID 1 for now
        const data = await api.getStallsByVenue(1);
        setStalls(data || []); 
      } catch (err) {
        console.error(err);
        setError("Failed to load stalls");
      } finally {
        setLoading(false);
      }
    }
    fetchStalls();
  }, []); 
  */

  // Filter Logic (Search by Name)
  const filteredStalls = stalls.filter((stall) => {
    const matchesSearch = stall.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch; 
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-600 pb-20">
      
      {/* Header & Search Area */}
      <div className="p-6 pb-2 space-y-4">
        <div className="flex items-center gap-2">
            <Link href="/ordering/table" className="p-1 -ml-2 rounded-full hover:bg-slate-100">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-700">Search</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Craving Something?" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-400 rounded-lg py-3 pl-10 pr-4 text-slate-600 outline-none focus:border-slate-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs border whitespace-nowrap transition-colors",
                activeCategory === cat 
                  ? "bg-slate-600 text-white border-slate-600" 
                  : "bg-white text-slate-600 border-slate-600 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-2">
        
        {loading && <div className="flex justify-center mt-10 text-slate-400">Loading stalls...</div>}
        
        {!loading && filteredStalls.length === 0 && (
             <div className="flex justify-center mt-10 text-slate-400">No stalls found</div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {!loading && filteredStalls.map((stall) => (
            <Link 
              href={`/ordering/menu/${stall.stall_id}`} 
              key={stall.stall_id} 
              className={cn(
                "flex flex-col items-center group cursor-pointer",
                !stall.is_open && "opacity-60 grayscale pointer-events-none" // Disable clicks if closed
              )}
            >
              {/* Card Image */}
              <div className="w-full aspect-square border-2 border-slate-500 rounded-xl flex items-center justify-center bg-slate-50 mb-2 overflow-hidden relative transition-colors group-hover:bg-slate-100">
                {stall.image_url ? (
                   /* eslint-disable-next-line @next/next/no-img-element */
                   <img 
                    src={stall.image_url} 
                    alt={stall.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                   />
                ) : null}
                
                {/* Fallback Icon */}
                <div className={cn("absolute inset-0 flex items-center justify-center", stall.image_url ? "hidden" : "flex")}>
                    <ImageIcon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Stall Name */}
              <span className="text-sm font-medium text-slate-600 text-center leading-tight">
                {stall.name}
              </span>
              
              {/* Status Indicator */}
              {!stall.is_open && (
                  <span className="text-[10px] text-red-500 font-bold mt-0.5">CLOSED</span>
              )}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}