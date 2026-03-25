"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import { BackButton } from "@/components/ui/BackButton";
import { api } from "@/lib/api";
import { io } from "socket.io-client";
import { Clock, CheckCircle2, Utensils, AlertCircle } from "lucide-react";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");

export default function OrderStatusPage() {
  const { tableId } = useCartStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableId) return;

    // 1. Initial Data Fetch
    const fetchOrders = async () => {
        try {
            const data = await api.getOrdersByTable(tableId);
            setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchOrders();

    // 2. WebSocket Implementation
    // Assume userId 1 (Guest) for connection as per backend logic
    socket.emit("join_user", 1); 

    socket.on("order_status_updated", (data) => {
      // data format: { orderId, status }
      setOrders(prev => prev.map(order => 
        order.order_id === data.orderId ? { ...order, status: data.status } : order
      ));
    });

    return () => {
      socket.off("order_status_updated");
    };
  }, [tableId]);

  if (loading) return <div className="p-10 text-center">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        
        <header className="flex items-center gap-4">
          <BackButton href="/ordering/stalls" />
          <h1 className="text-2xl font-bold text-slate-800">Track My Orders</h1>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
            <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No orders found for Table {tableId}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.sort((a,b) => {
                // Handle "CUSTOM-X" IDs by extracting the numeric part if necessary, 
                // or just simple string comparison for sorting
                return String(b.order_id).localeCompare(String(a.order_id), undefined, {numeric: true});
            }).map((order) => (
              <div key={order.order_id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden relative">
                
                <div className={`absolute top-0 left-0 w-2 h-full ${getStatusColor(order.status)}`} />

                <div className="flex justify-between items-start mb-6 ml-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Order #{order.order_id}</h3>
                    <p className="text-xs text-slate-400">Placed at {new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${getStatusBg(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                <div className="space-y-4 ml-2">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="border-b border-slate-50 pb-3 last:border-none">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <div className="flex gap-3">
                          <span className="font-bold text-slate-400">{item.quantity}x</span>
                          <span className="text-slate-700 font-medium">{item.name || item.order_item_name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </div>

                      {/* Display Modifiers */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 ml-8 mt-1">
                          {item.modifiers.map((mod: any, mIdx: number) => (
                            <span key={mIdx} className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md">
                              + {mod.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Display Remarks/Notes */}
                      {item.remarks && (
                        <p className="text-[11px] text-slate-400 italic ml-8 mt-1">
                          Note: {item.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center ml-2">
                   <span className="text-sm font-bold text-slate-400">Total</span>
                   <span className="text-xl font-black text-slate-800">${Number(order.total_price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers for UI state
function getStatusColor(status: string) {
    switch(status.toLowerCase()) {
        case 'pending': return 'bg-slate-300';
        case 'preparing': return 'bg-blue-500';
        case 'ready': return 'bg-green-500';
        default: return 'bg-slate-200';
    }
}

function getStatusBg(status: string) {
    switch(status.toLowerCase()) {
        case 'preparing': return 'bg-blue-50 text-blue-600 animate-pulse';
        case 'ready': return 'bg-green-50 text-green-600 border border-green-100 shadow-sm';
        default: return 'bg-slate-50 text-slate-500';
    }
}

function getStatusIcon(status: string) {
    switch(status.toLowerCase()) {
        case 'pending': return <Clock size={14} />;
        case 'preparing': return <Utensils size={14} />;
        case 'ready': return <CheckCircle2 size={14} />;
        default: return null;
    }
}