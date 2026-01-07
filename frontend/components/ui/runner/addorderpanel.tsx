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
    unitPrice: string;
    notes?: string;
    table: string;
    volunteerName?: string;
  }) => void;
};

function AddOrderPanel({ open, onClose, onSubmit }: AddOrderPanelProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [table, setTable] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!open) return null;

  //input validations
  const isValidQuantity = (value: string) => {
    return /^\d+$/.test(value) && Number(value) > 0;
  };
  const isValidPrice = (value: string) => {
    return /^\d+(\.\d{1,2})?$/.test(value);
  };
  const isValidTable = (value: string) => {
    return /^\d+$/.test(value);
  };

  const validateForm = (): string | null => {
    const rules: Array<{ valid: boolean; message: string }> = [
      { valid: itemName.trim() !== "", message: "Item name required" },
      { valid: quantity.trim() !== "", message: "Quantity required" },
      { valid: unitPrice.trim() !== "", message: "Unit price required" },
      { valid: table.trim() !== "", message: "Table number required" },
  
      { valid: isValidQuantity(quantity), message: "Quantity must be a number" },
      {
        valid: isValidPrice(unitPrice),
        message: "Unit price must be a valid decimal (max 2 dp)",
      },
      { valid: isValidTable(table), message: "Table number must be a number" },
    ];
  
    const failedRule = rules.find((rule) => !rule.valid);
    return failedRule ? failedRule.message : null;
  };

  const handleSubmit = () => {
    const error = validateForm();

    if (error) {
      setErrorMessage(error);
      return;
    }

    onSubmit?.({
      itemName,
      quantity,
      unitPrice,
      notes,
      table,
      volunteerName,
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setItemName("");
    setQuantity("");
    setUnitPrice("");
    setNotes("");
    setTable("");
    setVolunteerName("");
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 bg-white box-border p-5 overflow-y-auto">
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Add Item</h2>
            <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
        </div>
        <div className="w-full py-2">
          <p className="text-sm font-medium">Item Name*</p>
          <TextInput
            classNameOut={"w-full py-2"}
            classNameIn={"w-full border-2 border-black rounded-lg px-3 py-2"}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>

        <div className="flex justify-between">
          <div className="w-10/21 py-2">
            <p className="text-sm font-medium">Quantity*</p>
            <TextInput
              classNameOut={"w-full py-2"}
              classNameIn={"w-full border-2 border-black rounded-lg px-3 py-2"}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="w-10/21 py-2">
            <p className="text-sm font-medium">Unit Price ($)*</p>
            <TextInput
              classNameOut={"w-full py-2"}
              classNameIn={"w-full border-2 border-black rounded-lg px-3 py-2"}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>
        </div>
        
        <div>
        <p className="text-sm font-medium">Additional Notes</p>
          <TextInput
              classNameOut={"w-full py-2"}
              classNameIn={"w-full border-2 border-black rounded-lg px-3 py-2"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        

        <div className="pt-2">
          <h3 className="text-lg font-bold mb-1">Volunteer Information</h3>
          <p className="text-base mb-1">Provide the Information of the volunteer who has requested this new order</p>
          <div className="flex justify-between">
            <div className="w-10/21 py-2">
              <p className="text-sm font-medium">Table Number*</p>
              <TextInput
                classNameOut={"w-full py-2"}
                classNameIn={"w-full border-2 border-black rounded-lg px-3 py-2"}
                value={table}
                onChange={(e) => setTable(e.target.value)}
              />
            </div>
              
            <div className="w-10/21 py-2">
              <p className="text-sm font-medium">Volunteer Name</p>
              <TextInput
                classNameOut={"w-full py-2"}
                classNameIn={"w-full border-2 border-black rounded-lg px-3 py-2"}
                value={volunteerName}
                onChange={(e) => setVolunteerName(e.target.value)}
              />
            </div>
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
        <div className="text-red-500 text-sm text-center font-bold">
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export { AddOrderPanel };
