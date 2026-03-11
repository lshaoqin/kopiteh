"use client";

import { X, Trash2 } from "lucide-react";
import { useState } from "react";
import { TextInput } from "../input";
import { Button } from "../button";

import { OrderItem, OrderItemModifier } from "../../../../types/order";
import { api } from "@/lib/api";

type EditOrderItemProps = {
  open: boolean;
  onClose: () => void;
  orderItem: OrderItem;
  modifiers?: Array<OrderItemModifier>;
  onOrderItemUpdated?: () => void;
};

function EditOrderItem({ open, onClose, orderItem, modifiers, onOrderItemUpdated }: EditOrderItemProps) {
  const [error, setError] = useState<string | null>(null);

  if (!open) return null; 

  const updateOrderItemStatus = async (order_item_id: number, type: string) => {
    try {
      const response = await api.updateOrderItemStatus(order_item_id, type);
    
      if (!response) {
        throw new Error("Failed to update order item status");
      }
      onOrderItemUpdated?.();
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const revertOrderItemStatus = async (order_item_id: number, type: string) => {
    try {
      const response = await api.revertOrderItemStatus(order_item_id, type);
    
      if (!response) {
        throw new Error("Failed to revert order item status");
      }
      onOrderItemUpdated?.();
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteOrderItem = async (order_item_id: number, type: string) => {
    try {
      await api.deleteOrderItem(order_item_id, type);
      onOrderItemUpdated?.();
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!open) return null;
  
  return (
    <>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9/10 h-2/3 bg-white rounded-lg shadow-lg border flex flex-col pb-4">
        <div className="flex px-3 items-center gap-2 border-b h-14">
          <div className="text-xs text-gray-500">
            <div>Table</div>
            <div className="truncate font-medium text-gray-800">
              {orderItem.table_number}
            </div>
          </div>
        </div>
      
        {/* Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-3 flex flex-col justify-around gap-6">
            {/* Item title */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 items-center flex ">
                  {orderItem.order_item_name}
                  <span className="ml-2 rounded-md text-white px-2 py-0.5 text-sm font-medium bg-green-600">
                    x{orderItem.quantity}
                  </span>
                </h2>
              </div>
            </div>
          
            {/* Price */}
            <div className="border-b border-black">
              <div className="text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Item Price:</span>
                  <span className="font-medium">${Number(orderItem.price).toFixed(2)}</span>
                </div>
                {orderItem.modifiers && orderItem.modifiers.length > 0 && orderItem.modifiers.map((m, index) => (
                  <div key={index} className="flex justify-between text-gray-600">
                    <span className="ml-2">+ {m.name}:</span>
                    <span>${Number(m.price_modifier).toFixed(2)}</span>
                  </div>
                ))}
                {orderItem.modifiers && orderItem.modifiers.length > 0 && (
                  <div className="flex justify-between pt-2 mt-2 border-t font-semibold">
                    <span>Subtotal (per item):</span>
                    <span>${(Number(orderItem.price) + orderItem.modifiers.reduce((sum, m) => sum + Number(m.price_modifier), 0)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 mt-2 border-t font-bold text-base">
                  <span>Total ({orderItem.quantity}x):</span>
                  <span>${((Number(orderItem.price) + (orderItem.modifiers?.reduce((sum, m) => sum + Number(m.price_modifier), 0) || 0)) * Number(orderItem.quantity)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          
            {/* Modifiers */}
            <div className="border-b border-black">
              <div className="mb-2 text-sm font-semibold text-gray-900">
                Modifiers
              </div>
              <div className="">
              {orderItem.modifiers && orderItem.modifiers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {orderItem.modifiers.map((m, index) => (
                  <span
                    key={index}
                    className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                    >
                    {m.name}
                  </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No modifiers</p>
              )}
              </div>
            </div>
          
          
            {/* Notes */}
            <div className="border-b border-black">
              <div className="my-1 text-sm font-semibold text-gray-900">
                Additional Notes
              </div>
              <div>
                {orderItem.remarks ? (
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {orderItem.remarks}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No additional notes</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="p-3 flex flex-col">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              className="h-14"
              onClick={() => onClose()}
            >
              Cancel
            </Button>
            <Button
              className="w-full h-14 bg-green-600"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export { EditOrderItem };
