"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { TextInput } from "./input";
import { Button } from "./button";

import { OrderItem, OrderItemModifier } from "../../../types/order";
import { api } from "@/lib/api";

type OrderItemDetailsProps = {
  open: boolean;
  onClose: () => void;
  orderItem: OrderItem;
  modifiers?: Array<OrderItemModifier>;
  onOrderItemUpdated?: () => void;
};

function OrderItemDetails({ open, onClose, orderItem, modifiers, onOrderItemUpdated }: OrderItemDetailsProps) {

  const [error, setError] = useState<string | null>(null);

  const updateOrderItemStatus = async (order_item_id: number, status: string) => {
    try {
      const response = await api.updateOrderItemStatus(order_item_id, status);
    
      if (!response) {
        throw new Error("Failed to fetch stall");
      }
      onOrderItemUpdated?.();
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!open) return null;
  
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9/10 h-2/3 bg-white rounded-lg shadow-lg border">
        <div className="w-full h-1/10 flex p-3 items-center gap-2 border-b">
          <div className="w-1/10 text-xs text-gray-500">
            <div>Table</div>
            <div className="truncate font-medium text-gray-800">
              {orderItem.table_id}
            </div>
          </div>
          <div className="w-8/10 text-xs text-gray-500">
            <div>Volunteer</div>
            <div className="truncate font-medium text-gray-800">
              Volunteer Name
              {/* Volunteer Name */}
            </div>
          </div>
          
          <button 
            onClick={() => {onClose();}}
            className="p-2 rounded-md hover:bg-gray-100 justify-self-end ml-auto"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      
        <div className="p-3 h-6/10 flex flex-col justify-around border-b">
          {/* Item title */}
          <div className="">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-semibold text-gray-900 items-center flex ">
                {orderItem.order_item_name}
                <span className="ml-2 rounded-md text-white px-2 py-0.5 text-sm font-medium bg-green-600">
                  x{orderItem.quantity}
                </span>
              </h2>
            </div>
          </div>
        
        
          {/* Modifiers */}
          {modifiers && (
          <div className="flex flex-wrap gap-2">
            {modifiers.map((m) => (
            <span
              key={m.order_item_option_id}
              className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
              >
              {m.option_id} / {m.option_name}
            </span>
            ))}
          </div>
          )}
        
        
          {/* Notes */}
          {orderItem.status && (
          <div className="">
            <div className="mb-1 text-sm font-semibold text-gray-900">
              Additional Notes
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {orderItem.remarks}
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          )}
        </div>
      
      
        {/* Actions */}
        <div className="p-3 h-3/10 box-border flex flex-col">
          {orderItem.status === "INCOMING" || orderItem.status === "PREPARING" ? (
          <>
            <Button 
              className="w-full h-1/2 bg-green-600 cursor-pointer"
              onClick={() => updateOrderItemStatus(Number(orderItem.order_item_id), orderItem.type)}
            >
              {orderItem.status === "INCOMING" ? "Mark as Preparing" : "Mark as Served"}
            </Button>
            <div className="h-1/2 mt-3 grid grid-cols-2 gap-3">
              <Button variant="secondary">Delete</Button>
              <Button variant="secondary">Edit</Button>
            </div>
          </>
          ) : null}
        </div>
      </div>
    </>
  );
}

export { OrderItemDetails };
