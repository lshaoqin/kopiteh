"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/formfield";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRef } from "react";

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { accessToken } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const uploadSelectedImage = async (file: File) => {
    if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

    const form = new FormData();
    form.append("image", file);
    form.append("folder", isVenue ? "venues" : "stalls");

    const res = await fetch(`${API_URL}/upload/single`, {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: form,
    });

    const json = await res.json().catch(() => null);

    if (!json) {
      throw new Error(`Upload failed (HTTP ${res.status})`);
    }

    if (!res.ok || json?.success === false) {
      throw new Error(json?.payload?.message ?? `Upload failed (HTTP ${res.status})`);
    }

    const imageUrl = json?.payload?.data?.imageUrl as string | undefined;

    if (!imageUrl) {
      throw new Error("Upload succeeded but no imageUrl returned");
    }

    return imageUrl;
  };


  useEffect(() => {
    if (!open) {
      setIsUploaded(false);
      return;
    }


    setName(initialName ?? "");
    setImageUrl(initialImageUrl ?? "");
    setError(null);
    setUploadError(null);

    if (isVenue) {
      setAddress(initialAddress ?? "");
      setDescription(initialDescription ?? "");
      setOpeningHours(initialOpeningHours ?? "");
    } else {
      setAddress("");
      setDescription("");
      setOpeningHours("");
    }

    if (initialImageUrl) {
      setIsUploaded(true);
    }
  }, [
    open,
    initialName,
    initialImageUrl,
    isVenue,
    initialAddress,
    initialDescription,
    initialOpeningHours,
  ]);

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
          <div className="space-y-3">
            <div className="flex items-end gap-3">
              {!isUploaded && (
                <div className="flex-1">
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
                      placeholder: "Image URL (optional)",
                      onChange: (e) => {
                        setImageUrl(e.target.value);
                        setError(null);
                        setIsUploaded(false);
                        setUploadError(null);
                      },
                    }}
                  />
                </div>
              )}
              <label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const inputEl = e.currentTarget;  
                    const file = inputEl.files?.[0];
                    if (!file) return;

                    try {
                      setUploading(true);
                      setUploadError(null);

                      const url = await uploadSelectedImage(file);
                      setImageUrl(url);
                      setIsUploaded(true);
                    } catch (err: any) {
                      setUploadError(err?.message ?? "Upload failed");
                    } finally {
                      setUploading(false);
                      inputEl.value = "";              
                    }
                  }}

                />

                <Button
                  type="button"
                  variant="updatestall"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </label>
            </div>

            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}

            {imageUrl?.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Preview"
                className="h-32 w-full object-cover rounded-lg border"
              />
            )}
          </div>
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
            disabled={!name.trim() || uploading}
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
