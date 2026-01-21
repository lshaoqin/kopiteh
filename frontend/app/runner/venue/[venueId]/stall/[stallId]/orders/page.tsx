"use client";

import { BackButton, AddButton } from "@/components/ui/button";
import { AddOrderPanel } from "@/components/ui/runner/addorderpanel";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderItem, OrderItemStatus  } from "../../../../../../../../types/order";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();
  const venueId = params.venueId;
  const stallId = params.stallId;

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [stall, setStall] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderItemStatus>("INCOMING");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredOrderItems = orderItems.filter(
    (item) => item.status === selectedStatus
  );

  const createOrder = async (data: {
    quantity: string;
    unitPrice: string;
    notes?: string;
    table: string;
  }) => {
    const res = await fetch(`${API_URL}/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        table_id: data.table,
        status: "PENDING",
        total_price: data.unitPrice ? parseFloat(data.unitPrice) * (data.quantity ? parseInt(data.quantity) : 1) : 0,
        created_at: new Date().toISOString(),
        remarks: data.notes,
      }),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json?.message || "Failed to create order");
    }

    return json.payload.data;
  };

  const createOrderItem = async (
    orderId: number,
    data: {
      itemName: string;
      quantity: string;
      unitPrice: string;
    }
  ) => {

    const res = await fetch(`${API_URL}/orderItem/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderId,
        status: "INCOMING",
        quantity: parseInt(data.quantity),
        unit_price: parseFloat(data.unitPrice),
        line_subtotal: parseInt(data.quantity) * parseFloat(data.unitPrice),
      }),
    });
    
    const json = await res.json();
  
    if (!res.ok || !json.success) {
      throw new Error(json?.message || "Failed to create order item");
    }
  
    return json.payload.data;
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch stall details
        const stallRes = await fetch(`${API_URL}/stalls/${stallId}`);
        const stallJson = await stallRes.json();
        if (!stallRes.ok || !stallJson.success) {
          throw new Error(stallJson?.message || "Failed to fetch stall");
        }
        setStall(stallJson.payload.data ?? []);

        // Fetch order items for the stall
        const orderItemsRes = await fetch(`${API_URL}/orderItem/stall/${stallId}`);
        const orderItemsJson = await orderItemsRes.json();
        if (!orderItemsRes.ok || !orderItemsJson.success) {
          throw new Error("Failed to fetch order items");
        }
        setOrderItems(orderItemsJson.payload.data ?? []);
      } catch (err: any) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Unexpected error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
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
          <BackButton href={`/runner/venue/${venueId}/stall/selectstall`} />
        </div>

        {/* Status Filter Row */}
        <div className="flex items-center gap-2 mt-4">
          <AddButton onClick={() => setShowAddOrder(true)} />
          <button 
          onClick={() => setSelectedStatus("INCOMING")}
            className={`px-4 py-1 rounded-lg text-sm font-medium shadow-sm ${
              selectedStatus === "INCOMING"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Incoming
          </button>
          <button 
          onClick={() => setSelectedStatus("PREPARING")}
            className={`px-4 py-1 rounded-lg text-sm font-medium shadow-sm gap-10 ${
              selectedStatus === "PREPARING"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Preparing
          </button>
          <button 
          onClick={() => setSelectedStatus("SERVED")}
            className={`px-4 py-1 rounded-lg text-sm font-medium shadow-sm ${
              selectedStatus === "SERVED"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Served
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {filteredOrderItems.length === 0 && !loading && (
              <p className="text-sm text-gray-500">
                No order item {selectedStatus.toLowerCase()}
              </p>
            )}

            {filteredOrderItems.map((item) => (
              <div
                key={`${item.order_id}-${item.item_id}`}
                className="flex justify-between items-center p-3 rounded-lg border bg-white shadow-sm"
              >
                <div>
                  <p className="font-medium">Order #{item.order_id}</p>
                  <p className="text-sm text-gray-600">
                    Item ID: {item.item_id}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium">x{item.quantity}</p>
                  <p className="text-sm text-gray-600">
                    ${item.line_subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        <div>
        <AddOrderPanel
          open={showAddOrder}
          onClose={() => setShowAddOrder(false)}
          onSubmit={async (data) => {
            console.log("AddOrderPanel data:", data);

            try {
              const order = await createOrder(data);

              await createOrderItem(order.order_id, data);
        
            } catch (err) {
              console.error(err);
              alert("Failed to create order");
            }
          }}
        />
        </div>
    </main>
  )
}
