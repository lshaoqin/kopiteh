"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button"; 
import { BackButton } from "@/components/ui/BackButton";

export default function TableSelectionPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { tableNumber, setTableNumber } = useCartStore();
  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleSelectOption = (table: number) => {
    setTableNumber(table);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (!tableNumber) return;
    router.push("/ordering/stalls");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-600 px-6 pt-6 pb-10">
      
      {/* Header */}
      <header className="flex items-center pb-6">
        <BackButton href="/" />
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
            className={cn(
              "w-full flex items-center justify-between px-5 py-4 text-left text-lg bg-white border border-slate-400 rounded-lg shadow-sm transition-all outline-none focus:ring-2 focus:ring-slate-200",
              isOpen ? "rounded-b-none border-b-0" : "rounded-lg"
            )}
          >
            <span className={tableNumber ? "text-slate-700" : "text-slate-300"}>
              {tableNumber ? tableNumber : "Select Table"}
            </span>
            <ChevronDown 
                className={cn("w-5 h-5 text-slate-500 transition-transform duration-200", isOpen && "rotate-180")} 
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-slate-400 rounded-b-lg overflow-hidden max-h-60 overflow-y-auto z-50 shadow-lg">
              {tables.map((table) => (
                <button
                  key={table}
                  onClick={() => handleSelectOption(table)}
                  className="w-full text-left px-5 py-3 text-lg text-slate-600 hover:bg-slate-50 border-b border-slate-100 last:border-none transition-colors"
                >
                  {table}
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
                disabled={!tableNumber}
            >
                Confirm
            </Button>
        </div>

      </main>
    </div>
  );
}