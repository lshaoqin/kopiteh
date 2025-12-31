"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/formfield";
import { Button } from "@/components/ui/button";

type AdminStallModal = {
  open: boolean;
  title: string;

  labelName: string;
  labelImage: string;

  submitText?: string;

  onClose: () => void;
  onSubmit: (data: { name: string; imageUrl: string }) => void;
};

export function AdminStallModal({
  open,
  title,
  labelName,
  labelImage,
  submitText,
  onClose,
  onSubmit,
}: AdminStallModal) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

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

        <div className="mt-10 w-full flex justify-center">
          <Button
            type="button"
            className={`py-2 rounded-2xl font-bold ${
              name.trim() ? "bg-gray-400 hover:bg-primary2" : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={() => onSubmit({ name, imageUrl })}
            disabled={!name.trim()}
          >
            {submitText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
