"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { TextInput } from "../input";
import { Button } from "../button";

 type AddOrderPanelProps = {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: {
        itemName: string;
        quantity: string;
        price: string;
        notes?: string;
        table?: string;
        volunteerName?: string;
    }) => void;
};

function AddOrderPanel({ open, onClose, onSubmit }: AddOrderPanelProps) {
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [notes, setNotes] = useState("");
    const [table, setTable] = useState("");
    const [volunteerName, setVolunteerName] = useState("");

    if (!open) return null;

    const handleSubmit = () => {
        onSubmit?.({
            itemName,
            quantity,
            price,
            notes,
            table,
            volunteerName,
        });
        onClose();
    };

    return (
      <div className="fixed inset-0 bg-white box-border p-5">
    <div className="w-full h-4/5 flex flex-col justify-between mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Add Item</h2>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
          </div>

          <TextInput
            classNameOut={"w-full py-2"}
            classNameIn={"w-full border rounded-lg px-3 py-2"}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Name"
          />

          <div className="flex justify-between">
            <TextInput
              classNameOut={"w-10/21 py-2"}
              classNameIn={"w-full border rounded-lg px-3 py-2"}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
            />
            <TextInput
              classNameOut={"w-10/21 py-2"}
              classNameIn={"w-full border rounded-lg px-3 py-2"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price per unit ($)"
            />
          </div>

          <TextInput
            classNameOut={"w-full py-2"}
            classNameIn={"w-full border rounded-lg px-3 py-2"}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional Notes"
          />

          <div className="pt-2">
            <h3 className="text-lg font-bold mb-1">Volunteer Information</h3>
            <p className="text-base mb-1">Provide the Information of the volunteer who has requested this new order</p>
            <div className="flex justify-between">
              <TextInput
                classNameOut={"w-10/21 py-2"}
                classNameIn={"w-full border rounded-lg px-3 py-2"}
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="Table Number"
              />
              <TextInput
                classNameOut={"w-10/21 py-2"}
                classNameIn={"w-full border rounded-lg px-3 py-2"}
                value={volunteerName}
                onChange={(e) => setVolunteerName(e.target.value)}
                placeholder="Volunteer Name"
              />
            </div>
          </div>
          <div className="w-full py-2">
            <Button
              variant="signin"
              onClick={handleSubmit}
              className="w-full"
            >
              Add Order
            </Button>
          </div>
        </div>
    </div>
  );
}

export { AddOrderPanel };
