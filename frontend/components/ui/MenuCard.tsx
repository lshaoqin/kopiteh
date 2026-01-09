"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import { MenuItem } from "@/../types"; 

interface MenuCardProps {
  item: MenuItem;
  href: string;
  rank?: number; // Temporary popularity index
}

// 1. POPULAR CARD
export function PopularMenuCard({ item, href, rank }: MenuCardProps) {
    const [imgError, setImgError] = useState(false);
  
  return (
    <Link 
      href={href}
      // Mobile: w-28, Desktop: w-44
      className="flex-shrink-0 w-28 md:w-44 flex flex-col items-center group cursor-pointer"
    >
      {/* Container */}
      <div className="w-full aspect-square bg-white rounded-2xl border-2 border-slate-500 flex items-center justify-center overflow-hidden mb-3 relative transition-colors group-hover:bg-slate-50">
        
        {item.image_url && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)} // If broken, switch to icon
            />
        ) : (
            <ImageIcon className="w-8 h-8 md:w-12 md:h-12 text-slate-300" strokeWidth={1.5} />
        )}

      </div>
      
      {/* Text */}
      <div className="px-1 text-center w-full">
        <p className="text-xs md:text-sm font-bold text-slate-600 truncate">
          {rank ? `#${rank}: ` : ""}{item.name}
        </p>
      </div>
    </Link>
  );
}

// 2. STANDARD LIST CARD 
export function StandardMenuCard({ item, href }: MenuCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link 
      href={href}
      className="flex items-center justify-between py-4 border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors group px-2 rounded-xl"
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
          {/* Image Container: Mobile w-16, Desktop w-24 */}
          <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-xl flex-shrink-0 flex items-center justify-center border-2 border-slate-500 overflow-hidden">
              {item.image_url && !imgError ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    onError={() => setImgError(true)}
                  />
              ) : (
                  <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-slate-300" strokeWidth={1.5} />
              )}
          </div>
          
          {/* Item Info */}
          <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-slate-700 truncate text-base md:text-lg">{item.name}</h3>
              <p className="text-xs md:text-sm text-slate-500 line-clamp-1 mt-1">
                {item.description || "No description"}
              </p>
              <p className="text-sm md:text-base font-semibold text-slate-800 mt-2">
                ${Number(item.price).toFixed(2)}
              </p>
          </div>
      </div>

      {/* Circular Plus Button */}
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 ml-4 shrink-0 group-hover:bg-slate-200 group-hover:text-slate-700 transition-all">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
      </div>
    </Link>
  );
}