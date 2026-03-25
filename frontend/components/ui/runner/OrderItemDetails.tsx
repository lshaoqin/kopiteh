"use client";

import { X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { TextInput } from "../input";
import { Button } from "../button";

import { OrderItem, OrderItemModifier } from "../../../../types/order";
import { api } from "@/lib/api";

import { EditOrderItem } from "./EditOrderItemPanel";

type OrderItemDetailsProps = {
  open: boolean;
  onClose: () => void;
  orderItem: OrderItem;
  onOrderItemUpdated?: () => void;
};

function OrderItemDetails({ open, onClose, orderItem, onOrderItemUpdated }: OrderItemDetailsProps) {
  const [error, setError] = useState<string | null>(null);
  const [showEditMode, setShowEditMode] = useState(false);

  const [currentItem, setCurrentItem] = useState<OrderItem | null>(orderItem);

  useEffect(() => {
    setCurrentItem(orderItem);
  }, [orderItem]);

  const refreshOrderItem = async () => {
    const updated = await api.getOrderItemsById(orderItem.order_item_id, orderItem.type);
    setCurrentItem(updated);
    onOrderItemUpdated?.();
  };

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
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!open || !currentItem) return null;
  
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9/10 h-2/3 bg-white rounded-lg shadow-lg border flex flex-col pb-4">
        <div className="flex px-3 items-center gap-2 border-b h-14">
          <div className="text-xs text-gray-500 flex justify-between w-full">
            <div className="flex flex-col">
              <span>Table: {currentItem.table_number}</span>
              <span>Volunteer Name: {currentItem.volunteer_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-2 rounded-md text-white text-xs font-medium bg-blue-600">
                {currentItem.type === "CUSTOM" ? "Custom Order" : ""}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => {onClose();}}
            className="p-2 rounded-md hover:bg-gray-100 justify-self-end ml-auto"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      
        {/* Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-3 flex flex-col justify-around gap-6">
            {/* Item title */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 items-center flex ">
                  {currentItem.order_item_name}
                  <span className="ml-2 rounded-md text-white px-2 py-0.5 text-sm font-medium bg-green-600">
                    x{currentItem.quantity}
                  </span>
                </h2>
              </div>
            </div>
          
            {/* Price */}
            <div className="border-b border-black">
              <div className="text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Item Price:</span>
                  <span className="font-medium">${Number(currentItem.price).toFixed(2)}</span>
                </div>
                {currentItem.modifiers && currentItem.modifiers.length > 0 && currentItem.modifiers.map((m, index) => (
                  <div key={index} className="flex justify-between text-gray-600">
                    <span className="ml-2">+ {m.name}:</span>
                    <span>${Number(m.price_modifier).toFixed(2)}</span>
                  </div>
                ))}
                {currentItem.modifiers && currentItem.modifiers.length > 0 && (
                  <div className="flex justify-between pt-2 mt-2 border-t font-semibold">
                    <span>Subtotal (per item):</span>
                    <span>${(Number(currentItem.price) + currentItem.modifiers.reduce((sum, m) => sum + Number(m.price_modifier), 0)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 mt-2 border-t font-bold text-base">
                  <span>Total ({currentItem.quantity}x):</span>
                  <span>${((Number(currentItem.price) + (currentItem.modifiers?.reduce((sum, m) => sum + Number(m.price_modifier), 0) || 0)) * Number(currentItem.quantity)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          
          
            {/* Notes */}
            <div>
              <div className="my-1 text-sm font-semibold text-gray-900">
                Additional Notes
              </div>
              <div>
                {currentItem.remarks ? (
                  <p className="text-sm text-gray-700">
                    {currentItem.remarks}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No additional notes</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 flex flex-col gap-3">
          {currentItem.status === "INCOMING" && (
          <>         
            <div className="grid grid-cols-5 gap-3">
              <Button
                variant="destructive"
                className="col-span-1 h-14"
                onClick={() => deleteOrderItem(Number(currentItem.order_item_id), currentItem.type)}
              >
              <Trash2 />
              </Button> 
              <Button
                variant="secondary"
                className="col-span-2 h-14"
                onClick={() => {
                  updateOrderItemStatus(Number(currentItem.order_item_id), currentItem.type);
                  updateOrderItemStatus(Number(currentItem.order_item_id), currentItem.type);
                }}
              >
                Mark as Served
              </Button>
              <Button
                variant="secondary"
                className="col-span-2 h-14"
                onClick={() => setShowEditMode(true)}
              >
                Edit
              </Button>
            </div>
            <Button
              className="w-full h-14 bg-green-600"
              onClick={() => updateOrderItemStatus(Number(currentItem.order_item_id), currentItem.type)}
            >
              Mark as Preparing
            </Button>
          </>
          )}
            
          {currentItem.status === "PREPARING" && (
          <>
            <div className="grid grid-cols-5 gap-3">
              <Button 
                variant="destructive"
                className="col-span-1 h-14"
                onClick={() => deleteOrderItem(Number(currentItem.order_item_id), currentItem.type)}
              >
                <Trash2 />
              </Button>         
              <Button 
                variant="secondary"
                className="col-span-2 h-14"
                onClick={() => revertOrderItemStatus(Number(currentItem.order_item_id), currentItem.type)}
              >
                Mark as Incoming
              </Button>
              <Button 
                variant="secondary"
                className="col-span-2 h-14"
                onClick={() => setShowEditMode(true)}
              >
                Edit
              </Button>
            </div>
            <Button 
                className="w-full h-14 bg-green-600 cursor-pointer"
                onClick={() => updateOrderItemStatus(Number(currentItem.order_item_id), currentItem.type)}
              >
                Mark as Served
              </Button>
          </>
          )}
          
          {currentItem.status === "SERVED" && (
            <Button 
              variant="secondary"
              className="w-full h-14"
              onClick={() => revertOrderItemStatus(Number(currentItem.order_item_id), currentItem.type)}
            >
              Mark as Preparing
            </Button>
          )}
        </div>
      </div>
      <EditOrderItem
        open={showEditMode}
        onClose={() => setShowEditMode(false)}
        orderItem={currentItem}
        onOrderItemUpdated={refreshOrderItem}
      />
    </>
  );
}

export { OrderItemDetails };
