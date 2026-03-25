"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/stores/cart.store";

interface CartItemRowProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function CartItemRow({ item, onIncrease, onDecrease }: CartItemRowProps) {
  return (
    <div className="flex items-start py-6 border-b border-slate-100 last:border-none">
      
      {/* LEFT: Edit Link */}
      <div className="pt-1.5 pr-4 shrink-0">
        <Link 
            href={`/ordering/menu/${item.menuItem.stall_id}/item/${item.menuItem.item_id}?cartId=${item.uniqueId}`}
            className="text-xs font-semibold text-slate-400 underline decoration-slate-300 underline-offset-4 hover:text-slate-600 transition-colors"
        >
            Edit
        </Link>
      </div>

      {/* MIDDLE: Content Info */}
      <div className="flex-1 min-w-0 pr-3">
        
        {/* Stall Name (Big & Bold) */}
        <h3 className="text-xl font-bold text-slate-700 leading-none mb-1">
            {item.stallName || "Unknown Stall"} 
        </h3>
        
        {/* Item Name (Secondary) */}
        <div className="text-base font-medium text-slate-600 mb-2">
            {item.menuItem.name}
        </div>

        {/* Modifiers (Grey Pills) */}
        {item.modifiers.length > 0 && (
            <div className="flex flex-wrap gap-2">
                {item.modifiers.map((mod) => (
                    <span 
                        key={mod.option_id} 
                        className="bg-slate-200/70 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-md"
                    >
                        {mod.name}
                    </span>
                ))}
            </div>
        )}
        
        {/* Optional: Show Notes if they exist */}
        {item.remarks && (
            <p className="text-xs text-slate-400 mt-2 italic">
                &quot;{item.remarks}&quot;
            </p>
        )}
      </div>

      {/* RIGHT: Quantity Controls */}
      <div className="flex items-center gap-3 pt-1 bg-slate-50/50 p-1 rounded-full border border-slate-100">
        
        <button 
            onClick={onDecrease}
            className={`w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center transition-all active:scale-90 shadow-sm
                ${item.quantity === 1 ? 'text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-50'}`}
        >
            {item.quantity === 1 ? (
                <Trash2 className="w-4 h-4" />
            ) : (
                <Minus className="w-4 h-4" />
            )}
        </button>
        
        <span className="text-base font-bold text-slate-800 w-4 text-center">
            {item.quantity}
        </span>
        
        <button 
            onClick={onIncrease}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90 shadow-sm"
        >
            <Plus className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}