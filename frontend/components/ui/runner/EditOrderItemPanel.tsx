"use client";

import { X, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { TextInput } from "../input";
import { Button } from "../button";

import { OrderItem, OrderItemModifier } from "../../../../types/order";
import { api } from "@/lib/api";

type EditOrderItemProps = {
  open: boolean;
  onClose: () => void;
  orderItem: OrderItem;
  onOrderItemUpdated: () => void;
};

function EditOrderItem({ open, onClose, orderItem, onOrderItemUpdated }: EditOrderItemProps) {
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(orderItem.order_item_name);
  const [quantity, setQuantity] = useState(orderItem.quantity);
  const [selectedModifiers, setSelectedModifiers] = useState<OrderItemModifier[]>(
    orderItem.modifiers || []
  );
  const [notes, setNotes] = useState(orderItem.remarks || "");

  if (!open) return null; 

  const saveChanges = async () => {
    let updateData;
    if (orderItem.type === "CUSTOM") {
      updateData = {
        order_item_name: name,
        quantity,
        remarks: notes,
      };
    } else {
      updateData = {
        quantity,
        remarks: notes,
        modifiers: selectedModifiers,
      };
    }
    try {
      await api.updateOrderItem(orderItem.order_item_id, orderItem.type, updateData);
      onOrderItemUpdated();
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
          <div className="w-full text-xs text-gray-500 border-yellow-500 border-2 rounded-md px-2 py-1 flex items-center gap-2 bg-yellow-50">
            <Pencil/>
            <p>Editing Mode</p>
          </div>
        </div>
      
        {/* Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-3 flex flex-col justify-around gap-6">
            {/* Item title */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 items-center flex ">
                  {orderItem.type === "CUSTOM" ? (
                    <TextInput
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        classNameOut="w-1/2 border-gray-300"
                        classNameIn="w-full text-2xl font-semibold border-2 rounded-md px-2 border-gray-800 focus:border-green-600"
                    />
                    ) : ( orderItem.order_item_name )
                  }
                  <div className="flex items-center ml-3 border rounded-md text-lg">
                    <button
                      className="px-2"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>

                    <span className="px-3">{quantity}</span>

                    <button
                      className="px-2"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
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
                <div className="gap-2 flex flex-col border-t pt-2 mt-2">
                  <span className="text-sm italic text-gray-900">
                    Modifiers (tap to toggle)
                  </span>
                  {orderItem.modifiers?.map((m) => {
                    const active = selectedModifiers.some(
                      (sm) => sm.option_id === m.option_id
                    );
                    return (
                      <button
                        key={m.option_id}
                        onClick={() => {
                          if (active) {
                            setSelectedModifiers((prev) =>
                              prev.filter((x) => x.option_id !== m.option_id)
                            );
                          } else {
                            setSelectedModifiers((prev) => [...prev, m]);
                          }
                        }}
                        className={`
                          flex justify-between w-full text-left px-2 py-1 rounded-md transition
                          ${active 
                            ? "border-1 bg-green-50 hover:bg-green-100 cursor-pointer" 
                            : "border-1 bg-gray-50 hover:bg-gray-100 cursor-pointer"}
                        `}
                      >
                        <span
                          className={`ml-2 ${
                            !active ? "line-through text-gray-400" : ""
                          }`}
                        >
                          + {m.name}:
                        </span>
                        <span
                          className={`${!active ? "line-through text-gray-400" : ""}`}
                        >
                          ${Number(m.price_modifier).toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedModifiers.length > 0 && (
                  <div className="flex justify-between pt-2 mt-2 border-t font-semibold">
                    <span>Subtotal (per item):</span>
                    <span>
                      $
                      {(
                        Number(orderItem.price) +
                        selectedModifiers.reduce(
                          (sum, m) => sum + Number(m.price_modifier),
                          0
                        )
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 mt-2 border-t font-bold text-base">
                  <span>Total ({orderItem.quantity}x):</span>
                  <span>
                    $
                    {(
                      (Number(orderItem.price) +
                        selectedModifiers.reduce(
                          (sum, m) => sum + Number(m.price_modifier),
                          0
                        )) *
                      Number(quantity)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          
          
            {/* Notes */}
            <div className="border-b border-black">
              <div className="my-1 text-sm font-semibold text-gray-900">
                Additional Notes
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                // make textarea fixed height and not resizable
                className="w-full rounded-md p-2 text-sm text-gray-700 border-2 rounded-md px-2 border-gray-800 focus:border-green-600 resize-none h-24"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="p-3 flex flex-col">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              className="h-14"
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              className="w-full h-14 bg-green-600"
              onClick={saveChanges}
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
