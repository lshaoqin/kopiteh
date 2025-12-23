"use client";

import { BackButton } from "@/components/ui/backbutton"
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderItem } from "../../../../../../../../types/order";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();
  const venueId = params.stallId;
  const stallId = params.stallId;

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [stall, setStall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch stall details
        const stallRes = await fetch(`${API_URL}/stalls/${stallId}`);
        if (!stallRes.ok) throw new Error("Failed to fetch stall");
        const stallJson = await stallRes.json();
        if (!stallJson.success) throw new Error("Failed to fetch stall");
        setStall(stallJson.payload.data);

        // Fetch order items for the stall
        const orderItemsRes = await fetch(`${API_URL}/orderitems/stall/${stallId}`);
        if (!orderItemsRes.ok) throw new Error("Failed to fetch order items");

        const orderItemsJson = await orderItemsRes.json();
        if (!orderItemsJson.success) {
          setOrderItems([]);
          return;
        }
        setOrderItems(orderItemsJson.payload.data ?? []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [API_URL, stallId]);


  return (
    <main className="p-2">
      <div>
        <div>
          <h1 className="text-3xl font-bold">
            {stall?.name}
          </h1>
          <BackButton href={`/runner/${venueId}/selectstall`} />
        </div>

        {loading && <p>Loading...</p>}

        {/* Status Filter Row */}
        <div className="flex items-center gap-2 mt-4">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-xl font-medium">
            +
          </button>
          <button className="px-4 py-1 rounded-lg bg-green-600 text-white text-sm font-medium shadow-sm">
            Incoming
          </button>
          <button className="px-4 py-1 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium">
            Preparing
          </button>
          <button className="px-4 py-1 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium">
            Served
          </button>
        </div>
      </div>
    </main>
  )
}
