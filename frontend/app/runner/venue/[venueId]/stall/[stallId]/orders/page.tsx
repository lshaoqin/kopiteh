"use client";

import { api } from "@/lib/api";
import { BackButton, AddButton } from "@/components/ui/button";
import { AddOrderPanel } from "@/components/ui/runner/addorderpanel";
import { OrderItemDetails } from "@/components/ui/OrderItemDetails";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { OrderItem, OrderItemStatus  } from "../../../../../../../../types/order";
import { Stall } from "../../../../../../../../types/stall";
import { useWebSocket } from "@/context/WebSocketContext";

export default function Home() {
  const params = useParams();
  const venueId = params.venueId;
  const stallId = params.stallId[0];
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected, joinStall, leaveStall } = useWebSocket();

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [stall, setStall] = useState<Stall | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderItemStatus>("INCOMING");

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [showOrderItemDetails, setShowOrderItemDetails] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);
  

  const filteredOrderItems = orderItems.filter(
    (item) => item.status === selectedStatus
  );

  // -- FETCHING STALL AND ORDER ITEMS --
  const getStall = async () => {
    try{
      const response = await api.getStallById(Number(stallId));

      if (!response) {
        throw new Error("Failed to fetch stall");
      }
      setStall(response);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getOrderItemsByStall = async () => {
    try {
      const response = await api.getOrderItemsByStall(Number(stallId));

      if (!response) {
        throw new Error("Failed to fetch order items");
      }
      console.log("Fetched order items:", response);
      setOrderItems(response);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // -- CREATING ORDER AND ORDER ITEMS --
  // Handle WebSocket events for real-time updates
  const handleOrderItemCreated = useCallback((data: { orderItem: OrderItem }) => {
    console.log('New order item received:', data.orderItem);
    setOrderItems((prev) => [...prev, data.orderItem]);
  }, []);

  const handleOrderItemUpdated = useCallback((data: { orderItem: OrderItem }) => {
    console.log('Order item updated:', data.orderItem);
    setOrderItems((prev) =>
      prev.map((item) =>
        item.order_item_id === data.orderItem.order_item_id ? data.orderItem : item
      )
    );
  }, []);

  // Join stall room and set up WebSocket listeners
  useEffect(() => {
    if (!socket || !isConnected || !stallId) return;

    const numericStallId = Number(stallId);
    joinStall(numericStallId);

    socket.on('order_item_created', handleOrderItemCreated);
    socket.on('order_item_updated', handleOrderItemUpdated);

    return () => {
      socket.off('order_item_created', handleOrderItemCreated);
      socket.off('order_item_updated', handleOrderItemUpdated);
      leaveStall(numericStallId);
    };
  }, [socket, isConnected, stallId, joinStall, leaveStall, handleOrderItemCreated, handleOrderItemUpdated]);


  const createOrderItem = async (
    data: {
      itemName: string;
      quantity: string;
      unitPrice: string;
      notes?: string;
      table: string;
    }
  ) => {
    try {
      const payload = {
        stall_id: Number(stallId),
        table_id: Number(data.table),
        order_item_name: data.itemName,
        status: "INCOMING" as const,
        quantity: Number(data.quantity),
        price: Number(data.unitPrice),
        remarks: data.notes || "",
      };
      const json = await api.createCustomOrder(payload);

      console.log("Create Order Item response:", json);
    
      if (!json) {
        throw new Error("Failed to create order item");
      } else {
        getOrderItemsByStall();
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    getStall();
    getOrderItemsByStall();
    setLoading(false);
  }, [stallId]);


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
            {/* Sort the order items by created_at in descending order */}
            {filteredOrderItems
              .slice()
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((item, index) => (
              <div key={index}
                className="flex h-16 justify-between items-center p-3 rounded-lg border bg-white shadow-sm cursor-pointer"
                onClick={
                  () => {
                    setSelectedOrderItem(item);
                    setShowOrderItemDetails(true);
                  }
                }
              >
                <div>
                  <p className="font-medium">
                    {item.order_item_name} <span className="bg-green-600 rounded px-1 text-white text-xs font-semibold">x{item.quantity}</span>
                  </p>
                  {item.modifiers && item.modifiers.length > 0 && (
                    console.log("Modifiers:", item.modifiers),
                    <p className="text-sm text-gray-600">
                      {item.modifiers.map(modifier => modifier.name).join(", ")}
                    </p>
                  )}
                  {/* Display modifiers here in the future */}
                </div>

                <div className="text-right">
                  <p className="font-medium">Table {item.table_id}</p>
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
              await createOrderItem(data);
            } catch (err) {
              console.error(err);
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        />
        </div>
        <div>
        <OrderItemDetails
          open={showOrderItemDetails}
          orderItem={selectedOrderItem}
          onClose={() => {
            setShowOrderItemDetails(false);
            setSelectedOrderItem(null);
            getOrderItemsByStall();
          }}
        />
        </div>
    </main>
  )
}
