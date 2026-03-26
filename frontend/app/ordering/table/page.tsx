"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/ui/BackButton";
import { DiningTable } from "@/../types/item";
import { api } from "@/lib/api";

export default function TableSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract venue from URL (?venue=123)
  const urlVenueId = searchParams.get("venue");
  const urlTableId = searchParams.get("table");

  const [isOpen, setIsOpen] = useState(false);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string | null>(null);

  const { 
    venueId, setVenueId, 
    tableId, setTableId, 
    volunteerName, setVolunteerName,
    isHydrated 
  } = useCartStore();

  useEffect(() => {
    if (!isHydrated) return;

    async function initializeSelection() {
      const effectiveVenueId = urlVenueId ? parseInt(urlVenueId) : venueId;
      const effectiveTableId = urlTableId ? parseInt(urlTableId) : tableId;

      if (!effectiveVenueId) {
        router.push("/ordering/venue");
        return;
      }

      const isNewTableContext = urlTableId && parseInt(urlTableId) !== tableId;

      if (isNewTableContext && effectiveVenueId && effectiveTableId && volunteerName.trim()) {
        setVenueId(effectiveVenueId);
        setTableId(effectiveTableId);
        router.push(`/ordering/stalls?venue=${effectiveVenueId}&table=${effectiveTableId}`);
        return;
      }

      if (urlVenueId && parseInt(urlVenueId) !== venueId) setVenueId(parseInt(urlVenueId));
      if (urlTableId && parseInt(urlTableId) !== tableId) setTableId(parseInt(urlTableId));

      try {
        setLoading(true);
        const data = await api.getTablesByVenue(effectiveVenueId); 
        setTables(data);
        
        // Pre-select the dropdown label if a table exists in store/URL
        const currentTable = data.find(t => t.table_id === effectiveTableId);
        if (currentTable) {
          setSelectedTableNumber(currentTable.table_number.toString());
        }
      } catch (err) {
        console.error("Failed to load tables:", err);
      } finally {
        setLoading(false);
      }
    }

    initializeSelection();
  }, [urlVenueId, urlTableId, isHydrated, router, venueId, tableId, setVenueId, setTableId]);




  const handleSelectOption = (id: number, number: string) => {
    setTableId(id);
    setSelectedTableNumber(number);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (!tableId || !volunteerName.trim()) return;
    router.push(`/ordering/stalls?venue=${venueId}&table=${tableId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-600 px-6 pt-6 pb-10">
      
      {/* Header */}
      <header className="flex items-center pb-6">
        <BackButton href="/ordering/venue" />
      </header>

      {/* Title */}
      <div className="mb-10 mt-2">
        <h1 className="text-3xl font-bold text-slate-700 leading-tight">
            {volunteerName ? `Hi ${volunteerName},` : "Hi,"} <br />
            Ready to order?
        </h1>
      </div>

      <main className="flex-1 flex flex-col">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-500 ml-1 uppercase tracking-wider">
            Your Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              type="text"
              placeholder="Enter volunteer name"
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              className="pl-12 h-14 bg-white border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Select Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-500 ml-1 uppercase tracking-wider">
            Table Number
          </label>
          <div className="relative w-full">
            <button
              onClick={() => setIsOpen(!isOpen)}
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-between px-5 h-14 text-left text-lg bg-white border border-slate-300 rounded-lg shadow-sm transition-all outline-none",
                isOpen ? "rounded-b-none border-b-0" : "rounded-lg",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              <span className={selectedTableNumber ? "text-slate-700" : "text-slate-300"}>
                {loading ? "Loading tables..." : (selectedTableNumber ? `Table ${selectedTableNumber}` : "Select Table")}
              </span>
              <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-slate-300 rounded-b-lg overflow-hidden max-h-60 overflow-y-auto z-50 shadow-lg">
                {tables.map((table) => (
                  <button
                    key={table.table_id}
                    onClick={() => handleSelectOption(table.table_id, table.table_number.toString())}
                    className="w-full text-left px-5 py-4 text-lg text-slate-600 hover:bg-slate-50 border-b border-slate-100 last:border-none"
                  >
                    Table {table.table_number}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1" />
        <div className="mt-8">
            <Button 
                variant="confirm" 
                size="xl"
                onClick={handleConfirm} 
                disabled={!tableId || !volunteerName.trim() || loading}
            >
                Start Ordering
            </Button>
            {!volunteerName.trim() && !loading && (
              <p className="text-center text-xs text-slate-400 mt-3 italic">
                Please enter your name to continue
              </p>
            )}
        </div>

      </main>
    </div>
  );
}