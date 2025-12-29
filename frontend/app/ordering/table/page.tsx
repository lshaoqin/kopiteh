"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TableSelectionPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 

  const handleSelect = (table: number) => {
    setSelectedTable(table);
    setIsOpen(false);
    
    // Simulate selection and redirect to Stalls
    setTimeout(() => {
        router.push("/ordering/stalls");
    }, 200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-600">
      
      {/* Header */}
      <header className="flex items-center p-6 pb-2 relative">
        {/* Back button goes to Role Selection (/ordering) */}
        <Link href="/ordering" className="p-2 -ml-2 rounded-full hover:bg-slate-100 absolute left-4">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="w-full text-center text-lg font-medium text-slate-600">
          Enter Details
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 -mt-20">
        
        <div className="relative w-full max-w-xs">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-4 text-left text-lg border-2 border-slate-500 rounded-lg bg-white transition-all",
              isOpen ? "rounded-b-none border-b-0" : "rounded-lg"
            )}
          >
            <span className={selectedTable ? "text-slate-800" : "text-slate-400"}>
              {selectedTable ? `Table ${selectedTable}` : "Select Table"}
            </span>
            <ChevronDown className={cn("w-6 h-6 text-slate-500 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-slate-500 rounded-b-lg overflow-hidden max-h-60 overflow-y-auto z-50 shadow-xl">
              {tables.map((table) => (
                <button
                  key={table}
                  onClick={() => handleSelect(table)}
                  className="w-full text-left px-4 py-3 text-lg hover:bg-slate-100 border-b border-slate-100 last:border-none text-slate-600"
                >
                  {table}
                </button>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}