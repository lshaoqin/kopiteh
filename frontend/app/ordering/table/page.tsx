"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button"; 
import { BackButton } from "@/components/ui/BackButton";
import { DiningTable } from "@/../types/item";
import { api } from "@/lib/api";

export default function TableSelectionPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string | null>(null);

  const { venueId, tableId, setTableId } = useCartStore();

  useEffect(() => {
    async function loadTables() {
      if (!venueId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.getTablesByVenue(venueId); 
        setTables(data);
      } catch (err) {
        console.error("Failed to load tables:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTables();
  }, [venueId]);

  const handleSelectOption = (id: number, number: string) => {
    setTableId(id);
    setSelectedTableNumber(number);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (!tableId) return;
    router.push(`/ordering/stalls?venue=${venueId}&table=${tableId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-600 px-6 pt-6 pb-10">
      
      {/* Header */}
      <header className="flex items-center pb-6">
        <BackButton href="/ordering/venue" />
      </header>

      {/* Title */}
      <div className="mb-12 mt-2">
        <h1 className="text-3xl font-bold text-slate-700 leading-tight">
            Hi, <br />
            Select Table Number
        </h1>
      </div>

      <main className="flex-1 flex flex-col">
        
        {/* Select Dropdown */}
        <div className="relative w-full max-w-sm mx-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-between px-5 py-4 text-left text-lg bg-white border border-slate-400 rounded-lg shadow-sm transition-all outline-none",
              isOpen ? "rounded-b-none border-b-0" : "rounded-lg",
              loading && "opacity-60 cursor-not-allowed"
            )}
          >
            <span className={selectedTableNumber ? "text-slate-700" : "text-slate-300"}>
              {loading ? "Loading tables..." : (selectedTableNumber ? `Table ${selectedTableNumber}` : "Select Table")}
            </span>
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
                <ChevronDown 
                    className={cn("w-5 h-5 text-slate-500 transition-transform duration-200", isOpen && "rotate-180")} 
                />
            )}
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-slate-400 rounded-b-lg overflow-hidden max-h-60 overflow-y-auto z-50 shadow-lg">
              {tables.map((table) => (
                <button
                  key={table.table_id}
                  onClick={() => handleSelectOption(table.table_id, table.table_number.toString())}
                  className="w-full text-left px-5 py-3 text-lg text-slate-600 hover:bg-slate-50 border-b border-slate-100 last:border-none transition-colors"
                >
                  Table {table.table_number}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />
        <div className="mt-8">
            <Button 
                variant="confirm" 
                size="xl"
                onClick={handleConfirm} 
                disabled={!tableId || loading}
            >
                Confirm
            </Button>
        </div>

      </main>
    </div>
  );
}