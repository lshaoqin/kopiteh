"use client";

import { useCartStore } from "@/stores/cart.store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();

  const handlePlaceOrder = async () => {
    alert("Order Placed! (This would call API /order/create)");
    clearCart();
    router.push("/ordering"); // Back to start
  };

  if (items.length === 0) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
            <p className="mb-4">Your cart is empty.</p>
            <Link href="/ordering/stalls">
                <Button>Browse Stalls</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 pb-32">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-slate-100">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Your Orders</h1>
      </div>

      {/* Cart Items List */}
      <div className="p-6 space-y-8">
        {items.map((item) => (
            <div key={item.uniqueId} className="flex gap-4">
                {/* Quantity Badge */}
                <div className="w-10 h-10 border border-slate-300 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500 font-medium text-sm">
                    {item.quantity}x
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{item.menuItem.name}</h3>
                            {/* Stall Name */}
                            <p className="text-sm text-slate-400">Tian Tian Chicken Rice</p>
                        </div>
                        <Link 
                            href={`/ordering/menu/${item.menuItem.stall_id}/item/${item.menuItem.item_id}?cartId=${item.uniqueId}`}
                            className="text-xs text-slate-400 underline decoration-slate-300 underline-offset-4"
                        >
                            Edit Order
                        </Link>
                    </div>

                    {/* Modifiers Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {item.modifiers.map((mod) => (
                            <span key={mod.option_id} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                                {mod.name}
                            </span>
                        ))}
                    </div>
                    
                    {item.notes && (
                        <p className="text-xs text-slate-400 mt-2 italic">"{item.notes}"</p>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-6 pb-10 shadow-lg">
        <div className="flex justify-between items-center mb-4 text-lg font-bold text-slate-800">
            <span>Total</span>
            <span>${totalPrice().toFixed(2)}</span>
        </div>
        <Button 
            onClick={handlePlaceOrder} 
            className="w-full py-6 text-lg font-semibold bg-slate-600 hover:bg-slate-700"
        >
            Place Order
        </Button>
      </div>
    </div>
  );
}