"use client";

import Link from "next/link";
import { Plus, Image as ImageIcon } from "lucide-react";
import { MenuItem } from "@/../types"; 
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

interface MenuCardProps {
  item: MenuItem;
  href: string;
  rank?: number; // Temporary popularity index
  quantity?: number;
}

function QuantityBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm z-10 ring-2 ring-white">
      {count}
    </div>
  );
}

// 1. POPULAR CARD
export function PopularMenuCard({ item, href, rank, quantity = 0 }: MenuCardProps) {
  return (
    <Link 
      href={href}
      className="flex-shrink-0 w-28 flex flex-col items-center group cursor-pointer relative"
    >
      <div className="w-28 h-28 bg-white rounded-xl border-2 border-slate-500 flex items-center justify-center overflow-hidden mb-2 relative transition-colors group-hover:bg-slate-50">
        {item.item_image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.item_image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
            <ImageIcon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
        )}
        
        {/* Badge overlaps the image for popular items */}
        {quantity > 0 && (
            <div className="absolute top-2 right-2">
                <QuantityBadge count={quantity} />
            </div>
        )}
      </div>
      
      <div className="px-1 text-center w-full">
        <p className="text-xs font-semibold text-slate-600 truncate">
          {rank ? `#${rank}: ` : ""}{item.name}
        </p>
      </div>
    </Link>
  );
}

// 2. STANDARD LIST CARD (Matches your screenshot)
export function StandardMenuCard({ item, href, quantity = 0 }: MenuCardProps) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-between py-4 border-b border-slate-100 last:border-none active:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
          {/* Image */}
          <div className="w-16 h-16 bg-white rounded-xl flex-shrink-0 flex items-center justify-center border-2 border-slate-500 overflow-hidden">
              {item.item_image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.item_image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
              )}
          </div>
          
          {/* Text */}
          <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-slate-700 truncate text-base">{item.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {item.description || "No description"}
              </p>
          </div>
      </div>

      {/* Button Container */}
      <div className="relative ml-3">
          
          {/* The Badge (Overlaps top-right) */}
          <QuantityBadge count={quantity} />

          {/* The Plus Button */}
          <div className={cn(
              buttonVariants({ variant: "circle", size: "icon-sm" }), 
              "flex cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          )}>
              <Plus className="w-4 h-4" />
          </div>
      </div>
    </Link>
  );
}