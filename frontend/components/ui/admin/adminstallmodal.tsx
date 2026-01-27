"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/formfield";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type AdminStallModal = {
  open: boolean;
  title: string;

  labelName: string;
  labelImage?: string;

  variant?: "stall" | "venue";

  initialName?: string;
  initialImageUrl?: string;
  initialAddress?: string;
  initialDescription?: string;
  initialOpeningHours?: string;

  submitText?: string;
  deleteText?: string;

  onClose: () => void;
  onSubmit: (data: {
    name: string;
    imageUrl?: string;
    address?: string;
    description?: string;
    opening_hours?: string;
  }) => void;
  onDelete?: () => void;
};

export function AdminStallModal({
  open,
  title,
  labelName,
  labelImage,
  variant = "stall",
  submitText,
  deleteText,
  initialName,
  initialImageUrl,
  initialAddress,
  initialDescription,
  initialOpeningHours,
  onClose,
  onSubmit,
  onDelete,
}: AdminStallModal) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isVenue = variant === "venue";

  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName ?? "");
      setImageUrl(initialImageUrl ?? "");
      setError(null);

      if (isVenue) {
        setAddress(initialAddress ?? "");
        setDescription(initialDescription ?? "");
        setOpeningHours(initialOpeningHours ?? "");
      }
    }
  }, [open, initialName, initialImageUrl, isVenue, initialAddress, initialDescription, initialOpeningHours]);


  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-3">
        <FormField
          className="flex flex-col space-y-2 font-semibold"
          classNameOut={`
            p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
            ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
          `}
          classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
          variant="text"
          label={labelName}
          inputProps={{
            value: name,
            placeholder: "Name",
            onChange: (e) => {
              setName(e.target.value);
              setError(null);
            },
          }}
        />

        {labelImage && (
          <FormField
            className="flex flex-col space-y-2 font-semibold"
            classNameOut={`
      p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
      ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
    `}
            classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
            variant="text"
            label={labelImage}
            inputProps={{
              value: imageUrl,
              placeholder: "Image URL",
              onChange: (e) => {
                setImageUrl(e.target.value);
                setError(null);
              },
            }}
          />
        )}
        {isVenue && (
          <div>
            <FormField
              className="flex flex-col space-y-2 font-semibold"
              classNameOut={`
        p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
        ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
      `}
              classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
              variant="text"
              label="Address (optional)"
              inputProps={{
                value: address,
                placeholder: "123 Orchard Rd",
                onChange: (e) => setAddress(e.target.value),
              }}
            />

            <FormField
              className="flex flex-col space-y-2 font-semibold"
              classNameOut={`
        p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
        ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
      `}
              classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
              variant="text"
              label="Description (optional)"
              inputProps={{
                value: description,
                placeholder: "A cosy food court...",
                onChange: (e) => setDescription(e.target.value),
              }}
            />

            <FormField
              className="flex flex-col space-y-2 font-semibold"
              classNameOut={`
        p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
        ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
      `}
              classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
              variant="text"
              label="Opening Hours (optional)"
              inputProps={{
                value: openingHours,
                placeholder: "10am – 10pm",
                onChange: (e) => setOpeningHours(e.target.value),
              }}
            />
          </div>
        )}


        <div className={`mt-10 w-full flex justify-center ${deleteText ? "space-x-5" : ""
          }`}>
          {deleteText ? (
            <Button
              variant="deletestall"
              disabled={!name.trim()}
              onClick={() => onDelete?.()}
            >
              {deleteText}
            </Button>
          ) : (
            <div></div>
          )}
          <Button
            variant="updatestall"
            disabled={!name.trim()}
            onClick={() =>
              onSubmit({
                name,
                imageUrl,
                ...(isVenue
                  ? {
                    address: address.trim() || undefined,
                    description: description.trim() || undefined,
                    opening_hours: openingHours.trim() || undefined,
                  }
                  : {}),
              })
            }
          >
            {submitText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
