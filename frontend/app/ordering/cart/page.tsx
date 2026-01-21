"use client";

import { useCartStore } from "@/stores/cart.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton"; 
import { CartItemRow } from "@/components/ui/CartItemRow";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, clearCart } = useCartStore();

  const handlePlaceOrder = async () => {
    // TODO: Integrate API order creation here
    alert("Order Placed Successfully!");
    clearCart();
    router.push("/ordering/stalls"); // Back to start or Order Status page
  };

  // Handle Quantity Logic
  const handleIncrease = (uniqueId: string) => {
    updateQuantity(uniqueId, 1);
  };

  const handleDecrease = (uniqueId: string) => {
    updateQuantity(uniqueId, -1);
  };

  // --- EMPTY STATE ---
  if (items.length === 0) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-4xl">
                🛒
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <div className="mt-6">
                <BackButton href="/ordering/stalls" />
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 pb-32">
      
      {/* Header - Centered Title */}
      <div className="pt-8 pb-4 px-6 mb-2 relative flex items-center justify-center">
        <div className="absolute left-6">
            <BackButton href="/ordering/stalls" />
        </div>
        <h1 className="text-xl font-bold text-slate-700">Your Orders</h1>
      </div>

      {/* Cart Items List */}
      <div className="px-6 space-y-2">
        {items.map((item) => (
            <CartItemRow 
                key={item.uniqueId} 
                item={item} 
                onIncrease={() => handleIncrease(item.uniqueId)}
                onDecrease={() => handleDecrease(item.uniqueId)}
            />
        ))}
      </div>

      {/* Footer - Place Order Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white px-6 py-6 pb-10 z-20">
        <Button 
            onClick={handlePlaceOrder} 
            variant="confirm" 
            size="xl"
            className="w-full text-lg shadow-none bg-slate-600 hover:bg-slate-700"
        >
            Place Order
        </Button>
      </div>
    </div>
  );
}