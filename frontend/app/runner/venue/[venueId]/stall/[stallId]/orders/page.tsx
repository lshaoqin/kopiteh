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
  
  // Swipe state
  const [swipeState, setSwipeState] = useState<{ [key: number]: { x: number; startX: number; isSwiping: boolean } }>({});
  

  const filteredOrderItems = orderItems.filter(
    (item) => item.status === selectedStatus
  );

  // -- FETCHING STALL AND ORDER ITEMS --
  const getStall = useCallback(async () => {
    try{
      const response = await api.getStallById(Number(stallId));

      if (!response) {
        throw new Error("Failed to fetch stall");
      }
      setStall(response);
    } catch (error: any) {
      setError(error.message);
    }
  }, [stallId]);

  const getOrderItemsByStall = useCallback(async () => {
    try {
      const response = await api.getOrderItemsByStall(Number(stallId));

      if (!response) {
        throw new Error("Failed to fetch order items");
      }
      setOrderItems(response);
    } catch (error: any) {
      setError(error.message);
    }
  }, [stallId]);

  // -- CREATING ORDER AND ORDER ITEMS --
  // Handle WebSocket events for real-time updates
  const handleOrderItemCreated = useCallback((data: { orderItem: OrderItem }) => {
    setOrderItems((prev) => [...prev, data.orderItem]);
  }, []);

  const handleOrderItemUpdated = useCallback((data: { orderItem: OrderItem }) => {
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

      if (!json) {
        throw new Error("Failed to create order item");
      } else {
        getOrderItemsByStall();
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Update order item status
  const updateOrderItemStatus = async (orderItemId: number, type: "STANDARD" | "CUSTOM") => {
    try {
      await api.updateOrderItemStatus(orderItemId, type);
      // The WebSocket will handle the state update
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent, orderItemId: number) => {
    const touch = e.touches[0];
    setSwipeState(prev => ({
      ...prev,
      [orderItemId]: {
        x: 0,
        startX: touch.clientX,
        isSwiping: true
      }
    }));
  };

  const handleTouchMove = (e: React.TouchEvent, orderItemId: number) => {
    const state = swipeState[orderItemId];
    if (!state?.isSwiping) return;

    const touch = e.touches[0];
    const diff = touch.clientX - state.startX;
    
    // Only allow right swipe (positive diff)
    if (diff > 0) {
      setSwipeState(prev => ({
        ...prev,
        [orderItemId]: {
          ...state,
          x: Math.min(diff, 150) // Cap at 150px
        }
      }));
    }
  };

  const handleTouchEnd = async (orderItemId: number, type: "STANDARD" | "CUSTOM") => {
    const state = swipeState[orderItemId];
    if (!state) return;

    // If swiped more than 100px, trigger status update
    if (state.x > 100) {
      await updateOrderItemStatus(orderItemId, type);
    }

    // Reset swipe state
    setSwipeState(prev => {
      const newState = { ...prev };
      delete newState[orderItemId];
      return newState;
    });
  };

  useEffect(() => {
    setLoading(true);
    getStall();
    getOrderItemsByStall();
    setLoading(false);
  }, [stallId, getStall, getOrderItemsByStall]);


  return (
    <main className="p-2 px-4">
      <div>
        <div>
          <BackButton href={`/runner/venue/${venueId}/stall/selectstall`} />
          <h1 className="text-2xl font-bold">
            {stall?.name}
          </h1>
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
              .map((item, index) => {
                const swipe = swipeState[item.order_item_id] || { x: 0, isSwiping: false };
                const opacity = 1 - (swipe.x / 150) * 0.3;
                
                return (
              <div 
                key={index}
                className="relative overflow-hidden"
              >
                {/* Background indicator */}
                {swipe.x > 0 && (
                  <div 
                    className="absolute inset-0 bg-green-600 flex items-center px-4 rounded-lg"
                    style={{ opacity: Math.min(swipe.x / 100, 1) }}
                  >
                    <span className="text-white font-semibold">
                      {swipe.x > 100 ? '✓ Release to update' : 'Swipe to next status →'}
                    </span>
                  </div>
                )}
                
                {/* Card */}
                <div
                  className="flex h-16 justify-between items-center p-3 rounded-lg border bg-white shadow-sm cursor-pointer relative"
                  style={{
                    transform: `translateX(${swipe.x}px)`,
                    transition: swipe.isSwiping ? 'none' : 'transform 0.3s ease-out',
                    opacity
                  }}
                  onTouchStart={(e) => handleTouchStart(e, item.order_item_id)}
                  onTouchMove={(e) => handleTouchMove(e, item.order_item_id)}
                  onTouchEnd={() => handleTouchEnd(item.order_item_id, item.type)}
                  onClick={
                    () => {
                      if (!swipe.isSwiping) {
                        setSelectedOrderItem(item);
                        setShowOrderItemDetails(true);
                      }
                    }
                  }
                >
                <div>
                  <p className="font-medium">
                    {item.order_item_name} <span className="bg-green-600 rounded px-1 text-white text-xs font-semibold">x{item.quantity}</span>
                  </p>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {item.modifiers.map(modifier => modifier.name).join(", ")}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-medium">Table {item.table_number}</p>
                </div>
              </div>
              </div>
            )})}
          </div>
        )}
        </div>
        <div>
        <AddOrderPanel
          open={showAddOrder}
          onClose={() => setShowAddOrder(false)}
          onSubmit={async (data) => {
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
