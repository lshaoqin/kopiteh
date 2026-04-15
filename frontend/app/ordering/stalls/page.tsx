"use client";

import { useState, useEffect, Suspense } from "react"; 
import { useSearchParams, useRouter } from "next/navigation"; 
import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import { api } from "@/lib/api"; 
import { Stall } from "@/../types";
import { useCartStore } from "@/stores/cart.store";

// Components
import { StallGridCard } from "@/components/ui/StallGridCard";
import { FilterButton } from "@/components/ui/FilterButton";
import { BackButton } from "@/components/ui/BackButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { FloatingCartButton } from "@/components/ui/FloatingCartButton";

function StallSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Store actions and state
  const { venueId, tableId, tableNumber, setVenueId, setTableId, setTableNumber } = useCartStore();

  const [stalls, setStalls] = useState<Stall[]>([]); 
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  // 1. Sync URL Params to Store
  useEffect(() => {
    const vParam = searchParams.get("venue");
    const tParam = searchParams.get("table");

    if (vParam) setVenueId(Number(vParam));
    if (tParam) setTableId(Number(tParam));
  }, [searchParams, setVenueId, setTableId]);

  // 2. Fetch Stalls based on dynamic venueId
  useEffect(() => {
    async function fetchStalls() {
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
    if (!tableId) return;
    
    const checkOrders = async () => {
        try {
            const orders = await api.getOrdersByTable(tableId);
            const active = orders.filter((o: any) => 
                !['completed', 'cancelled'].includes(o.status.toLowerCase())
            );
            setActiveOrdersCount(active.length);
        } catch (e) {
            console.error("Order check failed", e);
        }
    };
    
    checkOrders();
    const interval = setInterval(checkOrders, 30000); // Poll every 30s as fallback
    return () => clearInterval(interval);
  }, [tableId]);

  useEffect(() => {
    if (loading) return;

    if (!venueId && !searchParams.get("venue")) {
      router.push("/ordering/venue");
    } 
    else if (!tableId && !searchParams.get("table")) {
      router.push("/ordering/table");
    }
  }, [loading, venueId, tableId, searchParams, router]);

  const filteredStalls = stalls
    .filter((stall) => stall.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Name (A-Z)") return a.name.localeCompare(b.name);
      if (sortBy === "Name (Z-A)") return b.name.localeCompare(a.name);
      if (sortBy === "Wait Time") return a.waiting_time - b.waiting_time;
      return 0;
    });

  if (!loading && (!venueId || !tableId) && !searchParams.get("venue")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 w-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-20 no-scrollbar">

        <div className="space-y-6 mb-10 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <BackButton href="/ordering/table" />
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Search</h1>
                    {tableId && (
                      <div className="bg-[#f0f4f8] px-4 py-1.5 rounded-full flex items-center justify-center">
                        <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                          Table {tableNumber}
                        </span>
                      </div>
                    )}
                  </div>
              </div>

              {/* My Orders Button Entry Point */}
              <Link href="/ordering/status">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 text-sm font-semibold transition-all border border-slate-200">
                    <ClipboardList size={18} className="text-slate-500" />
                    My Orders
                    {activeOrdersCount > 0 && (
                        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    )}
                </button>
              </Link>
          </div>
          
          {/* Active Status Banner */}
          {activeOrdersCount > 0 && (
            <Link 
                href="/ordering/status" 
                className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
                        !
                    </div>
                    <div>
                        <p className="text-orange-900 text-sm font-bold">Preparation in Progress</p>
                        <p className="text-orange-700 text-xs">Tap to track your {activeOrdersCount} active order{activeOrdersCount > 1 ? 's' : ''}.</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-orange-400" />
            </Link>
          )}

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
                <StallGridCard key={stall.stall_id} stall={stall} module="ordering" />
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