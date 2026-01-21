"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart.store";

export function FloatingCartButton() {
  // 1. Connect to Store
  const cartItems = useCartStore((state) => state.items);
  
  // 2. Calculate Total
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // 3. Auto-hide if empty
  if (totalCartCount === 0) return null;

  return (
    // Fixed Container 
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 py-6 pb-8 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <Link href="/ordering/cart">
        <Button 
            variant="confirm" 
            size="xl" 
            className="w-full text-lg font-semibold shadow-lg shadow-slate-200"
        >
            Go To Cart ({totalCartCount})
        </Button>
      </Link>
    </div>
  );
}