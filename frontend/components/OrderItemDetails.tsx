"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { TextInput } from "../input";
import { Button } from "../button";

import { OrderItem, OrderItemModifier } from "../../types/order";

type OrderItemDetailsProps = {
  open: boolean;
  onClose: () => void;
  orderItem: OrderItem;
  modifiers?: Array<OrderItemModifier>;
};

function OrderItemDetails({ open, onClose, orderItem, modifiers }: OrderItemDetailsProps) {

  if (!open) return null;



  return (
    <>
    <div className="flex-1 px-3 text-xs text-gray-500">
      <div>Volunteer</div>
        <div className="truncate font-medium text-gray-800">
          {orderItem.order_id ?? "—"}
        </div>
      </div>
      
      <button 
        onClick={() => {onClose();}}
        className="p-2 rounded-md hover:bg-gray-100"
      >
        <X className="h-5 w-5" />
      </button>
    
    
    {/* Item title */}
    <div className="px-4 pt-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
        {orderItem.order_item_id}
        {orderItem.quantity > 1 && (
          <span className="ml-2 rounded-md bg-green-100 px-2 py-0.5 text-sm font-medium text-green-700">
            x{orderItem.quantity}
          </span>
        )}
      </h2>
      </div>
    </div>
    
    
    {/* Modifiers */}
    {modifiers.length > 0 && (
    <div className="px-4 pt-3 flex flex-wrap gap-2">
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
    <div className="px-4 pt-4">
    <div className="mb-1 text-sm font-semibold text-gray-900">
    Additional Notes
    </div>
    <p className="text-sm text-gray-700 whitespace-pre-line">
    {orderItem.status}
    </p>
    </div>
    )}
    
    
    {/* Actions */}
    <div className="px-4 pt-5 pb-4">
    <Button className="w-full">Mark as preparing</Button>
    
    
    <div className="mt-3 grid grid-cols-2 gap-3">
    <Button variant="secondary">Delete</Button>
    <Button variant="secondary">Edit</Button>
    </div>
    </div>
    </>
  );
}

export { OrderItemDetails };
