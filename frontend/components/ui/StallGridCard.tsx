"use client";

import Link from "next/link";
import { Image as ImageIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stall } from "@/../types";

interface StallGridCardProps {
  stall: Stall;
}

export function StallGridCard({ stall }: StallGridCardProps) {
  return (
    <Link 
      href={stall.is_open ? `/ordering/menu/${stall.stall_id}` : "#"} 
      className={cn(
        "flex flex-col group w-full relative", 
        !stall.is_open && "cursor-not-allowed"
      )}
      onClick={(e) => !stall.is_open && e.preventDefault()} // Prevent click if closed
    >
      {/* 1. Image Container */}
      {/* Changed border color to slate-200 (lighter) and added shadow-sm */}
      <div className="w-full aspect-square relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-slate-300">
        
        {/* Image Zoom Effect on Hover */}
        {stall.stall_image ? (
           <img 
            src={stall.stall_image} 
            alt={stall.name} 
            className={cn(
                "w-full h-full object-cover transition-transform duration-500 ease-in-out",
                stall.is_open && "group-hover:scale-105", // Zoom only if open
                !stall.is_open && "grayscale" // Black & white if closed
            )}
            onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
           />
        ) : null}
        
        {/* Fallback Icon */}
        <div className={cn("absolute inset-0 flex items-center justify-center", stall.stall_image ? "hidden" : "flex")}>
            <ImageIcon className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
        </div>

        {/* 
           2. OVERLAYS (Better UX) 
        */}

        {/* Wait Time Badge (Only show if Open) */}
        {stall.is_open && stall.waiting_time > 0 && (
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-slate-700 flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3" />
                {stall.waiting_time} min
            </div>
        )}

        {/* Closed Overlay (Clearer than just opacity) */}
        {!stall.is_open && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-red-600 shadow-sm uppercase tracking-wide">
                    Closed
                </span>
            </div>
        )}
      </div>
      
      {/* 3. Typography Improvements */}
      <div className="mt-3 px-1 text-center">
        <h3 className={cn(
            "text-sm font-semibold leading-tight line-clamp-2 transition-colors",
            stall.is_open ? "text-slate-700 group-hover:text-slate-900" : "text-slate-400"
        )}>
            {stall.name}
        </h3>
      </div>
    </Link>
  );
}