"use client";

import type { Venue } from "../../../../../types/venue";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { CardHolder } from "@/components/ui/cardholder";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";

// You can reuse your AdminStallModal as a generic modal
// (it already supports title/labels/initial values/submit)
import { AdminStallModal } from "@/components/ui/admin/adminstallmodal";

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isHydrated, logout, accessToken } = useAuthStore();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  // modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // mutation states
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

        const res = await fetch(`${API_URL}/venue`);
        const data = await res.json();

        if (!res.ok || data.success === false) {
          throw new Error(data?.payload?.message ?? "Failed to fetch venues");
        }

        setVenues(data.payload?.data ?? []);
      } catch (err: any) {
        setError(err?.message ?? "Server error, please try again later.");
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, [API_URL]);

  if (!isHydrated || !user) return null;

  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        logout();
        router.push("/login");
        return;
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => null);

      logout();
      router.push("/admin/auth/login");
    } catch {
      useAuthStore.getState().logout();
      router.push("/login");
    }
  };

  const handleCreateVenue = async ({
    name,
    imageUrl,
    address,
    description,
    opening_hours,
  }: {
    name: string;
    imageUrl?: string;
    address?: string;
    description?: string;
    opening_hours?: string;
  }) => {
    try {
      setCreateError(null);

      const trimmedName = name.trim();
      if (!trimmedName) {
        setCreateError("Venue name is required.");
        return;
      }

      setCreating(true);

      const res = await fetch(`${API_URL}/venue/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          image_url: imageUrl?.trim() ? imageUrl.trim() : null,
          address: address?.trim() ? address.trim() : null,
          description: description?.trim() ? description.trim() : null,
          opening_hours: opening_hours?.trim() ? opening_hours.trim() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.payload?.message ?? "Failed to create venue");
      }

      const created = data.payload?.data;
      setVenues((curr) => [...curr, created]);
      setShowCreateModal(false);
    } catch (err: any) {
      setCreateError(err?.message ?? "Failed to create venue");
    } finally {
      setCreating(false);
    }
  };


  const handleUpdateVenue = async ({
    name,
    imageUrl,
    address,
    description,
    opening_hours,
  }: {
    name: string;
    imageUrl?: string;
    address?: string;
    description?: string;
    opening_hours?: string;
  }) => {
    try {
      setUpdateError(null);

      if (!editingVenue) {
        setUpdateError("No venue selected to update.");
        return;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        setUpdateError("Venue name is required.");
        return;
      }

      setUpdating(true);

      const venueId = editingVenue.venue_id;

      const res = await fetch(`${API_URL}/venue/update/${venueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          image_url: imageUrl?.trim() ? imageUrl.trim() : null,
          address: address?.trim() ? address.trim() : null,
          description: description?.trim() ? description.trim() : null,
          opening_hours: opening_hours?.trim() ? opening_hours.trim() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.payload?.message ?? "Failed to update venue");
      }

      const updated = data.payload?.data;

      setVenues((curr) =>
        curr.map((v) => (v.venue_id === venueId ? { ...v, ...updated } : v))
      );

      setShowUpdateModal(false);
      setEditingVenue(null);
    } catch (err: any) {
      setUpdateError(err?.message ?? "Failed to update venue");
    } finally {
      setUpdating(false);
    }
  };


  const handleDeleteVenue = async () => {
    if (!editingVenue) return;

    try {
      setDeleteError(null);
      setDeleting(true);

      const venueId = editingVenue.venue_id;

      const res = await fetch(`${API_URL}/venue/remove/${venueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.payload?.message ?? "Failed to delete venue");
      }

      setVenues((_tr) => _tr.filter((v) => v.venue_id !== venueId));
      setShowUpdateModal(false);
      setEditingVenue(null);
    } catch (err: any) {
      setDeleteError(err?.message ?? "Failed to delete venue");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 flex w-full">
      <div className="flex-1 w-full">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl">Venues</h1>

          <div className="flex items-center gap-2">
            <Button variant="addstall" onClick={() => setShowCreateModal(true)}>
              <CirclePlus />
              Add
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex-1 grid place-items-center">
            <p className="text-primary1">Loading…</p>
          </div>
        )}

        {!loading && error && <p className="mt-4 text-red-600">{error}</p>}

        {!loading && !error && venues.length === 0 && (
          <p className="mt-4">No venues found.</p>
        )}

        {!loading && !error && venues.length > 0 && (
          <ul className="mt-4 grid grid-cols-3 gap-10">
            {venues.map((v) => (
              <li key={v.venue_id}>
                <Link href={`/admin/main/managevenues/venues/${v.venue_id}/stalls`}>
                  <CardHolder
                    name={v.name}
                    img={v.image_url}
                    variant="venue"
                    onEdit={() => {
                      setEditingVenue(v);
                      setShowUpdateModal(true);
                    }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showCreateModal && (
        <AdminStallModal
          open={showCreateModal}
          title="New Venue"
          variant="venue"
          labelName="Venue Name"
          labelImage="Paste Venue Thumbnail"
          submitText={creating ? "Creating..." : "Create"}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateVenue}
        />
      )}

      {showUpdateModal && editingVenue && (
        <AdminStallModal
          open={showUpdateModal}
          variant="venue"
          title="Edit Venue"
          labelName="Venue Name"
          labelImage="Paste Image URL"
          submitText={updating ? "Updating..." : "Update"}
          deleteText={deleting ? "Deleting..." : "Delete"}
          onClose={() => {
            setShowUpdateModal(false);
            setEditingVenue(null);
            setUpdateError(null);
            setDeleteError(null);
          }}
          initialName={editingVenue.name}
          initialImageUrl={editingVenue.image_url ?? ""}
          initialAddress={editingVenue.address}
          initialDescription={editingVenue.description}
          initialOpeningHours={editingVenue.opening_hours}
          onSubmit={handleUpdateVenue}
          onDelete={handleDeleteVenue}
        />
      )}

      {(createError || updateError || deleteError) && (
        <div className="fixed bottom-4 left-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 shadow">
          {createError || updateError || deleteError}
        </div>
      )}
    </main>
  );
}
