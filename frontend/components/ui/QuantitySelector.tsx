"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({ 
  value, 
  onIncrease, 
  onDecrease, 
  min = 1,
  max = 99
}: QuantitySelectorProps) {
  
  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <div className="flex items-center justify-center gap-6">
      {/* MINUS BUTTON */}
      <button 
        onClick={onDecrease}
        disabled={isMin}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
          // Dark when active, Light when disabled
          !isMin 
            ? "bg-slate-600 text-white shadow-md hover:bg-slate-700" 
            : "bg-slate-100 text-slate-300 cursor-not-allowed"
        )}
      >
        <Minus className="w-6 h-6" strokeWidth={2.5} />
      </button>
      
      {/* NUMBER DISPLAY */}
      <span className="text-2xl font-medium w-8 text-center text-slate-600">
        {value.toString().padStart(2, '0')}
      </span>
      
      {/* PLUS BUTTON */}
      <button 
        onClick={onIncrease}
        disabled={isMax}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
          // Dark when active, Light when disabled
          !isMax
            ? "bg-slate-600 text-white shadow-md hover:bg-slate-700"
            : "bg-slate-100 text-slate-300 cursor-not-allowed"
        )}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}